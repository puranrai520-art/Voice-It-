'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreateStudentModal } from './CreateStudentModal';

export function CreateStudentButton() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function handleSuccess() {
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        id="create-student-btn"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 text-white font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-md text-sm"
        style={{ background: 'linear-gradient(135deg, #3b1fa8, #7c3aed)' }}
      >
        <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>person_add</span>
        <span className="hidden sm:inline">Create Student</span>
        <span className="sm:hidden">Add</span>
      </button>

      {open && (
        <CreateStudentModal
          onClose={() => setOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}
