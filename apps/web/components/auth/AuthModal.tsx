'use client';

import { ArrowLeft, Check, Eye, EyeOff, LockKeyhole, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';

function GoogleLogo() {
  return <svg className="google-logo" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="#4285F4" d="M21.35 12.27c0-.71-.06-1.4-.18-2.05H12v3.88h5.24a4.48 4.48 0 0 1-1.94 2.94v2.44h3.14c1.84-1.69 2.91-4.18 2.91-7.21Z" /><path fill="#34A853" d="M12 21.72c2.63 0 4.84-.87 6.45-2.36l-3.14-2.44c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.52A9.74 9.74 0 0 0 12 21.72Z" /><path fill="#FBBC05" d="M6.54 13.81A5.85 5.85 0 0 1 6.23 12c0-.63.11-1.25.31-1.81V7.67H3.3A9.74 9.74 0 0 0 2.26 12c0 1.57.38 3.06 1.04 4.33l3.24-2.52Z" /><path fill="#EA4335" d="M12 6.16c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.25 14.63 2.28 12 2.28a9.74 9.74 0 0 0-8.7 5.39l3.24 2.52c.77-2.31 2.92-4.03 5.46-4.03Z" /></svg>;
}

export function AuthModal({ onClose, onAuthenticated, message }: { onClose: () => void; onAuthenticated?: () => void; message?: string }) {
  const { signIn } = useAuth();
  const [step, setStep] = useState<'login' | 'password'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  function complete(emailAddress = email) {
    const firstPart = emailAddress.split('@')[0].replace(/[._-]+/g, ' ').trim();
    const name = firstPart ? firstPart.split(' ').map((part) => part[0].toUpperCase() + part.slice(1)).join(' ') : undefined;
    signIn({ email: emailAddress || undefined, name });
    onAuthenticated?.();
    onClose();
  }

  async function mockGoogle() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/google?mode=mock', { redirect: 'manual' });
      if (!response.ok && response.status !== 302 && response.status !== 307) throw new Error('Không thể kết nối với Google.');
      complete('minhanh@gmail.com');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể đăng nhập.');
      setBusy(false);
    }
  }

  function continueWithEmail() {
    if (!email.includes('@')) {
      setError('Vui lòng nhập email hợp lệ.');
      return;
    }
    setError(null);
    setStep('password');
  }

  return <div className="auth-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <button className="auth-close" type="button" onClick={onClose} aria-label="Đóng"><X size={18} /></button>
      <div className="auth-brand"><span className="brand-mark">SHD</span><span><strong>SHD Education</strong><small>Học tiếng Đức theo lộ trình của bạn</small></span></div>
      {step === 'login' ? <>
        <div className="auth-heading"><p className="eyebrow">Chào mừng bạn trở lại</p><h2 id="auth-title">Bắt đầu hành trình<br /><span>chinh phục tiếng Đức</span></h2><p>{message ?? 'Đăng nhập để lưu tiến độ, xem lịch sử làm bài và nhận lộ trình học phù hợp.'}</p></div>
        <button className="button google-button" type="button" onClick={() => void mockGoogle()} disabled={busy}><GoogleLogo />{busy ? 'Đang kết nối...' : 'Tiếp tục với Google'}</button>
        <div className="auth-divider"><span>hoặc tiếp tục bằng email</span></div>
        <label className="auth-field"><span>Email của bạn</span><input autoFocus type="email" value={email} onChange={(event) => setEmail(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') continueWithEmail(); }} placeholder="you@example.com" /></label>
        {error && <p className="form-error">{error}</p>}
        <button className="button button-primary auth-submit" type="button" onClick={continueWithEmail}>Tiếp tục <span>→</span></button>
        <p className="auth-legal">Bằng việc tiếp tục, bạn đồng ý với <a href="#terms">Điều khoản sử dụng</a> và <a href="#privacy">Chính sách bảo mật</a> của SHD Education.</p>
      </> : <>
        <button className="auth-back" type="button" onClick={() => setStep('login')}><ArrowLeft size={15} /> Quay lại</button>
        <div className="auth-heading"><p className="eyebrow">Tài khoản của bạn</p><h2 id="auth-title">Thiết lập mật khẩu</h2><p>Email <strong>{email}</strong> đã sẵn sàng. Tạo mật khẩu để đăng nhập nhanh hơn lần sau.</p></div>
        <label className="auth-field"><span>Mật khẩu</span><span className="password-field"><input autoFocus type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} /><button type="button" aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></span></label>
        <div className="auth-security"><LockKeyhole size={15} /><span>Mật khẩu của bạn được mã hóa và bảo vệ an toàn.</span></div>
        <button className="button button-primary auth-submit" type="button" disabled={!password} onClick={() => complete()}>Tạo mật khẩu <Check size={16} /></button>
        <button className="button button-quiet auth-submit" type="button" onClick={() => complete()}>Bỏ qua, chỉ dùng Google</button>
      </>}
    </section>
  </div>;
}
