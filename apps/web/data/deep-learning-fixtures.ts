import type { QuestionType } from '@shd/contracts';

export type LearningSkill = 'Lesen' | 'Hoeren';

export type VocabularyEntry = {
  id: string;
  term: string;
  article?: 'der' | 'die' | 'das';
  plural?: string;
  partOfSpeech: string;
  ipa: string;
  definitionVi: string;
  contextVi: string;
  exampleDe: string;
  exampleVi: string;
};

export type ParaphrasePair = {
  questionPhrase: string;
  sourcePhrase: string;
  note: string;
};

export type EvidenceLocator = {
  anchorId: string;
  label: string;
  excerpt: string;
};

export type AudioLocator = {
  startMs: number;
  endMs: number;
  transcriptId: string;
};

export type ExplanationStep = {
  title: string;
  content: string;
};

export type DeepLearningQuestion = {
  id: string;
  prompt: string;
  options?: Array<{ id: string; text: string }>;
  questionType?: QuestionType;
  selectedOption?: string;
  correctOption?: string;
  explanation: string;
  keywords: string[];
  evidence?: EvidenceLocator;
  audio?: AudioLocator;
  paraphrases: ParaphrasePair[];
  steps: ExplanationStep[];
};

export type DeepLearningExercise = {
  slug: string;
  title: string;
  level: 'A1' | 'A2' | 'B1' | 'B2';
  provider: 'Goethe' | 'ÖSD' | 'TELC';
  teil: string;
  skill: LearningSkill;
  questions: number;
  attempts: number;
  description: string;
  audioUrl?: string;
  content?: string;
  transcript?: Array<{
    id: string;
    speaker: string;
    de: string;
    vi: string;
    startMs: number;
    endMs: number;
  }>;
  vocabulary: VocabularyEntry[];
  reviewQuestions: DeepLearningQuestion[];
};

const stationVocabulary: VocabularyEntry[] = [
  {
    id: 'zug',
    term: 'Zug',
    article: 'der',
    plural: 'die Züge',
    partOfSpeech: 'Danh từ',
    ipa: '[tsuːk]',
    definitionVi: 'tàu hỏa',
    contextVi: 'Phương tiện di chuyển giữa các thành phố.',
    exampleDe: 'Der Zug nach Berlin hat Verspätung.',
    exampleVi: 'Chuyến tàu đi Berlin bị trễ.',
  },
  {
    id: 'verspaetung',
    term: 'Verspätung',
    article: 'die',
    plural: 'die Verspätungen',
    partOfSpeech: 'Danh từ',
    ipa: '[fɛɐ̯ˈʃpɛːtʊŋ]',
    definitionVi: 'sự chậm trễ',
    contextVi: 'Thông báo về thời gian tàu hoặc chuyến bay đến muộn.',
    exampleDe: 'Der Zug hat zehn Minuten Verspätung.',
    exampleVi: 'Chuyến tàu chậm mười phút.',
  },
  {
    id: 'gleis',
    term: 'Gleis',
    article: 'das',
    plural: 'die Gleise',
    partOfSpeech: 'Danh từ',
    ipa: '[ɡlaɪ̯s]',
    definitionVi: 'sân ga, đường ray',
    contextVi: 'Khu vực hành khách đứng chờ tàu.',
    exampleDe: 'Bitte warten Sie am Gleis drei.',
    exampleVi: 'Vui lòng chờ ở sân ga số ba.',
  },
];

