import React from 'react';
import { ShieldCheck } from 'lucide-react';

const APP_STORE_URL = 'https://apps.apple.com/gb/app/cruzi/id6759689036';

export default function ConnectCompletePage() {
  const handleOpenApp = () => {
    window.location.href = 'cruzi://';
    setTimeout(() => { window.location.href = APP_STORE_URL; }, 1500);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', border: '3px solid #7C3AED', background: '#F0EFFE', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
          <ShieldCheck size={40} color="#10B981" />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: '0 0 12px', fontFamily: 'inherit' }}>
          You're ready to receive payments
        </h1>
        <p style={{ fontSize: 16, color: '#6B7280', lineHeight: 1.6, margin: '0 0 40px', fontFamily: 'inherit' }}>
          Students can now pay you directly through Cruzi. Your first payment will arrive within 2 working days of each lesson.
        </p>
        <button
          onClick={handleOpenApp}
          style={{ width: '100%', height: 48, borderRadius: 16, background: '#7C3AED', color: '#fff', fontSize: 16, fontWeight: 600, border: 'none', cursor: 'pointer', marginBottom: 16, fontFamily: 'inherit' }}
        >
          Open Cruzi
        </button>
        <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0, fontFamily: 'inherit' }}>
          You can manage your payouts anytime in Settings → Payments
        </p>
      </div>
    </div>
  );
}
