import { SpeakingTaskSchema, type SpeakingTask } from '@shd/contracts';

const jointPartOne = {
  title: 'Gemeinsam eine Party planen',
  topic: 'eine Party organisieren',
  durationSeconds: 180,
  instructionDe: 'Sie möchten zusammen eine kleine Party für Ihre Freunde organisieren. Besprechen Sie die folgenden Punkte, machen Sie Vorschläge und entscheiden Sie gemeinsam.',
  instructionVi: 'Bạn cùng người thi tổ chức một buổi tiệc nhỏ. Hãy đề xuất, phản hồi và thống nhất kế hoạch.',
  bulletPoints: ['Wann? · Khi nào?', 'Wo? · Ở đâu?', 'Was vorbereiten? · Chuẩn bị gì?', 'Wer bringt was mit? · Ai mang gì?'],
  dialogueTurns: [
    { speaker: 'A' as const, textDe: 'Hallo! Wir sollen zusammen eine Party organisieren. Hast du eine Idee?', textVi: 'Mở lời và chủ động hỏi ý kiến.', functionLabel: 'MỞ ĐẦU' },
    { speaker: 'B' as const, textDe: 'Ja, gern. Wie wäre es mit Samstagabend?', textVi: 'Đưa ra một đề xuất về thời gian.', functionLabel: 'ĐỀ XUẤT' },
    { speaker: 'A' as const, textDe: 'Das klingt gut. Wo könnten wir die Party machen?', textVi: 'Đồng ý và chuyển sang địa điểm.', functionLabel: 'PHẢN HỒI' },
    { speaker: 'B' as const, textDe: 'Vielleicht bei mir zu Hause. Ich habe genug Platz.', textVi: 'Nêu đề xuất kèm lý do.', functionLabel: 'GIẢI THÍCH' },
    { speaker: 'A' as const, textDe: 'Super! Ich kann Getränke kaufen. Kannst du Musik vorbereiten?', textVi: 'Phân chia nhiệm vụ và đặt câu hỏi.', functionLabel: 'PHỐI HỢP' },
    { speaker: 'B' as const, textDe: 'Natürlich. Dann treffen wir uns am Samstag um 18 Uhr bei mir.', textVi: 'Chốt thời gian, địa điểm và kế hoạch.', functionLabel: 'THỐNG NHẤT' },
  ],
  redemittel: [
    { phraseDe: 'Wir sollten ... organisieren.', phraseVi: 'Chúng ta nên tổ chức ...', category: 'Nêu vấn đề' },
    { phraseDe: 'Wie wäre es mit ...?', phraseVi: 'Hay là ... thì sao?', category: 'Đề xuất' },
    { phraseDe: 'Das klingt gut.', phraseVi: 'Nghe có vẻ ổn đấy.', category: 'Phản hồi' },
    { phraseDe: 'Was hältst du davon?', phraseVi: 'Bạn thấy thế nào về điều đó?', category: 'Tương tác' },
    { phraseDe: 'Ich könnte ... mitbringen.', phraseVi: 'Tôi có thể mang ...', category: 'Phân chia nhiệm vụ' },
    { phraseDe: 'Dann machen wir das so.', phraseVi: 'Vậy chúng ta thống nhất như thế.', category: 'Kết thúc' },
  ],
};

