import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Brain, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
            const response = await fetch(`${apiBase}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Error al iniciar sesión');

            login(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0c10] p-4 font-sans">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md glass p-10 rounded-[40px] border border-white/5 relative overflow-hidden shadow-2xl"
            >
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 opacity-80" />

                <div className="flex flex-col items-center mb-10">
                    <div className="p-4 bg-indigo-600 rounded-2xl shadow-2xl shadow-indigo-600/40 mb-4">
                        <Brain className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tighter">Tuuci Agent</h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">SISTEMA DE GESTIÓN</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Usuario / Email</label>
                        <input
                            type="email"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.07] transition-all placeholder:text-slate-700"
                            placeholder="Introduce tu correo"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Contraseña</label>
                        <input
                            type="password"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.07] transition-all placeholder:text-slate-700"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold"
                        >
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-5 rounded-2xl shadow-2xl shadow-indigo-600/30 transition-all hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-3 text-sm"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'INICIAR SESIÓN'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;
