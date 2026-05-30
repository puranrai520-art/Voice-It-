'use client';

import { useState } from 'react';

export function AdminExportButton({ complaints }: { complaints: any[] }) {
  const [exporting, setExporting] = useState(false);

  const exportCSV = () => {
    setExporting(true);
    try {
      const headers = ['ID', 'Title', 'Description', 'Category', 'Status', 'Priority', 'Student', 'Email', 'Created At'];
      const rows = complaints.map((c) => [
        c.id,
        `"${(c.title || '').replace(/"/g, '""')}"`,
        `"${(c.description || '').replace(/"/g, '""')}"`,
        c.category || '',
        c.status || '',
        c.priority || '',
        c.user?.name || '',
        c.user?.email || '',
        new Date(c.created_at).toLocaleString(),
      ]);

      const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `voiceit-complaints-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setTimeout(() => setExporting(false), 1000);
    }
  };

  return (
    <button
      onClick={exportCSV}
      disabled={exporting || complaints.length === 0}
      title="Export complaints as CSV"
      className="inline-flex items-center gap-2 bg-secondary-container text-on-secondary-container font-label-lg text-label-lg px-4 py-2.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all border border-secondary/20 disabled:opacity-50"
    >
      <span
        className="material-symbols-outlined text-[18px]"
        style={{ fontVariationSettings: exporting ? "'FILL' 1" : "'FILL' 0" }}
      >
        {exporting ? 'download_done' : 'download'}
      </span>
      <span className="hidden sm:inline">{exporting ? 'Exported!' : 'Export CSV'}</span>
    </button>
  );
}
