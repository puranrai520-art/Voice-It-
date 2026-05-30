'use client';

import { useState, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

const STATUS_FILTERS = ['All', 'Pending', 'In Review', 'Resolved'];
const CATEGORY_FILTERS = ['All', 'Infrastructure', 'Academic', 'Administration', 'Hostel', 'Other'];

interface AdminFiltersProps {
  activeStatus: string;
  activeCategory: string;
  currentQ: string;
}

export function AdminFilters({ activeStatus, activeCategory, currentQ }: AdminFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(currentQ);

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === 'All' || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams('q', q);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant pointer-events-none">
            search
          </span>
          <input
            id="admin-search-input"
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title…"
            className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <button
          type="submit"
          className="bg-primary text-on-primary font-label-lg text-label-lg px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
        >
          Search
        </button>
      </form>

      {/* Status filters */}
      <div className="flex gap-2 flex-wrap items-center">
        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Status:</span>
        {STATUS_FILTERS.map((f) => {
          const isActive = activeStatus === f;
          const activeClass =
            f === 'All'       ? 'bg-primary text-on-primary border-primary shadow-sm' :
            f === 'Pending'   ? 'status-pending-active shadow-sm' :
            f === 'In Review' ? 'status-review-active shadow-sm' :
            f === 'Resolved'  ? 'status-resolved-active shadow-sm' : '';

          const dotColor =
            f === 'Pending'   ? 'bg-amber-500' :
            f === 'In Review' ? 'bg-blue-500' :
            f === 'Resolved'  ? 'bg-emerald-500' : '';

          return (
            <button
              key={f}
              id={`admin-status-filter-${f.toLowerCase().replace(' ', '-')}`}
              onClick={() => updateParams('status', f)}
              className={`inline-flex items-center gap-1.5 font-label-lg text-label-lg px-3 py-1.5 rounded-full border transition-all text-[12px] ${
                isActive
                  ? activeClass
                  : 'bg-surface-container text-on-surface-variant border-outline-variant/30 hover:bg-surface-container-high'
              }`}
            >
              {f !== 'All' && (
                <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor} ${!isActive ? 'opacity-50' : ''}`} />
              )}
              {f}
            </button>
          );
        })}
      </div>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORY_FILTERS.map((f) => (
          <button
            key={f}
            id={`admin-cat-filter-${f.toLowerCase()}`}
            onClick={() => updateParams('category', f)}
            className={`font-label-lg text-label-lg px-3 py-1.5 rounded-full border transition-all text-[12px] ${
              activeCategory === f
                ? 'bg-secondary text-on-secondary border-secondary shadow-sm'
                : 'bg-surface-container text-on-surface-variant border-outline-variant/30 hover:bg-surface-container-high'
            }`}
          >
            {f}
          </button>
        ))}
      </div>
    </div>
  );
}
