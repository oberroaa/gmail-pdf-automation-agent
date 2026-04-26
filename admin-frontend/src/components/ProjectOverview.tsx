import { useState } from "react";
import {
    Brain, Box, Wind, HardHat, ShieldCheck,
    Zap, Database, BarChart3,
    Search, LayoutDashboard, ClipboardList, Settings2,
    Cpu, Code2, Globe, Server, Terminal, Languages,
    Mail, ExternalLink
} from "lucide-react";
import { motion } from "framer-motion";

const OVERVIEW_CONTENT = {
    es: {
        badge: "Sistema Inteligente Tuuci v2.0",
        title_top: "Ecosistema de",
        title_span: "Automatización Industrial",
        hero_desc: "Una solución integral que fusiona la versatilidad de la **Inteligencia Artificial** con la infalibilidad de **Motores de Precisión** para el control total de materiales y producción.",
        tech_title: "Arquitectura del Sistema",
        modules_title: "Módulos de Operación",
        active_badge: "Módulo Activo",
        sync_title: "Sincronización en Tiempo Real",
        sync_desc: "El Agente monitoriza constantemente Gmail. Cualquier cambio en las reglas de IA o en el inventario de Canopy se refleja instantáneamente en la próxima ejecución automática.",
        security_title: "Seguridad y Control de Acceso",
        security_desc: "El sistema implementa una arquitectura de seguridad robusta para proteger la integridad de los datos industriales.",
        security_items: [
            { title: "Roles de Usuario (RBAC)", text: "Diferenciación de permisos entre ADMIN, SUPERVISOR y CONSULTOR para restringir acciones críticas." },
            { title: "Encriptación de Datos", text: "Uso de algoritmos de hash irreversibles para proteger las credenciales de acceso (Zero-Knowledge)." },
            { title: "Auditoría", text: "Seguimiento de cambios en reglas y movimientos de inventario vinculados a cada usuario." }
        ],
        tech_items: [
            { label: "Frontend", value: "React + Vite", detail: "UI reactiva con Tailwind CSS y Framer Motion." },
            { label: "Backend", value: "Node.js (ESM)", detail: "API REST sobre Express con arquitectura Cloud." },
            { label: "AI Engine", value: "Gemini 2.5 Flash", detail: "Generación de reglas mediante NLP avanzado." },
            { label: "Base de Datos", value: "MongoDB Atlas", detail: "Persistencia NoSQL escalable y redundante." },
            { label: "Infraestructura", value: "Vercel / GitHub", detail: "CI/CD automatizado y tareas CRON (Agente)." },
            { label: "Comunicaciones", value: "Meta / Gmail API", detail: "Integración oficial de WhatsApp y correo." }
        ],
        modules_items: [
            {
                title: "Material Handler",
                description: "Gestión inteligente de materiales y pedidos generales.",
                details: "Este módulo utiliza Inteligencia Artificial para flexibilizar la lectura de pedidos. Permite al usuario definir reglas en lenguaje humano que Gemini traduce a lógica de filtrado, logrando una automatización proactiva que notifica vía WhatsApp y Email sobre requerimientos de stock.",
                features: ["Extracción asistida por IA", "Reglas dinámicas", "Historial de reportes", "Manejo de Grúa"]
            },
            {
                title: "Canopy",
                description: "Motor de precisión para el control de stock de telas.",
                details: "Módulo determinista de alta fidelidad. A diferencia de la IA, este motor 'mide' el PDF píxel a píxel para extraer datos de producción críticos con un 0% de error de interpretación. Es la herramienta vital para el cruce de yardas de tela requeridas vs. disponibles en el inventario real.",
                features: ["Precisión Píxel-a-Píxel", "Inventario en tiempo real", "Analizador de producción", "Cruce de requerimientos"]
            }
        ],
        developer: {
            title: "Desarrollador del Proyecto",
            name: "Otoniel Berroa",
            roles: ["Ingeniero Informático", "Desarrollo de Software", "Administrador de Sistemas"],
            email: "oberroaa@gmail.com",
            portfolio: "https://otoniel-portfolio.vercel.app/",
            desc: "Arquitecto y desarrollador principal de este ecosistema de automatización, enfocado en optimizar procesos industriales mediante tecnología de vanguardia."
        }
    },
    en: {
        badge: "Tuuci Intelligent System v2.0",
        title_top: "Industrial",
        title_span: "Automation Ecosystem",
        hero_desc: "An integral solution that merges the versatility of **Artificial Intelligence** with the infallibility of **Precision Engines** for total control of materials and production.",
        tech_title: "System Architecture",
        modules_title: "Operational Modules",
        active_badge: "Active Module",
        sync_title: "Real-Time Synchronization",
        sync_desc: "The Agent constantly monitors Gmail. Any changes in AI rules or Canopy inventory are instantly reflected in the next automatic execution.",
        security_title: "Security and Access Control",
        security_desc: "The system implements a robust security architecture to protect the integrity of industrial data.",
        security_items: [
            { title: "User Roles (RBAC)", text: "Permission differentiation between ADMIN, SUPERVISOR, and CONSULTOR to restrict critical actions." },
            { title: "Data Encryption", text: "Use of irreversible hashing algorithms to protect access credentials (Zero-Knowledge)." },
            { title: "Auditing", text: "Tracking of changes in rules and inventory movements linked to each user." }
        ],
        tech_items: [
            { label: "Frontend", value: "React + Vite", detail: "Reactive UI with Tailwind CSS and Framer Motion." },
            { label: "Backend", value: "Node.js (ESM)", detail: "REST API on Express with Cloud architecture." },
            { label: "AI Engine", value: "Gemini 2.5 Flash", detail: "Rule generation through advanced NLP." },
            { label: "Database", value: "MongoDB Atlas", detail: "Scalable and redundant NoSQL persistence." },
            { label: "Infrastructure", value: "Vercel / GitHub", detail: "Automated CI/CD and CRON tasks (Agent)." },
            { label: "Communications", value: "Meta / Gmail API", detail: "Official WhatsApp and Email integration." }
        ],
        modules_items: [
            {
                title: "Material Handler",
                description: "Intelligent management of materials and general orders.",
                details: "This module uses Artificial Intelligence to make order reading flexible. It allows the user to define rules in human language that Gemini translates into filtering logic, achieving proactive automation that notifies via WhatsApp and Email about stock requirements.",
                features: ["AI-assisted extraction", "Dynamic rules", "Report history", "Crane Handling"]
            },
            {
                title: "Canopy",
                description: "Precision engine for fabric stock control.",
                details: "High-fidelity deterministic module. Unlike AI, this engine 'measures' the PDF pixel by pixel to extract critical production data with 0% interpretation error. It's the vital tool for cross-referencing required vs. available fabric yardage in real inventory.",
                features: ["Pixel-by-Pixel Precision", "Real-time inventory", "Production analyzer", "Requirement cross-check"]
            }
        ],
        developer: {
            title: "Project Developer",
            name: "Otoniel Berroa",
            roles: ["Computer Engineer", "Software Development", "Systems Administrator"],
            email: "oberroaa@gmail.com",
            portfolio: "https://otoniel-portfolio.vercel.app/",
            desc: "Architect and lead developer of this automation ecosystem, focused on optimizing industrial processes through cutting-edge technology."
        }
    }
} as const;

