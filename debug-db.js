import { getCanopyCollection } from "./db.js";

async function checkDb() {
    const coll = await getCanopyCollection();
    const item = await coll.findOne({ alias: "OM10.0HEX" });
    console.log("DB Record found:", JSON.stringify(item, null, 2));
    process.exit(0);
}

checkDb();
