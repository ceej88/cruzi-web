import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { BarChart3, Eye, Smartphone, Monitor, Globe, TrendingUp } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface PageView {
  id: string;
  page: string;
  referrer: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  device_type: string | null;
  created_at: string;
}

const PageAnalyticsSection: React.FC = () => {
  const [views, setViews] = useState<PageView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchViews = async () => {
      const { data } = await supabase
        .from('page_views')
        .select('*')
        .eq('page', '/savings')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (data) setViews(data as PageView[]);
      setLoading(false);
    };
    fetchViews();
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);

    const today = views.filter(v => new Date(v.created_at) >= todayStart).length;
    const thisWeek = views.filter(v => new Date(v.created_at) >= weekStart).length;
    const total = views.length;

    // Device breakdown
    const mobile = views.filter(v => v.device_type === 'mobile').length;
    const desktop = views.filter(v => v.device_type === 'desktop').length;

    // UTM source breakdown
    const sourceMap: Record<string, number> = {};
    views.forEach(v => {
      const src = v.utm_source || 'Direct / Unknown';
      sourceMap[src] = (sourceMap[src] || 0) + 1;
    });
    const sources = Object.entries(sourceMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Daily chart data (last 14 days)
    const dailyMap: Record<string, number> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(todayStart);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dailyMap[key] = 0;
    }
    views.forEach(v => {
      const key = new Date(v.created_at).toISOString().split('T')[0];
      if (key in dailyMap) dailyMap[key]++;
    });
    const dailyChart = Object.entries(dailyMap).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      views: count,
    }));

    return { today, thisWeek, total, mobile, desktop, sources, dailyChart };
  }, [views]);

  if (loading) {
    return (
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-40 mb-4" />
        <div className="h-40 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-2">
        <BarChart3 className="h-4 w-4 text-blue-500" />
        <p className="text-[11px] font-black text-blue-500 uppercase tracking-[0.3em]">
          PAGE ANALYTICS
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Today', value: stats.today, icon: Eye },
          { label: 'This Week', value: stats.thisWeek, icon: TrendingUp },
          { label: 'All Time', value: stats.total, icon: Globe },
        ].map(s => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 text-center"
          >
            <s.icon className="h-4 w-4 mx-auto text-slate-400 mb-2" />
            <p className="text-2xl font-black text-slate-900">{s.value}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
              {s.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Daily chart */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
        <h3 className="text-sm font-black text-slate-900 mb-4">Daily Views (14 days)</h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.dailyChart}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 9, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                width={20}
              />
              <Tooltip
                contentStyle={{
                  background: '#1e293b',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              />
              <Bar dataKey="views" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Device breakdown */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
        <h3 className="text-sm font-black text-slate-900 mb-4">Device Breakdown</h3>
        <div className="flex gap-4">
          <div className="flex-1 flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <Smartphone className="h-5 w-5 text-violet-500" />
            <div>
              <p className="text-lg font-black text-slate-900">{stats.mobile}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mobile</p>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
            <Monitor className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-lg font-black text-slate-900">{stats.desktop}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Desktop</p>
            </div>
          </div>
        </div>
      </div>

      {/* UTM source breakdown */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
        <h3 className="text-sm font-black text-slate-900 mb-4">Traffic Sources</h3>
        {stats.sources.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No views yet. Share your link!</p>
        ) : (
          <div className="space-y-2">
            {stats.sources.map(s => (
              <div
                key={s.name}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
              >
                <span className="font-bold text-slate-900 text-sm capitalize">{s.name}</span>
                <span className="text-xs font-black text-slate-500 bg-slate-200 px-3 py-1 rounded-full">
                  {s.count} views
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageAnalyticsSection;