const jointPartTwo = {
  title: 'Kinder und Mobiltelefone',
  topic: 'Kinder und Mobiltelefone',
  durationSeconds: 180,
  instructionDe: 'Präsentieren Sie das Thema „Kinder und Mobiltelefone“. Sprechen Sie über Ihre Erfahrungen, die Situation in Ihrem Heimatland, Vor- und Nachteile und Ihre Meinung. Schließen Sie Ihren Vortrag ab.',
  instructionVi: 'Trình bày về trẻ em và điện thoại di động theo 5 phần: giới thiệu, trải nghiệm, tình hình quê hương, ưu – nhược điểm và kết luận.',
  bulletPoints: ['Folie 1 · Einführung', 'Folie 2 · Erfahrungen', 'Folie 3 · Heimatland', 'Folie 4 · Pro & Kontra', 'Folie 5 · Schluss'],
  slides: [
    { folieNumber: 1, titleDe: 'Einführung', titleVi: 'Giới thiệu', contentDe: 'Guten Tag! Heute möchte ich über das Thema „Kinder und Mobiltelefone“ sprechen. Zuerst erzähle ich von meinen Erfahrungen. Danach beschreibe ich die Situation in meinem Heimatland. Anschließend nenne ich Vor- und Nachteile und sage meine Meinung.', contentVi: 'Xin chào! Hôm nay tôi muốn trình bày về chủ đề trẻ em và điện thoại di động. Đầu tiên tôi chia sẻ trải nghiệm, tiếp theo là tình hình ở quê hương; sau đó nêu ưu, nhược điểm và quan điểm cá nhân.', pedagogicalTip: 'Ở Folie 1, giới thiệu chủ đề và nói ngắn gọn cấu trúc bài.' },
    { folieNumber: 2, titleDe: 'Erfahrungen', titleVi: 'Trải nghiệm', contentDe: 'Ich habe mein erstes Handy bekommen, als ich sechzehn Jahre alt war. Damals habe ich vor allem mit Freunden telefoniert und Nachrichten geschrieben. In meiner Schule durften wir Handys im Unterricht nicht benutzen.', contentVi: 'Tôi có điện thoại đầu tiên khi 16 tuổi. Khi đó, tôi chủ yếu gọi điện, nhắn tin với bạn bè. Ở trường, chúng tôi không được dùng điện thoại trong giờ học.', pedagogicalTip: 'Kể một trải nghiệm có chi tiết cụ thể; không cần nói quá dài.' },
    { folieNumber: 3, titleDe: 'Heimatland', titleVi: 'Quê hương', contentDe: 'In Vietnam benutzen heute viele Kinder ein Smartphone. Besonders in großen Städten ist das sehr verbreitet. Viele Eltern möchten, dass ihre Kinder erreichbar sind. Gleichzeitig machen sie sich Sorgen wegen der Bildschirmzeit.', contentVi: 'Ở Việt Nam, nhiều trẻ hiện dùng điện thoại thông minh, nhất là tại các thành phố lớn. Nhiều phụ huynh muốn liên lạc được với con, nhưng cũng lo ngại thời gian sử dụng màn hình.', pedagogicalTip: 'Mô tả tình hình tại quê hương và đưa ví dụ có tính đời sống.' },
    { folieNumber: 4, titleDe: 'Vor- und Nachteile', titleVi: 'Ưu và nhược điểm', contentDe: 'Einerseits können Kinder ihre Eltern leicht erreichen und Informationen finden. Andererseits verbringen manche Kinder zu viel Zeit am Handy. Sie können sich dann schlechter auf die Schule konzentrieren. Meiner Meinung nach sollten Kinder ein Handy nur mit klaren Regeln benutzen.', contentVi: 'Một mặt, trẻ có thể dễ dàng liên lạc với cha mẹ và tìm thông tin. Mặt khác, một số trẻ dùng điện thoại quá lâu và khó tập trung học. Theo tôi, trẻ chỉ nên sử dụng điện thoại với các quy định rõ ràng.', pedagogicalTip: 'Để thể hiện lập luận, nên có mặt tích cực, mặt tiêu cực và ý kiến cá nhân.' },
    { folieNumber: 5, titleDe: 'Schluss', titleVi: 'Kết luận', contentDe: 'Zum Schluss möchte ich sagen, dass Mobiltelefone für Kinder nützlich sein können. Wichtig ist aber, dass die Eltern ihre Kinder begleiten und gemeinsam Regeln vereinbaren. Vielen Dank fürs Zuhören!', contentVi: 'Cuối cùng, tôi cho rằng điện thoại có thể hữu ích với trẻ em. Tuy nhiên, điều quan trọng là cha mẹ cần đồng hành và cùng con thống nhất quy tắc sử dụng. Xin cảm ơn mọi người đã lắng nghe!', pedagogicalTip: 'Kết lại ngắn gọn, diễn đạt quan điểm và cảm ơn người nghe.' },
  ],
  redemittel: [
    { phraseDe: 'Heute möchte ich über ... sprechen.', phraseVi: 'Hôm nay tôi muốn nói về ...', category: 'Mở bài' },
    { phraseDe: 'Zuerst ..., danach ..., anschließend ...', phraseVi: 'Đầu tiên..., tiếp theo..., sau đó...', category: 'Điều hướng' },
    { phraseDe: 'Meiner Erfahrung nach ...', phraseVi: 'Theo kinh nghiệm của tôi...', category: 'Trải nghiệm' },
    { phraseDe: 'In meinem Heimatland ...', phraseVi: 'Ở quê hương tôi...', category: 'Quê hương' },
    { phraseDe: 'Einerseits ... andererseits ...', phraseVi: 'Một mặt... mặt khác...', category: 'Lập luận' },
    { phraseDe: 'Meiner Meinung nach ...', phraseVi: 'Theo quan điểm của tôi...', category: 'Ý kiến' },
    { phraseDe: 'Zum Schluss möchte ich sagen, dass ...', phraseVi: 'Cuối cùng tôi muốn nói rằng...', category: 'Kết luận' },
    { phraseDe: 'Vielen Dank fürs Zuhören!', phraseVi: 'Cảm ơn vì đã lắng nghe!', category: 'Kết bài' },
  ],
};

