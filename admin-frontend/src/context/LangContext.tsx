import React, { createContext, useContext, useState } from 'react';

type Lang = 'es' | 'en';

interface LangContextType {
    lang: Lang;
    toggleLang: () => void;
}

const LangContext = createContext<LangContextType | undefined>(undefined);

export const LangProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [lang, setLang] = useState<Lang>('en');
    const toggleLang = () => setLang(prev => prev === 'es' ? 'en' : 'es');

    return (
        <LangContext.Provider value={{ lang, toggleLang }}>
            {children}
        </LangContext.Provider>
    );
};

export const useLang = () => {
    const context = useContext(LangContext);
    if (!context) throw new Error('useLang must be used within a LangProvider');
    return context;
};
