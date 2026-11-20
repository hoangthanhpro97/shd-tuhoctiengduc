import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="not-found-page">
      <div className="not-found-card">
        <span className="not-found-code">404</span>
        <p className="eyebrow">Không tìm thấy trang</p>
        <h1>Nội dung bạn đang tìm chưa có ở đây.</h1>
        <p>Hãy quay lại danh mục đề thi để tiếp tục hành trình học tiếng Đức.</p>
        <div className="not-found-actions">
          <Link className="button button-primary" href="/de-thi">Xem ÖSD &amp; Goethe Online-Test</Link>
          <Link className="button button-quiet" href="/">Về trang chủ</Link>
        </div>
      </div>
    </main>
  );
}
