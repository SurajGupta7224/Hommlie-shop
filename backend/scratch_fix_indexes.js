const sequelize = require("./config/db");

async function fixIndexes() {
  try {
    const [results] = await sequelize.query("SHOW INDEX FROM users");
    console.log(`Found ${results.length} indexes.`);

    for (const index of results) {
      const keyName = index.Key_name;
      // Keep PRIMARY and the first 'email' index (or whatever you prefer)
      // Actually, let's keep PRIMARY and one unique email index.
      // We'll drop everything that looks like email_N or redundant role_id/etc if they are duplicated.
      
      if (keyName.startsWith("email_") || (keyName === "email" && results.filter(i => i.Key_name === "email").length > 1)) {
         console.log(`Dropping redundant index: ${keyName}`);
         try {
           await sequelize.query(`ALTER TABLE users DROP INDEX ${keyName}`);
         } catch (e) {
           console.error(`Failed to drop ${keyName}: ${e.message}`);
         }
      }
    }

    console.log("Cleanup finished.");
    process.exit(0);
  } catch (err) {
    console.error("Error fixing indexes:", err);
    process.exit(1);
  }
}

fixIndexes();
