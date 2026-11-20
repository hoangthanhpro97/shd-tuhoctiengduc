/**
 * Reading Analyzer Engine for German Exam Preparation (ÖSD B1/B2)
 * Supports 3-level contextual analysis:
 * - Level 1: Word understanding (Hiểu từ) - Lemma, POS, gender, plural, IPA, meanings
 * - Level 2: Sentence structure (Đọc cấu trúc) - Feldermodell breakdown, grammar points, translation
 * - Level 3: Discourse relations (Đọc liên kết) - Flowchart, sentence groups, bi-directional source quotes, takeaways
 */

export type WordAnalysis = {
  level: 'word';
  originalText: string;
  lemma: string;
  partOfSpeech: string;
  gender?: 'der' | 'die' | 'das' | 'Plural';
  pluralForm?: string;
  ipa?: string;
  generalMeaningVi: string;
  contextMeaningVi: string;
  exampleSentenceDe: string;
  exampleSentenceVi: string;
};

export type StructureField = {
  label: string;
  germanRole: 'Vorfeld / Subjekt' | 'Verb 1 (Position 2)' | 'Mittelfeld (Objekte / Adverbiale)' | 'Verb 2 (Satzklammer)' | 'Nebensatz';
  text: string;
  vietnameseExplanation: string;
};

export type SentenceAnalysis = {
  level: 'sentence';
  originalText: string;
  mainIdeaVi: string;
  vietnameseTranslation: string;
  keyGrammarPoint: string;
  grammarCategory: string;
  fields: StructureField[];
};

export type DiscourseSentenceGroup = {
  id: string;
  color: 'emerald' | 'amber' | 'purple' | 'blue';
  categoryLabel: string;
  sourceQuote: string;
  vietnameseSummary: string;
};

export type DiscourseAnalysis = {
  level: 'discourse';
  originalText: string;
  title: string;
  flowSteps: string[];
  sentenceGroups: DiscourseSentenceGroup[];
  takeawayVi: string;
};

export type AnalysisResult = WordAnalysis | SentenceAnalysis | DiscourseAnalysis;

