export interface TopicVisual {
  imageUrl: string;
  overlayGradient: string;
  badgeColor: string;
  iconEmoji: string;
}

const EXACT_ITEM_VISUALS: Record<string, TopicVisual> = {
  'thong-bao-nha-ga': {
    imageUrl: 'https://images.unsplash.com/photo-1541447271487-09612b3f49f7?auto=format&fit=crop&w=640&q=80',
    overlayGradient: 'from-blue-950/85 via-blue-900/40 to-transparent',
    badgeColor: 'bg-blue-600/90 text-white',
    iconEmoji: '🚆',
  },
  'mot-ngay-di-lam': {
    imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=600&q=80',
    overlayGradient: 'from-slate-950/85 via-slate-900/40 to-transparent',
    badgeColor: 'bg-slate-600/90 text-white',
    iconEmoji: '💼',
  },
  'hen-gap-cuoi-tuan': {
    imageUrl: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&w=640&q=80',
    overlayGradient: 'from-amber-950/85 via-amber-900/40 to-transparent',
    badgeColor: 'bg-amber-600/90 text-white',
    iconEmoji: '☕',
  },
  'lop-hoc-buoi-toi': {
    imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80',
    overlayGradient: 'from-indigo-950/85 via-indigo-900/40 to-transparent',
    badgeColor: 'bg-indigo-600/90 text-white',
    iconEmoji: '📚',
  },
  'lich-hoc-cua-ban': {
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80',
    overlayGradient: 'from-emerald-950/85 via-emerald-900/40 to-transparent',
    badgeColor: 'bg-emerald-600/90 text-white',
    iconEmoji: '🗓️',
  },
  'thong-tin-tuyen-dung': {
    imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=640&q=80',
    overlayGradient: 'from-rose-950/85 via-red-900/40 to-transparent',
    badgeColor: 'bg-rose-600/90 text-white',
    iconEmoji: '📋',
  },
  'loi-moi': {
    imageUrl: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=640&q=80',
    overlayGradient: 'from-amber-950/85 via-orange-900/40 to-transparent',
    badgeColor: 'bg-amber-600/90 text-white',
    iconEmoji: '✉️',
  },
  'tin-nhan-trong-ngay': {
    imageUrl: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=600&q=80',
    overlayGradient: 'from-red-950/85 via-red-900/40 to-transparent',
    badgeColor: 'bg-[#da2527]/90 text-white',
    iconEmoji: '💬',
  },
  'goethe-b1-teil-1': {
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80',
    overlayGradient: 'from-violet-950/85 via-violet-900/40 to-transparent',
    badgeColor: 'bg-violet-600/90 text-white',
    iconEmoji: '🤝',
  },
  'goethe-b1-teil-2': {
    imageUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=600&q=80',
    overlayGradient: 'from-purple-950/85 via-purple-900/40 to-transparent',
    badgeColor: 'bg-purple-600/90 text-white',
    iconEmoji: '📊',
  },
  'osd-zdo-b1-teil-1': {
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    overlayGradient: 'from-sky-950/85 via-blue-900/40 to-transparent',
    badgeColor: 'bg-sky-600/90 text-white',
    iconEmoji: '🎙️',
  },
  'goethe-b2-teil-1': {
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80',
    overlayGradient: 'from-fuchsia-950/85 via-purple-900/40 to-transparent',
    badgeColor: 'bg-fuchsia-600/90 text-white',
    iconEmoji: '🗣️',
  },
  'goethe-b1-aufgabe-1': {
    imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=80',
    overlayGradient: 'from-teal-950/85 via-emerald-900/40 to-transparent',
    badgeColor: 'bg-teal-600/90 text-white',
    iconEmoji: '✍️',
  },
  'goethe-b1-aufgabe-2': {
    imageUrl: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=600&q=80',
    overlayGradient: 'from-cyan-950/85 via-teal-900/40 to-transparent',
    badgeColor: 'bg-cyan-600/90 text-white',
    iconEmoji: '💻',
  },
  'goethe-b1-aufgabe-3': {
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
    overlayGradient: 'from-slate-950/85 via-slate-900/40 to-transparent',
    badgeColor: 'bg-slate-700/90 text-white',
    iconEmoji: '🖋️',
  },
  'osd-b1-schreiben': {
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
    overlayGradient: 'from-emerald-950/85 via-teal-900/40 to-transparent',
    badgeColor: 'bg-emerald-600/90 text-white',
    iconEmoji: '📧',
  },
  'im-alltag': {
    imageUrl: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=600&q=80',
    overlayGradient: 'from-amber-950/85 via-yellow-900/40 to-transparent',
    badgeColor: 'bg-amber-600/90 text-white',
    iconEmoji: '🚲',
  },
  'am-arbeitsplatz': {
    imageUrl: 'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?auto=format&fit=crop&w=640&q=80',
    overlayGradient: 'from-orange-950/85 via-amber-900/40 to-transparent',
    badgeColor: 'bg-orange-600/90 text-white',
    iconEmoji: '🏢',
  },
  'in-der-stadt': {
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80',
    overlayGradient: 'from-yellow-950/85 via-amber-900/40 to-transparent',
    badgeColor: 'bg-yellow-600/90 text-white',
    iconEmoji: '🏙️',
  },
  'gute-gewohnheiten': {
    imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=640&q=80',
    overlayGradient: 'from-orange-950/85 via-red-900/40 to-transparent',
    badgeColor: 'bg-amber-700/90 text-white',
    iconEmoji: '☕',
  },
  'diktat-b1-bai-01': {
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=640&q=80',
    overlayGradient: 'from-blue-950/85 via-blue-900/35 to-transparent',
    badgeColor: 'bg-blue-600/90 text-white',
    iconEmoji: '🗣️',
  },
  'diktat-b1-bai-02': {
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=640&q=80',
    overlayGradient: 'from-emerald-950/85 via-emerald-900/35 to-transparent',
    badgeColor: 'bg-emerald-600/90 text-white',
    iconEmoji: '🏡',
  },
  'diktat-b1-bai-03': {
    imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=640&q=80',
    overlayGradient: 'from-slate-950/85 via-slate-900/35 to-transparent',
    badgeColor: 'bg-slate-700/90 text-white',
    iconEmoji: '💼',
  },
  'diktat-b1-bai-04': {
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=640&q=80',
    overlayGradient: 'from-amber-950/85 via-amber-900/35 to-transparent',
    badgeColor: 'bg-amber-600/90 text-white',
    iconEmoji: '☕',
  },
  'diktat-b1-bai-05': {
    imageUrl: 'https://images.unsplash.com/photo-1541447271487-09612b3f49f7?auto=format&fit=crop&w=640&q=80',
    overlayGradient: 'from-cyan-950/85 via-cyan-900/35 to-transparent',
    badgeColor: 'bg-cyan-600/90 text-white',
    iconEmoji: '🚆',
  },
  'diktat-b1-bai-06': {
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=640&q=80',
    overlayGradient: 'from-orange-950/85 via-orange-900/35 to-transparent',
    badgeColor: 'bg-orange-600/90 text-white',
    iconEmoji: '🍽️',
  },
  'diktat-b1-bai-07': {
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=640&q=80',
    overlayGradient: 'from-rose-950/85 via-rose-900/35 to-transparent',
    badgeColor: 'bg-rose-600/90 text-white',
    iconEmoji: '🤝',
  },
  'diktat-b1-bai-08': {
    imageUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=640&q=80',
    overlayGradient: 'from-purple-950/85 via-purple-900/35 to-transparent',
    badgeColor: 'bg-purple-600/90 text-white',
    iconEmoji: '🎙️',
  },
  'diktat-b1-bai-09': {
    imageUrl: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&w=640&q=80',
    overlayGradient: 'from-teal-950/85 via-teal-900/35 to-transparent',
    badgeColor: 'bg-teal-600/90 text-white',
    iconEmoji: '💬',
  },
  'diktat-b1-bai-10': {
    imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=640&q=80',
    overlayGradient: 'from-indigo-950/85 via-indigo-900/35 to-transparent',
    badgeColor: 'bg-indigo-600/90 text-white',
    iconEmoji: '✍️',
  },
  'diktat-b1-bai-11': {
    imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=640&q=80',
    overlayGradient: 'from-red-950/85 via-red-900/35 to-transparent',
    badgeColor: 'bg-[#da2527]/90 text-white',
    iconEmoji: '🏛️',
  },
};

