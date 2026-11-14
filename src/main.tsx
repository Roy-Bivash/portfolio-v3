import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './css/index.css';
import './css/font.css';
import './css/prose.css';
import { Router } from './router/Router';
import { LanguageProvider } from './providers/LanguageProvider';
import { AppStateProvider } from './providers/AppStateProvider';
import { LightEffect } from './components/lightEffect/LightEffect';
import { DataProvider } from './providers/DataProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppStateProvider>
      <LanguageProvider>
        <DataProvider>
          <LightEffect />
          <Router />
        </DataProvider>
      </LanguageProvider>
    </AppStateProvider>
  </StrictMode>,
)
