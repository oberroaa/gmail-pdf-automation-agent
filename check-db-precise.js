import { getCanopyCollection } from "./db.js";

async function checkDb() {
    const coll = await getCanopyCollection();
    const item = await coll.findOne({ alias: /OM10/i });
    if (item) {
        console.log("--- DB RECORD ---");
        console.log("ID:", item._id);
        console.log("Item:", JSON.stringify(item.item));
        console.log("Alias:", JSON.stringify(item.alias));
        console.log("Profile:", JSON.stringify(item.profile));
        console.log("Telas:", JSON.stringify(item.telas));
        console.log("Telas2:", JSON.stringify(item.telas2));
    } else {
        console.log("No record found with alias OM10");
    }
    process.exit(0);
}

checkDb();
