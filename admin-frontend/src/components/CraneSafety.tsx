import { useState, useEffect } from "react";
import { useLang } from "../context/LangContext";
import { motion } from "framer-motion";
import {
  ClipboardCheck,
  Shield,
  Printer,
  History,
  AlertCircle,
  Users,
  Search,
  Ruler,
  Anchor,
  ArrowUp,
  ArrowDown,
  Edit,
  Save,
  X,
  Loader2
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getSafetyProtocol, updateSafetyProtocol } from "../services/safetyApi";

const DEFAULT_CONTENT = {
  es: {
    title: "📘 Manejo de Grúa con Doble Gancho",
    subtitle: "Protocolo de seguridad para Bundles de Aluminio",
    printBtn: "Imprimir Protocolo",
    langBtn: "English",
    personal_title: "1. Personal",
    personal: "• Se **requieren 2 operadores**: Operador de grúa o Ayudante / señalero\n• Comunicación constante en todo momento",
    inspection_title: "2. Inspección previa",
    inspection: "• Grúa funcionando correctamente\n• Ganchos en buen estado\n• Eslingas sin daño\n• Cable de acero sin hilos rotos\n• Área libre de personas y obstáculos",
    prep_title: "3. Preparación del bundle",
    prep: "• Identificar longitud del bundle y marcar puntos de sujeción.\n• **Si mide más de 20 ft**: Retirar maderas o materiales que sobresalgan por debajo.",
    sling_title: "Selección de eslingas",
    slings: "• No va al rack alto → Usar **10 ft**\n• Sí va al rack alto → Usar **8 ft o 6 ft** (evita choques)\n**Regla especial rack alto**: Eliminar maderas intermedias antes de insertar para mejor control.",
    hook_pos_title: "4. Posición de ganchos (CLAVE)",
    hooks_gt20_title: "Bundles Mayor a 20 ft",
    hooks_gt20: "Un gancho a **13 ft** (centro) + Otro a **1 ft** del extremo.",
    hooks_le20_title: "Bundles Menor o igual a 20 ft",
    hooks_le20: "Un gancho a **11 ft** (centro) + Otro a **1 ft** del extremo.",
    move_title: "5 y 6. Levante y Movimiento",
    move: "• Levantar ganchos **parejos** y verificar nivelación.\n• Movimiento **lento y controlado**, sin brusquedad.\n• Mantener comunicación constante con el señalero.",
    save_title: "7. Guardado del Bundle",
    save: "1. Amarrar ambos ganchos de manera pareja al bundle, usando los FT correspondientes (**11 ft o 13 ft** y **1 ft** del extremo).\n2. Levantar el bundle recto, manteniéndolo nivelado.\n3. Alinear el bundle con el rack o carrito antes de introducirlo.\n4. Introducir lentamente el extremo donde **NO** se marcó el 1 ft.\n5. Avanzar despacio hasta que la soga central (**11 ft o 13 ft**) toque el rack.\n6. Cuando llegue al final, bajar el bundle hasta que ese extremo quede apoyado sobre el carrito.\n7. Con el extremo ya apoyado, soltar el gancho que está pegado al rack/carrito.\n8. Con el otro gancho, mover el bundle hacia adentro de forma controlada.\n9. Cuando el bundle toque el final, soltar el segundo gancho, verificando siempre que esté estable.\n10. Con el **forklift**, insertar el bundle dejando siempre un espacio suficiente para poder agarrarlo nuevamente al momento del retiro.",
    remove_title: "8. Retiro del Bundle",
    remove: "1. Sacar el bundle aproximadamente **2 ft** con el forklift.\n2. Amarrar el gancho que queda más afuera, para comenzar la extracción.\n3. Una vez asegurado el primer gancho, levantar ligeramente el bundle para poder retirarlo del rack.\n4. Retirar el bundle lentamente usando ese gancho, hasta que el carrito dentro del rack llegue al tope de salida.\n5. Cuando el carrito llegue al tope, amarrar el **segundo gancho**.\n6. Levantar el bundle hasta que se despegue completamente del carrito y quede parejo.\n7. Con ambos ganchos asegurados, mover el bundle hacia afuera de forma controlada.\n8. Una vez fuera del rack, continuar con movimientos lentos y proceder a bajarlo lentamente en posición segura.",
    safety_title: "Seguridad y Prevención",
    risks_title: "Riesgos",
    risks: "• Caída de carga\n• Golpes / Atrapamientos",
    prevention_title: "Prevención",
    prevention: "• Mantener distancia\n• No estar bajo la carga\n• Inspección diaria",
    gold_rules_title: "Reglas de Oro",
    gold_rules: "• No operar solo\n• No cargas desbalanceadas\n• Comunicación constante",
    checklist_title: "Checklist Diario",
    critical: "CRÍTICO",
    checks: "• Grúa\n• Ganchos\n• Eslingas\n• Cable de acero\n• Área\n• Comunicación",
    failure_msg: "Si hay falla: **NO operar y reportar inmediatamente**.",
    footer_text: "TUUCI AGENT - PROTOCOLO DE SEGURIDAD INDUSTRIAL",
    footer_gen: "Generado el:"
  },
  en: {
    title: "📘 Double Hook Crane Handling",
    subtitle: "Safety protocol for Aluminum Bundles",
    printBtn: "Print Protocol",
    langBtn: "Español",
    personal_title: "1. Personnel",
    personal: "• Requires **2 operators**: Crane Operator and Helper / Signaler\n• Constant communication at all times",
    inspection_title: "2. Pre-operation Inspection",
    inspection: "• Crane functioning correctly\n• Hooks in good condition\n• Slings without damage\n• Steel cable without broken wires\n• Area free of people and obstacles",
    prep_title: "3. Bundle Preparation",
    prep: "• Identify bundle length and mark attachment points.\n• **If over 20 ft**: Remove wood or materials protruding underneath.",
    sling_title: "Sling Selection",
    slings: "• Not going to top rack → Use **10 ft**\n• Going to top rack → Use **8 ft or 6 ft** (prevents collisions)\n**Special rule for top rack**: Remove intermediate wood before insertion for better control.",
    hook_pos_title: "4. Hook Position (KEY)",
    hooks_gt20_title: "Bundles Over 20 ft",
    hooks_gt20: "One hook at **13 ft** (center) + Another at **1 ft** from the end.",
    hooks_le20_title: "Bundles 20 ft or less",
    hooks_le20: "One hook at **11 ft** (center) + Another at **1 ft** from the end.",
    move_title: "5 & 6. Lifting and Movement",
    move: "• Lift hooks **evenly** and verify leveling.\n• Movement **slow and controlled**, without sudden moves.\n• Maintain constant communication with the signaler.",
    save_title: "7. Storing the Bundle",
    save: "1. Attach both hooks evenly to the bundle, using corresponding FT (**11 ft or 13 ft** and **1 ft** from the end).\n2. Lift the bundle straight, keeping it level.\n3. Align the bundle with the rack or cart before introducing it.\n4. Slowly introduce the end where **NOT** marked at 1 ft.\n5. Advance slowly until the center sling (**11 ft or 13 ft**) touches the rack.\n6. When reaching the end, lower the bundle until that end is supported on the cart.\n7. With the end already supported, release the hook attached to the rack/cart.\n8. With the other hook, move the bundle inward in a controlled manner.\n9. When the bundle touches the end, release the second hook, always verifying stability.\n10. With the **forklift**, insert the bundle always leaving enough space to be able to grab it again at the time of removal.",
    remove_title: "8. Bundle Removal",
    remove: "1. Pull the bundle out approximately **2 ft** using the forklift.\n2. Attach the hook furthest out to begin extraction.\n3. Once the first hook is secured, lift the bundle slightly to remove it from the rack.\n4. Withdraw the bundle slowly using that hook, until the cart inside the rack reaches the output limit.\n5. When the cart reaches the limit, attach the **second hook**.\n6. Lift the bundle until it completely detaches from the cart and is level.\n7. With both hooks secured, move the bundle outward in a controlled manner.\n8. Once outside the rack, continue with slow movements and proceed to lower it slowly into a safe position.",
    safety_title: "Safety and Prevention",
    risks_title: "Risks",
    risks: "• Falling load\n• Impact / Entrapment",
    prevention_title: "Prevention",
    prevention: "• Keep distance\n• Do not stand under the load\n• Daily inspection",
    gold_rules_title: "Golden Rules",
    gold_rules: "• Do not operate alone\n• No unbalanced loads\n• Constant communication",
    checklist_title: "Daily Checklist",
    critical: "CRITICAL",
    checks: "• Crane\n• Hooks\n• Slings\n• Steel Cable\n• Area\n• Communication",
    failure_msg: "If there is a failure: **DO NOT operate and report immediately**.",
    footer_text: "TUUCI AGENT - INDUSTRIAL SAFETY PROTOCOL",
    footer_gen: "Generated on:"
  }
};

