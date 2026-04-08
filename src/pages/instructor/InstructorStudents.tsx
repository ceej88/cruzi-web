import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Users, Search, Phone, Mail, Clock } from 'lucide-react';

interface Props { userId: string; }

function useStudents(userId: string) {
  return useQuery({
    queryKey: ['dash-students', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, status, credit_balance, total_hours, progress, next_lesson, created_at')
        .eq('instructor_id', userId)
        .order('full_name');
      if (error) throw error;
      return data ?? [];
    },
  });
}

const statusColour: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  ENQUIRY: 'bg-blue-100 text-blue-700',
  INACTIVE: 'bg-gray-100 text-gray-500',
  PASSED: 'bg-purple-100 text-purple-700',
};

const InstructorStudents: React.FC<Props> = ({ userId }) => {
  const { data: students = [], isLoading, error } = useStudents(userId);
  const [search, setSearch] = useState('');

  const filtered = students.filter(s =>
    !search || s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = students.filter(s => !s.status || s.status === 'ACTIVE').length;
  const pendingCount = students.filter(s => s.status === 'PENDING' || s.status === 'ENQUIRY').length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
          <div className="text-2xl font-bold text-gray-900">{students.length}</div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{activeCount}</div>
          <div className="text-xs text-gray-500">Active</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 text-center">
          <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          <div className="text-xs text-gray-500">Pending</div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search students..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#7c3aed]"
        />
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 h-20 animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-600">
          Failed to load students. Please refresh.
        </div>
      )}

      {!isLoading && !error && filtered.length === 0 && (
        <div className="text-center py-16">
          <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-500">
            {search ? 'No students match your search' : 'No students yet'}
          </p>
          <p className="text-sm text-gray-400 mt-1">Add students from the Cruzi mobile app</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map(s => {
          const initials = s.full_name
            ? s.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
            : '?';
          const statusKey = s.status ?? 'ACTIVE';
          const creditOk = (s.credit_balance ?? 0) >= 0;

          return (
            <div key={s.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-[#7c3aed]">{initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900 truncate">{s.full_name ?? 'Unnamed'}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColour[statusKey] ?? 'bg-gray-100 text-gray-500'}`}>
                      {statusKey}
                    </span>
                    {!creditOk && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                        Negative balance
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                    {s.email && (
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{s.email}</span>
                    )}
                    {s.phone && (
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{s.phone}</span>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  {s.total_hours != null && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 justify-end">
                      <Clock className="w-3 h-3" />
                      <span>{Number(s.total_hours).toFixed(1)}h</span>
                    </div>
                  )}
                  {s.credit_balance != null && (
                    <p className={`text-xs font-semibold ${creditOk ? 'text-green-600' : 'text-red-500'}`}>
                      £{Number(s.credit_balance).toFixed(2)}
                    </p>
                  )}
                  {s.progress != null && (
                    <p className="text-xs text-gray-400">{Math.round(Number(s.progress))}% ready</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InstructorStudents;
