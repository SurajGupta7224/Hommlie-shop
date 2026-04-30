const sequelize = require("./config/db");

async function checkIndexes() {
  try {
    const [results] = await sequelize.query("SHOW INDEX FROM users");
    console.log("Indexes on 'users' table:");
    results.forEach(index => {
      console.log(`- ${index.Key_name} (Column: ${index.Column_name})`);
    });
    console.log(`Total indexes: ${results.length}`);
    process.exit(0);
  } catch (err) {
    console.error("Error checking indexes:", err);
    process.exit(1);
  }
}

checkIndexes();
