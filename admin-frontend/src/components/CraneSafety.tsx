import { useState } from "react";
import { motion } from "framer-motion";
import {
  ClipboardCheck,
  ShieldAlert,
  Printer,
  CheckCircle2,
  History,
  AlertCircle,
  Users,
  Search,
  Ruler,
  Anchor,
  ArrowUp,
  ArrowDown,
  Languages
} from "lucide-react";

const CONTENT = {
  es: {
    title: "📘 Manejo de Grúa con Doble Gancho",
    subtitle: "Protocolo de seguridad para Bundles de Aluminio",
    printBtn: "Imprimir Protocolo",
    langBtn: "English",
    personal_title: "1. Personal",
    personal_1_prefix: "Se ",
    personal_1_highlight: "requieren 2 operadores",
    personal_1_suffix: ": Operador de grúa o Ayudante / señalero",
    personal_2: "Comunicación constante en todo momento",
    inspection_title: "2. Inspección previa",
    inspection_items: [
      "Grúa funcionando correctamente",
      "Ganchos en buen estado",
      "Eslingas sin daño",
      "Cable de acero sin hilos rotos",
      "Área libre de personas y obstáculos"
    ],
    prep_title: "3. Preparación del bundle",
    prep_1: "Identificar longitud del bundle y marcar puntos de sujeción.",
    prep_2_highlight: "Si mide más de 20 ft:",
    prep_2_suffix: "Retirar maderas o materiales que sobresalgan por debajo.",
    sling_title: "Selección de eslingas",
    sling_1_prefix: "No va al rack alto → Usar ",
    sling_1_highlight: "10 ft",
    sling_2_prefix: "Sí va al rack alto → Usar ",
    sling_2_highlight: "8 ft o 6 ft",
    sling_2_suffix: " (evita choques)",
    rack_rule_highlight: "Regla especial rack alto:",
    rack_rule_desc: "Eliminar maderas intermedias antes de insertar para mejor control.",
    hook_pos_title: "4. Posición de ganchos (CLAVE)",
    bundles_gt_20: "Bundles Mayor a 20 ft",
    bundles_le_20: "Bundles Menor o igual a 20 ft",
    hook_desc_13: "Un gancho a ",
    hook_desc_11: "Un gancho a ",
    hook_highlight_13: "13 ft",
    hook_highlight_11: "11 ft",
    hook_highlight_1: "1 ft",
    hook_desc_suffix: " (centro) + Otro a ",
    hook_desc_final: " del extremo.",
    move_title: "5 y 6. Levante y Movimiento",
    move_1_prefix: "Levantar ganchos ",
    move_1_highlight: "parejos",
    move_1_suffix: " y verificar nivelación.",
    move_2_prefix: "Movimiento ",
    move_2_highlight: "lento y controlado",
    move_2_suffix: ", sin brusquedad.",
    move_3: "Mantener comunicación constante con el señalero.",
    save_title: "7. Guardado del Bundle",
    save_steps: [
      "Amarrar ambos ganchos de manera pareja al bundle, usando los FT correspondientes (11 ft o 13 ft y 1 ft del extremo).",
      "Levantar el bundle recto, manteniéndolo nivelado.",
      "Alinear el bundle con el rack o carrito antes de introducirlo.",
      { prefix: "Introducir lentamente el extremo donde ", highlight: "NO", suffix: " se marcó el 1 ft." },
      "Avanzar despacio hasta que la soga central (11 ft o 13 ft) toque el rack.",
      "Cuando llegue al final, bajar el bundle hasta que ese extremo quede apoyado sobre el carrito.",
      "Con el extremo ya apoyado, soltar el gancho que está pegado al rack/carrito.",
      "Con el otro gancho, mover el bundle hacia adentro de forma controlada.",
      "Cuando el bundle toque el final, soltar el segundo gancho, verificando siempre que esté estable.",
      { prefix: "Con el ", highlight: "forklift", suffix: ", insertar el bundle dejando siempre un espacio suficiente para poder agarrarlo nuevamente al momento del retiro." }
    ],
    remove_title: "8. Retiro del Bundle",
    remove_steps: [
      { prefix: "Sacar el bundle aproximadamente ", highlight: "2 ft", suffix: " con el forklift." },
      "Amarrar el gancho que queda más afuera, para comenzar la extracción.",
      "Una vez asegurado el primer gancho, levantar ligeramente el bundle para poder retirarlo del rack.",
      "Retirar el bundle lentamente usando ese gancho, hasta que el carrito dentro del rack llegue al tope de salida.",
      { prefix: "Cuando el carrito llegue al tope, amarrar el ", highlight: "segundo gancho", suffix: "." },
      "Levantar el bundle hasta que se despegue completamente del carrito y quede parejo.",
      "Con ambos ganchos asegurados, mover el bundle hacia afuera de forma controlada.",
      "Una vez fuera del rack, continuar con movimientos lentos y proceder a bajarlo lentamente en posición segura."
    ],
    safety_title: "Seguridad y Prevención",
    risks_title: "Riesgos",
    risks: ["Caída de carga", "Golpes / Atrapamientos"],
    prevention_title: "Prevención",
    prevention: ["Mantener distancia", "No estar bajo la carga", "Inspección diaria"],
    gold_rules_title: "Reglas de Oro",
    gold_rules: ["No operar solo", "No cargas desbalanceadas", "Comunicación constante"],
    checklist_title: "Checklist Diario",
    critical: "CRÍTICO",
    checks: ["Grúa", "Ganchos", "Eslingas", "Cable de acero", "Área", "Comunicación"],
    failure_prefix: "Si hay falla: ",
    failure_highlight: "NO operar y reportar inmediatamente",
    footer_text: "TUUCI AGENT - PROTOCOLO DE SEGURIDAD INDUSTRIAL",
    footer_gen: "Generado el:"
  },
  en: {
    title: "📘 Double Hook Crane Handling",
    subtitle: "Safety protocol for Aluminum Bundles",
    printBtn: "Print Protocol",
    langBtn: "Español",
    personal_title: "1. Personnel",
    personal_1_prefix: "Requires ",
    personal_1_highlight: "2 operators",
    personal_1_suffix: ": Crane Operator and Helper / Signaler",
    personal_2: "Constant communication at all times",
    inspection_title: "2. Pre-operation Inspection",
    inspection_items: [
      "Crane functioning correctly",
      "Hooks in good condition",
      "Slings without damage",
      "Steel cable without broken wires",
      "Area free of people and obstacles"
    ],
    prep_title: "3. Bundle Preparation",
    prep_1: "Identify bundle length and mark attachment points.",
    prep_2_highlight: "If over 20 ft:",
    prep_2_suffix: "Remove wood or materials protruding underneath.",
    sling_title: "Sling Selection",
    sling_1_prefix: "Not going to top rack → Use ",
    sling_1_highlight: "10 ft",
    sling_2_prefix: "Going to top rack → Use ",
    sling_2_highlight: "8 ft or 6 ft",
    sling_2_suffix: " (prevents collisions)",
    rack_rule_highlight: "Special rule for top rack:",
    rack_rule_desc: "Remove intermediate wood before insertion for better control.",
    hook_pos_title: "4. Hook Position (KEY)",
    bundles_gt_20: "Bundles Over 20 ft",
    bundles_le_20: "Bundles 20 ft or less",
    hook_desc_13: "One hook at ",
    hook_desc_11: "One hook at ",
    hook_highlight_13: "13 ft",
    hook_highlight_11: "11 ft",
    hook_highlight_1: "1 ft",
    hook_desc_suffix: " (center) + Another at ",
    hook_desc_final: " from the end.",
    move_title: "5 & 6. Lifting and Movement",
    move_1_prefix: "Lift hooks ",
    move_1_highlight: "evenly",
    move_1_suffix: " and verify leveling.",
    move_2_prefix: "Movement ",
    move_2_highlight: "slow and controlled",
    move_2_suffix: ", without sudden moves.",
    move_3: "Maintain constant communication with the signaler.",
    save_title: "7. Storing the Bundle",
    save_steps: [
      "Attach both hooks evenly to the bundle, using corresponding FT (11 ft or 13 ft and 1 ft from the end).",
      "Lift the bundle straight, keeping it level.",
      "Align the bundle with the rack or cart before introducing it.",
      { prefix: "Slowly introduce the end where ", highlight: "NOT", suffix: " marked at 1 ft." },
      "Advance slowly until the center sling (11 ft or 13 ft) touches the rack.",
      "When reaching the end, lower the bundle until that end is supported on the cart.",
      "With the end already supported, release the hook attached to the rack/cart.",
      "With the other hook, move the bundle inward in a controlled manner.",
      "When the bundle touches the end, release the second hook, always verifying stability.",
      { prefix: "With the ", highlight: "forklift", suffix: ", insert the bundle always leaving enough space to be able to grab it again at the time of removal." }
    ],
    remove_title: "8. Bundle Removal",
    remove_steps: [
      { prefix: "Pull the bundle out approximately ", highlight: "2 ft", suffix: " using the forklift." },
      "Attach the hook furthest out to begin extraction.",
      "Once the first hook is secured, lift the bundle slightly to remove it from the rack.",
      "Withdraw the bundle slowly using that hook, until the cart inside the rack reaches the output limit.",
      { prefix: "When the cart reaches the limit, attach the ", highlight: "second hook", suffix: "." },
      "Lift the bundle until it completely detaches from the cart and is level.",
      "With both hooks secured, move the bundle outward in a controlled manner.",
      "Once outside the rack, continue with slow movements and proceed to lower it slowly into a safe position."
    ],
    safety_title: "Safety and Prevention",
    risks_title: "Risks",
    risks: ["Falling load", "Impact / Entrapment"],
    prevention_title: "Prevention",
    prevention: ["Keep distance", "Do not stand under the load", "Daily inspection"],
    gold_rules_title: "Golden Rules",
    gold_rules: ["Do not operate alone", "No unbalanced loads", "Constant communication"],
    checklist_title: "Daily Checklist",
    critical: "CRITICAL",
    checks: ["Crane", "Hooks", "Slings", "Steel Cable", "Area", "Communication"],
    failure_prefix: "If there is a failure: ",
    failure_highlight: "DO NOT operate and report immediately",
    footer_text: "TUUCI AGENT - INDUSTRIAL SAFETY PROTOCOL",
    footer_gen: "Generated on:"
  }
};

