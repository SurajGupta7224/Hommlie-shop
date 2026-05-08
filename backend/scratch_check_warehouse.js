const sequelize = require("./config/db");

async function checkWarehouseColumns() {
  try {
    await sequelize.authenticate();
    const [results] = await sequelize.query("DESCRIBE warehouse_inventory");
    console.log("Warehouse Inventory Table Columns:");
    results.forEach(r => console.log(`- ${r.Field}`));
    process.exit(0);
  } catch (error) {
    console.error("Error checking columns:", error);
    process.exit(1);
  }
}

checkWarehouseColumns();
