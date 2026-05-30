'use client';

import { useState, useTransition } from 'react';
import { updateUserRole } from '@/actions/users';
import type { UserRole } from '@/types';

interface Props {
  userId: string;
  currentRole: UserRole;
  isSelf: boolean;
}

export function UserRoleClient({ userId, currentRole, isSelf }: Props) {
  const [role, setRole] = useState<UserRole>(currentRole);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const toggleRole = () => {
    const newRole: UserRole = role === 'admin' ? 'student' : 'admin';
    startTransition(async () => {
      try {
        await updateUserRole(userId, newRole);
        setRole(newRole);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      }
    });
  };

  if (isSelf) {
    return (
      <span className="inline-flex items-center gap-1 bg-primary text-on-primary font-label-md text-label-md px-3 py-1 rounded-full text-[11px]">
        <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
        Admin (you)
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 font-label-md text-label-md px-3 py-1 rounded-full text-[11px] ${
            role === 'admin'
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container-high text-on-surface'
          }`}
        >
          {role === 'admin' && (
            <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
          )}
          {role}
        </span>
        <button
          id={`toggle-role-${userId}`}
          onClick={toggleRole}
          disabled={isPending}
          className="font-label-md text-label-md text-primary hover:underline disabled:opacity-50 text-[12px]"
        >
          {isPending ? 'Updating…' : `Make ${role === 'admin' ? 'student' : 'admin'}`}
        </button>
      </div>
      {error && (
        <p className="font-body-md text-body-md text-error text-[11px]">{error}</p>
      )}
    </div>
  );
}