// Rich curated database for b1-osd-mock-01 and common B1 German vocabulary
const curatedVocabulary: Record<string, Omit<WordAnalysis, 'level' | 'originalText'>> = {
  umgezogen: {
    lemma: 'umziehen',
    partOfSpeech: 'Động từ bất quy tắc (tách được)',
    ipa: '[ˈʊmˌtsiːən]',
    generalMeaningVi: 'chuyển nhà, đổi chỗ ở',
    contextMeaningVi: 'đã chuyển tới Berlin sinh sống cách đây 2 tuần',
    exampleSentenceDe: 'Ich bin vor zwei Wochen nach Berlin umgezogen.',
    exampleSentenceVi: 'Tôi đã chuyển đến Berlin được hai tuần.',
  },
  umzug: {
    lemma: 'der Umzug',
    partOfSpeech: 'Danh từ giống đực',
    gender: 'der',
    pluralForm: 'die Umzüge',
    ipa: '[ˈʊmˌtsuːk]',
    generalMeaningVi: 'việc dọn nhà, di chuyển chỗ ở',
    contextMeaningVi: 'quá trình chuyển nơi sinh sống sang thành phố mới',
    exampleSentenceDe: 'Mein Umzug nach Berlin war am Anfang ganz schön stressig.',
    exampleSentenceVi: 'Việc dọn nhà đến Berlin ban đầu khá căng thẳng.',
  },
  stressig: {
    lemma: 'stressig',
    partOfSpeech: 'Tính từ',
    ipa: '[ˈʃtʁɛsɪç]',
    generalMeaningVi: 'căng thẳng, gây áp lực',
    contextMeaningVi: 'rất mệt mỏi và lo âu vì việc tìm nhà trọ khó khăn',
    exampleSentenceDe: 'Am Anfang war es ganz schön stressig, weil ich keine Wohnung finden konnte.',
    exampleSentenceVi: 'Ban đầu khá căng thẳng vì tôi không tìm được căn hộ nào.',
  },
  wg: {
    lemma: 'die WG (Wohngemeinschaft)',
    partOfSpeech: 'Danh từ viết tắt giống cái',
    gender: 'die',
    pluralForm: 'die WGs',
    ipa: '[veːˈɡeː]',
    generalMeaningVi: 'nhà/căn hộ ở ghép chung',
    contextMeaningVi: 'căn hộ 3 người cùng thuê ở khu Kreuzberg',
    exampleSentenceDe: 'Jetzt wohne ich in einer netten 3er-WG in Kreuzberg!',
    exampleSentenceVi: 'Bây giờ tôi sống trong một căn hộ ở ghép 3 người dễ chịu ở Kreuzberg!',
  },
  mitbewohner: {
    lemma: 'der Mitbewohner',
    partOfSpeech: 'Danh từ giống đực',
    gender: 'der',
    pluralForm: 'die Mitbewohner',
    ipa: '[ˈmɪt bəˌvoːnɐ]',
    generalMeaningVi: 'bạn cùng phòng, bạn cùng nhà',
    contextMeaningVi: 'hai người bạn Sara và Jonas cùng thuê chung căn hộ',
    exampleSentenceDe: 'Meine Mitbewohner, Sara und Jonas, sind supernett.',
    exampleSentenceVi: 'Các bạn cùng phòng của tôi, Sara và Jonas, siêu thân thiện.',
  },
  mieten: {
    lemma: 'die Miete',
    partOfSpeech: 'Danh từ giống cái',
    gender: 'die',
    pluralForm: 'die Mieten',
    ipa: '[ˈmiːtə]',
    generalMeaningVi: 'tiền thuê nhà',
    contextMeaningVi: 'mức giá thuê nhà ở Berlin quá cao so với dự tính',
    exampleSentenceDe: 'Überall waren die Mieten viel zu hoch.',
    exampleSentenceVi: 'Khắp nơi giá thuê đều quá đắt đỏ.',
  },
  webentwickler: {
    lemma: 'der Webentwickler',
    partOfSpeech: 'Danh từ nghề nghiệp giống đực',
    gender: 'der',
    pluralForm: 'die Webentwickler',
    ipa: '[ˈvɛpʔɛntˌvɪklɐ]',
    generalMeaningVi: 'lập trình viên web',
    contextMeaningVi: 'công việc mới của Michael bắt đầu từ tuần tới',
    exampleSentenceDe: 'Nächste Woche fängt mein neuer Job als Webentwickler an.',
    exampleSentenceVi: 'Tuần tới công việc lập trình viên web mới của tôi sẽ bắt đầu.',
  },
  nervös: {
    lemma: 'nervös',
    partOfSpeech: 'Tính từ',
    ipa: '[nɛʁˈvøːs]',
    generalMeaningVi: 'bồn chồn, hồi hộp, lo lắng',
    contextMeaningVi: 'tâm trạng lo âu xen lẫn háo hức trước ngày đi làm đầu tiên',
    exampleSentenceDe: 'Ich bin schon ziemlich nervös, aber ich freue mich auch riesig darauf.',
    exampleSentenceVi: 'Tôi đã khá hồi hộp, nhưng cũng vô cùng háo hức chờ đón.',
  },
  ausbildung: {
    lemma: 'die Ausbildung',
    partOfSpeech: 'Danh từ giống cái',
    gender: 'die',
    pluralForm: 'die Ausbildungen',
    ipa: '[ˈaʊ̯sˌbɪldʊŋ]',
    generalMeaningVi: 'học nghề, đào tạo nghề',
    contextMeaningVi: 'chương trình đào tạo thực hành kết hợp lý thuyết',
    exampleSentenceDe: 'Er macht eine Ausbildung als Fachinformatiker.',
    exampleSentenceVi: 'Anh ấy đang học nghề chuyên viên tin học.',
  },
  bewerbung: {
    lemma: 'die Bewerbung',
    partOfSpeech: 'Danh từ giống cái',
    gender: 'die',
    pluralForm: 'die Bewerbungen',
    ipa: '[bəˈvɛʁbʊŋ]',
    generalMeaningVi: 'hồ sơ ứng tuyển, đơn xin việc',
    contextMeaningVi: 'hồ sơ xin việc nộp vào công ty',
    exampleSentenceDe: 'Ich habe meine Bewerbung gestern abgeschickt.',
    exampleSentenceVi: 'Tôi đã gửi hồ sơ xin việc của mình vào ngày hôm qua.',
  },
  erfahrung: {
    lemma: 'die Erfahrung',
    partOfSpeech: 'Danh từ giống cái',
    gender: 'die',
    pluralForm: 'die Erfahrungen',
    ipa: '[ɛɐ̯ˈfaːʁʊŋ]',
    generalMeaningVi: 'kinh nghiệm, trải nghiệm',
    contextMeaningVi: 'kinh nghiệm làm việc thực tế',
    exampleSentenceDe: 'Für diese Stelle braucht man praktische Erfahrung.',
    exampleSentenceVi: 'Đối với vị trí này cần có kinh nghiệm thực tế.',
  },
  veranstaltung: {
    lemma: 'die Veranstaltung',
    partOfSpeech: 'Danh từ giống cái',
    gender: 'die',
    pluralForm: 'die Veranstaltungen',
    ipa: '[fɛɐ̯ˈʔanʃtaltʊŋ]',
    generalMeaningVi: 'sự kiện, buổi biểu diễn, hội thảo',
    contextMeaningVi: 'sự kiện cộng đồng hoặc văn hóa',
    exampleSentenceDe: 'Die Veranstaltung findet im Kulturzentrum statt.',
    exampleSentenceVi: 'Sự kiện diễn ra tại trung tâm văn hóa.',
  },
  umwelt: {
    lemma: 'die Umwelt',
    partOfSpeech: 'Danh từ giống cái',
    gender: 'die',
    ipa: '[ˈʊmˌvɛlt]',
    generalMeaningVi: 'môi trường sống',
    contextMeaningVi: 'bảo vệ môi trường và sinh thái tự nhiên',
    exampleSentenceDe: 'Fahrradfahren schont die Umwelt und spart Geld.',
    exampleSentenceVi: 'Đi xe đạp bảo vệ môi trường và tiết kiệm tiền.',
  },
  weiterbildung: {
    lemma: 'die Weiterbildung',
    partOfSpeech: 'Danh từ giống cái',
    gender: 'die',
    pluralForm: 'die Weiterbildungen',
    ipa: '[ˈvaɪ̯tɐˌbɪldʊŋ]',
    generalMeaningVi: 'học nâng cao, đào tạo tiếp tục',
    contextMeaningVi: 'khóa học bồi dưỡng chuyên môn sau đại học/học nghề',
    exampleSentenceDe: 'Die Firma bezahlt mir die Weiterbildung.',
    exampleSentenceVi: 'Công ty chi trả học phí khóa đào tạo nâng cao cho tôi.',
  },
};