export const deepLearningExercises: DeepLearningExercise[] = [
  {
    slug: 'lesen-b1-ausbildung',
    title: 'Thông tin tuyển dụng',
    level: 'B1',
    provider: 'TELC',
    teil: 'Teil 3',
    skill: 'Lesen',
    questions: 8,
    attempts: 1573,
    description: 'Đọc tin tuyển dụng và tìm thông tin chi tiết trong văn bản.',
    content: 'Die Lernwerkstatt sucht ab September neue Auszubildende. Der Betrieb verbindet praktische Arbeit in verschiedenen Abteilungen mit regelmäßigem Unterricht in der Berufsschule. So können junge Menschen früh Verantwortung übernehmen und gleichzeitig einen anerkannten Abschluss vorbereiten.\n\nBewerbungen sind bis zum 15. Juli möglich. Gute Deutschkenntnisse und Interesse an Technik sind wichtig. Im Gespräch erklärt die Ausbildungsleitung außerdem, welche Aufgaben die neuen Mitarbeitenden im ersten Jahr übernehmen und wie sie von erfahrenen Kolleginnen und Kollegen begleitet werden.\n\nWer sich bewirbt, sollte einen Lebenslauf und die letzten Zeugnisse einreichen. Besonders wichtig sind Zuverlässigkeit, Lernbereitschaft und die Bereitschaft, im Team zu arbeiten. Ein Praktikum vor Beginn der Ausbildung ist möglich, aber keine Voraussetzung.',
    vocabulary: [
      {
        id: 'auszubildende',
        term: 'Auszubildende',
        plural: 'die Auszubildenden',
        partOfSpeech: 'Danh từ',
        ipa: '[ˈaʊ̯sˌtsuːbɪldn̩də]',
        definitionVi: 'người học nghề',
        contextVi: 'Người đang theo một chương trình đào tạo nghề.',
        exampleDe: 'Die Firma sucht neue Auszubildende.',
        exampleVi: 'Công ty đang tìm người học nghề mới.',
      },
      {
        id: 'bewerbung',
        term: 'Bewerbung',
        article: 'die',
        plural: 'die Bewerbungen',
        partOfSpeech: 'Danh từ',
        ipa: '[bəˈvɛʁbʊŋ]',
        definitionVi: 'hồ sơ xin việc',
        contextVi: 'Bộ hồ sơ gửi cho nhà tuyển dụng.',
        exampleDe: 'Die Bewerbung muss bis zum 15. Juli eingehen.',
        exampleVi: 'Hồ sơ phải được gửi trước ngày 15 tháng 7.',
      },
    ],
    reviewQuestions: [
      {
        id: 'lesen-b1-q1',
        prompt: 'Bis wann können sich Interessierte bewerben?',
        selectedOption: 'B',
        correctOption: 'B',
        explanation: 'Mốc thời gian “bis zum 15. Juli” xuất hiện trực tiếp trong câu thứ hai của thông báo.',
        keywords: ['bis wann', 'bewerben', '15. Juli'],
        evidence: { anchorId: 'lesen-paragraph-b', label: 'Định vị mốc thời gian', excerpt: 'Bewerbungen sind bis zum 15. Juli möglich.' },
        paraphrases: [{ questionPhrase: 'Bis wann', sourcePhrase: 'bis zum 15. Juli', note: 'Cùng hỏi về thời hạn cuối cùng.' }],
        steps: [
          { title: 'Phân tích câu hỏi & từ khóa', content: '“Bis wann” yêu cầu tìm một mốc thời gian kết thúc.' },
          { title: 'Định vị thông tin', content: 'Đoạn thứ hai chứa cụm “bis zum 15. Juli”.' },
          { title: 'Đối chiếu paraphrasing', content: '“Bewerben” trong câu hỏi tương ứng với “Bewerbungen” trong bài.' },
          { title: 'Kết luận & bẫy tư duy', content: 'Đáp án B đúng. Không chọn ngày bắt đầu tháng 9 vì đó là thời điểm bắt đầu chương trình.' },
        ],
      },
    ],
  },
  {
    slug: 'hoeren-b1-am-bahnhof',
    title: 'Thông báo ở nhà ga',
    level: 'B1',
    provider: 'Goethe',
    teil: 'Teil 1',
    skill: 'Hoeren',
    questions: 5,
    attempts: 1240,
    description: 'Luyện nghe thông báo ngắn và nhận diện thông tin thời gian, địa điểm.',
    transcript: [
      { id: 'station-line-1', speaker: 'A', de: 'Der Zug nach Berlin hat heute zehn Minuten Verspätung.', vi: 'Chuyến tàu đi Berlin hôm nay bị trễ mười phút.', startMs: 0, endMs: 4200 },
      { id: 'station-line-2', speaker: 'B', de: 'Bitte warten Sie am Gleis drei.', vi: 'Vui lòng chờ ở sân ga số ba.', startMs: 4400, endMs: 7200 },
    ],
    vocabulary: stationVocabulary,
    reviewQuestions: [
      {
        id: 'hoeren-b1-q1',
        prompt: 'Wie lange verspätet sich der Zug?',
        selectedOption: 'A',
        correctOption: 'A',
        explanation: 'Trong thông báo, người nói nêu rõ tàu bị trễ mười phút.',
        keywords: ['wie lange', 'Verspätung', 'zehn Minuten'],
        audio: { startMs: 0, endMs: 4200, transcriptId: 'station-line-1' },
        paraphrases: [{ questionPhrase: 'Wie lange verspätet', sourcePhrase: 'zehn Minuten Verspätung', note: 'Câu hỏi và audio cùng nói về thời lượng trễ.' }],
        steps: [
          { title: 'Phân tích câu hỏi & từ khóa', content: '“Wie lange” báo hiệu cần nghe một khoảng thời gian.' },
          { title: 'Định vị thông tin', content: 'Nghe từ đầu đoạn thông báo để bắt cụm “zehn Minuten”.' },
          { title: 'Đối chiếu paraphrasing', content: '“verspätet sich” tương ứng với “Verspätung”.' },
          { title: 'Kết luận & bẫy tư duy', content: 'Đáp án A đúng. “Gleis drei” là địa điểm, không phải thời lượng.' },
        ],
      },
    ],
  },
  {
    slug: 'osd-b1',
    title: 'ÖSD B1 Lesen – Online-Test',
    level: 'B1',
    provider: 'ÖSD',
    teil: 'Teil 1',
    skill: 'Lesen',
    questions: 8,
    attempts: 986,
    description: 'Luyện đọc ÖSD B1 với các thông báo thực tế và câu hỏi tìm thông tin nhanh.',
    content: 'Das Stadtzentrum bietet am Samstag ein kostenloses Kulturprogramm an. Besucherinnen und Besucher können mehrere Ausstellungen besuchen und an einer kurzen Stadtführung teilnehmen. Die Anmeldung für die Führung ist online möglich.\n\nDie Führung beginnt um zehn Uhr am Haupteingang des Museums. Wer teilnehmen möchte, sollte mindestens fünfzehn Minuten früher kommen. Getränke und kleine Snacks können im Museumscafé gekauft werden.\n\nBei schlechtem Wetter findet die Veranstaltung trotzdem statt. Nur der Rundgang durch den Park wird dann in einen Vortrag im Museum verlegt.',
    vocabulary: [],
    reviewQuestions: [
      {
        id: 'osd-b1-q1',
        prompt: 'Wann beginnt die Stadtführung?',
        correctOption: 'A',
        explanation: 'Im zweiten Absatz steht, dass die Führung um zehn Uhr am Haupteingang beginnt.',
        keywords: ['wann', 'Stadtführung', 'zehn Uhr'],
        paraphrases: [{ questionPhrase: 'Wann beginnt', sourcePhrase: 'beginnt um zehn Uhr', note: 'Beide Formulierungen fragen nach dem Startzeitpunkt.' }],
        steps: [
          { title: 'Tìm từ khóa', content: 'Câu hỏi yêu cầu một mốc thời gian bắt đầu.' },
          { title: 'Định vị thông tin', content: 'Đoạn thứ hai có cụm “beginnt um zehn Uhr”.' },
          { title: 'Kết luận', content: 'Đáp án đúng là mười giờ.' },
        ],
      },
    ],
  },
];

export function getDeepLearningExercise(slug: string) {
  return deepLearningExercises.find((exercise) => exercise.slug === slug);
}
