import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { createServerSupabase } from '@/lib/supabase/server';
import { StatusBadge } from '@/components/complaints/StatusBadge';
import { PriorityStars } from '@/components/complaints/PriorityStars';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { AdminFilters } from './AdminFilters';
import { AdminAnalyticsBar } from './AdminAnalyticsBar';
import { AdminBulkActions } from './AdminBulkActions';
import { AdminExportButton } from './AdminExportButton';

export const metadata = {
  title: 'Admin Panel — VoiceIt',
  description: 'Manage all student complaints with AI insights',
};

const CATEGORY_FILTERS = ['All', 'Infrastructure', 'Academic', 'Administration', 'Hostel', 'Other'];
const STATUS_FILTERS = ['All', 'Pending', 'In Review', 'Resolved'];

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; category?: string; q?: string; priority?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const supabase = createServerSupabase();
  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('clerk_id', userId)
    .single();

  if (user?.role !== 'admin') redirect('/403');

  const { status, category, q, priority } = await searchParams;
  const activeStatus = STATUS_FILTERS.includes(status || '') ? status : 'All';
  const activeCategory = CATEGORY_FILTERS.includes(category || '') ? category : 'All';

  let query = supabase
    .from('complaints')
    .select('*, user:users(name, avatar_url, email)')
    .order('created_at', { ascending: false });

  if (activeStatus && activeStatus !== 'All') query = query.eq('status', activeStatus);
  if (activeCategory && activeCategory !== 'All') query = query.eq('category', activeCategory);
  if (q) query = query.ilike('title', `%${q}%`);
  if (priority) query = query.eq('priority', parseInt(priority));

  const { data: complaints } = await query;

  // ---- Stats ----
  const [
    { count: totalCount },
    { count: pendingCount },
    { count: reviewCount },
    { count: resolvedCount },
    { count: totalUsers },
    { data: categoryData },
  ] = await Promise.all([
    supabase.from('complaints').select('*', { count: 'exact', head: true }),
    supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'Pending'),
    supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'In Review'),
    supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'Resolved'),
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('complaints').select('category'),
  ]);

  // Build category breakdown
  const categoryMap: Record<string, number> = {};
  categoryData?.forEach((c: any) => {
    if (c.category) categoryMap[c.category] = (categoryMap[c.category] || 0) + 1;
  });
  const categoryBreakdown = Object.entries(categoryMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const resolutionRate = totalCount
    ? Math.round(((resolvedCount ?? 0) / (totalCount ?? 1)) * 100)
    : 0;

  const stats = [
    {
      label: 'Total Complaints',
      value: totalCount ?? 0,
      icon: 'assignment',
      color: 'text-primary',
      bg: 'bg-primary-container',
      trend: null,
    },
    {
      label: 'Pending',
      value: pendingCount ?? 0,
      icon: 'pending_actions',
      color: 'text-error',
      bg: 'bg-error-container',
      trend: null,
    },
    {
      label: 'In Review',
      value: reviewCount ?? 0,
      icon: 'rate_review',
      color: 'text-on-secondary-container',
      bg: 'bg-secondary-container',
      trend: null,
    },
    {
      label: 'Resolved',
      value: resolvedCount ?? 0,
      icon: 'check_circle',
      color: 'text-primary',
      bg: 'bg-primary-container',
      trend: null,
    },
    {
      label: 'Total Students',
      value: totalUsers ?? 0,
      icon: 'group',
      color: 'text-on-tertiary-container',
      bg: 'bg-tertiary-container',
      trend: null,
    },
    {
      label: 'Resolution Rate',
      value: `${resolutionRate}%`,
      icon: 'insights',
      color: 'text-primary',
      bg: 'bg-primary-container',
      trend: null,
    },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">

      {/* ---- Header ---- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="material-symbols-outlined text-[18px] text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              shield
            </span>
            <span className="font-label-md text-label-md text-primary uppercase tracking-wider">Admin Only</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Command Centre</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            AI-powered complaint management & analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AdminExportButton complaints={complaints || []} />
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 bg-surface-container border border-outline-variant/30 text-on-surface font-label-lg text-label-lg px-4 py-2.5 rounded-xl hover:bg-surface-container-high transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
            <span className="hidden sm:inline">Manage Users</span>
          </Link>
        </div>
      </div>

      {/* ---- Stats Grid ---- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-4 flex flex-col gap-2"
          >
            <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center`}>
              <span
                className={`material-symbols-outlined text-[16px] ${stat.color}`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {stat.icon}
              </span>
            </div>
            <div>
              <p className="text-[22px] font-bold text-on-surface leading-none">{stat.value}</p>
              <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5 leading-tight">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ---- Analytics Bar (Category Breakdown) ---- */}
      {categoryBreakdown.length > 0 && (
        <AdminAnalyticsBar
          categoryBreakdown={categoryBreakdown}
          total={totalCount ?? 0}
          resolutionRate={resolutionRate}
        />
      )}

      {/* ---- Quick Action Cards ---- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { href: '/admin?status=Pending', label: 'Review Pending', icon: 'pending_actions', color: 'text-error', count: pendingCount ?? 0 },
          { href: '/admin?priority=5', label: 'Urgent (P5)', icon: 'priority_high', color: 'text-error', count: null },
          { href: '/admin/users', label: 'Manage Roles', icon: 'admin_panel_settings', color: 'text-primary', count: null },
          { href: '/admin?status=Resolved', label: 'Resolved', icon: 'check_circle', color: 'text-primary', count: resolvedCount ?? 0 },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-4 hover:border-primary/30 hover:shadow-card transition-all group flex items-center gap-3"
          >
            <span
              className={`material-symbols-outlined text-[22px] ${action.color} group-hover:scale-110 transition-transform`}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {action.icon}
            </span>
            <div className="min-w-0">
              <p className="font-label-lg text-label-lg text-on-surface truncate">{action.label}</p>
              {action.count !== null && (
                <p className="font-label-sm text-label-sm text-on-surface-variant">{action.count} items</p>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* ---- Filters ---- */}
      <Suspense fallback={<div className="h-24 bg-surface-container-low animate-pulse rounded-2xl mb-4" />}>
        <AdminFilters
          activeStatus={activeStatus || 'All'}
          activeCategory={activeCategory || 'All'}
          currentQ={q || ''}
        />
      </Suspense>

      {/* ---- Complaints List with Bulk Actions ---- */}
      <div className="mt-4">
        {!complaints?.length ? (
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-12 text-center">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-3 block">search_off</span>
            <p className="font-body-lg text-body-lg text-on-surface-variant">No complaints found</p>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">Try adjusting your filters.</p>
          </div>
        ) : (
          <AdminBulkActions complaints={complaints} />
        )}
      </div>
    </div>
  );
}