export default function ProjectOverview() {
    const [lang, setLang] = useState<'es' | 'en'>('en');
    const t = OVERVIEW_CONTENT[lang];

    const techStack = [
        { icon: <Globe className="w-5 h-5" />, label: t.tech_items[0].label, value: t.tech_items[0].value, detail: t.tech_items[0].detail },
        { icon: <Server className="w-5 h-5" />, label: t.tech_items[1].label, value: t.tech_items[1].value, detail: t.tech_items[1].detail },
        { icon: <Brain className="w-5 h-5" />, label: t.tech_items[2].label, value: t.tech_items[2].value, detail: t.tech_items[2].detail },
        { icon: <Database className="w-5 h-5" />, label: t.tech_items[3].label, value: t.tech_items[3].value, detail: t.tech_items[3].detail },
        { icon: <Cpu className="w-5 h-5" />, label: t.tech_items[4].label, value: t.tech_items[4].value, detail: t.tech_items[4].detail },
        { icon: <Code2 className="w-5 h-5" />, label: t.tech_items[5].label, value: t.tech_items[5].value, detail: t.tech_items[5].detail }
    ];

    const modules = [
        {
            title: t.modules_items[0].title,
            description: t.modules_items[0].description,
            details: t.modules_items[0].details,
            icon: <Box className="w-6 h-6 text-indigo-400" />,
            color: "from-indigo-600/20 to-indigo-600/5",
            borderColor: "border-indigo-500/20",
            features: [
                { icon: <Brain className="w-4 h-4" />, text: t.modules_items[0].features[0] },
                { icon: <LayoutDashboard className="w-4 h-4" />, text: t.modules_items[0].features[1] },
                { icon: <ClipboardList className="w-4 h-4" />, text: t.modules_items[0].features[2] },
                { icon: <HardHat className="w-4 h-4" />, text: t.modules_items[0].features[3] }
            ]
        },
        {
            title: t.modules_items[1].title,
            description: t.modules_items[1].description,
            details: t.modules_items[1].details,
            icon: <Wind className="w-6 h-6 text-sky-400" />,
            color: "from-sky-600/20 to-sky-600/5",
            borderColor: "border-sky-500/20",
            features: [
                { icon: <Zap className="w-4 h-4" />, text: t.modules_items[1].features[0] },
                { icon: <Database className="w-4 h-4" />, text: t.modules_items[1].features[1] },
                { icon: <Search className="w-4 h-4" />, text: t.modules_items[1].features[2] },
                { icon: <BarChart3 className="w-4 h-4" />, text: t.modules_items[1].features[3] }
            ]
        }
    ];

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-16 pb-20">
            {/* Hero Section */}
            <header className="relative py-16 px-10 rounded-[3rem] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/25 via-slate-950 to-[#0a0c10] -z-10" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -z-10" />

                <div className="absolute top-8 right-10 z-20">
                    <button
                        onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl font-bold text-xs transition-all border border-white/5 shadow-lg backdrop-blur-md"
                    >
                        <Languages className="w-4 h-4 text-indigo-400" />
                        {lang === 'es' ? 'English' : 'Español'}
                    </button>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                        <ShieldCheck className="w-4 h-4 text-indigo-400" />
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-400">{t.badge}</span>
                    </div>

                    <h1 className="text-6xl font-black text-white leading-[1.1] tracking-tight">
                        {t.title_top} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400">{t.title_span}</span>
                    </h1>

                    <p className="text-slate-400 text-xl max-w-3xl leading-relaxed font-medium">
                        {t.hero_desc.split(/(\*\*.*?\*\*)/g).map((part: string, i: number) => (
                            part.startsWith("**") && part.endsWith("**") ? <span key={i} className="text-white">{part.slice(2, -2)}</span> : part
                        ))}
                    </p>
                </motion.div>
            </header>

            {/* Modules Grid - Detailed Summaries */}
            <div className="space-y-8">
                <div className="flex items-center gap-4 px-4">
                    <Settings2 className="w-6 h-6 text-sky-400" />
                    <h3 className="text-2xl font-black text-white tracking-tight">{t.modules_title}</h3>
                    <div className="h-px bg-white/10 flex-1" />
                </div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 lg:grid-cols-2 gap-10"
                >
                    {modules.map((mod, idx) => (
                        <motion.div
                            key={idx}
                            variants={item}
                            className={`glass p-10 rounded-[3rem] border ${mod.borderColor} relative group overflow-hidden`}
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${mod.color} opacity-0 group-hover:opacity-100 transition-all duration-700`} />

                            <div className="relative space-y-8">
                                <div className="flex items-center justify-between">
                                    <div className="w-16 h-16 bg-slate-950 rounded-[1.5rem] flex items-center justify-center border border-white/10 shadow-2xl">
                                        {mod.icon}
                                    </div>
                                    <div className="bg-white/5 px-4 py-1 rounded-full border border-white/5">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.active_badge}</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-3xl font-black text-white">{mod.title}</h3>
                                    <p className="text-slate-300 font-semibold text-sm leading-relaxed">{mod.description}</p>
                                    <p className="text-slate-500 text-sm leading-relaxed">{mod.details}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                                    {mod.features.map((feat, i) => (
                                        <div key={i} className="flex items-center gap-3 text-slate-400">
                                            <div className="p-2 bg-white/5 rounded-xl text-indigo-400">
                                                {feat.icon}
                                            </div>
                                            <span className="text-[11px] font-bold uppercase tracking-tight">{feat.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* Tech Stack - Improved Visuals */}
            <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="space-y-8"
            >
                <div className="flex items-center gap-4 px-4">
                    <Terminal className="w-6 h-6 text-indigo-400" />
                    <h3 className="text-2xl font-black text-white tracking-tight">{t.tech_title}</h3>
                    <div className="h-px bg-white/10 flex-1" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {techStack.map((tech, i) => (
                        <div key={i} className="glass p-6 rounded-[2rem] border border-white/5 space-y-4 group hover:border-indigo-500/40 transition-all duration-500 bg-gradient-to-br from-white/[0.03] to-transparent">
                            <div className="w-12 h-12 bg-slate-900/50 rounded-2xl flex items-center justify-center text-indigo-400 border border-white/5 group-hover:scale-110 transition-transform">
                                {tech.icon}
                            </div>
                            <div className="space-y-1">
                                <p className="text-[11px] font-black text-indigo-500 uppercase tracking-widest">{tech.label}</p>
                                <p className="text-lg font-bold text-white">{tech.value}</p>
                                <p className="text-xs text-slate-500 leading-relaxed">{tech.detail}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.section>

            {/* Security Section */}
            <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="space-y-8"
            >
                <div className="flex items-center gap-4 px-4">
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                    <h3 className="text-2xl font-black text-white tracking-tight">{t.security_title}</h3>
                    <div className="h-px bg-white/10 flex-1" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {t.security_items.map((sec, i) => (
                        <div key={i} className="glass p-8 rounded-[2rem] border border-emerald-500/10 space-y-4 hover:border-emerald-500/30 transition-all duration-500 bg-gradient-to-br from-emerald-500/[0.02] to-transparent">
                            <h4 className="text-lg font-bold text-emerald-400">{sec.title}</h4>
                            <p className="text-sm text-slate-400 leading-relaxed">{sec.text}</p>
                        </div>
                    ))}
                </div>
            </motion.section>

            {/* Developer Profile Section */}
            <motion.section
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="glass p-8 md:p-12 rounded-[3rem] border border-indigo-500/10 bg-gradient-to-br from-indigo-500/[0.05] to-transparent relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl -z-10" />

                <div className="flex flex-col md:flex-row items-center gap-10">
                    <div className="relative shrink-0">
                        <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500 to-sky-400 rounded-[2.5rem] opacity-20 blur-xl animate-pulse" />
                        <img
                            src="/profile.jpg"
                            alt={t.developer.name}
                            className="w-48 h-48 md:w-56 md:h-56 object-cover rounded-[2.5rem] border-2 border-white/10 relative z-10 shadow-2xl"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=Otoniel&background=6366f1&color=fff&size=256";
                            }}
                        />
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-6">
                        <div className="space-y-2">
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-400 px-4 py-1.5 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                                {t.developer.title}
                            </span>
                            <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight pt-2">{t.developer.name}</h3>
                        </div>

                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                            {t.developer.roles.map((role, i) => (
                                <div key={i} className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                                    {i === 0 ? <Code2 className="w-4 h-4 text-sky-400" /> : i === 1 ? <Terminal className="w-4 h-4 text-indigo-400" /> : <Server className="w-4 h-4 text-emerald-400" />}
                                    <span className="text-sm font-bold text-slate-300">{role}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                            <a 
                                href={`mailto:${t.developer.email}`}
                                className="flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition-colors group"
                            >
                                <div className="p-2 bg-white/5 rounded-lg group-hover:bg-indigo-500/10 transition-colors">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-medium">{t.developer.email}</span>
                            </a>
                            <a 
                                href={t.developer.portfolio}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-slate-400 hover:text-sky-400 transition-colors group"
                            >
                                <div className="p-2 bg-white/5 rounded-lg group-hover:bg-sky-500/10 transition-colors">
                                    <ExternalLink className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-medium">Portfolio / GitHub</span>
                            </a>
                        </div>

                        <p className="text-slate-400 text-lg leading-relaxed font-medium max-w-2xl">
                            {t.developer.desc}
                        </p>
                    </div>
                </div>
            </motion.section>

            {/* Info Cards */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="grid grid-cols-1 gap-6"
            >
                <div className="glass p-8 rounded-[2rem] border border-white/5 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-24 h-24 bg-indigo-500/10 rounded-3xl flex items-center justify-center border border-indigo-500/20 shrink-0">
                        <Settings2 className="w-10 h-10 text-indigo-400" />
                    </div>
                    <div>
                        <h4 className="text-xl font-bold text-white mb-2">{t.sync_title}</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            {t.sync_desc}
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