const jointPartThree = {
  title: 'Rückmeldung und Fragen',
  topic: 'Nach der Präsentation',
  durationSeconds: 120,
  instructionDe: 'Geben Sie Ihrem Prüfungspartner oder Ihrer Prüfungspartnerin eine Rückmeldung zu seiner oder ihrer Präsentation und stellen Sie eine passende Frage. Reagieren Sie außerdem auf Rückmeldungen und Fragen zu Ihrem eigenen Thema.',
  instructionVi: 'Sau bài thuyết trình, bạn nhận xét và đặt câu hỏi cho bạn thi; đồng thời trả lời các câu hỏi dành cho mình.',
  bulletPoints: ['Rückmeldung · Nhận xét', 'Frage stellen · Đặt câu hỏi', 'Antworten · Trả lời'],
  feedbackCards: [
    { category: 'Rückmeldung', phraseDe: 'Deine Präsentation hat mir gut gefallen. Besonders interessant fand ich, dass viele Kinder in Vietnam ein Handy benutzen.', phraseVi: 'Mình rất thích bài trình bày của bạn. Mình thấy điều thú vị là nhiều trẻ ở Việt Nam sử dụng điện thoại.' },
    { category: 'Frage an den Partner', phraseDe: 'Ich habe dazu eine Frage: Ab welchem Alter sollten Kinder deiner Meinung nach ein Handy bekommen?', phraseVi: 'Mình muốn hỏi: Theo bạn, trẻ em nên có điện thoại từ độ tuổi nào?' },
    { category: 'Antwort auf eine Frage', phraseDe: 'Ich denke, dass Kinder ab zwölf Jahren ein Handy bekommen können, wenn die Eltern klare Regeln festlegen.', phraseVi: 'Mình cho rằng từ 12 tuổi trẻ có thể có điện thoại nếu cha mẹ đưa ra quy tắc rõ ràng.' },
    { category: 'Spontane Reaktion', phraseDe: 'Das ist eine interessante Frage. Ich glaube, es hängt vom Alter und von der Situation der Familie ab.', phraseVi: 'Đó là một câu hỏi thú vị. Mình nghĩ điều này phụ thuộc vào tuổi và hoàn cảnh của gia đình.' },
  ],
  redemittel: [
    { phraseDe: 'Deine Präsentation hat mir gut gefallen.', phraseVi: 'Mình rất thích phần thuyết trình của bạn.', category: 'Nhận xét' },
    { phraseDe: 'Besonders interessant fand ich ...', phraseVi: 'Mình thấy điều đặc biệt thú vị là...', category: 'Nêu điểm nổi bật' },
    { phraseDe: 'Ich habe dazu eine Frage.', phraseVi: 'Mình có một câu hỏi về điều đó.', category: 'Đặt câu hỏi' },
    { phraseDe: 'Was denkst du darüber?', phraseVi: 'Bạn nghĩ sao về việc đó?', category: 'Hỏi ý kiến' },
    { phraseDe: 'Das ist eine gute Frage.', phraseVi: 'Đó là một câu hỏi hay.', category: 'Câu đệm' },
    { phraseDe: 'Ich würde sagen, dass ...', phraseVi: 'Mình muốn nói rằng...', category: 'Trả lời' },
  ],
};