const fallbackVisual: TopicVisual = {
  imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
  overlayGradient: 'from-slate-950/85 via-slate-900/40 to-transparent',
  badgeColor: 'bg-slate-700/90 text-white',
  iconEmoji: '📖',
};

const listeningFallbackVisuals: TopicVisual[] = [
  { imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=640&q=80', overlayGradient: 'from-violet-950/85 via-violet-900/35 to-transparent', badgeColor: 'bg-violet-700/90 text-white', iconEmoji: '🎧' },
  { imageUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=640&q=80', overlayGradient: 'from-sky-950/85 via-blue-900/35 to-transparent', badgeColor: 'bg-sky-700/90 text-white', iconEmoji: '🎙️' },
  { imageUrl: 'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?auto=format&fit=crop&w=640&q=80', overlayGradient: 'from-emerald-950/85 via-teal-900/35 to-transparent', badgeColor: 'bg-emerald-700/90 text-white', iconEmoji: '📻' },
  { imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=640&q=80', overlayGradient: 'from-rose-950/85 via-red-900/35 to-transparent', badgeColor: 'bg-rose-700/90 text-white', iconEmoji: '🎶' },
];

const readingFallbackVisuals: TopicVisual[] = [
  { imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=640&q=80', overlayGradient: 'from-slate-900/35 via-transparent to-transparent', badgeColor: 'bg-slate-700/90 text-white', iconEmoji: '' },
  { imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=640&q=80', overlayGradient: 'from-amber-900/30 via-transparent to-transparent', badgeColor: 'bg-amber-700/90 text-white', iconEmoji: '' },
  { imageUrl: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=640&q=80', overlayGradient: 'from-sky-900/30 via-transparent to-transparent', badgeColor: 'bg-sky-700/90 text-white', iconEmoji: '' },
  { imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=640&q=80', overlayGradient: 'from-indigo-900/30 via-transparent to-transparent', badgeColor: 'bg-indigo-700/90 text-white', iconEmoji: '' },
  { imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=640&q=80', overlayGradient: 'from-emerald-900/30 via-transparent to-transparent', badgeColor: 'bg-emerald-700/90 text-white', iconEmoji: '' },
];

const speakingFallbackVisuals: TopicVisual[] = [
  { imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=640&q=80', overlayGradient: 'from-slate-900/40 via-transparent to-transparent', badgeColor: 'bg-violet-700/90 text-white', iconEmoji: '🤝' },
  { imageUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=640&q=80', overlayGradient: 'from-slate-900/40 via-transparent to-transparent', badgeColor: 'bg-purple-700/90 text-white', iconEmoji: '📊' },
  { imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=640&q=80', overlayGradient: 'from-slate-900/40 via-transparent to-transparent', badgeColor: 'bg-sky-700/90 text-white', iconEmoji: '🎙️' },
  { imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=640&q=80', overlayGradient: 'from-slate-900/40 via-transparent to-transparent', badgeColor: 'bg-rose-700/90 text-white', iconEmoji: '🗣️' },
  { imageUrl: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&w=640&q=80', overlayGradient: 'from-slate-900/40 via-transparent to-transparent', badgeColor: 'bg-amber-700/90 text-white', iconEmoji: '☕' },
];

const writingFallbackVisuals: TopicVisual[] = [
  { imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=640&q=80', overlayGradient: 'from-slate-900/40 via-transparent to-transparent', badgeColor: 'bg-teal-700/90 text-white', iconEmoji: '✍️' },
  { imageUrl: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=640&q=80', overlayGradient: 'from-slate-900/40 via-transparent to-transparent', badgeColor: 'bg-cyan-700/90 text-white', iconEmoji: '💻' },
  { imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=640&q=80', overlayGradient: 'from-slate-900/40 via-transparent to-transparent', badgeColor: 'bg-slate-700/90 text-white', iconEmoji: '🖋️' },
  { imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=640&q=80', overlayGradient: 'from-slate-900/40 via-transparent to-transparent', badgeColor: 'bg-emerald-700/90 text-white', iconEmoji: '📧' },
  { imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=640&q=80', overlayGradient: 'from-slate-900/40 via-transparent to-transparent', badgeColor: 'bg-indigo-700/90 text-white', iconEmoji: '📝' },
];

const diktatFallbackVisuals: TopicVisual[] = [
  { imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=640&q=80', overlayGradient: 'from-blue-950/85 via-blue-900/35 to-transparent', badgeColor: 'bg-blue-600/90 text-white', iconEmoji: '🗣️' },
  { imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=640&q=80', overlayGradient: 'from-emerald-950/85 via-emerald-900/35 to-transparent', badgeColor: 'bg-emerald-600/90 text-white', iconEmoji: '🏡' },
  { imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=640&q=80', overlayGradient: 'from-slate-950/85 via-slate-900/35 to-transparent', badgeColor: 'bg-slate-700/90 text-white', iconEmoji: '💼' },
  { imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=640&q=80', overlayGradient: 'from-amber-950/85 via-amber-900/35 to-transparent', badgeColor: 'bg-amber-600/90 text-white', iconEmoji: '☕' },
  { imageUrl: 'https://images.unsplash.com/photo-1541447271487-09612b3f49f7?auto=format&fit=crop&w=640&q=80', overlayGradient: 'from-cyan-950/85 via-cyan-900/35 to-transparent', badgeColor: 'bg-cyan-600/90 text-white', iconEmoji: '🚆' },
  { imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=640&q=80', overlayGradient: 'from-orange-950/85 via-orange-900/35 to-transparent', badgeColor: 'bg-orange-600/90 text-white', iconEmoji: '🍽️' },
  { imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=640&q=80', overlayGradient: 'from-rose-950/85 via-rose-900/35 to-transparent', badgeColor: 'bg-rose-600/90 text-white', iconEmoji: '🤝' },
  { imageUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=640&q=80', overlayGradient: 'from-purple-950/85 via-purple-900/35 to-transparent', badgeColor: 'bg-purple-600/90 text-white', iconEmoji: '🎙️' },
  { imageUrl: 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&w=640&q=80', overlayGradient: 'from-teal-950/85 via-teal-900/35 to-transparent', badgeColor: 'bg-teal-600/90 text-white', iconEmoji: '💬' },
  { imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=640&q=80', overlayGradient: 'from-indigo-950/85 via-indigo-900/35 to-transparent', badgeColor: 'bg-indigo-600/90 text-white', iconEmoji: '✍️' },
  { imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=640&q=80', overlayGradient: 'from-red-950/85 via-red-900/35 to-transparent', badgeColor: 'bg-[#da2527]/90 text-white', iconEmoji: '🏛️' },
];

function hashKey(key: string) {
  return [...key].reduce((sum, character, idx) => sum + character.charCodeAt(0) * (idx + 1), 0);
}

function normalizeTopicKey(value: string) {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getTopicVisual(skill: string, title: string, itemKey?: string): TopicVisual {
  if (itemKey && EXACT_ITEM_VISUALS[itemKey]) return EXACT_ITEM_VISUALS[itemKey];

  const normalizedTitle = normalizeTopicKey(title);
  const matchedKey = Object.keys(EXACT_ITEM_VISUALS).find((key) => key === normalizedTitle);
  if (matchedKey) return EXACT_ITEM_VISUALS[matchedKey];

  if (skill === 'horen' && itemKey) {
    const hash = [...itemKey].reduce((sum, character) => sum + character.charCodeAt(0), 0);
    return listeningFallbackVisuals[hash % listeningFallbackVisuals.length];
  }
  if (skill === 'lesen' && itemKey) {
    const hash = [...itemKey].reduce((sum, character) => sum + character.charCodeAt(0), 0);
    return readingFallbackVisuals[hash % readingFallbackVisuals.length];
  }
  if (skill === 'sprechen' && itemKey) {
    return speakingFallbackVisuals[hashKey(itemKey) % speakingFallbackVisuals.length];
  }
  if (skill === 'schreiben' && itemKey) {
    return writingFallbackVisuals[hashKey(itemKey) % writingFallbackVisuals.length];
  }
  if (skill === 'diktat' && itemKey) {
    return diktatFallbackVisuals[hashKey(itemKey) % diktatFallbackVisuals.length];
  }
  return fallbackVisual;
}
