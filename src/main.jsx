import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ToastProvider } from './components/Toast'
import { ThemeProvider } from './context/ThemeContext'
import { CompareProvider } from './context/CompareContext'
import './i18n/config' // Import i18n config

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <CompareProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </CompareProvider>
    </ThemeProvider>
  </StrictMode>,
)

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    if (import.meta.env.DEV) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (let registration of registrations) {
          registration.unregister();
        }
      });
    } else {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  });
}

// Updated: 2025-10-12T16:06:36.901Z

// Updated: 2025-10-12T16:09:08.953Z