const zdoPartOne = {
  title: 'Sich gegenseitig kennenlernen',
  topic: 'Kennenlernen',
  durationSeconds: 180,
  instructionDe: 'Lernen Sie Ihre Gesprächspartnerin oder Ihren Gesprächspartner kennen. Sprechen Sie zum Beispiel über Wohnort, Arbeit, Freizeit und Sprachen.',
  instructionVi: 'Làm quen với người cùng thi; hỏi và trả lời về nơi ở, công việc, sở thích, ngôn ngữ.',
  bulletPoints: ['Wohnort', 'Beruf', 'Freizeit', 'Sprachen'],
  dialogueTurns: [
    { speaker: 'A' as const, textDe: 'Guten Tag! Ich heiße Mai. Wie heißen Sie?', textVi: 'Chào và giới thiệu tên.', functionLabel: 'CHÀO HỎI' },
    { speaker: 'B' as const, textDe: 'Ich heiße Lukas. Freut mich! Wo wohnen Sie?', textVi: 'Chào đáp lại và hỏi về nơi ở.', functionLabel: 'HỎI THÊM' },
    { speaker: 'A' as const, textDe: 'Ich wohne in Wien. Und Sie?', textVi: 'Trả lời và hỏi lại.', functionLabel: 'TƯƠNG TÁC' },
    { speaker: 'B' as const, textDe: 'Ich wohne in Graz. In meiner Freizeit gehe ich gern wandern. Was machen Sie gern?', textVi: 'Thêm sở thích và duy trì hội thoại.', functionLabel: 'KHAI TRIỂN' },
  ],
  redemittel: [
    { phraseDe: 'Freut mich, Sie kennenzulernen.', phraseVi: 'Rất vui được làm quen.', category: 'Mở đầu' },
    { phraseDe: 'Wo wohnen Sie?', phraseVi: 'Bạn sống ở đâu?', category: 'Hỏi' },
    { phraseDe: 'Was machen Sie beruflich?', phraseVi: 'Bạn làm nghề gì?', category: 'Hỏi' },
    { phraseDe: 'Und Sie?', phraseVi: 'Còn bạn?', category: 'Hỏi lại' },
  ],
};

const zdoPartTwo = {
  title: 'Über ein Alltagsthema sprechen',
  topic: 'Freizeit und Sport',
  durationSeconds: 240,
  instructionDe: 'Sprechen Sie miteinander über das Thema „Freizeit und Sport“. Erzählen Sie von Ihren Erfahrungen und tauschen Sie Ihre Meinungen aus.',
  instructionVi: 'Trao đổi về chủ đề thời gian rảnh và thể thao; kể trải nghiệm và phản hồi quan điểm của đối phương.',
  bulletPoints: ['Erfahrungen', 'Meinung', 'Beispiele', 'Nachfragen'],
  dialogueTurns: [
    { speaker: 'A' as const, textDe: 'Was machen Sie in Ihrer Freizeit am liebsten?', textVi: 'Hỏi mở đầu.', functionLabel: 'MỞ ĐẦU' },
    { speaker: 'B' as const, textDe: 'Ich fahre gern Rad, weil ich mich dabei entspannen kann. Und Sie?', textVi: 'Trả lời có lý do và hỏi lại.', functionLabel: 'LÝ GIẢI' },
    { speaker: 'A' as const, textDe: 'Ich gehe oft schwimmen. Finden Sie, dass Sport wichtig ist?', textVi: 'Dẫn sang ý kiến.', functionLabel: 'MỞ RỘNG' },
    { speaker: 'B' as const, textDe: 'Ja, auf jeden Fall. Sport ist gut für die Gesundheit. Man kann auch neue Leute kennenlernen.', textVi: 'Nêu ý kiến kèm ví dụ.', functionLabel: 'TRAO ĐỔI' },
  ],
  redemittel: [
    { phraseDe: 'In meiner Freizeit ...', phraseVi: 'Trong thời gian rảnh tôi...', category: 'Kinh nghiệm' },
    { phraseDe: 'Meiner Meinung nach ...', phraseVi: 'Theo tôi...', category: 'Ý kiến' },
    { phraseDe: 'Ich sehe das ähnlich.', phraseVi: 'Tôi cũng nghĩ tương tự.', category: 'Phản hồi' },
    { phraseDe: 'Können Sie ein Beispiel nennen?', phraseVi: 'Bạn có thể đưa ví dụ không?', category: 'Hỏi thêm' },
  ],
};

