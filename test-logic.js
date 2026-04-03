const dbAlias = "OM10.0HEX";
const pdfItem = "CEXPOM10.0HEX-BL";
const dbProfile = "Market Cut Folded";
const pdfProfile = "Market Cut Folded";
const dbTelas = ["1009006"];
const pdfTelas = ["1009006"];

console.log("Alias Match:", pdfItem.includes(dbAlias));
console.log("Profile Match:", pdfProfile === dbProfile);
console.log("Telas Match (strings):", JSON.stringify(dbTelas) === JSON.stringify(pdfTelas));

// Case sensitivity check
console.log("Profile Strict Match:", pdfProfile === dbProfile);
console.log("Profile length:", pdfProfile.length, "vs", dbProfile.length);
