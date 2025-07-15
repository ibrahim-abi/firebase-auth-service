// firebase/Seeder.js
const FirestoreService = require("./FirestoreService");

// Central config for allowed user types and access codes
const ALLOWED_USER_TYPES = ['app_user', 'web_user', 'admin'];
const ACCESS_CODE_MAP = {
  app_user: 1000,
  web_user: 10001,
  admin: 9999, // Example for admin
};

class Seeder {
  constructor(data) {
    this.data = data; // Array of { collection: 'name', documents: [...] }
  }

  async seed() {
    for (const item of this.data) {
      const service = new FirestoreService(item.collection);
      const existing = await service.readAll();
      if (existing.length > 0) {
        console.log(`⏩ Skipped seeding '${item.collection}' (already has data)`);
        continue;
      }

      for (const doc of item.documents) {
        let docData = doc.data;
        try {
          if (item.collection === 'users') {
            if (!docData.type || !ALLOWED_USER_TYPES.includes(docData.type)) {
              throw new Error(
                `Invalid or missing user type in seeder. Must be one of: ${ALLOWED_USER_TYPES.join(', ')}`
              );
            }
            docData.accessCode = ACCESS_CODE_MAP[docData.type];
          }
          await service.create(doc.id || null, docData);
          console.log(`✅ Seeded document in ${item.collection}: ${doc.id || '[auto-id]'}`);
        } catch (err) {
          console.error(`❌ Failed to seed document in ${item.collection}: ${doc.id || '[auto-id]'} - ${err.message}`);
          // Continue with next document
        }
      }
      console.log(`✅ Seeded collection: ${item.collection}`);
    }
  }
}

module.exports = Seeder;