const zdoPartThree = {
  title: 'Gemeinsam einen Ausflug planen',
  topic: 'einen Ausflug planen',
  durationSeconds: 180,
  instructionDe: 'Planen Sie gemeinsam einen Ausflug mit Freunden. Besprechen Sie, wann und wohin Sie fahren, wie Sie hinkommen und was Sie mitnehmen.',
  instructionVi: 'Cùng lên kế hoạch đi chơi: thời gian, địa điểm, phương tiện và đồ cần mang.',
  bulletPoints: ['Wann?', 'Wohin?', 'Wie fahren?', 'Was mitnehmen?'],
  dialogueTurns: [
    { speaker: 'A' as const, textDe: 'Wir möchten am Wochenende einen Ausflug machen. Wohin könnten wir fahren?', textVi: 'Đặt vấn đề và hỏi gợi ý.', functionLabel: 'MỞ ĐẦU' },
    { speaker: 'B' as const, textDe: 'Vielleicht an einen See? Dort können wir spazieren gehen.', textVi: 'Đề xuất.', functionLabel: 'ĐỀ XUẤT' },
    { speaker: 'A' as const, textDe: 'Gute Idee! Wollen wir am Sonntag mit dem Zug fahren?', textVi: 'Đồng ý và đề xuất phương tiện.', functionLabel: 'PHẢN HỒI' },
    { speaker: 'B' as const, textDe: 'Ja. Ich bringe Getränke mit, und du könntest etwas zu essen vorbereiten.', textVi: 'Phân chia nhiệm vụ.', functionLabel: 'THỐNG NHẤT' },
  ],
  redemittel: [
    { phraseDe: 'Wohin könnten wir fahren?', phraseVi: 'Chúng ta có thể đi đâu?', category: 'Đề xuất' },
    { phraseDe: 'Gute Idee!', phraseVi: 'Ý hay đấy!', category: 'Phản hồi' },
    { phraseDe: 'Wollen wir ...?', phraseVi: 'Chúng ta ... nhé?', category: 'Đề xuất' },
    { phraseDe: 'Ich bringe ... mit.', phraseVi: 'Tôi mang ...', category: 'Nhiệm vụ' },
  ],
};

function taskId(provider: SpeakingTask['examProvider'], part: number, slug: string) {
  return `${provider}-teil-${part}-${slug}`;
}

function jointTask(provider: 'goethe_b1' | 'osd_zb1', part: 1 | 2 | 3, source: typeof jointPartOne | typeof jointPartTwo | typeof jointPartThree): SpeakingTask {
  const slugPart = part === 1 ? 'party-planen' : part === 2 ? 'kinder-und-mobiltelefone' : 'ruckmeldung-und-fragen';
  return {
    id: taskId(provider, part, slugPart),
    slug: `${provider.replace('_', '-')}-teil-${part}-${slugPart}`,
    examProvider: provider,
    level: 'B1',
    part,
    taskType: part === 1 ? 'PLAN_DIALOG' : part === 2 ? 'PRESENTATION_SLIDES' : 'FEEDBACK_QA',
    ...source,
  } as SpeakingTask;
}

function zdoTask(part: 1 | 2 | 3, source: typeof zdoPartOne | typeof zdoPartTwo | typeof zdoPartThree): SpeakingTask {
  const slugPart = part === 1 ? 'kennenlernen' : part === 2 ? 'alltagsthema-sprechen' : 'ausflug-planen';
  return {
    id: taskId('osd_zdo_b1', part, slugPart),
    slug: `osd-zdo-b1-teil-${part}-${slugPart}`,
    examProvider: 'osd_zdo_b1',
    level: 'B1',
    part,
    taskType: 'PLAN_DIALOG',
    ...source,
  } as SpeakingTask;
}

export const speakingTasks = SpeakingTaskSchema.array().parse([
  jointTask('goethe_b1', 1, jointPartOne),
  jointTask('goethe_b1', 2, jointPartTwo),
  jointTask('goethe_b1', 3, jointPartThree),
  jointTask('osd_zb1', 1, jointPartOne),
  jointTask('osd_zb1', 2, jointPartTwo),
  jointTask('osd_zb1', 3, jointPartThree),
  zdoTask(1, zdoPartOne),
  zdoTask(2, zdoPartTwo),
  zdoTask(3, zdoPartThree),
]);

export const speakingProviderLabels: Record<SpeakingTask['examProvider'], string> = {
  goethe_b1: 'Goethe-Zertifikat B1',
  osd_zb1: 'ÖSD Zertifikat B1 (ZB1)',
  osd_zdo_b1: 'ÖSD Deutsch Österreich B1 (ZDÖ)',
};

export const speakingTaskTypeLabels: Record<SpeakingTask['taskType'], string> = {
  PLAN_DIALOG: 'Dialog · tương tác',
  PRESENTATION_SLIDES: 'Präsentation · 5 Folien',
  FEEDBACK_QA: 'Feedback · Fragen',
};

