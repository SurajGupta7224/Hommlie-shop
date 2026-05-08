const sequelize = require("./config/db");

async function checkSubCategoriesColumns() {
  try {
    await sequelize.authenticate();
    const [results] = await sequelize.query("DESCRIBE sub_categories");
    console.log("SubCategories Table Columns:");
    results.forEach(r => console.log(`- ${r.Field}`));
    process.exit(0);
  } catch (error) {
    console.error("Error checking columns:", error);
    process.exit(1);
  }
}

checkSubCategoriesColumns();
