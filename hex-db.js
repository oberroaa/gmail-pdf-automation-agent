import { getCanopyCollection } from "./db.js";

function toHex(s) {
    if (!s) return "null";
    return Array.from(s).map(c => c.charCodeAt(0).toString(16).padStart(4, '0')).join(' ');
}

async function checkDb() {
    const coll = await getCanopyCollection();
    const item = await coll.findOne({ alias: /OM10/i });
    if (item) {
        console.log("DB Alias:", item.alias);
        console.log("DB Alias Hex:", toHex(item.alias));
        console.log("DB Profile:", item.profile);
        console.log("DB Profile Hex:", toHex(item.profile));
    }
    process.exit(0);
}

checkDb();
