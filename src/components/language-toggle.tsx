'use client';

import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/use-language';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'es' : 'en');
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggleLanguage} aria-label="Toggle language">
      <div className="h-6 w-8 flex items-center justify-center rounded-sm text-sm font-semibold">
        {language.toUpperCase()}
      </div>
    </Button>
  );
}
