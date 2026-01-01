import fs from "fs";

export default function runRule(pdfText, rule) {
    if (rule.extract.type !== "regex") {
        throw new Error("Solo regex soportado por ahora");
    }

    const regex = new RegExp(rule.extract.pattern, "g");
    const rows = [];

    let match;
    while ((match = regex.exec(pdfText)) !== null) {
        rows.push({
            [rule.extract.fields[0]]: match[1],
            [rule.extract.fields[1]]: Number(match[2])
        });
    }

    // Agrupar
    const grouped = {};

    for (const r of rows) {
        const key = r[rule.groupBy];
        if (!grouped[key]) grouped[key] = 0;
        grouped[key] += r[rule.sumField];
    }

    return grouped;
}
