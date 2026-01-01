export function validateRule(rule) {

    if (!rule.name || typeof rule.name !== "string") {
        throw new Error("Regla inválida: falta 'name'");
    }

    if (!Array.isArray(rule.fields) || rule.fields.length === 0) {
        throw new Error("Regla inválida: 'fields' vacío o inexistente");
    }

    for (const field of rule.fields) {
        if (!field.key || !field.regex) {
            throw new Error("Campo inválido: falta key o regex");
        }

        // validar regex
        try {
            new RegExp(field.regex);
        } catch (err) {
            throw new Error(`Regex inválida en campo ${field.key}`);
        }
    }

    if (!rule.group_by) {
        throw new Error("Regla inválida: falta 'group_by'");
    }

    if (!rule.unit) {
        throw new Error("Regla inválida: falta 'unit'");
    }

    return true;
}
