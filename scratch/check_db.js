import { getCanopyHistoryCollection } from "./db.js";

async function check() {
    try {
        const coll = await getCanopyHistoryCollection();
        const all = await coll.find({}).toArray();
        console.log("Total records:", all.length);
        const statuses = all.map(r => r.status);
        const uniqueStatuses = [...new Set(statuses)];
        console.log("Unique statuses found:", uniqueStatuses);
        
        const countD = await coll.countDocuments({ status: "DISPONIBLE" });
        console.log("Count with status 'DISPONIBLE':", countD);

        const first = all[0];
        if (first) {
            console.log("First record status:", JSON.stringify(first.status));
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

check();
