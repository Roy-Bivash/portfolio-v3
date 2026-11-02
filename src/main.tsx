import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './css/index.css'
import { Router } from './router/Router';
import { LanguageProvider } from './providers/languageProvider';
import { AppStateProvider } from './providers/AppStateProvider';
import { LightEffect } from './components/lightEffect/LightEffect';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppStateProvider>
      <LanguageProvider>
        <LightEffect />
        <Router />
      </LanguageProvider>
    </AppStateProvider>
  </StrictMode>,
)
