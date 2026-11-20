'use client';

import { ArrowRight, Award, BookOpen, CheckCircle2, Clock3, Flame, Headphones, LogOut, Settings, Target, Trophy } from 'lucide-react';
import { useState } from 'react';
import { AuthModal } from '../../../components/auth/AuthModal';
import { useAuth } from '../../../components/auth/AuthProvider';
import { AccountSecurityCard } from '../../../components/account/AccountSecurityCard';
import { GiftCodeCard } from '../../../components/account/GiftCodeCard';

const history = [
  { title: 'Deutsch B1 · Mock Test 01', date: '03/11/2026', score: '21/30', status: 'Đạt tham khảo', tone: 'success' },
  { title: 'Thông báo ở nhà ga', date: '01/11/2026', score: '4/5', status: 'Hoàn thành', tone: 'success' },
  { title: 'Am Arbeitsplatz', date: '29/10/2026', score: '8/12', status: 'Cần luyện thêm', tone: 'warning' },
];

export default function AccountPage() {
  const { user, signOut } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');

  if (!user) return <main className="account-page catalog-page"><div className="container account-guest"><div className="account-guest-art"><span className="account-orb orb-one" /><span className="account-orb orb-two" /><BookOpen size={52} /></div><div className="eyebrow">Không gian học tập cá nhân</div><h1>Lưu lại mọi bước tiến<br /><span>của bạn.</span></h1><p>Đăng nhập để đồng bộ tiến độ, xem lại lịch sử bài làm và nhận gợi ý học tập phù hợp với mục tiêu.</p><div className="account-guest-actions"><button className="button button-primary" type="button" onClick={() => setAuthOpen(true)}>Đăng nhập hoặc đăng ký <ArrowRight size={15} /></button><a className="button button-quiet" href="/de-thi">Khám phá trước</a></div><div className="account-benefits"><span><CheckCircle2 size={15} /> Lưu tiến độ tự động</span><span><CheckCircle2 size={15} /> Theo dõi điểm số</span><span><CheckCircle2 size={15} /> Gợi ý lộ trình</span></div></div>{authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}</main>;

  return <main className="account-page catalog-page"><div className="container">
    <header className="account-hero"><div className="account-profile"><span className="avatar avatar-large">{user.initials}</span><div><p className="eyebrow">Không gian học tập</p><h1>Chào {user.name.split(' ').slice(-1)[0]} <span>👋</span></h1><p>{user.email} <span className="account-dot">·</span> Thành viên từ tháng 10/2026</p></div></div><div className="account-hero-actions"><span className="plan-badge"><Award size={14} /> {user.plan} plan</span><button className="icon-action" type="button" aria-label="Cài đặt tài khoản"><Settings size={17} /></button></div></header>
    <nav className="account-tabs" aria-label="Nội dung tài khoản"><button className={activeTab === 'overview' ? 'is-active' : ''} type="button" onClick={() => setActiveTab('overview')}>Tổng quan</button><button className={activeTab === 'history' ? 'is-active' : ''} type="button" onClick={() => setActiveTab('history')}>Lịch sử học tập</button><a href="/tai-khoan-pro">Nâng cấp Pro <span>✦</span></a></nav>
    {activeTab === 'overview' ? <>
      <section className="account-stat-grid"><div className="account-stat-card"><span className="stat-icon red"><Flame size={18} /></span><div><small>Chuỗi ngày học</small><strong>7 ngày</strong><em>Đang giữ nhịp tốt</em></div></div><div className="account-stat-card"><span className="stat-icon blue"><Target size={18} /></span><div><small>Tiến độ tuần này</small><strong>68%</strong><em>4 / 6 mục tiêu</em></div></div><div className="account-stat-card"><span className="stat-icon yellow"><Trophy size={18} /></span><div><small>Tổng điểm luyện</small><strong>1.240</strong><em>+18% tháng này</em></div></div><div className="account-stat-card"><span className="stat-icon green"><Clock3 size={18} /></span><div><small>Thời gian học</small><strong>12,5 giờ</strong><em>Trong 30 ngày qua</em></div></div></section>
      <section className="account-dashboard-grid"><div className="account-main-card"><div className="dashboard-section-heading"><div><div className="eyebrow">Tiến độ học tập</div><h2>Mục tiêu của bạn</h2></div><button className="link-button" type="button">Chỉnh sửa</button></div><div className="goal-row"><span className="goal-icon red"><Headphones size={18} /></span><span><strong>Cải thiện kỹ năng nghe</strong><small>Hoàn thành 12 bài luyện Hören</small></span><b>8/12</b></div><div className="progress-bar"><i style={{ width: '67%' }} /></div><div className="goal-row"><span className="goal-icon blue"><BookOpen size={18} /></span><span><strong>Chuẩn bị cho kỳ thi B1</strong><small>Hoàn thành 3 đề mô phỏng</small></span><b>1/3</b></div><div className="progress-bar progress-blue"><i style={{ width: '34%' }} /></div><a className="button button-primary account-main-cta" href="/de-thi">Tiếp tục mục tiêu <ArrowRight size={15} /></a></div><aside className="account-side-card"><div className="dashboard-section-heading"><div><div className="eyebrow">Thành tích</div><h2>Huy hiệu của bạn</h2></div><Trophy size={19} /></div><div className="achievement-list"><span className="achievement is-earned"><i>🔥</i><strong>7 ngày liên tiếp</strong><small>Đạt ngày 04/11</small></span><span className="achievement is-earned"><i>🎧</i><strong>Nghe chăm chỉ</strong><small>Hoàn thành 10 bài</small></span><span className="achievement"><i>🔒</i><strong>Chiến binh B1</strong><small>Còn 2 đề nữa</small></span></div></aside></section>
      <section className="account-history-card"><div className="dashboard-section-heading"><div><div className="eyebrow">Gần đây</div><h2>Bài học đã hoàn thành</h2></div><button className="link-button" type="button" onClick={() => setActiveTab('history')}>Xem tất cả <ArrowRight size={14} /></button></div><HistoryTable compact /></section><section className="account-deep-grid"><AccountSecurityCard email={user.email} /><GiftCodeCard /></section>
    </> : <section className="account-history-card account-history-full"><div className="dashboard-section-heading"><div><div className="eyebrow">Dữ liệu của bạn</div><h2>Lịch sử học tập</h2><p>Xem lại các bài đã làm và tiếp tục cải thiện từng kỹ năng.</p></div><a className="button button-primary" href="/de-thi">Làm bài mới <ArrowRight size={15} /></a></div><HistoryTable /></section>}
    <section className="account-footer-actions"><a href="/tai-khoan-pro"><span className="pro-spark">✦</span><span><strong>Mở khóa nhiều hơn với SHD Pro</strong><small>Giải thích chi tiết, chấm Schreiben và lộ trình cá nhân hóa.</small></span><ArrowRight size={17} /></a><button type="button" onClick={signOut}><LogOut size={15} /> Đăng xuất</button></section>
  </div></main>;
}

function HistoryTable({ compact = false }: { compact?: boolean }) {
  return <div className="history-table"><div className="history-table-head"><span>Bài luyện</span><span>Ngày làm</span><span>Điểm</span><span>Trạng thái</span></div>{history.slice(0, compact ? 3 : history.length).map((item) => <div className="history-table-row" key={item.title}><span><strong>{item.title}</strong><small>{item.title.includes('Mock') ? 'Đề mô phỏng' : item.title.includes('nhà ga') ? 'Luyện nghe Hören' : 'Chép chính tả Diktat'}</small></span><span>{item.date}</span><span><b>{item.score}</b></span><span><em className={`history-status ${item.tone}`}>{item.status}</em></span></div>)}</div>;
}