export default function CraneSafety() {
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const t = CONTENT[lang];

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8 pb-12"
    >
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/50 p-8 rounded-3xl border border-white/5 print:border-none print:p-0 print:bg-transparent">
        <div>
          <h1 className="text-3xl font-black text-white print:text-black">
            {t.title}
          </h1>
          <p className="text-slate-400 mt-2 font-medium print:text-slate-700">
            {t.subtitle}
          </p>
        </div>
        <div className="flex gap-2 print:hidden">
          <button
            onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all border border-white/5 shadow-lg"
          >
            <Languages className="w-4 h-4" />
            {t.langBtn}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/20"
          >
            <Printer className="w-4 h-4" />
            {t.printBtn}
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          body { background: white !important; color: black !important; }
          .glass { background: transparent !important; border: 1px solid #e2e8f0 !important; color: black !important; box-shadow: none !important; backdrop-filter: none !important; }
          main { background: white !important; padding: 0 !important; }
          .print\\:text-black { color: black !important; }
          .print\\:font-extrabold { font-weight: 800 !important; }
          * { -webkit-print-color-adjust: exact; }
          .max-w-4xl { max-width: 100% !important; margin: 0 !important; }
        }
      `}} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:block">

        {/* 1. PERSONAL */}
        <div className="glass p-6 rounded-2xl space-y-3 border-l-4 border-l-blue-500 print:border print:shadow-none print:mb-4">
          <div className="flex items-center gap-3 text-blue-400 print:text-blue-700">
            <Users className="w-5 h-5" />
            <h3 className="font-bold uppercase tracking-wider text-sm">{t.personal_title}</h3>
          </div>
          <ul className="space-y-3 text-base text-slate-300 print:text-black">
            <li className="flex items-start gap-3">
              <span className="text-blue-500 flex-shrink-0">•</span>
              <span>
                {t.personal_1_prefix}
                <span className="text-white font-bold print:text-black print:font-extrabold">{t.personal_1_highlight}</span>
                {t.personal_1_suffix}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500 flex-shrink-0">•</span>
              <span>{t.personal_2}</span>
            </li>
          </ul>
        </div>

        {/* 2. INSPECCIÓN PREVIA */}
        <div className="glass p-6 rounded-2xl space-y-3 border-l-4 border-l-amber-500 print:border print:shadow-none print:mb-4">
          <div className="flex items-center gap-3 text-amber-400 print:text-amber-700">
            <Search className="w-5 h-5" />
            <h3 className="font-bold uppercase tracking-wider text-sm">{t.inspection_title}</h3>
          </div>
          <ul className="space-y-3 text-base text-slate-300 print:text-black grid grid-cols-1 gap-1">
            {t.inspection_items.map((item, id) => (
              <li key={id} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 3. PREPARACIÓN */}
        <div className="glass p-6 rounded-2xl space-y-4 border-l-4 border-l-indigo-500 md:col-span-2 print:border print:shadow-none print:mb-4">
          <div className="flex items-center gap-3 text-indigo-400 print:text-indigo-700">
            <Ruler className="w-5 h-5" />
            <h3 className="font-bold uppercase tracking-wider text-sm">{t.prep_title}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ul className="space-y-2 text-base text-slate-300 print:text-black border-r border-white/5 pr-4 print:border-none">
              <li>• {t.prep_1}</li>
              <li>• <span className="text-white font-bold print:text-black print:font-extrabold">{t.prep_2_highlight}</span> {t.prep_2_suffix}</li>
            </ul>
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t.sling_title}</h4>
              <ul className="space-y-2 text-base text-slate-300 print:text-black">
                <li>• {t.sling_1_prefix}<span className="text-white font-bold print:text-black print:font-extrabold">{t.sling_1_highlight}</span></li>
                <li>• {t.sling_2_prefix}<span className="text-white font-bold print:text-black print:font-extrabold">{t.sling_2_highlight}</span>{t.sling_2_suffix}</li>
              </ul>
              <div className="bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/20 text-sm text-indigo-300 print:bg-slate-100 print:text-black">
                <span className="text-white font-bold print:text-black print:font-extrabold">{t.rack_rule_highlight}</span> {t.rack_rule_desc}
              </div>
            </div>
          </div>
        </div>

        {/* 4. POSICIÓN DE GANCHOS */}
        <div className="glass p-6 rounded-2xl space-y-4 border-l-4 border-l-emerald-500 md:col-span-2 print:border print:shadow-none print:mb-4">
          <div className="flex items-center gap-3 text-emerald-400 print:text-emerald-700">
            <Anchor className="w-5 h-5" />
            <h3 className="font-bold uppercase tracking-wider text-sm">{t.hook_pos_title}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/50 p-5 rounded-xl print:bg-slate-100">
              <p className="text-white font-bold text-lg mb-2 print:text-black">{t.bundles_gt_20}</p>
              <p className="text-sm text-slate-400 print:text-slate-700">
                {t.hook_desc_13}<span className="text-white font-bold print:text-black print:font-extrabold">{t.hook_highlight_13}</span>
                {t.hook_desc_suffix}<span className="text-white font-bold print:text-black print:font-extrabold">{t.hook_highlight_1}</span>
                {t.hook_desc_final}
              </p>
            </div>
            <div className="bg-slate-800/50 p-5 rounded-xl print:bg-slate-100">
              <p className="text-white font-bold text-lg mb-2 print:text-black">{t.bundles_le_20}</p>
              <p className="text-sm text-slate-400 print:text-slate-700">
                {t.hook_desc_11}<span className="text-white font-bold print:text-black print:font-extrabold">{t.hook_highlight_11}</span>
                {t.hook_desc_suffix}<span className="text-white font-bold print:text-black print:font-extrabold">{t.hook_highlight_1}</span>
                {t.hook_desc_final}
              </p>
            </div>
          </div>
        </div>

        {/* 5. LEVANTAMIENTO & 6. MOVIMIENTO */}
        <div className="glass p-6 rounded-2xl space-y-3 border-l-4 border-l-sky-500 print:border print:shadow-none print:mb-4">
          <div className="flex items-center gap-3 text-sky-400 print:text-sky-700">
            <ArrowUp className="w-5 h-5" />
            <h3 className="font-bold uppercase tracking-wider text-sm">{t.move_title}</h3>
          </div>
          <ul className="space-y-2 text-base text-slate-300 print:text-black">
            <li className="flex items-start gap-3">
              <span className="text-sky-500 flex-shrink-0">•</span>
              <span>{t.move_1_prefix}<span className="text-white font-bold print:text-black print:font-extrabold">{t.move_1_highlight}</span>{t.move_1_suffix}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-sky-500 flex-shrink-0">•</span>
              <span>{t.move_2_prefix}<span className="text-white font-bold print:text-black print:font-extrabold">{t.move_2_highlight}</span>{t.move_2_suffix}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-sky-500 flex-shrink-0">•</span>
              <span>{t.move_3}</span>
            </li>
          </ul>
        </div>

        {/* 7. GUARDADO */}
        <div className="glass p-6 rounded-2xl space-y-3 border-l-4 border-l-purple-500 md:col-span-2 print:border print:shadow-none print:mb-4">
          <div className="flex items-center gap-3 text-purple-400 print:text-purple-700">
            <ArrowDown className="w-5 h-5" />
            <h3 className="font-bold uppercase tracking-wider text-sm">{t.save_title}</h3>
          </div>
          <div className="grid grid-cols-1 gap-y-3 text-base text-slate-300 print:text-black">
            {t.save_steps.map((step, id) => (
              <p key={id} className="flex gap-3">
                <span>{id + 1}.</span> 
                {typeof step === 'string' ? (
                  <span>{step}</span>
                ) : (
                  <span>
                    {step.prefix}
                    <span className="text-white font-bold print:text-black print:font-extrabold">{step.highlight}</span>
                    {step.suffix}
                  </span>
                )}
              </p>
            ))}
          </div>
        </div>

        {/* 8. RETIRO */}
        <div className="glass p-6 rounded-2xl space-y-3 border-l-4 border-l-pink-500 md:col-span-2 print:border print:shadow-none print:mb-4">
          <div className="flex items-center gap-3 text-pink-400 print:text-pink-700">
            <History className="w-5 h-5" />
            <h3 className="font-bold uppercase tracking-wider text-sm">{t.remove_title}</h3>
          </div>
          <div className="grid grid-cols-1 gap-y-3 text-base text-slate-300 print:text-black">
             {t.remove_steps.map((step, id) => (
              <p key={id} className="flex gap-3">
                <span>{id + 1}.</span> 
                {typeof step === 'string' ? (
                  <span>{step}</span>
                ) : (
                  <span>
                    {step.prefix}
                    <span className="text-white font-bold print:text-black print:font-extrabold">{step.highlight}</span>
                    {step.suffix}
                  </span>
                )}
              </p>
            ))}
          </div>
        </div>

        {/* 9, 10, 11. SEGURIDAD Y PREVENCIÓN */}
        <div className="glass p-6 rounded-2xl space-y-4 border-l-4 border-l-red-500 md:col-span-2 print:border print:shadow-none print:mb-4">
          <div className="flex items-center gap-3 text-red-500 print:text-red-700">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="font-bold uppercase tracking-wider text-sm">{t.safety_title}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm font-bold text-slate-500 uppercase mb-3 tracking-wider">{t.risks_title}</h4>
              <ul className="text-sm space-y-3 text-slate-300 print:text-black">
                {t.risks.map((r, i) => <li key={i} className="flex items-start gap-2"><span>• {r}</span></li>)}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-500 uppercase mb-3 tracking-wider">{t.prevention_title}</h4>
              <ul className="text-sm space-y-3 text-slate-300 print:text-black">
                {t.prevention.map((p, i) => <li key={i} className="flex items-start gap-2"><span>• {p}</span></li>)}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-500 uppercase mb-3 tracking-wider">{t.gold_rules_title}</h4>
              <ul className="text-sm space-y-3 text-slate-300 print:text-black">
                {t.gold_rules.map((g, i) => <li key={i} className="flex items-start gap-2"><span>• {g}</span></li>)}
              </ul>
            </div>
          </div>
        </div>

        {/* 12. CHECKLIST */}
        <div className="glass p-6 rounded-2xl space-y-3 bg-emerald-500/5 border-emerald-500/20 md:col-span-2 print:border print:shadow-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-emerald-400 print:text-emerald-700">
              <ClipboardCheck className="w-6 h-6" />
              <h3 className="font-bold uppercase tracking-wider text-lg">{t.checklist_title}</h3>
            </div>
            <div className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full animate-pulse print:hidden">
              {t.critical}
            </div>
          </div>
          <div className="flex flex-wrap gap-4 py-2">
            {t.checks.map((item) => (
              <div key={item} className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-lg border border-white/5 print:bg-slate-100">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                <span className="text-sm font-bold text-slate-200 print:text-black">{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-5 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-4 print:bg-slate-100 print:border">
            <AlertCircle className="w-7 h-7 text-red-500" />
            <p className="text-base font-bold text-red-200 print:text-black">
              {t.failure_prefix} <span className="underline uppercase">{t.failure_highlight}</span>.
            </p>
          </div>
        </div>

      </div>

      {/* FOOTER PRINT */}
      <div className="hidden print:block text-center mt-12 pt-8 border-t border-slate-200">
        <p className="text-xs text-slate-500 font-bold">{t.footer_text}</p>
        <p className="text-[10px] text-slate-400 mt-1">{t.footer_gen} {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
      </div>
    </motion.div>
  );
}
