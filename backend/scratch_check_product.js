const sequelize = require("./config/db");

async function checkProduct() {
  try {
    await sequelize.authenticate();
    const [results] = await sequelize.query(`
      SELECT p.id, p.name, p.status, p.slug,
             (SELECT COUNT(*) FROM product_variations pv 
              JOIN warehouse_inventory wi ON pv.id = wi.variation_id 
              WHERE pv.product_id = p.id AND wi.stock > 0) as inventory_count
      FROM products p 
      WHERE p.slug = 'mortein-rat-kill-cake-instantly-kills-rats-outdoors'
    `);
    console.log("Product Check Results:", JSON.stringify(results, null, 2));
    process.exit(0);
  } catch (error) {
    console.error("Error checking product:", error);
    process.exit(1);
  }
}

checkProduct();
