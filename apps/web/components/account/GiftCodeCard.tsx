'use client';

import { Gift, LoaderCircle } from 'lucide-react';
import { useState } from 'react';

export function GiftCodeCard() {
  const [code, setCode] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'valid' | 'expired' | 'invalid'>('idle');
  async function redeem() {
    setState('loading');
    const response = await fetch('/api/v1/account/gift-code', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ code }) });
    const payload = await response.json().catch(() => ({}));
    setState(response.ok ? 'valid' : payload.code === 'GIFT_CODE_EXPIRED' ? 'expired' : 'invalid');
  }
  return <section className="gift-code-card"><div className="gift-code-icon"><Gift size={20} /></div><div><p className="eyebrow">Quyền lợi học viên</p><h2>Nhận ngày học Free</h2><p>Nhập Gift Code từ sự kiện hoặc chương trình nội bộ SHD Education để kích hoạt ngày học.</p><div className="gift-code-form"><input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="SHD-XXXX-XXXX" aria-label="Gift Code" /><button className="button button-primary" type="button" disabled={!code || state === 'loading'} onClick={() => void redeem()}>{state === 'loading' ? <LoaderCircle className="spin" size={15} /> : 'Kích hoạt'}</button></div>{state === 'valid' && <small className="gift-feedback is-valid">Gift Code hợp lệ. Quyền lợi đã được ghi nhận phía server.</small>}{state === 'expired' && <small className="gift-feedback is-invalid">Mã đã hết hạn. Vui lòng kiểm tra lại chương trình.</small>}{state === 'invalid' && <small className="gift-feedback is-invalid">Gift Code không hợp lệ hoặc đã được sử dụng.</small>}</div></section>;
}
