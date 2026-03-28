import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Verificar localStorage primeiro
    const saved = localStorage.getItem('kutexa_theme');
    if (saved !== null) {
      return saved === 'dark';
    }
    // Caso contrário, usar preferência do sistema (padrão: dark)
    return true;
  });

  const toggleTheme = (darkMode) => {
    setIsDarkMode(darkMode);
    localStorage.setItem('kutexa_theme', darkMode ? 'dark' : 'light');
    applyTheme(darkMode);
  };

  const applyTheme = (darkMode) => {
    const htmlElement = document.documentElement;
    const bodyElement = document.body;
    
    if (darkMode) {
      // Dark Mode - Neo-Cyberpunk
      htmlElement.setAttribute('data-theme', 'dark');
      htmlElement.classList.add('theme-dark');
      htmlElement.classList.remove('theme-light');
      bodyElement.setAttribute('data-theme', 'dark');
      bodyElement.classList.add('theme-dark');
      bodyElement.classList.remove('theme-light');
      document.body.style.backgroundColor = '#0A0A0F';
      document.body.style.color = '#F0F0FF';
    } else {
      // Light Mode - Apple Style
      htmlElement.setAttribute('data-theme', 'light');
      htmlElement.classList.add('theme-light');
      htmlElement.classList.remove('theme-dark');
      bodyElement.setAttribute('data-theme', 'light');
      bodyElement.classList.add('theme-light');
      bodyElement.classList.remove('theme-dark');
      document.body.style.backgroundColor = '#F5F5F7';
      document.body.style.color = '#1D1D1F';
    }
  };

  // Aplicar tema no primeiro carregamento
  useEffect(() => {
    applyTheme(isDarkMode);
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  }
  return context;
};
