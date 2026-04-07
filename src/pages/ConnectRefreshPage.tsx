import React from 'react';
import { AlertTriangle } from 'lucide-react';

const APP_STORE_URL = 'https://apps.apple.com/gb/app/cruzi/id6759689036';

export default function ConnectRefreshPage() {
  const handleOpenApp = () => {
    window.location.href = 'cruzi://';
    setTimeout(() => { window.location.href = APP_STORE_URL; }, 1500);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', border: '3px solid #F59E0B', background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
          <AlertTriangle size={40} color="#F59E0B" />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: '0 0 12px', fontFamily: 'inherit' }}>
          Your session timed out
        </h1>
        <p style={{ fontSize: 16, color: '#6B7280', lineHeight: 1.6, margin: '0 0 40px', fontFamily: 'inherit' }}>
          No worries — your progress has been saved by Stripe. Just restart the setup from the Cruzi app.
        </p>
        <button
          onClick={handleOpenApp}
          style={{ width: '100%', height: 48, borderRadius: 16, background: '#7C3AED', color: '#fff', fontSize: 16, fontWeight: 600, border: 'none', cursor: 'pointer', marginBottom: 16, fontFamily: 'inherit' }}
        >
          Open Cruzi
        </button>
        <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0, fontFamily: 'inherit' }}>
          If you keep seeing this, contact us at{' '}
          <a href="mailto:support@cruzi.co.uk" style={{ color: '#7C3AED', textDecoration: 'none' }}>support@cruzi.co.uk</a>
        </p>
      </div>
    </div>
  );
}
