// Cruzi AI - Instructor Compliance Archive
// Audit-ready mock test history with export and detailed view

import React, { useState, useMemo, useRef } from 'react';
import { useInstructorData } from '@/hooks/useInstructorData';
import { format } from 'date-fns';
import { 
  Shield, 
  Filter, 
  FileSpreadsheet, 
  FolderOpen, 
  Calendar, 
  CheckCircle, 
  XCircle,
  X,
  FileText,
  FileDown
} from 'lucide-react';

const InstructorCompliance: React.FC = () => {
  const { mockTests, students } = useInstructorData();
  const [selectedPupilId, setSelectedPupilId] = useState<string>('all');
  const [viewingResult, setViewingResult] = useState<typeof mockTests[0] | null>(null);
  const scoreSheetRef = useRef<HTMLDivElement>(null);

  // Enrich mock tests with student names
  const enrichedHistory = useMemo(() => {
    return mockTests.map(test => ({
      ...test,
      pupilName: students.find(s => s.id === test.student_id)?.full_name || 'Unknown'
    }));
  }, [mockTests, students]);

  const filteredHistory = useMemo(() => {
    if (selectedPupilId === 'all') return enrichedHistory;
    return enrichedHistory.filter(h => h.student_id === selectedPupilId);
  }, [enrichedHistory, selectedPupilId]);

  const stats = useMemo(() => {
    const total = filteredHistory.length;
    const passes = filteredHistory.filter(h => h.passed).length;
    const fails = total - passes;
    const passRate = total > 0 ? Math.round((passes / total) * 100) : 0;
    const avgMinors = total > 0 ? Math.round(filteredHistory.reduce((sum, h) => sum + h.total_minors, 0) / total) : 0;
    return { total, passes, fails, passRate, avgMinors };
  }, [filteredHistory]);

  const handleExportCSV = () => {
    if (enrichedHistory.length === 0) {
      alert("No data available to export.");
      return;
    }

    const headers = ['ID', 'Date', 'Time', 'Pupil Name', 'Minors', 'Serious', 'Dangerous', 'Result'];
    const rows = enrichedHistory.map(res => {
      const dateObj = new Date(res.date);
      const date = format(dateObj, 'dd/MM/yyyy');
      const time = format(dateObj, 'HH:mm');
      const markers = Array.isArray(res.markers) ? res.markers : [];
      const seriousCount = markers.filter((m: any) => m.serious).length;
      const dangerousCount = markers.filter((m: any) => m.dangerous).length;
      const result = res.passed ? 'PASS' : 'FAIL';
      
      return [
        res.id,
        date,
        time,
        `"${res.pupilName}"`,
        res.total_minors,
        seriousCount,
        dangerousCount,
        result
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `Cruzi_Compliance_Export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    if (!viewingResult) return;
    
    const pupilName = students.find(s => s.id === viewingResult.student_id)?.full_name || 'Student';
    const markers = Array.isArray(viewingResult.markers) ? viewingResult.markers : [];
    const seriousCount = markers.filter((m: any) => m.serious).length;
    const dangerousCount = markers.filter((m: any) => m.dangerous).length;
    const faultyMarkers = markers.filter((m: any) => m.minors > 0 || m.serious || m.dangerous);
    
    // Create printable HTML content
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Mock Test Score Sheet - ${pupilName}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1a1a1a; }
          .header { text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid ${viewingResult.passed ? '#10b981' : '#ef4444'}; }
          .header h1 { font-size: 28px; font-weight: 900; margin-bottom: 8px; }
          .header p { color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; }
          .result-badge { display: inline-block; padding: 8px 32px; border-radius: 8px; font-size: 24px; font-weight: 900; color: white; background: ${viewingResult.passed ? '#10b981' : '#ef4444'}; margin: 20px 0; }
          .stats { display: flex; justify-content: center; gap: 40px; margin: 30px 0; }
          .stat { text-align: center; padding: 20px; background: #f5f5f5; border-radius: 12px; min-width: 100px; }
          .stat-value { font-size: 32px; font-weight: 900; }
          .stat-label { font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
          .faults { margin-top: 40px; }
          .faults h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #666; margin-bottom: 16px; }
          .fault-row { display: flex; justify-content: space-between; padding: 12px 16px; background: #f9f9f9; border-radius: 8px; margin-bottom: 8px; }
          .fault-category { font-weight: 600; }
          .fault-counts { display: flex; gap: 16px; }
          .fault-count { font-weight: 700; }
          .minor { color: #3b82f6; }
          .serious { color: #f59e0b; }
          .dangerous { color: #ef4444; }
          .footer { margin-top: 60px; text-align: center; color: #999; font-size: 11px; }
          .meta { display: flex; justify-content: center; gap: 40px; margin: 20px 0; color: #666; font-size: 13px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <p>Mock Test Score Sheet</p>
          <h1>${pupilName}</h1>
          <div class="meta">
            <span>Date: ${format(new Date(viewingResult.date), 'dd MMMM yyyy')}</span>
            <span>Time: ${format(new Date(viewingResult.date), 'HH:mm')}</span>
          </div>
          <div class="result-badge">${viewingResult.passed ? 'PASS' : 'FAIL'}</div>
        </div>
        
        <div class="stats">
          <div class="stat">
            <div class="stat-value" style="color: #3b82f6;">${viewingResult.total_minors}</div>
            <div class="stat-label">Minors</div>
          </div>
          <div class="stat">
            <div class="stat-value" style="color: ${seriousCount > 0 ? '#f59e0b' : '#ccc'};">${seriousCount}</div>
            <div class="stat-label">Serious</div>
          </div>
          <div class="stat">
            <div class="stat-value" style="color: ${dangerousCount > 0 ? '#ef4444' : '#ccc'};">${dangerousCount}</div>
            <div class="stat-label">Dangerous</div>
          </div>
        </div>
        
        ${faultyMarkers.length > 0 ? `
          <div class="faults">
            <h2>Fault Breakdown</h2>
            ${faultyMarkers.map((m: any) => `
              <div class="fault-row">
                <span class="fault-category">${m.category}</span>
                <div class="fault-counts">
                  ${m.minors > 0 ? `<span class="fault-count minor">${m.minors} Minor${m.minors > 1 ? 's' : ''}</span>` : ''}
                  ${m.serious ? '<span class="fault-count serious">Serious</span>' : ''}
                  ${m.dangerous ? '<span class="fault-count dangerous">Dangerous</span>' : ''}
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${viewingResult.notes ? `
          <div class="faults">
            <h2>Examiner Notes</h2>
            <div class="fault-row" style="display: block;">
              ${viewingResult.notes}
            </div>
          </div>
        ` : ''}
        
        <div class="footer">
          <p>Generated by Cruzi • ${format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
          <p style="margin-top: 4px;">This is a mock test record for training purposes only.</p>
        </div>
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 px-4">
      <div className="flex flex-col lg:flex-row justify-between lg:items-end px-2 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight flex items-center gap-4">
            <Shield className="h-8 w-8 text-primary" />
            Compliance Archive
          </h1>
          <p className="text-muted-foreground font-medium mt-2">Audit-ready historical score sheets and mock test records.</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-background px-6 py-5 rounded-3xl border border-border shadow-sm text-center">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Pass Rate</p>
          <p className="text-3xl font-black text-emerald-600">{stats.passRate}%</p>
        </div>
        <div className="bg-background px-6 py-5 rounded-3xl border border-border shadow-sm text-center">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Tests</p>
          <p className="text-3xl font-black text-foreground">{stats.total}</p>
        </div>
        <div className="bg-background px-6 py-5 rounded-3xl border border-border shadow-sm text-center">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Passed</p>
          <p className="text-3xl font-black text-emerald-600">{stats.passes}</p>
        </div>
        <div className="bg-background px-6 py-5 rounded-3xl border border-border shadow-sm text-center">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Failed</p>
          <p className="text-3xl font-black text-destructive">{stats.fails}</p>
        </div>
        <div className="bg-background px-6 py-5 rounded-3xl border border-border shadow-sm text-center">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Avg Minors</p>
          <p className="text-3xl font-black text-primary">{stats.avgMinors}</p>
        </div>
      </div>

      <div className="bg-foreground rounded-[3rem] p-6 md:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground text-2xl shadow-xl">
            <Filter className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <p className="text-primary text-[10px] font-black uppercase tracking-[0.2em]">Filter by Pupil</p>
            <select 
              value={selectedPupilId}
              onChange={(e) => setSelectedPupilId(e.target.value)}
              className="bg-transparent text-background font-black text-2xl border-none p-0 focus:ring-0 cursor-pointer hover:text-primary transition-colors appearance-none pr-8"
            >
              <option value="all" className="text-foreground">All Pupils</option>
              {students.map(s => (
                <option key={s.id} value={s.id} className="text-foreground">
                  {s.full_name || s.email}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={handleExportCSV}
            className="bg-background/10 hover:bg-background/20 text-background px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="bg-background rounded-[3rem] p-32 text-center border-4 border-dashed border-border">
          <FolderOpen className="h-24 w-24 text-muted-foreground/20 mx-auto mb-8" />
          <p className="text-muted-foreground font-black text-xl">No records found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredHistory.map((res) => {
            const markers = Array.isArray(res.markers) ? res.markers : [];
            return (
              <div key={res.id} className="bg-background rounded-[2.5rem] p-8 border border-border flex flex-col md:flex-row md:items-center justify-between hover:shadow-xl transition-all group gap-4">
                <div className="flex items-center gap-8">
                  <div className={`w-20 h-20 rounded-3xl flex flex-col items-center justify-center text-primary-foreground shadow-xl shrink-0 ${res.passed ? 'bg-emerald-500' : 'bg-destructive'}`}>
                    <span className="text-[10px] font-black uppercase tracking-tighter mb-0.5">{res.passed ? 'Pass' : 'Fail'}</span>
                    {res.passed ? <CheckCircle className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                  </div>
                  <div>
                    <h4 className="text-xl md:text-2xl font-black text-foreground tracking-tight">{res.pupilName}</h4>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-[11px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-muted-foreground/50" />
                        {format(new Date(res.date), 'dd/MM/yyyy')}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between md:justify-end gap-12">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Score Profile</p>
                    <p className="text-xl font-black text-foreground">
                      <span className="text-primary">{res.total_minors}M</span>
                      <span className="mx-2 opacity-20">|</span>
                      <span className={res.has_serious ? 'text-amber-500' : 'text-muted-foreground/30'}>
                        {markers.filter((m: any) => m.serious).length}S
                      </span>
                    </p>
                  </div>
                  <button 
                    onClick={() => setViewingResult(res)}
                    className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"
                  >
                    <FileText className="h-5 w-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewingResult && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-foreground/60 backdrop-blur-md animate-in fade-in duration-300">
          <div ref={scoreSheetRef} className="bg-background w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-500">
            <div className={`p-6 md:p-10 flex justify-between items-center text-primary-foreground ${viewingResult.passed ? 'bg-emerald-600' : 'bg-destructive'}`}>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-80 mb-2">Official Score Sheet</p>
                <h2 className="text-2xl md:text-4xl font-black tracking-tight">
                  {students.find(s => s.id === viewingResult.student_id)?.full_name || 'Student'}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleExportPDF}
                  className="w-12 h-12 rounded-full bg-background/20 hover:bg-background/30 flex items-center justify-center transition-all"
                  title="Download PDF"
                >
                  <FileDown className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => setViewingResult(null)}
                  className="w-12 h-12 rounded-full bg-background/20 hover:bg-background/30 flex items-center justify-center transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                <div className="p-4 bg-muted rounded-2xl border border-border text-center">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Minors</p>
                  <p className="text-2xl font-black text-foreground">{viewingResult.total_minors}</p>
                </div>
                <div className="p-4 bg-muted rounded-2xl border border-border text-center">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Serious</p>
                  <p className={`text-2xl font-black ${viewingResult.has_serious ? 'text-amber-500' : 'text-muted-foreground/30'}`}>
                    {Array.isArray(viewingResult.markers) ? viewingResult.markers.filter((m: any) => m.serious).length : 0}
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-2xl border border-border text-center">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Dangerous</p>
                  <p className={`text-2xl font-black ${viewingResult.has_dangerous ? 'text-destructive' : 'text-muted-foreground/30'}`}>
                    {Array.isArray(viewingResult.markers) ? viewingResult.markers.filter((m: any) => m.dangerous).length : 0}
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-2xl border border-border text-center">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Result</p>
                  <p className={`text-2xl font-black ${viewingResult.passed ? 'text-emerald-500' : 'text-destructive'}`}>
                    {viewingResult.passed ? 'PASS' : 'FAIL'}
                  </p>
                </div>
              </div>

              {/* Fault Breakdown */}
              {Array.isArray(viewingResult.markers) && viewingResult.markers.some((m: any) => m.minors > 0 || m.serious || m.dangerous) && (
                <div className="mb-8">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Fault Breakdown</p>
                  <div className="space-y-2">
                    {viewingResult.markers
                      .filter((m: any) => m.minors > 0 || m.serious || m.dangerous)
                      .map((m: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border">
                          <span className="font-bold text-foreground">{m.category}</span>
                          <div className="flex items-center gap-3">
                            {m.minors > 0 && <span className="text-sm font-bold text-primary">{m.minors} minor{m.minors > 1 ? 's' : ''}</span>}
                            {m.serious && <span className="text-sm font-black text-amber-500 uppercase">S</span>}
                            {m.dangerous && <span className="text-sm font-black text-destructive uppercase">D</span>}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {viewingResult.notes && (
                <div className="bg-muted rounded-2xl p-6 border border-border">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Examiner Notes</p>
                  <p className="text-foreground font-medium">{viewingResult.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorCompliance;
