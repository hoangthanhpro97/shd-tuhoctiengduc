'use client';

import { CheckCircle2, Link2, LockKeyhole } from 'lucide-react';
import { maskEmail } from '../../lib/account/mask-email';

export function AccountSecurityCard({ email }: { email: string }) {
  return <section className="account-main-card account-security-card"><div className="dashboard-section-heading"><div><p className="eyebrow">Bảo mật tài khoản</p><h2>Thông tin liên kết</h2></div><LockKeyhole size={18} /></div><div className="security-email"><span className="avatar">{email.slice(0, 1).toUpperCase()}</span><span><strong>{maskEmail(email)}</strong><small>Email đăng nhập của bạn được che ẩn để bảo vệ riêng tư.</small></span></div><div className="security-status-list"><span><CheckCircle2 size={15} /> Google đã liên kết <b>Đã xác minh</b></span><span><Link2 size={15} /> Mật khẩu email <b>Đã thiết lập</b></span></div></section>;
}
