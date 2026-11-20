export type LearningSkill = 'Hoeren' | 'Lesen';

export type LearningExercise = {
  slug: string;
  title: string;
  level: 'A1' | 'A2' | 'B1' | 'B2';
  provider: 'Goethe' | 'ÖSD' | 'TELC';
  teil: string;
  skill: LearningSkill;
  questions: number;
  attempts: number;
  description: string;
  thumbnailUrl?: string;
  coverPattern?: 'book' | 'scenic' | 'minimal';
  badgeLabel?: string;
  partCount?: number;
  topic?: string;
  transcript?: Array<{ speaker: string; de: string; vi: string }>;
  content?: string;
};

export type ModelAnswerExerciseItem = {
  sentence: string;
  translationVi: string;
  blank: string;
  answer: string;
  choices: string[];
};

export const learningExercises: LearningExercise[] = [
  { slug: 'hoeren-b1-am-bahnhof', title: 'Thông báo ở nhà ga', level: 'B1', provider: 'Goethe', teil: 'Teil 1', skill: 'Hoeren', questions: 5, attempts: 1240, description: 'Luyện nghe thông báo ngắn và nhận diện thông tin thời gian, địa điểm.', topic: 'Giao thông & đời sống', coverPattern: 'scenic', partCount: 3, transcript: [{ speaker: 'A', de: 'Der Zug nach Berlin hat heute zehn Minuten Verspätung.', vi: 'Chuyến tàu đi Berlin hôm nay bị trễ mười phút.' }, { speaker: 'B', de: 'Bitte warten Sie am Gleis drei.', vi: 'Vui lòng chờ ở sân ga số ba.' }] },
  { slug: 'hoeren-a2-im-alltag', title: 'Một ngày đi làm', level: 'A2', provider: 'ÖSD', teil: 'Teil 2', skill: 'Hoeren', questions: 10, attempts: 874, description: 'Nghe hội thoại đời sống hàng ngày với tốc độ vừa phải.', topic: 'Công việc', coverPattern: 'minimal', partCount: 2, transcript: [{ speaker: 'A', de: 'Wann beginnt dein Arbeitstag?', vi: 'Ngày làm việc của bạn bắt đầu lúc mấy giờ?' }, { speaker: 'B', de: 'Um acht Uhr. Ich fahre mit dem Fahrrad.', vi: 'Lúc tám giờ. Tôi đi bằng xe đạp.' }] },
  { slug: 'lesen-b1-ausbildung', title: 'Thông tin tuyển dụng', level: 'B1', provider: 'TELC', teil: 'Teil 3', skill: 'Lesen', questions: 8, attempts: 1573, description: 'Đọc tin tuyển dụng và tìm thông tin chi tiết trong văn bản.', topic: 'Đào tạo nghề', coverPattern: 'book', partCount: 3, content: 'Die Lernwerkstatt sucht ab September neue Auszubildende. Bewerbungen sind bis zum 15. Juli möglich. Gute Deutschkenntnisse und Interesse an Technik sind wichtig.' },
  { slug: 'lesen-a1-einkaufen', title: 'Lịch học của bạn', level: 'A1', provider: 'Goethe', teil: 'Teil 1', skill: 'Lesen', questions: 5, attempts: 632, description: 'Đọc các mẩu tin ngắn và nối thông tin với tình huống phù hợp.', topic: 'Sinh hoạt hàng ngày', coverPattern: 'minimal', partCount: 2, content: 'Der Deutschkurs findet am Montag und Mittwoch um 18 Uhr statt. Bitte bringen Sie ein Heft und einen Stift mit.' },
];

export const diktatExercises = [
  { slug: 'diktat-a1-im-alltag', title: 'Im Alltag', level: 'A1' as const, questions: 8, duration: '03:00', sentences: ['Guten Morgen, wie geht es dir?', 'Ich kaufe heute frisches Brot.'] },
  { slug: 'diktat-a2-am-arbeitsplatz', title: 'Am Arbeitsplatz', level: 'A2' as const, questions: 12, duration: '05:00', sentences: [
    'Der Termin beginnt um neun Uhr.',
    'Bitte schicken Sie die E-Mail heute.',
    'Unsere Besprechung findet im zweiten Stock statt.',
    'Ich muss morgen früher zur Arbeit kommen.',
    'Die Kollegin erklärt den neuen Arbeitsablauf.',
    'Kannst du bitte die Dokumente ausdrucken?',
    'Wir machen um zwölf Uhr eine kurze Pause.',
    'Der Kunde wartet auf eine schnelle Antwort.',
    'Nächste Woche nehme ich zwei Tage Urlaub.',
    'Bitte tragen Sie den Termin in den Kalender ein.',
    'Das Team arbeitet gemeinsam an einem wichtigen Projekt.',
    'Am Freitag besprechen wir die Ergebnisse.',
  ] },
  { slug: 'diktat-b1-gute-gewohnheiten', title: 'Gute Gewohnheiten', level: 'B1' as const, questions: 15, duration: '07:00', sentences: ['Regelmäßige Wiederholung hilft beim Sprachenlernen.', 'Kleine Schritte führen langfristig zum Ziel.'] },
];