export default function CraneSafety() {
  const { user } = useAuth();
  const { lang } = useLang();
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProtocol();
  }, []);

  const loadProtocol = async () => {
    try {
      setLoading(true);
      const data = await getSafetyProtocol();
      if (data) {
        // Deep merge to ensure all keys exist
        setContent({
          es: { ...DEFAULT_CONTENT.es, ...data.es },
          en: { ...DEFAULT_CONTENT.en, ...data.en }
        });
      }
    } catch (err) {
      console.error("Error loading protocol:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateSafetyProtocol(content);
      setIsEditing(false);
    } catch (err) {
      alert("Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    loadProtocol();
    setIsEditing(false);
  };

  const updateField = (langKey: 'es' | 'en', field: string, value: string) => {
    setContent(prev => ({
      ...prev,
      [langKey]: {
        ...((prev as any)[langKey]),
        [field]: value
      }
    }));
  };

  const parseMarkdown = (text: string) => {
    if (!text) return null;

    return text.split("\n").map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed && i > 0) return <div key={i} className="h-2" />;

      // Regex for bold **text**
      const parts = trimmed.split(/(\*\*.*?\*\*)/g);
      const formattedLine = parts.map((part, pi) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <span key={pi} className="font-bold text-white print:text-black print:font-extrabold">{part.slice(2, -2)}</span>;
        }
        return part;
      });

      // Bullets
      if (trimmed.startsWith("•") || trimmed.startsWith("-")) {
        return (
          <div key={i} className="flex gap-2 items-start py-0.5">
            <span className="text-indigo-500 font-bold">•</span>
            <span className="flex-1">
              {parts.map((p, pi) => {
                const pTrim = p.trim();
                let finalP = p;
                if (pi === 0 && (pTrim.startsWith("•") || pTrim.startsWith("-"))) {
                  finalP = p.replace(/^[•-]\s*/, "");
                }
                if (finalP.startsWith("**") && finalP.endsWith("**")) {
                  return <span key={pi} className="font-bold text-white print:text-black print:font-extrabold">{finalP.slice(2, -2)}</span>;
                }
                return finalP;
              })}
            </span>
          </div>
        );
      }

      // Numbers
      if (/^\d+\./.test(trimmed)) {
        const numMatch = trimmed.match(/^(\d+\.)\s*(.*)/);
        if (numMatch) {
          const num = numMatch[1];
          const rest = numMatch[2];
          // Parse bold in rest
          const restParts = rest.split(/(\*\*.*?\*\*)/g);
          return (
            <div key={i} className="flex gap-2 items-start py-0.5">
              <span className="font-bold text-indigo-500 min-w-[20px]">{num}</span>
              <span className="flex-1">
                {restParts.map((p, pi) => {
                  if (p.startsWith("**") && p.endsWith("**")) {
                    return <span key={pi} className="font-bold text-white print:text-black print:font-extrabold">{p.slice(2, -2)}</span>;
                  }
                  return p;
                })}
              </span>
            </div>
          );
        }
      }

      return <p key={i}>{formattedLine}</p>;
    });
  };

  const EditableModule = ({
    langKey,
    field,
    titleField,
    icon: Icon,
    className = ""
  }: any) => {
    const title = (content as any)[langKey][titleField];
    const value = (content as any)[langKey][field];

    return (
      <div className={`glass p-6 rounded-2xl space-y-4 border-l-4 ${className} print:border print:shadow-none print:mb-4`}>
        <div className="flex items-center gap-3 opacity-90 print:text-black">
          {Icon && <Icon className="w-5 h-5 text-current" />}
          <h3 className="font-bold uppercase tracking-wider text-sm flex-1">
            {isEditing ? (
              <input
                type="text"
                value={title}
                onChange={(e) => updateField(langKey, titleField, e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-indigo-500"
              />
            ) : title}
          </h3>
        </div>

        <div className="text-base text-slate-300 print:text-black">
          {isEditing ? (
            <textarea
              value={value}
              onChange={(e) => updateField(langKey, field, e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-indigo-500 min-h-[120px] font-mono"
              placeholder="Escribe aquí... Usa **negrita** para resaltar."
            />
          ) : (
            <div className="space-y-1">
              {parseMarkdown(value)}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 opacity-50">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-400 font-medium tracking-wide">Cargando protocolo...</p>
      </div>
    );
  }

  const t: any = content[lang];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8 pb-12"
    >
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

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/50 p-8 rounded-3xl border border-white/5 print:border-none print:p-0 print:bg-transparent">
        <div className="flex-1 w-full">
          <h1 className="text-3xl font-black text-white print:text-black">
            {isEditing ? (
              <input
                type="text"
                value={t.title}
                onChange={(e) => updateField(lang, 'title', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-white focus:outline-none focus:border-indigo-500"
              />
            ) : t.title}
          </h1>
          <div className="text-slate-400 mt-2 font-medium print:text-slate-700 w-full">
            {isEditing ? (
              <input
                type="text"
                value={t.subtitle}
                onChange={(e) => updateField(lang, 'subtitle', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-white focus:outline-none focus:border-indigo-500"
              />
            ) : t.subtitle}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          {user?.role === 'ADMIN' && (
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Guardar
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all border border-white/5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all border border-white/5 shadow-lg"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </button>
              )}
            </div>
          )}

          {!isEditing && (
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/20"
            >
              <Printer className="w-4 h-4" />
              {t.printBtn}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:block">
        <EditableModule
          langKey={lang} field="personal" titleField="personal_title"
          icon={Users} className="border-l-blue-500 text-blue-400"
        />
        <EditableModule
          langKey={lang} field="inspection" titleField="inspection_title"
          icon={Search} className="border-l-amber-500 text-amber-400"
        />

        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 print:block">
          <EditableModule
            langKey={lang} field="prep" titleField="prep_title"
            icon={Ruler} className="border-l-indigo-500 text-indigo-400"
          />
          <EditableModule
            langKey={lang} field="slings" titleField="sling_title"
            icon={ClipboardCheck} className="border-l-indigo-400 text-indigo-300"
          />
        </div>

        <div className="md:col-span-2 glass p-6 rounded-2xl space-y-4 border-l-4 border-l-emerald-500 print:border print:shadow-none print:mb-4">
          <div className="flex items-center gap-3 text-emerald-400 print:text-black">
            <Anchor className="w-5 h-5" />
            <h3 className="font-bold uppercase tracking-wider text-sm flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={t.hook_pos_title}
                  onChange={(e) => updateField(lang, 'hook_pos_title', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-indigo-500"
                />
              ) : t.hook_pos_title}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/50 p-5 rounded-xl print:bg-slate-100">
              <h4 className="text-white font-bold mb-2 print:text-black uppercase text-xs tracking-wider">
                {isEditing ? (
                  <input
                    type="text"
                    value={t.hooks_gt20_title}
                    onChange={(e) => updateField(lang, 'hooks_gt20_title', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-xs"
                  />
                ) : t.hooks_gt20_title}
              </h4>
              <div className="text-sm text-slate-300 print:text-black">
                {isEditing ? (
                  <textarea
                    value={t.hooks_gt20}
                    onChange={(e) => updateField(lang, 'hooks_gt20', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs"
                  />
                ) : parseMarkdown(t.hooks_gt20)}
              </div>
            </div>
            <div className="bg-slate-800/50 p-5 rounded-xl print:bg-slate-100">
              <h4 className="text-white font-bold mb-2 print:text-black uppercase text-xs tracking-wider">
                {isEditing ? (
                  <input
                    type="text"
                    value={t.hooks_le20_title}
                    onChange={(e) => updateField(lang, 'hooks_le20_title', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white text-xs"
                  />
                ) : t.hooks_le20_title}
              </h4>
              <div className="text-sm text-slate-300 print:text-black">
                {isEditing ? (
                  <textarea
                    value={t.hooks_le20}
                    onChange={(e) => updateField(lang, 'hooks_le20', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs"
                  />
                ) : parseMarkdown(t.hooks_le20)}
              </div>
            </div>
          </div>
        </div>

        <EditableModule
          langKey={lang} field="move" titleField="move_title"
          icon={ArrowUp} className="border-l-sky-500 text-sky-400"
        />

        <EditableModule
          langKey={lang} field="save" titleField="save_title"
          icon={ArrowDown} className="border-l-purple-500 text-purple-400 md:col-span-2"
        />

        <EditableModule
          langKey={lang} field="remove" titleField="remove_title"
          icon={History} className="border-l-pink-500 text-pink-400 md:col-span-2"
        />

        <div className="glass p-6 rounded-2xl space-y-4 border-l-4 border-l-red-500 md:col-span-2 print:border print:shadow-none print:mb-4">
          <div className="flex items-center gap-3 text-red-500 print:text-black">
            <Shield className="w-5 h-5" />
            <h3 className="font-bold uppercase tracking-wider text-sm flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={t.safety_title}
                  onChange={(e) => updateField(lang, 'safety_title', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white"
                />
              ) : t.safety_title}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm font-bold text-slate-500 uppercase mb-3 tracking-wider">
                {isEditing ? (
                  <input
                    type="text"
                    value={t.risks_title}
                    onChange={(e) => updateField(lang, 'risks_title', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-1"
                  />
                ) : t.risks_title}
              </h4>
              <div className="text-sm text-slate-300 print:text-black">
                {isEditing ? (
                  <textarea
                    value={t.risks}
                    onChange={(e) => updateField(lang, 'risks', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-1 text-xs min-h-[80px]"
                  />
                ) : parseMarkdown(t.risks)}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-500 uppercase mb-3 tracking-wider">
                {isEditing ? (
                  <input
                    type="text"
                    value={t.prevention_title}
                    onChange={(e) => updateField(lang, 'prevention_title', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-1"
                  />
                ) : t.prevention_title}
              </h4>
              <div className="text-sm text-slate-300 print:text-black">
                {isEditing ? (
                  <textarea
                    value={t.prevention}
                    onChange={(e) => updateField(lang, 'prevention', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-1 text-xs min-h-[80px]"
                  />
                ) : parseMarkdown(t.prevention)}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-500 uppercase mb-3 tracking-wider">
                {isEditing ? (
                  <input
                    type="text"
                    value={t.gold_rules_title}
                    onChange={(e) => updateField(lang, 'gold_rules_title', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-1"
                  />
                ) : t.gold_rules_title}
              </h4>
              <div className="text-sm text-slate-300 print:text-black">
                {isEditing ? (
                  <textarea
                    value={t.gold_rules}
                    onChange={(e) => updateField(lang, 'gold_rules', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-1 text-xs min-h-[80px]"
                  />
                ) : parseMarkdown(t.gold_rules)}
              </div>
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl space-y-3 bg-emerald-500/5 border-emerald-500/20 md:col-span-2 print:border print:shadow-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-emerald-400 print:text-black">
              <ClipboardCheck className="w-6 h-6" />
              <h3 className="font-bold uppercase tracking-wider text-lg flex-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={t.checklist_title}
                    onChange={(e) => updateField(lang, 'checklist_title', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-emerald-400"
                  />
                ) : t.checklist_title}
              </h3>
            </div>
            <div className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full animate-pulse print:hidden">
              {isEditing ? (
                <input
                  type="text"
                  value={t.critical}
                  onChange={(e) => updateField(lang, 'critical', e.target.value)}
                  className="bg-transparent border-none text-center w-16 text-white"
                />
              ) : t.critical}
            </div>
          </div>
          <div className="flex flex-wrap gap-4 py-2">
            {isEditing ? (
              <textarea
                value={t.checks}
                onChange={(e) => updateField(lang, 'checks', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm"
                placeholder="Usa • para cada item de grúa..."
              />
            ) : (
              <div className="flex flex-wrap gap-4">
                {t.checks.split("\n").map((check: string, ci: number) => (
                  <div key={ci} className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-lg border border-white/5 print:bg-slate-100">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                    <span className="text-sm font-bold text-slate-200 print:text-black">
                      {check.replace(/^[•-]\s*/, "")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mt-4 p-5 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-4 print:bg-slate-100 print:border">
            <AlertCircle className="w-7 h-7 text-red-500" />
            <div className="text-base font-bold text-red-200 print:text-black flex-1">
              {isEditing ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={t.failure_msg}
                    onChange={(e) => updateField(lang, 'failure_msg', e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-red-200"
                  />
                </div>
              ) : parseMarkdown(t.failure_msg)}
            </div>
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <div className="hidden print:block text-center mt-12 pt-8 border-t border-slate-200">
        <p className="text-xs text-slate-500 font-bold">
          {isEditing ? (
            <input
              type="text"
              value={t.footer_text}
              onChange={(e) => updateField(lang, 'footer_text', e.target.value)}
              className="w-full bg-transparent text-center border-none"
            />
          ) : t.footer_text}
        </p>
        <p className="text-[10px] text-slate-400 mt-1">
          {isEditing ? (
            <input
              type="text"
              value={t.footer_gen}
              onChange={(e) => updateField(lang, 'footer_gen', e.target.value)}
              className="bg-transparent text-center border-none"
            />
          ) : t.footer_gen} {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
        </p>
      </div>
    </motion.div>
  );
}
