'use client';

import { ArrowRight, BookOpen, CheckCircle2, Clock3, Flame, Headphones, PenLine, Target, Trophy } from 'lucide-react';
import { useAuth } from '../../../components/auth/AuthProvider';
import { AcademicBookCover } from '../../../components/common/AcademicBookCover';
import { LessonThumbnail } from '../../../components/common/LessonThumbnail';

const recentLessons = [
  { title: 'ÖSD B1 · Modelltest 01', type: 'Đề mô phỏng', progress: 42, href: '/lam-bai/local-osd-b1-mock-01-exam-lesen-1794838978263-eeef8e?auth=1', tone: 'book' as const },
  { title: 'Kurze Alltagsansagen', type: 'Hören · B1', progress: 68, href: '/luyen-nghe/osd-b1-mock-01-hoeren-1', tone: 'audio' as const },
  { title: 'Am Arbeitsplatz', type: 'Diktat · A2', progress: 25, href: '/chep-chinh-ta/diktat-a2-am-arbeitsplatz', tone: 'dictation' as const },
];

export default function LearningDashboardPage() {
  const { user } = useAuth();
  if (!user) {
    return (
      <main className="dashboard-page">
        <div className="container dashboard-locked" style={{ paddingTop: '32px' }}>
          <span className="dashboard-locked-icon"><BookOpen size={30} /></span>
          <p className="eyebrow">SHD Learning Space</p>
          <h1>Đăng nhập để mở trang học tập.</h1>
          <p>Lưu tiến độ, theo dõi streak và tiếp tục đúng bài bạn đang học.</p>
          <a className="button button-primary" href="/tai-khoan">Đăng nhập hoặc đăng ký <ArrowRight size={15} /></a>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <div className="container" style={{ paddingTop: '32px' }}>
        <header className="dashboard-profile-header">
          <div className="dashboard-profile">
            <span className="avatar avatar-large">{user.initials}</span>
            <div>
              <p className="eyebrow">SHD Learning Space · Lộ trình cá nhân</p>
              <h1>Chào {user.name.split(' ').slice(-1)[0]} <span>👋</span></h1>
              <p>Hôm nay mình tiếp tục một bước nhỏ nhé. Bạn đang giữ nhịp rất tốt.</p>
            </div>
          </div>
          <div className="dashboard-goal-card">
            <Target size={18} />
            <span>
              <small>Mục tiêu hiện tại</small>
              <strong>Chinh phục B1 trong 8 tuần</strong>
              <em>68% tiến độ</em>
            </span>
          </div>
        </header>

        <section className="dashboard-stat-row">
          <div>
            <span className="stat-icon red"><Flame size={17} /></span>
            <span><small>Streak</small><strong>7 ngày</strong><em>+2 ngày tuần này</em></span>
          </div>
          <div>
            <span className="stat-icon blue"><Target size={17} /></span>
            <span><small>Mục tiêu tuần</small><strong>4/6</strong><em>Còn 2 bài</em></span>
          </div>
          <div>
            <span className="stat-icon yellow"><Trophy size={17} /></span>
            <span><small>Điểm luyện</small><strong>1.240</strong><em>Top 24%</em></span>
          </div>
          <div>
            <span className="stat-icon green"><Clock3 size={17} /></span>
            <span><small>Thời gian học</small><strong>12,5h</strong><em>30 ngày qua</em></span>
          </div>
        </section>

        <section className="dashboard-expiry-banner">
          <span className="dashboard-expiry-icon"><Clock3 size={18} /></span>
          <div>
            <strong>Gói Free của bạn còn 23 ngày học</strong>
            <p>Gia hạn miễn phí để tiếp tục lưu tiến độ hoặc mở khóa toàn bộ lời giải với SHD Pro.</p>
          </div>
          <div className="dashboard-expiry-actions">
            <a className="button button-quiet" href="/tai-khoan">Gia hạn miễn phí</a>
            <a className="button button-primary" href="/tai-khoan-pro">Nâng cấp Pro <ArrowRight size={14} /></a>
          </div>
        </section>

        <section className="dashboard-priority">
          <div className="dashboard-section-heading">
            <div>
              <p className="eyebrow">Ưu tiên số 1</p>
              <h2>Bài làm gần đây</h2>
              <p className="dashboard-section-subtitle">Tiếp tục đúng nơi bạn đã dừng lại.</p>
            </div>
            <a href="/tai-khoan">Lịch sử học tập <ArrowRight size={14} /></a>
          </div>
          <div className="recent-lesson-grid">
            {recentLessons.map((lesson) => (
              <article className="recent-lesson-card" key={lesson.title}>
                <div className="recent-lesson-top">
                  <span className={`recent-lesson-icon ${lesson.tone}`} aria-hidden="true">
                    {lesson.tone === 'book' ? <BookOpen size={17} /> : lesson.tone === 'audio' ? <Headphones size={17} /> : <PenLine size={17} />}
                  </span>
                  <span className="badge badge-neutral">{lesson.type}</span>
                </div>
                <h3>{lesson.title}</h3>
                <div className="recent-progress-row"><span>Tiến độ</span><strong>{lesson.progress}%</strong></div>
                <div className="progress-bar"><i style={{ width: `${lesson.progress}%` }} /></div>
                <a className="button button-primary" href={lesson.href}>Làm tiếp <ArrowRight size={14} /></a>
              </article>
            ))}
          </div>
        </section>

        <section className="dashboard-shelf">
          <div className="dashboard-section-heading">
            <div>
              <p className="eyebrow">Kệ học tập</p>
              <h2>Chọn một kỹ năng để luyện hôm nay</h2>
            </div>
            <a href="/de-thi">Xem tất cả <ArrowRight size={14} /></a>
          </div>
          <div className="dashboard-book-row">
            <a className="dashboard-book-card" href="/de-thi/b1-osd-mock-01">
              <AcademicBookCover title="ÖSD B1 Modellsatz 01" level="B1" profile="ÖSD B1 · Lesen & Hören" pattern="book" badgeLabel="Đang học" partCount={2} />
              <span>Đề thi mô phỏng</span>
            </a>
            <a className="dashboard-lesson-card" href="/luyen-nghe/osd-b1-mock-01-hoeren-1">
              <LessonThumbnail skill="Hoeren" level="B1" title="Kurze Alltagsansagen" pattern="audio" topic="Luyện nghe" />
              <div><strong>Luyện nghe Hören</strong><small>5 câu · 12 phút</small></div>
            </a>
            <a className="dashboard-lesson-card" href="/luyen-doc/osd-b1-mock-01-lesen-1">
              <LessonThumbnail skill="Lesen" level="B1" title="Blog von Michael" pattern="reading" topic="Đọc hiểu" />
              <div><strong>Luyện đọc Lesen</strong><small>6 câu · 15 phút</small></div>
            </a>
            <a className="dashboard-lesson-card" href="/chep-chinh-ta/diktat-a2-am-arbeitsplatz">
              <LessonThumbnail skill="Diktat" level="A2" title="Am Arbeitsplatz" pattern="dictation" topic="Chép chính tả" />
              <div><strong>Diktat &amp; Shadowing</strong><small>12 câu · 5 phút</small></div>
            </a>
          </div>
        </section>

        <section className="dashboard-pro-banner">
          <div>
            <p className="eyebrow">SHD Pro</p>
            <h2>Học sâu hơn, tiến bộ rõ hơn.</h2>
            <p>Mở khóa giải thích bẫy tư duy, chấm Schreiben và lộ trình cá nhân hóa theo mục tiêu của bạn.</p>
          </div>
          <a className="button button-primary" href="/tai-khoan-pro">Xem quyền lợi Pro <ArrowRight size={15} /></a>
        </section>

        <section className="dashboard-habits">
          <span><CheckCircle2 size={15} /> Học tối thiểu 15 phút mỗi ngày</span>
          <span><CheckCircle2 size={15} /> Ôn lại từ vựng sau mỗi bài</span>
          <span><CheckCircle2 size={15} /> Duy trì streak để tạo thói quen</span>
        </section>
      </div>
    </main>
  );
}