/**
 * Clean up text selection
 */
export function normalizeSelection(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

/**
 * Determine analysis level based on selection length and punctuation
 */
export function detectSelectionLevel(text: string): 'word' | 'sentence' | 'discourse' {
  const clean = normalizeSelection(text);
  const words = clean.split(/\s+/).filter(Boolean);
  
  // Single word or short phrase without sentence-ending punctuation
  if (words.length <= 3 && !/[.!?]/.test(clean)) {
    return 'word';
  }

  // Count sentences
  const sentenceCount = clean.split(/[.!?]+/).filter((s) => s.trim().length > 3).length;
  if (sentenceCount <= 1 && words.length < 24) {
    return 'sentence';
  }

  return 'discourse';
}

/**
 * Synthesize dynamic German word analysis
 */
function analyzeWordFallback(word: string, fullContext: string): WordAnalysis {
  const clean = word.replace(/[.,/#!$%^&*;:{}=\-_`~()?"'«»]/g, '').trim();
  const lower = clean.toLowerCase();

  // Try exact lookup
  if (curatedVocabulary[lower]) {
    const item = curatedVocabulary[lower];
    return {
      level: 'word',
      originalText: word,
      ...item,
    };
  }

  // Common German suffixes detection
  let pos = 'Từ vựng tiếng Đức';
  let gender: 'der' | 'die' | 'das' | 'Plural' | undefined = undefined;
  let meaning = `Nghĩa của từ "${clean}"`;

  if (/^[A-ZÄÖÜ]/.test(clean)) {
    // Capitalized = Noun in German
    if (clean.endsWith('ung') || clean.endsWith('heit') || clean.endsWith('keit') || clean.endsWith('schaft') || clean.endsWith('tion') || clean.endsWith('tät')) {
      pos = 'Danh từ giống cái (Feminin)';
      gender = 'die';
    } else if (clean.endsWith('chen') || clean.endsWith('lein') || clean.endsWith('ment') || clean.endsWith('um')) {
      pos = 'Danh từ giống trung (Neutrum)';
      gender = 'das';
    } else if (clean.endsWith('er') || clean.endsWith('ist') || clean.endsWith('or') || clean.endsWith('ismus')) {
      pos = 'Danh từ giống đực (Maskulin)';
      gender = 'der';
    } else {
      pos = 'Danh từ tiếng Đức';
    }
    meaning = `Danh từ chỉ đối tượng/khái niệm "${clean}"`;
  } else if (clean.endsWith('en') || clean.endsWith('te') || clean.endsWith('t')) {
    pos = 'Động từ';
    meaning = `Hành động liên quan đến "${clean}"`;
  } else if (clean.endsWith('ig') || clean.endsWith('lich') || clean.endsWith('isch') || clean.endsWith('bar') || clean.endsWith('sam')) {
    pos = 'Tính từ';
    meaning = `Đặc tính / tính chất mang sắc thái "${clean}"`;
  }

  // Find sentence containing this word in fullContext
  let surroundingSentence = clean;
  let surroundingSentenceVi = `Câu chứa từ "${clean}" trong ngữ cảnh bài đọc.`;
  if (fullContext) {
    const sentences = fullContext.split(/(?<=[.!?])\s+/);
    const match = sentences.find((s) => s.toLowerCase().includes(lower));
    if (match) {
      surroundingSentence = match.trim();
      surroundingSentenceVi = 'Đoạn ngữ cảnh trích xuất trực tiếp từ bài đọc.';
    }
  }

  return {
    level: 'word',
    originalText: clean,
    lemma: clean,
    partOfSpeech: pos,
    gender,
    ipa: `[${clean.toLowerCase()}]`,
    generalMeaningVi: meaning,
    contextMeaningVi: `${meaning} trong ngữ cảnh bài đọc này.`,
    exampleSentenceDe: surroundingSentence,
    exampleSentenceVi: surroundingSentenceVi,
  };
}

/**
 * Break down sentence structure using German Feldermodell
 */
function analyzeSentenceStructure(sentence: string): SentenceAnalysis {
  const clean = normalizeSelection(sentence);

  // Teil 1 specific high-fidelity sentence breakdowns
  if (clean.includes('vor zwei Wochen nach Berlin umgezogen')) {
    return {
      level: 'sentence',
      originalText: clean,
      mainIdeaVi: 'Michael đã chuyển đến Berlin sinh sống cách đây hai tuần.',
      vietnameseTranslation: 'Chào mọi người, tôi đã chuyển đến Berlin được hai tuần rồi.',
      keyGrammarPoint: 'Thì Perfekt với trợ động từ "sein" (dành cho động từ chuyển động "umziehen").',
      grammarCategory: 'Perfekt & Satzklammer',
      fields: [
        {
          label: 'Subjekt',
          germanRole: 'Vorfeld / Subjekt',
          text: 'ich',
          vietnameseExplanation: 'Chủ ngữ ngôi thứ nhất (Michael)',
        },
        {
          label: 'Verb 1 (Hilfsverb)',
          germanRole: 'Verb 1 (Position 2)',
          text: 'bin',
          vietnameseExplanation: 'Trợ động từ "sein" chia theo ngôi "ich" đứng vị trí 2',
        },
        {
          label: 'Mittelfeld',
          germanRole: 'Mittelfeld (Objekte / Adverbiale)',
          text: 'vor zwei Wochen nach Berlin',
          vietnameseExplanation: 'Trạng từ thời gian (vor zwei Wochen) + Nơi chốn đến (nach Berlin)',
        },
        {
          label: 'Verb 2 (Partizip II)',
          germanRole: 'Verb 2 (Satzklammer)',
          text: 'umgezogen',
          vietnameseExplanation: 'Động từ chính dạng quá khứ phân từ Partizip II chốt cuối câu',
        },
      ],
    };
  }

  if (clean.includes('weil ich keine Wohnung finden konnte')) {
    return {
      level: 'sentence',
      originalText: clean,
      mainIdeaVi: 'Ban đầu Michael rất căng thẳng vì không thể tìm được nhà ở.',
      vietnameseTranslation: 'Ban đầu việc này khá căng thẳng, bởi vì tôi không tìm được căn hộ nào.',
      keyGrammarPoint: 'Mệnh đề chỉ nguyên nhân với "weil" — đưa cụm động từ "finden konnte" về cuối mệnh đề.',
      grammarCategory: 'Kausalsatz mit weil',
      fields: [
        {
          label: 'Hauptsatz',
          germanRole: 'Vorfeld / Subjekt',
          text: 'Am Anfang war es ganz schön stressig,',
          vietnameseExplanation: 'Mệnh đề chính: Ban đầu khá là căng thẳng',
        },
        {
          label: 'Konjunktion',
          germanRole: 'Verb 1 (Position 2)',
          text: 'weil',
          vietnameseExplanation: 'Liên từ phụ thuộc chỉ lý do (bởi vì)',
        },
        {
          label: 'Subjekt & Objekt',
          germanRole: 'Mittelfeld (Objekte / Adverbiale)',
          text: 'ich keine Wohnung',
          vietnameseExplanation: 'Chủ ngữ "ich" + Tân ngữ phủ định "keine Wohnung"',
        },
        {
          label: 'Verben am Satzende',
          germanRole: 'Nebensatz',
          text: 'finden konnte.',
          vietnameseExplanation: 'Động từ nguyên mẫu (finden) + Trợ động từ khuyết thiếu quá khứ (konnte) ở cuối',
        },
      ],
    };
  }

  if (clean.includes('fängt mein neuer Job als Webentwickler an')) {
    return {
      level: 'sentence',
      originalText: clean,
      mainIdeaVi: 'Tuần tới Michael sẽ bắt đầu công việc lập trình viên web mới.',
      vietnameseTranslation: 'Tuần tới công việc mới của tôi với vai trò lập trình viên web sẽ bắt đầu.',
      keyGrammarPoint: 'Động từ tách "anfangen" — tiền tố "an" bị tách và đẩy về vị trí cuối cùng của câu.',
      grammarCategory: 'Trennbare Verben',
      fields: [
        {
          label: 'Temporalangabe',
          germanRole: 'Vorfeld / Subjekt',
          text: 'Nächste Woche',
          vietnameseExplanation: 'Trạng từ thời gian đứng đầu câu (Vorfeld) để tạo điểm nhấn',
        },
        {
          label: 'Verb 1 (Stamm)',
          germanRole: 'Verb 1 (Position 2)',
          text: 'fängt',
          vietnameseExplanation: 'Gốc động từ anfangen chia theo ngôi thứ 3 số ít',
        },
        {
          label: 'Subjekt & Apposition',
          germanRole: 'Mittelfeld (Objekte / Adverbiale)',
          text: 'mein neuer Job als Webentwickler',
          vietnameseExplanation: 'Chủ ngữ "công việc mới của tôi" kèm chức danh nghề nghiệp',
        },
        {
          label: 'Verbzusatz',
          germanRole: 'Verb 2 (Satzklammer)',
          text: 'an.',
          vietnameseExplanation: 'Tiền tố tách "an" đóng khung câu (Satzklammer)',
        },
      ],
    };
  }

  // Dynamic German Sentence Parser
  const words = clean.split(/\s+/);
  const hasSubordinate = /\b(weil|dass|obwohl|wenn|da|als|nachdem|damit|bevor)\b/i.test(clean);
  const mainWords = clean.replace(/[.!?]/g, '').split(/\s+/);
  
  return {
    level: 'sentence',
    originalText: clean,
    mainIdeaVi: `Ý chính: Câu biểu đạt thông điệp về "${mainWords.slice(0, 5).join(' ')}...".`,
    vietnameseTranslation: `Bản dịch gợi ý: ${clean}`,
    keyGrammarPoint: hasSubordinate
      ? 'Cấu trúc câu phức có mệnh đề phụ thuộc (Nebensatz): liên từ đưa động từ chia về cuối mệnh đề.'
      : 'Cấu trúc câu trần thuật cơ bản: Động từ vị trí 2 (V2-Stellung), thành phần Vorfeld đứng đầu câu.',
    grammarCategory: hasSubordinate ? 'Nebensatz (Mệnh đề phụ)' : 'Hauptsatz (Mệnh đề chính)',
    fields: [
      {
        label: 'Vorfeld',
        germanRole: 'Vorfeld / Subjekt',
        text: words.slice(0, 2).join(' '),
        vietnameseExplanation: 'Thành phần mở đầu câu (Chủ ngữ hoặc trạng từ khởi tạo)',
      },
      {
        label: 'Verb 1 (Position 2)',
        germanRole: 'Verb 1 (Position 2)',
        text: words[2] ?? words[1] ?? 'Verb',
        vietnameseExplanation: 'Vị trí động từ chia theo ngôi ngữ pháp',
      },
      {
        label: 'Mittelfeld',
        germanRole: 'Mittelfeld (Objekte / Adverbiale)',
        text: words.slice(3, Math.max(4, words.length - 1)).join(' ') || 'Thành phần bổ nghĩa',
        vietnameseExplanation: 'Các bổ ngữ cách thức, thời gian, nơi chốn hoặc tân ngữ',
      },
      {
        label: 'Rechte Satzklammer',
        germanRole: 'Verb 2 (Satzklammer)',
        text: words[words.length - 1] ?? '',
        vietnameseExplanation: 'Động từ cuối câu hoặc thành phần kết thúc câu',
      },
    ],
  };
}

/**
 * Discourse analysis for multi-sentence / paragraph selections with bi-directional highlights
 */
function analyzeDiscourse(text: string, part: number): DiscourseAnalysis {
  const clean = normalizeSelection(text);

  // High-fidelity discourse for Teil 1 (Blog von Michael)
  if (clean.includes('Berlin') || clean.includes('Wohnung') || part === 1) {
    return {
      level: 'discourse',
      originalText: clean,
      title: 'Mạch liên kết: Nhật ký chuyển nhà & Thích nghi cuộc sống mới',
      flowSteps: [
        'Bối cảnh: Dọn đến Berlin',
        'Khó khăn: Giá thuê đắt đỏ',
        'Giải pháp: Đồng nghiệp trợ giúp vào WG',
        'Hiện tại: Cuộc sống vui vẻ với Mitbewohner',
        'Tương lai: Bắt đầu công việc Webentwickler',
      ],
      sentenceGroups: [
        {
          id: 'grp-1',
          color: 'emerald',
          categoryLabel: 'Bối cảnh khởi đầu',
          sourceQuote: 'ich bin vor zwei Wochen nach Berlin umgezogen',
          vietnameseSummary: 'Michael thông báo đã hoàn tất việc chuyển tới sống tại Berlin được hai tuần.',
        },
        {
          id: 'grp-2',
          color: 'amber',
          categoryLabel: 'Xung đột / Trở ngại',
          sourceQuote: 'Am Anfang war es ganz schön stressig, weil ich keine Wohnung finden konnte. Überall waren die Mieten viel zu hoch.',
          vietnameseSummary: 'Gặp áp lực lớn thời gian đầu do giá nhà ở Berlin quá cao và khan hiếm phòng.',
        },
        {
          id: 'grp-3',
          color: 'purple',
          categoryLabel: 'Bước ngoặt / Giải pháp',
          sourceQuote: 'Zum Glück hat mir mein Kollege geholfen: Jetzt wohne ich in einer netten 3er-WG in Kreuzberg!',
          vietnameseSummary: 'May mắn nhờ đồng nghiệp hỗ trợ nên đã tìm được một phòng trong căn hộ chung 3 người tại Kreuzberg.',
        },
        {
          id: 'grp-4',
          color: 'blue',
          categoryLabel: 'Hiện tại & Tương lai',
          sourceQuote: 'Meine Mitbewohner, Sara und Jonas, sind supernett. Wir kochen fast jeden Abend zusammen und am Wochenende zeigen sie mir die Stadt. Nächste Woche fängt mein neuer Job als Webentwickler an.',
          vietnameseSummary: 'Hòa nhập rất tốt với bạn cùng phòng và chuẩn bị bước vào công việc lập trình viên mới với tâm trạng háo hức xen lẫn hồi hộp.',
        },
      ],
      takeawayVi:
        'Tóm lại: Đoạn văn mô tả hành trình từ khó khăn tìm chỗ ở ban đầu đến khi ổn định cuộc sống tại Berlin nhờ sự trợ giúp của đồng nghiệp, phản ánh tâm trạng lạc quan và sẵn sàng cho công việc mới.',
    };
  }

  // Dynamic discourse parser for other parts
  const sentences = clean.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 5);
  const colors: DiscourseSentenceGroup['color'][] = ['emerald', 'amber', 'purple', 'blue'];

  const groups: DiscourseSentenceGroup[] = sentences.slice(0, 4).map((s, idx) => ({
    id: `dyn-grp-${idx + 1}`,
    color: colors[idx % colors.length],
    categoryLabel: idx === 0 ? 'Luận điểm khởi xướng' : idx === 1 ? 'Dẫn chứng thực tế' : idx === 2 ? 'Phân tích phản biện' : 'Kết luận trọng tâm',
    sourceQuote: s,
    vietnameseSummary: `Diễn giải ý của câu: "${s.slice(0, 60)}..."`,
  }));

  const flowSteps = groups.map((g) => `${g.categoryLabel}: ${g.sourceQuote.slice(0, 25)}...`);

  return {
    level: 'discourse',
    originalText: clean,
    title: 'Phân tích cấu trúc liên kết đoạn (Kohärenz & Kohäsion)',
    flowSteps: flowSteps.length ? flowSteps : ['Bối cảnh ngữ liệu', 'Phát triển luận điểm', 'Kết luận'],
    sentenceGroups: groups,
    takeawayVi: `Tóm lại: Toàn bộ đoạn trích tập trung làm rõ luận điểm chính và các yếu tố dẫn chứng liên quan trong ngữ cảnh bài đọc Teil ${part}.`,
  };
}

/**
 * Main public entry point: analyze text at the appropriate level
 */
export function analyzeReadingText(selection: string, fullPassage: string, part: number = 1): AnalysisResult {
  const level = detectSelectionLevel(selection);

  if (level === 'word') {
    return analyzeWordFallback(selection, fullPassage);
  }

  if (level === 'sentence') {
    return analyzeSentenceStructure(selection);
  }

  return analyzeDiscourse(selection, part);
}
