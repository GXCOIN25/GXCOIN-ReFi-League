import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// TEMPORARILY DISABLED Service Worker for PWA functionality - debugging deployment issue
// Once deployment works, re-enable this
if ('serviceWorker' in navigator && false) { // DISABLED
  window.addEventListener('load', () => {
    // Unregister any existing service workers
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      for(let registration of registrations) {
        registration.unregister();
        console.log('[PWA] Unregistered service worker');
      }
    });
    
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('[PWA] Service Worker registered successfully:', registration);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[PWA] New content available, refresh to update');
                // You could show a toast notification here
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('[PWA] Service Worker registration failed:', error);
      });
  });
}

// Force unregister any existing service workers on load
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
      console.log('🗑️ UNREGISTERED old service worker - deployment fix');
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
