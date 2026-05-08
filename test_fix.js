import analyzePdfWithRules from "./analyze-pdf.js";
import { getRulesCollection } from "./db.js";

async function runAnalysis() {
    try {
        const pdfPath = "d:/MPC/gmail-pdf-tuuci-agent/processed_pdfs/M1 Frame-5-7-26.pdf";
        const rulesColl = await getRulesCollection();
        const defaultRule = await rulesColl.findOne({ isDefault: true });
        
        const result = await analyzePdfWithRules(pdfPath, defaultRule.ruleset, "M1 Frame-5-7-26.pdf");
        console.log(result);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}
runAnalysis();
