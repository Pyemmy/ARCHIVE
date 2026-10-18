import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safely suppress uncaught errors originating from browser extensions (e.g. MetaMask inpage.js)
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event?.reason;
    const msg = typeof reason === 'string' ? reason : reason?.message || '';
    const stack = reason?.stack || '';
    if (
      msg.includes('MetaMask') ||
      msg.includes('Failed to connect to MetaMask') ||
      stack.includes('chrome-extension://') ||
      stack.includes('moz-extension://') ||
      stack.includes('inpage.js')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });

  window.addEventListener('error', (event) => {
    const filename = event?.filename || '';
    const msg = event?.message || '';
    if (
      filename.includes('chrome-extension://') ||
      filename.includes('moz-extension://') ||
      filename.includes('inpage.js') ||
      msg.includes('MetaMask') ||
      msg.includes('Failed to connect to MetaMask')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });
}

createRoot(document.getElementById('root')!).render(<App />);
