export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center bg-grid-pattern">
      {children}
    </div>
  );
}
