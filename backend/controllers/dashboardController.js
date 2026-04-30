const {
  Order, Product, User, Warehouse, WarehouseInventory,
  OrderItem, ProductVariation, Customer, Role
} = require("../models/index");
const { Op, fn, col, literal } = require("sequelize");
const sequelize = require("../config/db");

exports.getDashboardStats = async (req, res) => {
  try {
    // Role-based filtering logic: Only 'Admin' can see global data
    const isAdmin = req.user.role?.role_name?.toLowerCase().includes('admin');
    const userId = req.user.id;

    // Filter by user_id if NOT an admin
    const whereClause = isAdmin ? {} : { user_id: userId };

    // 1. Total Orders count
    const totalOrders = await Order.count({ where: whereClause });

    // 2. Total Revenue (sum of final_amount for all non-cancelled orders)
    const revenueWhere = { ...whereClause, status: { [Op.ne]: 'cancelled' } };
    const totalRevenue = await Order.sum('final_amount', { where: revenueWhere }) || 0;

    // 3. Total Products count
    const totalProducts = await Product.count({ where: whereClause });

    // 4. Total Vendors count (Only Admins see global count; others see 1 for themselves)
    let totalVendors = 1;
    if (isAdmin) {
      const vendorRole = await Role.findOne({ where: { role_name: 'Vendor' } });
      if (vendorRole) {
        totalVendors = await User.count({ where: { role_id: vendorRole.id } });
      }
    }

    // 5. Active Warehouses count
    const totalWarehouses = await Warehouse.count({ where: { ...whereClause, status: 1 } });

    // 6. Recent Orders (Top 5 latest)
    const recentOrders = await Order.findAll({
      where: whereClause,
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [
        { model: Customer, as: 'customer', attributes: ['name'] }
      ]
    });

    // 7. Low Stock Items (threshold stock <= 10)
    const lowStockItems = await WarehouseInventory.findAll({
      where: {
        stock: { [Op.lte]: 10 }
      },
      include: [
        {
          model: Product,
          as: 'product',
          where: whereClause,
          attributes: ['name']
        },
        { model: ProductVariation, as: 'variation', attributes: ['variation_name'] },
        { model: Warehouse, as: 'warehouse', attributes: ['name'] }
      ],
      limit: 5
    });

    // 8. Sales Trend (Last 7 days data for chart)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last7Days.push(date.toISOString().split('T')[0]);
    }

    const salesTrend = await Order.findAll({
      where: {
        ...whereClause,
        created_at: {
          [Op.gte]: new Date(new Date().setDate(new Date().getDate() - 7))
        },
        status: { [Op.ne]: 'cancelled' }
      },
      attributes: [
        [fn('DATE', col('created_at')), 'date'],
        [fn('SUM', col('final_amount')), 'totalSales']
      ],
      group: [fn('DATE', col('created_at'))],
      raw: true
    });

    // Map the database results into the 7-day array format for the chart
    const formattedSalesTrend = last7Days.map(day => {
      const found = salesTrend.find(s => s.date === day);
      return {
        name: new Date(day).toLocaleDateString('en-US', { weekday: 'short' }),
        sales: found ? parseFloat(found.totalSales) : 0
      };
    });

    // 9. Top Selling Products (Top 4)
    const topProductsRaw = await OrderItem.findAll({
      attributes: [
        'product_id',
        [fn('SUM', col('quantity')), 'sold'],
        [fn('SUM', literal('quantity * unit_price')), 'revenue']
      ],
      include: [
        {
          model: Product,
          as: 'product',
          where: whereClause,
          attributes: ['name']
        }
      ],
      group: ['product_id'],
      order: [[literal('sold'), 'DESC']],
      limit: 4,
      raw: true,
      nest: true
    });

    // 10. Today's Pulse Stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = await Order.count({
      where: {
        ...whereClause,
        created_at: { [Op.gte]: today }
      }
    });

    const todayRevenue = await Order.sum('final_amount', {
      where: {
        ...whereClause,
        created_at: { [Op.gte]: today },
        status: { [Op.ne]: 'cancelled' }
      }
    }) || 0;

    const pendingOrders = await Order.count({
      where: {
        ...whereClause,
        status: 'pending'
      }
    });

    const activeDeliveries = await Order.count({
      where: {
        ...whereClause,
        status: 'out_for_delivery'
      }
    });

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue,
        totalProducts,
        totalVendors,
        totalWarehouses,
        lowStockCount: lowStockItems.length
      },
      pulse: {
        todayOrders,
        todayRevenue,
        pendingOrders,
        activeDeliveries
      },
      recentOrders: recentOrders.map(o => ({
        id: o.order_number || `ORD-${o.id}`,
        customer: o.customer?.name || 'Unknown',
        amount: `₹${o.final_amount}`,
        status: o.status,
        date: new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      })),
      lowStockItems: lowStockItems.map(i => ({
        name: i.product?.name,
        variation: i.variation?.variation_name,
        stock: i.stock,
        warehouse: i.warehouse?.name
      })),
      salesData: formattedSalesTrend,
      topProducts: topProductsRaw.map(p => ({
        name: p.product?.name,
        sold: parseInt(p.sold),
        revenue: `₹${parseFloat(p.revenue).toLocaleString()}`
      }))
    });

  } catch (error) {
    console.error("Dashboard Stats Aggregation Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
