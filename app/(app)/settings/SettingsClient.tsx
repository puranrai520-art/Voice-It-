'use client';

import { useState, useTransition, useRef } from 'react';
import {
  updateUserSettings,
  uploadProfilePhoto,
  updateStudentDetails,
  updateTeacherDetails,
} from '@/actions/users';
import type { StudentDetails, TeacherDetails } from '@/types';

interface Props {
  initialName: string;
  initialEmailNotifications: boolean;
  initialAvatarUrl?: string | null;
  userInitials: string;
  userRole: 'student' | 'admin';
  initialStudentDetails?: StudentDetails | null;
  initialTeacherDetails?: TeacherDetails | null;
}

export function SettingsClient({
  initialName,
  initialEmailNotifications,
  initialAvatarUrl,
  userInitials,
  userRole,
  initialStudentDetails,
  initialTeacherDetails,
}: Props) {
  // ─── Profile photo state ───
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl ?? null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadPending, startUploadTransition] = useTransition();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // ─── Profile name + notifications ───
  const [name, setName] = useState(initialName);
  const [emailNotifications, setEmailNotifications] = useState(initialEmailNotifications);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Student details ───
  const [studentDetails, setStudentDetails] = useState<StudentDetails>(
    initialStudentDetails ?? {}
  );
  const [isStudentPending, startStudentTransition] = useTransition();
  const [studentSaved, setStudentSaved] = useState(false);
  const [studentError, setStudentError] = useState<string | null>(null);

  // ─── Teacher details (admin) ───
  const [teacherDetails, setTeacherDetails] = useState<TeacherDetails>(
    initialTeacherDetails ?? {}
  );
  const [isTeacherPending, startTeacherTransition] = useTransition();
  const [teacherSaved, setTeacherSaved] = useState(false);
  const [teacherError, setTeacherError] = useState<string | null>(null);

  // ─── Photo handlers ───
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File too large. Maximum 5 MB.');
      return;
    }
    setUploadError(null);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = () => {
    if (!fileRef.current?.files?.[0]) return;
    setUploadError(null);
    setUploadSuccess(false);
    startUploadTransition(async () => {
      try {
        const fd = new FormData();
        fd.append('avatar', fileRef.current!.files![0]);
        const result = await uploadProfilePhoto(fd);
        setAvatarUrl(result.avatar_url);
        setAvatarPreview(null);
        if (fileRef.current) fileRef.current.value = '';
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      } catch (err: any) {
        setUploadError(err.message || 'Failed to upload photo');
      }
    });
  };

  // ─── Profile save ───
  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      try {
        await updateUserSettings({ name, email_notifications: emailNotifications });
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } catch (err: any) {
        setError(err.message || 'Failed to save settings');
      }
    });
  };

  // ─── Student details save ───
  const handleStudentSave = () => {
    setStudentError(null);
    startStudentTransition(async () => {
      try {
        await updateStudentDetails(studentDetails);
        setStudentSaved(true);
        setTimeout(() => setStudentSaved(false), 2500);
      } catch (err: any) {
        setStudentError(err.message || 'Failed to save details');
      }
    });
  };

  // ─── Teacher details save ───
  const handleTeacherSave = () => {
    setTeacherError(null);
    startTeacherTransition(async () => {
      try {
        await updateTeacherDetails(teacherDetails);
        setTeacherSaved(true);
        setTimeout(() => setTeacherSaved(false), 2500);
      } catch (err: any) {
        setTeacherError(err.message || 'Failed to save staff details');
      }
    });
  };

  const displayAvatar = avatarPreview || avatarUrl;

  return (
    <div className="flex flex-col gap-4">

      {/* ── Profile Photo ── */}
      <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-6">
        <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Profile Photo</h2>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar preview */}
          <div className="relative shrink-0">
            {displayAvatar ? (
              <img
                src={displayAvatar}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-[#1e0052]/20 shadow-lg ring-2 ring-[#1e0052]/10"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#1e0052] text-white flex items-center justify-center font-bold text-[26px] shadow-lg">
                {userInitials}
              </div>
            )}
            {/* Camera overlay button */}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#1e0052] text-white rounded-full flex items-center justify-center shadow-md hover:opacity-90 transition-opacity"
              aria-label="Change photo"
            >
              <span className="material-symbols-outlined text-[15px]">photo_camera</span>
            </button>
          </div>

          {/* Upload controls */}
          <div className="flex-1 flex flex-col gap-3 w-full">
            <div>
              <p className="font-label-lg text-label-lg text-on-surface">Upload a profile photo</p>
              <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                JPEG, PNG, WEBP or GIF — max 5 MB
              </p>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleAvatarChange}
              className="hidden"
              id="avatar-upload-input"
            />

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-2 bg-surface-container border border-outline-variant/30 text-on-surface font-label-lg text-label-lg px-4 py-2 rounded-xl hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">upload</span>
                Choose File
              </button>

              {avatarPreview && (
                <button
                  type="button"
                  onClick={handleAvatarUpload}
                  disabled={isUploadPending}
                  className="inline-flex items-center gap-2 bg-[#1e0052] text-white font-label-lg text-label-lg px-4 py-2 rounded-xl hover:opacity-90 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isUploadPending ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Uploading…
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">save</span>
                      Save Photo
                    </>
                  )}
                </button>
              )}

              {avatarUrl && !avatarPreview && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-2 text-on-surface-variant font-label-lg text-label-lg px-4 py-2 rounded-xl hover:bg-surface-container transition-colors border border-outline-variant/20"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  Change Photo
                </button>
              )}
            </div>

            {uploadError && (
              <div className="flex items-start gap-2 text-error font-body-md text-body-md bg-error-container/30 border border-error/20 rounded-xl px-3 py-2">
                <span className="material-symbols-outlined text-[16px] mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                <span>{uploadError}</span>
              </div>
            )}
            {uploadSuccess && (
              <div className="flex items-center gap-2 text-primary font-body-md text-body-md">
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                Profile photo updated successfully!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Display Name ── */}
      <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-6">
        <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Profile</h2>
        <div className="flex flex-col gap-2">
          <label htmlFor="settings-name" className="font-label-lg text-label-lg text-on-surface">
            Display Name
          </label>
          <input
            id="settings-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your display name"
            className="w-full bg-surface border border-outline-variant/30 rounded-xl px-4 py-3 font-body-lg text-body-lg text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-[#1e0052] focus:ring-2 focus:ring-[#1e0052]/20 transition-all"
          />
          <p className="font-body-md text-body-md text-on-surface-variant">
            This is the name displayed in the sidebar and complaint headers.
          </p>
        </div>
      </div>

      {/* ── Student Details (students only) ── */}
      {userRole === 'student' && (
        <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[20px] text-[#1e0052]" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
            <h2 className="font-headline-md text-headline-md text-on-surface">Student Details</h2>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant mb-5">
            These details help admin identify you and respond faster. Stored securely in your profile.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'roll_number', label: 'Roll Number', placeholder: 'e.g. CS2024001', icon: 'badge' },
              { key: 'course', label: 'Course / Programme', placeholder: 'e.g. B.Tech CSE', icon: 'menu_book' },
              { key: 'department', label: 'Department', placeholder: 'e.g. Computer Science', icon: 'domain' },
              { key: 'year', label: 'Year / Semester', placeholder: 'e.g. 3rd Year, Sem 5', icon: 'calendar_today' },
              { key: 'phone', label: 'Phone Number', placeholder: 'e.g. +91 9876543210', icon: 'phone' },
            ].map(({ key, label, placeholder, icon }) => (
              <div key={key} className="flex flex-col gap-1.5">
                <label className="font-label-lg text-label-lg text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-on-surface-variant">{icon}</span>
                  {label}
                </label>
                <input
                  type="text"
                  value={(studentDetails as any)[key] || ''}
                  onChange={(e) => setStudentDetails((prev) => ({ ...prev, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full bg-surface border border-outline-variant/30 rounded-xl px-4 py-2.5 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-[#1e0052] focus:ring-2 focus:ring-[#1e0052]/20 transition-all"
                />
              </div>
            ))}
          </div>

          {studentError && (
            <div className="mt-4 flex items-center gap-2 text-error font-body-md text-body-md">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
              {studentError}
            </div>
          )}

          <div className="flex justify-end mt-5">
            <button
              id="save-student-details-btn"
              type="button"
              onClick={handleStudentSave}
              disabled={isStudentPending}
              className="inline-flex items-center gap-2 bg-[#1e0052] text-white font-label-lg text-label-lg px-5 py-2.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isStudentPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving…
                </>
              ) : studentSaved ? (
                <>
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  Saved!
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  Save Details
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Staff / Teacher Details (admin only) ── */}
      {userRole === 'admin' && (
        <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[20px] text-[#1e0052]" style={{ fontVariationSettings: "'FILL' 1" }}>badge</span>
            <h2 className="font-headline-md text-headline-md text-on-surface">Staff Details</h2>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant mb-5">
            Your professional information displayed to students on complaint responses.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'employee_id', label: 'Employee ID', placeholder: 'e.g. EMP2024001', icon: 'badge' },
              { key: 'designation', label: 'Designation', placeholder: 'e.g. Head of Department', icon: 'work' },
              { key: 'department', label: 'Department', placeholder: 'e.g. Computer Science', icon: 'domain' },
              { key: 'phone', label: 'Phone / Extension', placeholder: 'e.g. +91 9876543210', icon: 'phone' },
            ].map(({ key, label, placeholder, icon }) => (
              <div key={key} className="flex flex-col gap-1.5">
                <label className="font-label-lg text-label-lg text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-on-surface-variant">{icon}</span>
                  {label}
                </label>
                <input
                  type="text"
                  value={(teacherDetails as any)[key] || ''}
                  onChange={(e) => setTeacherDetails((prev) => ({ ...prev, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full bg-surface border border-outline-variant/30 rounded-xl px-4 py-2.5 font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-[#1e0052] focus:ring-2 focus:ring-[#1e0052]/20 transition-all"
                />
              </div>
            ))}
          </div>

          {teacherError && (
            <div className="mt-4 flex items-center gap-2 text-error font-body-md text-body-md">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
              {teacherError}
            </div>
          )}

          <div className="flex justify-end mt-5">
            <button
              id="save-teacher-details-btn"
              type="button"
              onClick={handleTeacherSave}
              disabled={isTeacherPending}
              className="inline-flex items-center gap-2 bg-[#1e0052] text-white font-label-lg text-label-lg px-5 py-2.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isTeacherPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving…
                </>
              ) : teacherSaved ? (
                <>
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  Saved!
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  Save Details
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Notifications ── */}
      <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-6">
        <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Notifications</h2>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-label-lg text-label-lg text-on-surface">Email Notifications</p>
            <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
              Receive an email when an admin replies to your complaint.
            </p>
          </div>
          <button
            id="toggle-email-notifications"
            role="switch"
            aria-checked={emailNotifications}
            onClick={() => setEmailNotifications((v) => !v)}
            className={`relative shrink-0 w-12 h-6 rounded-full border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1e0052]/30 ${
              emailNotifications
                ? 'bg-[#1e0052] border-[#1e0052]'
                : 'bg-surface-container-high border-outline-variant/40'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                emailNotifications ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-error-container text-on-error-container rounded-xl px-4 py-3">
          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
          <p className="font-body-md text-body-md">{error}</p>
        </div>
      )}

      {/* Save Profile Button */}
      <button
        id="save-settings-btn"
        onClick={handleSave}
        disabled={isPending}
        className="self-end inline-flex items-center gap-2 bg-[#1e0052] text-white font-label-lg text-label-lg px-6 py-3 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Saving…
          </>
        ) : saved ? (
          <>
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            Saved!
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-[18px]">save</span>
            Save Changes
          </>
        )}
      </button>
    </div>
  );
}
