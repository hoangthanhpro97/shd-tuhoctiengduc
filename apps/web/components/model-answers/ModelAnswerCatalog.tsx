'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

type Item = { slug: string; teil: string; title: string; level: string; prompt: string; topic?: string; taskType?: string };

export function ModelAnswerCatalog({ kind, items }: { kind: 'schreiben' | 'sprechen'; items: Item[] }) {
  const [topic, setTopic] = useState('all');
  const [taskType, setTaskType] = useState('all');
  const topics = useMemo(() => ['all', ...new Set(items.map((item) => item.topic ?? (item.teil === 'Teil 1' ? 'Đời sống hàng ngày' : 'Ý kiến & trình bày')))], [items]);
  const taskTypes = useMemo(() => ['all', ...new Set(items.map((item) => item.taskType ?? item.teil))], [items]);
  const filtered = items.filter((item) => (topic === 'all' || (item.topic ?? (item.teil === 'Teil 1' ? 'Đời sống hàng ngày' : 'Ý kiến & trình bày')) === topic) && (taskType === 'all' || (item.taskType ?? item.teil) === taskType));
  return <main className="catalog-page"><div className="container"><p className="eyebrow">Bài mẫu · {kind === 'schreiben' ? 'Schreiben' : 'Sprechen'}</p><h1>Tham khảo cách triển khai bài {kind === 'schreiben' ? 'viết' : 'nói'}</h1><p className="catalog-intro">Học cách mở bài, phát triển ý và dùng Redemittel tự nhiên theo từng dạng đề.</p><div className="model-filter-bar"><label>Chủ đề<select value={topic} onChange={(event) => setTopic(event.target.value)}>{topics.map((value) => <option value={value} key={value}>{value === 'all' ? 'Tất cả chủ đề' : value}</option>)}</select></label><label>Dạng đề<select value={taskType} onChange={(event) => setTaskType(event.target.value)}>{taskTypes.map((value) => <option value={value} key={value}>{value === 'all' ? 'Tất cả dạng đề' : value}</option>)}</select></label><span className="badge badge-neutral">{filtered.length} bài mẫu</span></div><div className="model-grid">{filtered.map((item) => <Link className="model-card" href={`/bai-mau-${kind}/${item.slug}`} key={item.slug}><span className="badge">{item.level} · {item.teil}</span><h2>{item.title}</h2><p>{item.prompt}</p><span className="card-action">Xem bài mẫu →</span></Link>)}</div>{filtered.length === 0 && <div className="empty-state">Không có bài mẫu phù hợp với bộ lọc.</div>}</div></main>;
}
