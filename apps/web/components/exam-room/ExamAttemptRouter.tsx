'use client';

import { useEffect, useState } from 'react';
import { ExamWorkspace } from './ExamWorkspace';
import { ExamWorkstationCore } from './core/ExamWorkstationCore';
import { FullExamSwitcher } from './core/FullExamSwitcher';

export function ExamAttemptRouter({ attemptId }: { attemptId: string }) {
  const [routeType, setRouteType] = useState<'lesen' | 'hoeren' | 'all' | null>(() => {
    if (attemptId.includes('-lesen-')) return 'lesen';
    if (attemptId.includes('-hoeren-')) return 'hoeren';
    if (attemptId.includes('-all-')) return 'all';
    return null;
  });

  useEffect(() => {
    if (routeType !== null) return;
    fetch(`/api/v1/attempts/${attemptId}`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (payload?.sectionFilter === 'lesen' || attemptId.includes('lesen')) {
          setRouteType('lesen');
        } else if (payload?.sectionFilter === 'hoeren' || attemptId.includes('hoeren')) {
          setRouteType('hoeren');
        } else {
          // Full Test (`sectionFilter === 'all'`): route to dual frozen workspaces (no legacy ExamRoom fallback)
          setRouteType('all');
        }
      })
      .catch(() => setRouteType('all'));
  }, [attemptId, routeType]);

  if (routeType === null) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-slate-500">
        Đang mở phòng thi...
      </div>
    );
  }

  // Phòng Đọc hiểu (Lesen) chuẩn vàng đã đóng băng 100%
  if (routeType === 'lesen') {
    return <ExamWorkspace attemptId={attemptId} />;
  }

  // Phòng Nghe hiểu (Hören) chuẩn vàng đã đóng băng 100%
  if (routeType === 'hoeren') {
    return <ExamWorkstationCore attemptId={attemptId} forceSkill="hoeren" />;
  }

  // Thi Full Test ghép Lesen + Hören dùng trực tiếp 2 giao diện chuẩn đã đóng băng
  return <FullExamSwitcher attemptId={attemptId} />;
}
