import { getRulesCollection } from "./db.js";

async function checkRules() {
    try {
        const collection = await getRulesCollection();
        const rules = await collection.find({}).toArray();
        console.log("=== REGLAS EN DB ===");
        console.log(JSON.stringify(rules, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkRules();
