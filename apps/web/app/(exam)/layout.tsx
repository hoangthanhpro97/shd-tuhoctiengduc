'use client';

import { AuthProvider } from '../../components/auth/AuthProvider';

export default function ExamGroupLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <AuthProvider>
      <div className="exam-route-shell">{children}</div>
    </AuthProvider>
  );
}
