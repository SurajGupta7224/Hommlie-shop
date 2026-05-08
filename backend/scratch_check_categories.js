const sequelize = require("./config/db");

async function checkCategoriesColumns() {
  try {
    await sequelize.authenticate();
    const [results] = await sequelize.query("DESCRIBE categories");
    console.log("Categories Table Columns:");
    results.forEach(r => console.log(`- ${r.Field}`));
    process.exit(0);
  } catch (error) {
    console.error("Error checking columns:", error);
    process.exit(1);
  }
}

checkCategoriesColumns();
