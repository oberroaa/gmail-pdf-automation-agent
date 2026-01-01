export default function getDefaultRules() {
    return {
        name: "default-ft-materials",
        description: "Extract FT materials grouped by part number",
        extract: {
            part_number: true,
            quantity: true,
            uom: true
        },
        filters: {
            uom_include: ["FT"],
            uom_exclude: ["EA"]
        },
        group_by: ["part_number"],
        sum: ["quantity"],
        format: {
            decimals: 3,
            output: "HUMAN_TEXT"
        }
    };
}