export type SpeakingPrototypeMeta = {
  short: string;
  type: string;
  steps: Array<{ step: string; titleVi: string; titleDe: string }>;
  checks: string;
};

const jointPrototypeMeta: Record<1 | 2 | 3, SpeakingPrototypeMeta> = {
  1: {
    short: 'Lập kế hoạch cùng bạn thi',
    type: 'Dialog · tương tác',
    steps: [
      { step: '1', titleVi: 'Đặt vấn đề', titleDe: 'Anlass nennen' },
      { step: '2', titleVi: 'Đề xuất', titleDe: 'Vorschlag machen' },
      { step: '3', titleVi: 'Phản hồi', titleDe: 'Reagieren' },
      { step: '4', titleVi: 'Thống nhất', titleDe: 'Entscheiden' },
    ],
    checks: 'Bạn đã hỏi, phản hồi và thống nhất được cả bốn ý chưa?',
  },
  2: {
    short: 'Thuyết trình về trẻ em & điện thoại',
    type: 'Präsentation · 5 Folien',
    steps: [
      { step: '1', titleVi: 'Giới thiệu', titleDe: 'Einführung' },
      { step: '2', titleVi: 'Trải nghiệm', titleDe: 'Erfahrungen' },
      { step: '3', titleVi: 'Quê hương', titleDe: 'Heimatland' },
      { step: '4', titleVi: 'Ưu / nhược', titleDe: 'Vor- und Nachteile' },
      { step: '5', titleVi: 'Kết luận', titleDe: 'Schluss' },
    ],
    checks: 'Bạn đã đi đủ 5 Folien và nêu quan điểm cá nhân chưa?',
  },
  3: {
    short: 'Nhận xét, đặt câu hỏi và phản hồi',
    type: 'Feedback · Fragen',
    steps: [
      { step: '1', titleVi: 'Nhận xét', titleDe: 'Rückmeldung' },
      { step: '2', titleVi: 'Đặt câu hỏi', titleDe: 'Frage stellen' },
      { step: '3', titleVi: 'Trả lời', titleDe: 'Antworten' },
    ],
    checks: 'Bạn đã có lời nhận xét, một câu hỏi liên quan và một câu trả lời tự nhiên chưa?',
  },
};

const zdoPrototypeMeta: Record<1 | 2 | 3, SpeakingPrototypeMeta> = {
  1: {
    short: 'Làm quen và giới thiệu bản thân',
    type: 'Kennenlernen · Dialog',
    steps: [
      { step: '1', titleVi: 'Chào hỏi', titleDe: 'Begrüßen' },
      { step: '2', titleVi: 'Giới thiệu', titleDe: 'Vorstellen' },
      { step: '3', titleVi: 'Hỏi thêm', titleDe: 'Nachfragen' },
    ],
    checks: 'Bạn đã hỏi lại đối phương để duy trì hội thoại chưa?',
  },
  2: {
    short: 'Trao đổi về một chủ đề đời sống',
    type: 'Gespräch · Meinung',
    steps: [
      { step: '1', titleVi: 'Nêu chủ đề', titleDe: 'Thema nennen' },
      { step: '2', titleVi: 'Chia sẻ', titleDe: 'Erfahrungen' },
      { step: '3', titleVi: 'Trao đổi', titleDe: 'Meinungen' },
    ],
    checks: 'Bạn đã trao đổi qua lại và có ý kiến kèm lý do chưa?',
  },
  3: {
    short: 'Cùng lập kế hoạch một chuyến đi',
    type: 'Planung · Dialog',
    steps: [
      { step: '1', titleVi: 'Mở đầu', titleDe: 'Anlass nennen' },
      { step: '2', titleVi: 'Gợi ý', titleDe: 'Vorschläge' },
      { step: '3', titleVi: 'Thoả thuận', titleDe: 'Entscheiden' },
    ],
    checks: 'Bạn đã thống nhất về thời gian, địa điểm, phương tiện và chuẩn bị chưa?',
  },
};

export const speakingPrototypeMeta = speakingTasks.reduce<Record<string, SpeakingPrototypeMeta>>((metadata, task) => {
  metadata[task.slug] = task.examProvider === 'osd_zdo_b1' ? zdoPrototypeMeta[task.part as 1 | 2 | 3] : jointPrototypeMeta[task.part as 1 | 2 | 3];
  return metadata;
}, {});