export const modelAnswers = {
  schreiben: [
    { slug: 'b1-schreiben-e-mail', teil: 'Teil 1', title: 'E-Mail thân mật', level: 'B1', prompt: 'Sie möchten Ihre Freundin zu einem Ausflug einladen.', topic: 'Bạn bè & du lịch', sample: 'Liebe Anna,\n\nwie geht es dir? Am Samstag möchte ich einen Ausflug an den See machen. Hast du Zeit? Wir können uns um zehn Uhr am Bahnhof treffen.\n\nLiebe Grüße\nMai', translation: 'Anna thân mến,\n\nBạn khỏe không? Thứ Bảy này mình muốn đi dã ngoại ở hồ. Bạn có thời gian không? Chúng ta có thể gặp nhau lúc mười giờ ở nhà ga.\n\nThân ái\nMai', redemittel: ['Wie geht es dir?', 'Hast du Zeit?', 'Ich freue mich auf deine Antwort.'], exercise: [
      { sentence: 'Ich schreibe dir heute, weil ich am Samstag einen Ausflug an den See planen möchte.', translationVi: 'Mình viết thư cho bạn hôm nay vì mình muốn lên kế hoạch đi dã ngoại ở hồ vào thứ Bảy.', blank: 'schreibe dir heute, weil', answer: 'schreibe dir heute, weil', choices: ['schreibe dir heute, weil', 'Wie wäre es, wenn', 'Es tut mir leid, dass', 'würde mich riesig freuen', 'Sag mir bitte bald Bescheid'] },
      { sentence: 'Wie wäre es, wenn wir uns um zehn Uhr direkt am Hauptbahnhof treffen?', translationVi: 'Sẽ thế nào nếu chúng ta gặp nhau lúc 10 giờ ngay tại nhà ga trung tâm?', blank: 'Wie wäre es, wenn', answer: 'Wie wäre es, wenn', choices: ['Wie wäre es, wenn', 'schreibe dir heute, weil', 'Es tut mir leid, dass', 'würde mich riesig freuen', 'Sag mir bitte bald Bescheid'] },
      { sentence: 'Es tut mir leid, dass ich mich erst jetzt auf deine letzte Nachricht melde.', translationVi: 'Mình rất tiếc vì đến tận bây giờ mới phản hồi tin nhắn trước của bạn.', blank: 'Es tut mir leid, dass', answer: 'Es tut mir leid, dass', choices: ['Es tut mir leid, dass', 'Sag mir bitte bald Bescheid', 'Wie wäre es, wenn', 'schreibe dir heute, weil', 'würde mich riesig freuen'] },
      { sentence: 'Ich würde mich riesig freuen, wenn du Zeit hättest und mitkommen könntest.', translationVi: 'Mình sẽ rất vui nếu bạn có thời gian và có thể đi cùng.', blank: 'würde mich riesig freuen', answer: 'würde mich riesig freuen', choices: ['würde mich riesig freuen', 'Es tut mir leid, dass', 'Sag mir bitte bald Bescheid', 'Wie wäre es, wenn', 'schreibe dir heute, weil'] },
      { sentence: 'Sag mir bitte bald Bescheid, damit ich die Fahrkarten buchen kann.', translationVi: 'Hãy báo cho mình sớm nhé để mình có thể đặt vé tàu.', blank: 'Sag mir bitte bald Bescheid', answer: 'Sag mir bitte bald Bescheid', choices: ['Sag mir bitte bald Bescheid', 'würde mich riesig freuen', 'Wie wäre es, wenn', 'Es tut mir leid, dass', 'schreibe dir heute, weil'] },
    ] as ModelAnswerExerciseItem[] },
    { slug: 'b1-schreiben-meinung', teil: 'Teil 2', title: 'Ý kiến cá nhân', level: 'B1', prompt: 'Schreiben Sie Ihre Meinung zum Thema Online-Lernen.', sample: 'Meiner Meinung nach bietet Online-Lernen viele Vorteile. Man kann flexibel lernen und Zeit sparen. Allerdings braucht man auch viel Disziplin.', translation: 'Theo ý kiến của tôi, học trực tuyến có nhiều ưu điểm. Người học có thể học linh hoạt và tiết kiệm thời gian. Tuy nhiên cũng cần nhiều kỷ luật.', redemittel: ['Meiner Meinung nach...', 'Ein Vorteil ist...', 'Allerdings...'] },
  ],
  sprechen: [
    { slug: 'b1-sprechen-planen', teil: 'Teil 1', title: 'Gemeinsam planen', level: 'B1', prompt: 'Planen Sie gemeinsam einen Besuch im Museum.', sample: 'Ich schlage vor, dass wir am Samstag ins Museum gehen. Wie wäre es um drei Uhr? Danach können wir noch einen Kaffee trinken.', translation: 'Mình đề xuất chúng ta đi bảo tàng vào thứ Bảy. Ba giờ thì sao? Sau đó chúng ta có thể uống cà phê.', redemittel: ['Ich schlage vor, dass...', 'Wie wäre es mit...?', 'Das klingt gut.'] },
    { slug: 'b1-sprechen-meinung', teil: 'Teil 2', title: 'Ein Thema präsentieren', level: 'B1', prompt: 'Präsentieren Sie das Thema gesunde Gewohnheiten.', sample: 'Heute möchte ich über gesunde Gewohnheiten sprechen. Für mich sind regelmäßige Bewegung und ausreichend Schlaf besonders wichtig.', translation: 'Hôm nay tôi muốn nói về thói quen lành mạnh. Với tôi, vận động đều đặn và ngủ đủ giấc đặc biệt quan trọng.', redemittel: ['Heute möchte ich...', 'Besonders wichtig ist...', 'Zum Schluss...'] },
  ],
};
