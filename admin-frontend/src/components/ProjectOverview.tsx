import { useLang } from "../context/LangContext";
import {
    Brain, Box, Wind, HardHat, ShieldCheck,
    Zap, Database, BarChart3,
    Search, LayoutDashboard, ClipboardList, Settings2,
    Cpu, Code2, Globe, Server, Terminal,
    Mail, ExternalLink
} from "lucide-react";
import { motion } from "framer-motion";

export default function ProjectOverview() {
    const { t: globalT } = useLang();
    const t = globalT.overview;

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
                    {t.security_items.map((sec: any, i: number) => (
                        <div key={i} className="glass p-8 rounded-[2rem] border border-emerald-500/10 space-y-4 hover:border-emerald-500/30 transition-all duration-500 bg-gradient-to-br from-emerald-500/[0.02] to-transparent">
                            <h4 className="text-lg font-bold text-emerald-400">{sec.title}</h4>
                            <p className="text-sm text-slate-400 leading-relaxed">{sec.text}</p>
                        </div>
                    ))}
                </div>
            </motion.section>

            {/* Project Team Section */}
            <div className="space-y-8">
                <div className="flex items-center gap-4 px-4">
                    <ShieldCheck className="w-6 h-6 text-indigo-400" />
                    <h3 className="text-2xl font-black text-white tracking-tight">Equipo del Proyecto</h3>
                    <div className="h-px bg-white/10 flex-1" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Otoniel Card */}
                    <motion.section
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="glass p-8 rounded-[3rem] border border-indigo-500/10 bg-gradient-to-br from-indigo-500/[0.05] to-transparent relative overflow-hidden flex flex-col gap-6"
                    >
                        <div className="flex items-start gap-6">
                            <div className="relative shrink-0">
                                <div className="absolute -inset-2 bg-gradient-to-tr from-indigo-500 to-sky-400 rounded-2xl opacity-20 blur-lg animate-pulse" />
                                <img
                                    src="/profile.jpg"
                                    alt={t.developer.name}
                                    className="w-24 h-24 md:w-28 md:h-28 object-cover rounded-2xl border-2 border-white/10 relative z-10 shadow-xl"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${t.developer.name}&background=6366f1&color=fff&size=128`;
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400 px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                                    {t.developer.title}
                                </span>
                                <h3 className="text-2xl font-black text-white tracking-tight">{t.developer.name}</h3>
                                <div className="flex flex-wrap gap-2">
                                    {t.developer.roles.map((role: string, i: number) => (
                                        <span key={i} className="text-[10px] font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded-lg border border-white/5">{role}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed font-medium">
                            {t.developer.desc}
                        </p>
                        <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                            <a href={`mailto:${t.developer.email}`} className="p-2 bg-white/5 rounded-xl hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-400 transition-all"><Mail className="w-4 h-4" /></a>
                            <a href={t.developer.portfolio} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-xl hover:bg-sky-500/10 text-slate-400 hover:text-sky-400 transition-all"><ExternalLink className="w-4 h-4" /></a>
                        </div>
                    </motion.section>

                    {/* Angel Card */}
                    <motion.section
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="glass p-8 rounded-[3rem] border border-sky-500/10 bg-gradient-to-br from-sky-500/[0.05] to-transparent relative overflow-hidden flex flex-col gap-6"
                    >
                        <div className="flex items-start gap-6">
                            <div className="relative shrink-0">
                                <div className="absolute -inset-2 bg-gradient-to-tr from-sky-500 to-emerald-400 rounded-2xl opacity-10 blur-lg" />
                                <div className="w-24 h-24 md:w-28 md:h-28 bg-white rounded-2xl border-2 border-white/10 relative z-10 shadow-xl flex items-center justify-center">
                                    <ShieldCheck className="w-10 h-10 text-slate-200" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-sky-400 px-3 py-1 bg-sky-500/10 rounded-full border border-sky-500/20">
                                    {t.tester.title}
                                </span>
                                <h3 className="text-2xl font-black text-white tracking-tight">{t.tester.name}</h3>
                                <div className="flex flex-wrap gap-2">
                                    {t.tester.roles.map((role: string, i: number) => (
                                        <span key={i} className="text-[10px] font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded-lg border border-white/5">{role}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed font-medium">
                            {t.tester.desc}
                        </p>
                        <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                            <a href={`mailto:${t.tester.email}`} className="p-2 bg-white/5 rounded-xl hover:bg-sky-500/10 text-slate-400 hover:text-sky-400 transition-all"><Mail className="w-4 h-4" /></a>
                            <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Client Success</span>
                            </div>
                        </div>
                    </motion.section>
                </div>
            </div>

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
