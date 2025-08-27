'use client';

import React, { useEffect, useState } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from '../i18n';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (i18n.isInitialized) {
      setIsInitialized(true);
    } else {
      const handleInitialized = () => {
        setIsInitialized(true);
      };
      i18n.on('initialized', handleInitialized);
      
      return () => {
        i18n.off('initialized', handleInitialized);
      };
    }
  }, []);

  if (!isInitialized) {
    return null; // O un componente de carga si lo prefieres
  }

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
};

export const useLanguage = () => {
  const { i18n } = useTranslation();
  
  // Función para obtener el idioma actual de forma segura
  const getSafeLanguage = () => {
    const currentI18nLanguage = i18n.language;
    if (typeof currentI18nLanguage === 'string') {
      return currentI18nLanguage.startsWith('es') ? 'es' : 'en';
    }
    return 'en'; // Valor predeterminado seguro
  };

  const [language, setLanguageState] = useState(getSafeLanguage());

  useEffect(() => {
    const handleLanguageChanged = () => {
      setLanguageState(getSafeLanguage());
    };

    i18n.on('languageChanged', handleLanguageChanged);
    
    // Asegurarse de que el estado inicial se establezca si i18n ya está inicializado
    setLanguageState(getSafeLanguage());

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]); // Dependencia en i18n para re-suscribirse si la instancia de i18n cambia (raro, pero seguro)

  const setLanguage = (lang: 'en' | 'es') => {
    i18n.changeLanguage(lang);
  };

  return { language, setLanguage };
};
