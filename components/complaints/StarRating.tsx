'use client';

import { useState, useTransition } from 'react';
import { submitRating } from '@/actions/complaints';

interface StarRatingProps {
  complaintId: string;
  currentRating: number | null;
  isResolved: boolean;
}

export function StarRating({ complaintId, currentRating, isResolved }: StarRatingProps) {
  const [hovered, setHovered] = useState(0);
  const [rating, setRating] = useState(currentRating ?? 0);
  const [submitted, setSubmitted] = useState(!!currentRating);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState('');

  if (!isResolved) return null;

  const handleRate = (val: number) => {
    if (submitted && rating === val) return;
    startTransition(async () => {
      try {
        await submitRating(complaintId, val);
        setRating(val);
        setSubmitted(true);
        setMessage('Thanks for your feedback! ⭐');
        setTimeout(() => setMessage(''), 3000);
      } catch {
        setMessage('Failed to save rating. Try again.');
        setTimeout(() => setMessage(''), 3000);
      }
    });
  };

  const labels = ['Terrible', 'Bad', 'Okay', 'Good', 'Excellent'];
  const activeVal = hovered || rating;

  return (
    <div className="bg-surface-container border border-outline-variant/20 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <span
          className="material-symbols-outlined text-[18px] text-primary"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          reviews
        </span>
        <p className="font-label-lg text-label-lg text-on-surface">
          {submitted ? 'Your Rating' : 'Rate this Resolution'}
        </p>
        {submitted && (
          <span className="ml-auto font-label-sm text-label-sm text-on-surface-variant">
            (tap to change)
          </span>
        )}
      </div>

      <p className="font-body-md text-body-md text-on-surface-variant mb-4">
        {submitted
          ? 'Thank you for rating how well your complaint was resolved.'
          : 'How satisfied are you with how your complaint was resolved?'}
      </p>

      {/* Star row */}
      <div
        className="flex gap-1.5 mb-2"
        onMouseLeave={() => setHovered(0)}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            disabled={isPending}
            onClick={() => handleRate(n)}
            onMouseEnter={() => setHovered(n)}
            aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
            className={`transition-all duration-150 disabled:cursor-not-allowed ${
              isPending ? 'opacity-50' : 'hover:scale-110 active:scale-95'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[32px] transition-all duration-150 ${
                n <= activeVal
                  ? n >= 4 ? 'text-primary' : n >= 2 ? 'text-secondary' : 'text-outline'
                  : 'text-outline-variant'
              }`}
              style={{
                fontVariationSettings: n <= activeVal ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              star
            </span>
          </button>
        ))}
      </div>

      {/* Label */}
      <div className="h-5 mb-3">
        {activeVal > 0 && (
          <p className={`font-label-md text-label-md transition-all ${
            activeVal >= 4 ? 'text-primary' : activeVal >= 3 ? 'text-secondary' : 'text-error'
          }`}>
            {labels[activeVal - 1]}
          </p>
        )}
      </div>

      {/* Toast message */}
      {message && (
        <p className={`font-label-md text-label-md mt-1 ${
          message.includes('Thanks') ? 'text-primary' : 'text-error'
        }`}>
          {message}
        </p>
      )}
    </div>
  );
}
