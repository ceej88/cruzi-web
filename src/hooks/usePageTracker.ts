import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePageTracker = (page: string) => {
  useEffect(() => {
    const sessionKey = `page_tracked_${page}`;

    // Prevent duplicate logs per browser session
    if (sessionStorage.getItem(sessionKey)) return;

    const params = new URLSearchParams(window.location.search);

    const deviceType = window.innerWidth < 768 ? 'mobile' : 'desktop';

    const payload = {
      page,
      referrer: document.referrer || null,
      utm_source: params.get('utm_source') || null,
      utm_medium: params.get('utm_medium') || null,
      utm_campaign: params.get('utm_campaign') || null,
      device_type: deviceType,
      screen_width: window.innerWidth,
      user_agent: navigator.userAgent || null,
    };

    supabase
      .from('page_views')
      .insert(payload)
      .then(() => {
        sessionStorage.setItem(sessionKey, '1');
      });
  }, [page]);
};
