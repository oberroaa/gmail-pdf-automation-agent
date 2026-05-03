import React, { createContext, useContext, useState, useEffect } from 'react';
import es from '../locales/es.json';
import en from '../locales/en.json';

export type Lang = 'es' | 'en';

const translations = { es, en };

interface LangContextType {
    lang: Lang;
    toggleLang: () => void;
    t: any; // The translation object for the current language
}

const LangContext = createContext<LangContextType | undefined>(undefined);

export const LangProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Persistent language
    const [lang, setLang] = useState<Lang>(() => {
        const saved = localStorage.getItem('app_lang');
        return (saved as Lang) || 'en';
    });

    useEffect(() => {
        localStorage.setItem('app_lang', lang);
    }, [lang]);

    const toggleLang = () => setLang(prev => prev === 'es' ? 'en' : 'es');

    return (
        <LangContext.Provider value={{ lang, toggleLang, t: translations[lang] }}>
            {children}
        </LangContext.Provider>
    );
};

export const useLang = () => {
    const context = useContext(LangContext);
    if (!context) throw new Error('useLang must be used within a LangProvider');
    return context;
};
