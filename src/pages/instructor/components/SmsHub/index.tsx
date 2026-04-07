import React, { useState, useEffect } from 'react';
import { useSmsCredits } from '@/hooks/useSmsCredits';
import SmsRemindersTab from './SmsRemindersTab';
import SmsBroadcastTab from './SmsBroadcastTab';
import SmsBundlesTab from './SmsBundlesTab';
import SmsHistoryTab from './SmsHistoryTab';

type Tab = 'reminders' | 'broadcast' | 'bundles' | 'history';

const SmsHub: React.FC = () => {
  const { credits, checkPurchaseSuccess } = useSmsCredits();
  const [tab, setTab] = useState<Tab>('reminders');

  useEffect(() => {
    checkPurchaseSuccess();
  }, [checkPurchaseSuccess]);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'reminders', label: 'SMS Reminders' },
    { id: 'broadcast', label: 'Broadcast' },
    { id: 'bundles', label: 'SMS Bundles' },
    { id: 'history', label: 'History' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Credit banner */}
      <div className="mx-4 mt-3 bg-[#34C759] rounded-xl px-4 py-2.5">
        <p className="text-white text-sm font-bold">
          Credits: <span className="text-base">{credits}</span> SMS Messages.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white mt-3 sticky top-0 z-10 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-shrink-0 px-4 py-3 text-xs font-bold tracking-wide transition-all relative whitespace-nowrap ${
              tab === t.id ? 'text-[#3B82F6]' : 'text-[#6B7280]'
            }`}
            style={{ touchAction: 'manipulation' }}
          >
            {t.label}
            {tab === t.id && (
              <div className="absolute bottom-0 left-2 right-2 h-[3px] bg-[#3B82F6] rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
        {tab === 'reminders' && <SmsRemindersTab />}
        {tab === 'broadcast' && <SmsBroadcastTab />}
        {tab === 'bundles' && <SmsBundlesTab />}
        {tab === 'history' && <SmsHistoryTab />}
      </div>
    </div>
  );
};

export default SmsHub;
