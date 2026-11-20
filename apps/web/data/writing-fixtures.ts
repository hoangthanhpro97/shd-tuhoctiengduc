import { WritingTaskSchema, type WritingTask } from '@shd/contracts';

type Definition = {
  key: string;
  provider: WritingTask['examProvider'];
  level: WritingTask['level'];
  part: number;
  partLabel: string;
  type: WritingTask['taskType'];
  title: string;
  topic: string;
  seconds: number;
  scope: WritingTask['durationScope'];
  heading: string;
  situation: string;
  points: Array<[string, string]>;
  ending: string;
  word: number | null;
  register: WritingTask['writingTarget']['register'];
  parts: Array<[string, string]>;
  tip: string;
  sample: string;
  translation: string;
  vocab: Array<[string, string]>;
  question: string;
  choices: string[];
  correct: number;
  sourceUrl: string;
};

const definitions: Definition[] = [
  {
    key: 'goethe-b1-aufgabe-1-ausflug-nach-da-lat', provider: 'goethe_b1', level: 'B1', part: 1, partLabel: 'Aufgabe 1', type: 'INFORMAL_EMAIL', title: 'Viết email kể về chuyến đi cuối tuần', topic: 'Du lịch & bạn bè', seconds: 1200, scope: 'TASK',
    heading: 'Schreiben Sie eine E-Mail an Ihre Freundin Lea.', situation: 'Sie haben am Wochenende einen Ausflug gemacht. Ihre Freundin Lea konnte leider nicht mitkommen. Schreiben Sie Lea eine E-Mail.',
    points: [['Beschreiben Sie, wohin Sie gefahren sind.', 'Kể lại đã đi đâu'], ['Erzählen Sie, was Sie dort gemacht haben.', 'Kể các hoạt động đã làm'], ['Schlagen Sie einen gemeinsamen Ausflug vor.', 'Đề nghị một chuyến đi cùng nhau']], ending: 'Schreiben Sie etwas zu allen drei Punkten. Schreiben Sie circa 80 Wörter.', word: 80, register: 'informal',
    parts: [['Anrede', 'Liebe Lea,'], ['Einleitung', 'Ich möchte dir von meinem Ausflug erzählen.'], ['Hauptteil', 'Wo? Was gemacht? Vorschlag?'], ['Schluss', 'Schreib mir bald! Liebe Grüße']], tip: 'Văn phong thân mật: dùng du/dich/dir, câu ngắn, đủ ba hành động giao tiếp của đề.',
    sample: 'Liebe Lea,\n\nAm Wochenende bin ich mit meiner Schwester nach Da Lat gefahren. Wir haben einen schönen See besucht und viele Fotos gemacht. Das Wetter war kühl und sonnig, deshalb konnten wir den ganzen Tag spazieren gehen. Besonders toll fand ich das kleine Café am See, weil der Kuchen dort wirklich lecker war.\n\nNächstes Wochenende möchte ich wieder einen Ausflug machen. Hast du Lust, mitzukommen? Wir könnten am Samstagmorgen losfahren. Schreib mir bitte bald!\n\nLiebe Grüße\nMinh',
    translation: 'Lea thân mến,\n\nCuối tuần tôi đã đi Đà Lạt cùng chị gái. Chúng tôi thăm một hồ nước đẹp và chụp nhiều ảnh. Thời tiết mát và nắng nên chúng tôi có thể đi dạo cả ngày. Tôi đặc biệt thích quán cà phê nhỏ bên hồ vì bánh ở đó rất ngon.\n\nCuối tuần sau tôi muốn đi chơi tiếp. Bạn có muốn đi cùng không? Chúng ta có thể khởi hành sáng thứ Bảy. Sớm hồi âm nhé!\n\nThân mến,\nMinh',
    vocab: [['Ich möchte dir von … erzählen.', 'Tôi muốn kể cho bạn nghe về …'], ['Besonders toll fand ich …', 'Tôi đặc biệt thấy … rất tuyệt'], ['Hast du Lust, mitzukommen?', 'Bạn có muốn đi cùng không?'], ['Schreib mir bitte bald!', 'Hãy sớm viết lại cho tôi nhé!']], question: 'Chọn lời kết phù hợp cho email thân mật gửi bạn', choices: ['Mit freundlichen Grüßen', 'Liebe Grüße', 'Sehr geehrte Damen und Herren'], correct: 1, sourceUrl: 'https://bfu.goethe.de/b1_mod/schreiben.php',
  },
  {
    key: 'goethe-b1-aufgabe-2-handys-in-der-schule', provider: 'goethe_b1', level: 'B1', part: 2, partLabel: 'Aufgabe 2', type: 'FORUM_POST', title: 'Trình bày quan điểm về điện thoại ở trường', topic: 'Đời sống & công nghệ', seconds: 1500, scope: 'TASK',
    heading: 'Schreiben Sie einen Beitrag in einem Online-Forum.', situation: 'In einem Online-Forum diskutieren Menschen über das Thema „Handys in der Schule“. Schreiben Sie Ihre Meinung.',
    points: [['Sagen Sie Ihre Meinung zum Thema.', 'Trình bày quan điểm'], ['Begründen Sie Ihre Meinung.', 'Đưa ra lý do'], ['Nennen Sie ein Beispiel aus Ihrer Erfahrung.', 'Đưa ra ví dụ phù hợp']], ending: 'Schreiben Sie circa 80 Wörter.', word: 80, register: 'neutral',
    parts: [['Einleitung', 'Ich finde das Thema interessant.'], ['Meinung', 'Meiner Meinung nach …'], ['Begründung', 'Ein wichtiger Grund dafür ist …'], ['Schluss', 'Deshalb denke ich, dass …']], tip: 'Bài diễn đàn không cần Anrede như email. Ưu tiên: quan điểm rõ + lý do + ví dụ và câu kết.',
    sample: 'Ich finde das Thema Handys in der Schule sehr interessant. Meiner Meinung nach dürfen Schülerinnen und Schüler ihre Handys benutzen, aber nur in bestimmten Situationen. Handys können beim Lernen helfen, zum Beispiel wenn man ein Wort schnell nachschlagen muss. Andererseits lenken soziale Medien oft vom Unterricht ab. In meiner Klasse haben wir eine klare Regel: Während der Stunde bleiben die Handys in der Tasche. In der Pause dürfen wir sie benutzen. Ich halte diese Lösung für sinnvoll, weil sie sowohl praktisch als auch fair ist.',
    translation: 'Tôi thấy chủ đề điện thoại ở trường rất thú vị. Theo tôi, học sinh có thể dùng điện thoại nhưng chỉ trong một số tình huống nhất định. Điện thoại giúp ích cho việc học, ví dụ khi cần tra nhanh một từ. Tuy nhiên, mạng xã hội thường gây xao nhãng. Lớp tôi có quy định rõ: trong giờ học, điện thoại phải để trong cặp. Giờ nghỉ thì được dùng. Tôi thấy giải pháp này vừa thiết thực vừa công bằng.',
    vocab: [['Meiner Meinung nach …', 'Theo quan điểm của tôi …'], ['Ein wichtiger Grund dafür ist …', 'Một lý do quan trọng là …'], ['Andererseits …', 'Mặt khác …'], ['Ich halte diese Lösung für sinnvoll.', 'Tôi cho rằng giải pháp này hợp lý.']], question: 'Chọn câu phù hợp để đưa ra quan điểm trong diễn đàn', choices: ['Meiner Meinung nach ist das sinnvoll.', 'Mit freundlichen Grüßen', 'Sehr geehrte Frau Müller'], correct: 0, sourceUrl: 'https://bfu.goethe.de/b1_mod/schreiben.php',
  },
  {
    key: 'goethe-b1-aufgabe-3-termin-verschieben', provider: 'goethe_b1', level: 'B1', part: 3, partLabel: 'Aufgabe 3', type: 'FORMAL_EMAIL', title: 'Viết email xin đổi lịch hẹn', topic: 'Học tập & lịch hẹn', seconds: 900, scope: 'TASK',
    heading: 'Schreiben Sie eine E-Mail an Ihre Kursleiterin.', situation: 'Ihre Kursleiterin Frau Weber hat Sie zu einem Gespräch eingeladen. Leider können Sie zu diesem Termin nicht kommen.',
    points: [['Entschuldigen Sie sich höflich.', 'Xin lỗi lịch sự'], ['Erklären Sie den Grund.', 'Nêu lý do'], ['Bitten Sie um einen neuen Termin.', 'Đề xuất hoặc xin lịch khác']], ending: 'Schreiben Sie circa 40 Wörter. Vergessen Sie Anrede und Gruß nicht.', word: 40, register: 'formal',
    parts: [['Anrede', 'Sehr geehrte Frau Weber,'], ['Entschuldigung', 'Es tut mir leid, dass …'], ['Grund + Bitte', 'Leider muss ich … Könnten wir …?'], ['Schluss', 'Mit freundlichen Grüßen']], tip: 'Email trang trọng: dùng Sie/Ihnen và xưng hô đúng, tránh Liebe Grüße.',
    sample: 'Sehr geehrte Frau Weber,\n\nvielen Dank für Ihre Einladung. Leider kann ich am Dienstag nicht kommen, weil ich einen wichtigen Arzttermin habe. Das tut mir sehr leid. Könnten wir vielleicht am Donnerstag sprechen?\n\nVielen Dank für Ihr Verständnis.\n\nMit freundlichen Grüßen\nMinh Nguyen',
    translation: 'Kính gửi cô Weber,\n\nCảm ơn cô đã mời tôi. Rất tiếc tôi không thể đến vào thứ Ba vì có một lịch hẹn khám bệnh quan trọng. Tôi rất xin lỗi. Chúng ta có thể nói chuyện vào thứ Năm không?\n\nCảm ơn cô đã thông cảm.\n\nTrân trọng,\nMinh Nguyen',
    vocab: [['Leider kann ich … nicht kommen.', 'Rất tiếc tôi không thể đến …'], ['Das tut mir sehr leid.', 'Tôi rất lấy làm tiếc.'], ['Könnten wir vielleicht …?', 'Chúng ta có thể … được không?'], ['Mit freundlichen Grüßen', 'Trân trọng']], question: 'Chọn cách xưng hô phù hợp với giáo viên trong email trang trọng', choices: ['Hallo, Frau Weber!', 'Sehr geehrte Frau Weber,', 'Liebe Grüße'], correct: 1, sourceUrl: 'https://bfu.goethe.de/b1_mod/schreiben.php',
  },
  {
    key: 'osd-zdo-b1-schreiben-kursbeginn', provider: 'osd_zdo_b1', level: 'B1', part: 1, partLabel: 'Schreiben', type: 'REPLY_EMAIL', title: 'Trả lời email về lịch khai giảng khóa học', topic: 'Học tập & công việc', seconds: 2400, scope: 'TASK',
    heading: 'Antworten Sie auf die E-Mail der Sprachschule.', situation: 'Sie haben eine E-Mail von einer Sprachschule in Wien erhalten: „Ihr Deutschkurs beginnt einen Monat später. Bitte schreiben Sie uns, ob Sie weiterhin teilnehmen möchten und welche Kurszeiten für Sie passen.“ Schreiben Sie eine Antwort.',
    points: [['Bedanken Sie sich für die Information.', 'Cảm ơn thông tin'], ['Sagen Sie, ob Sie teilnehmen möchten.', 'Xác nhận ý định học'], ['Erklären Sie Ihre Arbeitssituation.', 'Giải thích tình hình công việc'], ['Fragen Sie nach einem Abendkurs.', 'Hỏi về lớp học buổi tối']], ending: 'Schreiben Sie eine passende Anrede, Einleitung und einen Schluss. Bearbeiten Sie alle vier Punkte.', word: null, register: 'formal',
    parts: [['Anrede', 'Sehr geehrte Damen und Herren,'], ['Bezug', 'Vielen Dank für Ihre Nachricht.'], ['Vier Punkte', 'Danke → Teilnahme → Arbeit → Abendkurs'], ['Schluss', 'Ich freue mich auf Ihre Antwort.']], tip: 'ÖSD ZDÖ B1: một email dựa trên bốn gợi ý; bối cảnh đề thường gắn với đời sống tại Áo. Không mặc định dùng cấu trúc ba Aufgabe của ÖSD ZB1.',
    sample: 'Sehr geehrte Damen und Herren,\n\nvielen Dank für Ihre Nachricht über den neuen Kursbeginn. Ich möchte weiterhin am Deutschkurs teilnehmen, denn ich brauche Deutsch für meine Arbeit. Zurzeit arbeite ich jeden Tag bis 17 Uhr. Deshalb kann ich leider keinen Kurs am Vormittag besuchen.\n\nGibt es vielleicht einen Abendkurs, der nach 18 Uhr beginnt? Können Sie mir bitte auch den neuen Starttermin mitteilen? Ich freue mich auf Ihre Antwort.\n\nMit freundlichen Grüßen\nMinh Nguyen',
    translation: 'Kính gửi quý trung tâm,\n\nCảm ơn thông báo về thời gian bắt đầu khóa học mới. Tôi vẫn muốn tham gia lớp tiếng Đức vì tôi cần tiếng Đức cho công việc. Hiện tại tôi làm việc mỗi ngày đến 17 giờ nên không thể đi học buổi sáng.\n\nTrung tâm có lớp buổi tối bắt đầu sau 18 giờ không? Xin cho tôi biết cả ngày khai giảng mới. Tôi mong nhận được phản hồi.\n\nTrân trọng,\nMinh Nguyen',
    vocab: [['Vielen Dank für Ihre Nachricht.', 'Cảm ơn thông tin của quý vị.'], ['Ich möchte weiterhin teilnehmen.', 'Tôi muốn tiếp tục tham gia.'], ['Gibt es vielleicht einen Abendkurs?', 'Có lớp buổi tối không?'], ['Ich freue mich auf Ihre Antwort.', 'Tôi mong chờ phản hồi.']], question: 'Với người nhận là trung tâm đào tạo, câu chào nào phù hợp?', choices: ['Liebe Lea,', 'Sehr geehrte Damen und Herren,', 'Bis bald!'], correct: 1, sourceUrl: 'https://osd.at/portfolio-item/osd-zertifikat-deutsch-osterreich-b1-zdo-b1/',
  },
  {
    key: 'goethe-b2-teil-1-smartphones-im-unterricht', provider: 'goethe_b2', level: 'B2', part: 1, partLabel: 'Teil 1', type: 'FORUM_POST', title: 'Bài đăng diễn đàn: điện thoại trong trường học', topic: 'Công nghệ & giáo dục', seconds: 4500, scope: 'MODULE',
    heading: 'Schreiben Sie einen Forumsbeitrag zum Thema „Smartphones im Unterricht“.', situation: 'In einem Jugendforum wird diskutiert, ob Smartphones im Unterricht benutzt werden sollten. Nehmen Sie Stellung.',
    points: [['Äußern Sie Ihre Meinung zur Nutzung von Smartphones.', 'Nêu ý kiến'], ['Nennen Sie Gründe für die Beliebtheit.', 'Nêu lý do phổ biến'], ['Beschreiben Sie sinnvolle Alternativen oder Regeln.', 'Nêu giải pháp/thay thế'], ['Erklären Sie Vorteile dieser Alternativen.', 'Phân tích lợi ích giải pháp']], ending: 'Achten Sie auf Einleitung, Hauptteil und Schluss. Schreiben Sie circa 150 Wörter.', word: 150, register: 'neutral',
    parts: [['Einleitung', 'Das Thema wird kontrovers diskutiert.'], ['Position', 'Meiner Ansicht nach …'], ['Argumente', 'Ein Grund dafür … Hinzu kommt …'], ['Fazit', 'Zusammenfassend lässt sich sagen …']], tip: 'B2 cần mạch lập luận rõ và xử lý đủ bốn điểm yêu cầu; tránh biến bài thành một chuỗi câu đơn rời rạc.',
    sample: 'Die Nutzung von Smartphones im Unterricht wird seit Jahren kontrovers diskutiert. Meiner Ansicht nach sollten Smartphones nicht grundsätzlich verboten werden, da sie unter bestimmten Bedingungen eine wertvolle Lernhilfe sein können.\n\nViele Jugendliche verwenden ihre Geräte täglich, um Informationen zu recherchieren, Wörter nachzuschlagen oder mit anderen zu kommunizieren. Gerade deshalb sind Smartphones im schulischen Alltag weitverbreitet. Allerdings besteht die Gefahr, dass Nachrichten und soziale Medien die Konzentration beeinträchtigen.\n\nEine sinnvolle Alternative zu einem vollständigen Verbot wäre daher die Einführung klarer Nutzungsregeln. Beispielsweise könnten Lehrkräfte festlegen, in welchen Unterrichtsphasen digitale Geräte erlaubt sind. Zusätzlich könnten Schulen geeignete Lernplattformen bereitstellen und die Medienkompetenz der Schülerinnen und Schüler fördern.\n\nSolche Maßnahmen hätten mehrere Vorteile: Einerseits könnten Jugendliche die Chancen digitaler Technik nutzen. Andererseits würden Ablenkungen reduziert und ein bewusster Umgang mit Smartphones eingeübt. Zusammenfassend bin ich überzeugt, dass sinnvolle Regeln langfristig mehr bewirken als pauschale Verbote.',
    translation: 'Việc dùng điện thoại thông minh trong giờ học đã được tranh luận nhiều năm. Theo tôi, không nên cấm hoàn toàn vì trong điều kiện phù hợp, chúng có thể là công cụ học tập hữu ích.\n\nNhiều bạn trẻ dùng điện thoại để tìm thông tin, tra từ và liên lạc, nhưng thông báo và mạng xã hội cũng gây mất tập trung. Vì vậy, giải pháp hợp lý là có những quy định sử dụng rõ ràng, kết hợp nền tảng học tập và giáo dục kỹ năng số. Những biện pháp này vừa tận dụng công nghệ vừa hạn chế xao nhãng. Quy tắc hợp lý hiệu quả hơn lệnh cấm tuyệt đối.',
    vocab: [['wird kontrovers diskutiert', 'được tranh luận trái chiều'], ['Meiner Ansicht nach …', 'Theo quan điểm của tôi …'], ['Einerseits … Andererseits …', 'Một mặt … mặt khác …'], ['Zusammenfassend lässt sich sagen …', 'Tóm lại có thể nói rằng …']], question: 'Chọn cụm liên kết lập luận phù hợp B2', choices: ['Einerseits … Andererseits …', 'Liebe Grüße', 'Guten Morgen, Oma!'], correct: 0, sourceUrl: 'https://bfu.goethe.de/b2_mod_2MX6/schreiben.php',
  },
  {
    key: 'goethe-b2-teil-2-bericht-verzoegerung', provider: 'goethe_b2', level: 'B2', part: 2, partLabel: 'Teil 2', type: 'FORMAL_MESSAGE', title: 'Thông điệp trang trọng xin hỗ trợ công việc', topic: 'Công việc & trách nhiệm', seconds: 4500, scope: 'MODULE',
    heading: 'Schreiben Sie eine Nachricht an Ihren Vorgesetzten.', situation: 'Sie machen ein Praktikum. Wegen mehrerer Aufgaben können Sie einen Bericht nicht rechtzeitig fertigstellen. Schreiben Sie Ihrem Vorgesetzten Herrn Berg eine Nachricht.',
    points: [['Beschreiben Sie Ihre Situation.', 'Mô tả tình huống'], ['Begründen Sie die Verzögerung.', 'Giải thích nguyên nhân'], ['Machen Sie einen Vorschlag.', 'Đề xuất giải pháp'], ['Zeigen Sie Verständnis für die Situation des Teams.', 'Thể hiện sự thông cảm']], ending: 'Schreiben Sie circa 100 Wörter.', word: 100, register: 'formal',
    parts: [['Anrede', 'Sehr geehrter Herr Berg,'], ['Situation', 'Ich möchte Sie darüber informieren, dass …'], ['Vorschlag', 'Ich schlage vor, dass …'], ['Schluss', 'Vielen Dank für Ihr Verständnis.']], tip: 'Thông điệp B2 trong công việc cần đúng register và đưa ra giải pháp chủ động.',
    sample: 'Sehr geehrter Herr Berg,\n\nich möchte Sie darüber informieren, dass ich den Bericht für Freitag leider nicht rechtzeitig fertigstellen kann. Zurzeit bearbeite ich mehrere dringende Aufgaben für zwei Abteilungen. Deshalb benötige ich etwas mehr Zeit für eine sorgfältige Ausarbeitung.\n\nIch schlage vor, den Bericht am Montagvormittag abzugeben. Falls er früher gebraucht wird, könnte ich zunächst die wichtigsten Ergebnisse zusammenfassen. Mir ist bewusst, dass unser Team unter Zeitdruck steht, und ich möchte die Planung möglichst wenig beeinträchtigen.\n\nVielen Dank für Ihr Verständnis. Über eine kurze Rückmeldung würde ich mich sehr freuen.\n\nMit freundlichen Grüßen\nMinh Nguyen',
    translation: 'Kính gửi ông Berg,\n\nTôi muốn thông báo rằng không thể hoàn thành báo cáo kịp thứ Sáu. Hiện tôi xử lý nhiều công việc gấp cho hai phòng ban nên cần thêm thời gian. Tôi đề xuất gửi bản hoàn chỉnh sáng thứ Hai hoặc gửi trước phần tổng hợp kết quả quan trọng nếu cần sớm. Tôi hiểu nhóm đang chịu áp lực thời gian và mong hạn chế ảnh hưởng đến kế hoạch.\n\nCảm ơn ông đã thông cảm.\n\nTrân trọng.',
    vocab: [['Ich möchte Sie darüber informieren, dass …', 'Tôi muốn thông báo rằng …'], ['Ich schlage vor, …', 'Tôi đề xuất …'], ['Mir ist bewusst, dass …', 'Tôi ý thức rằng …'], ['Vielen Dank für Ihr Verständnis.', 'Cảm ơn sự thông cảm.']], question: 'Cụm nào phù hợp trong thư công việc?', choices: ['Ich schlage vor, dass …', 'Na, alles klar?', 'Bis bald, Kumpel!'], correct: 0, sourceUrl: 'https://bfu.goethe.de/b2_mod_2MX6/schreiben.php',
  },
  {
    key: 'osd-b2-aufgabe-1-weiterbildung-wien', provider: 'osd_zb2', level: 'B2', part: 1, partLabel: 'Aufgabe 1', type: 'FORMAL_EMAIL', title: 'Email trang trọng hỏi thông tin khóa học', topic: 'Học tập & nghề nghiệp', seconds: 5400, scope: 'MODULE',
    heading: 'Schreiben Sie ein formelles E-Mail an eine Bildungseinrichtung.', situation: 'Sie interessieren sich für eine berufliche Weiterbildung in Wien. Die Angaben auf der Website sind unvollständig. Schreiben Sie an den Anbieter.',
    points: [['Erklären Sie den Grund Ihrer Anfrage.', 'Nêu mục đích liên hệ'], ['Fragen Sie nach dem Zeitplan.', 'Hỏi lịch học'], ['Bitten Sie um Informationen zu den Kosten.', 'Hỏi về chi phí'], ['Erklären Sie Ihre berufliche Situation.', 'Nêu bối cảnh công việc']], ending: 'Verfassen Sie ein zusammenhängendes, höfliches E-Mail. Beachten Sie die Vorgaben der konkreten Prüfungsaufgabe.', word: null, register: 'formal',
    parts: [['Anrede', 'Sehr geehrte Damen und Herren,'], ['Anlass', 'Ich interessiere mich für …'], ['Fragen', 'Könnten Sie mir bitte mitteilen …?'], ['Schluss', 'Mit freundlichen Grüßen']], tip: 'ÖSD B2 Aufgabe 1 thường là email trang trọng; cần kiểm tra đúng yêu cầu và quy tắc chấm của đề cụ thể.',
    sample: 'Sehr geehrte Damen und Herren,\n\nauf Ihrer Website habe ich Informationen über Ihre Weiterbildung im Bereich Projektmanagement gefunden. Da ich mich beruflich weiterentwickeln möchte, interessiere ich mich sehr für dieses Angebot.\n\nLeider konnte ich nicht erkennen, an welchen Wochentagen der Unterricht stattfindet und mit welchen Gesamtkosten zu rechnen ist. Könnten Sie mir diese Informationen bitte zusenden? Besonders hilfreich wäre auch eine Übersicht über mögliche Förderungen.\n\nIch bin zurzeit in Vollzeit beschäftigt und könnte deshalb hauptsächlich abends oder am Wochenende teilnehmen. Bitte teilen Sie mir mit, ob es entsprechende Kursmodelle gibt.\n\nVielen Dank im Voraus für Ihre Unterstützung.\n\nMit freundlichen Grüßen\nMinh Nguyen',
    translation: 'Kính gửi quý đơn vị,\n\nTôi thấy trên website của quý đơn vị có khóa bồi dưỡng quản lý dự án và rất quan tâm vì muốn phát triển nghề nghiệp. Tuy nhiên, tôi chưa thấy lịch học và tổng chi phí. Xin gửi thêm thông tin, bao gồm các khoản hỗ trợ học phí nếu có. Hiện tôi làm toàn thời gian nên chỉ có thể học buổi tối hoặc cuối tuần. Tôi mong được biết có lịch học phù hợp không.\n\nXin cảm ơn. Trân trọng.',
    vocab: [['Ich interessiere mich für …', 'Tôi quan tâm đến …'], ['Könnten Sie mir bitte mitteilen, …?', 'Quý vị có thể cho tôi biết …?'], ['mit welchen Kosten zu rechnen ist', 'dự kiến chi phí là bao nhiêu'], ['Vielen Dank im Voraus.', 'Xin cảm ơn trước.']], question: 'Lời chào trang trọng phù hợp với đơn vị đào tạo?', choices: ['Liebe Freunde,', 'Sehr geehrte Damen und Herren,', 'Hallo du!'], correct: 1, sourceUrl: 'https://osd.at/portfolio-item/osd-zertifikat-b2-zb2/',
  },
  {
    key: 'osd-b2-aufgabe-2-homeoffice', provider: 'osd_zb2', level: 'B2', part: 2, partLabel: 'Aufgabe 2', type: 'ARGUMENTATIVE_TEXT', title: 'Bài lập luận về làm việc từ xa', topic: 'Công việc & xã hội', seconds: 5400, scope: 'MODULE',
    heading: 'Nehmen Sie zum Thema „Homeoffice“ Stellung.', situation: 'Immer mehr Menschen arbeiten regelmäßig von zu Hause. Schreiben Sie einen argumentierenden Text und gehen Sie auf verschiedene Aspekte ein.',
    points: [['Beschreiben Sie die aktuelle Entwicklung.', 'Giới thiệu xu hướng'], ['Nennen Sie Vorteile.', 'Phân tích lợi ích'], ['Nennen Sie mögliche Nachteile.', 'Phân tích bất lợi'], ['Begründen Sie Ihre eigene Position.', 'Kết luận quan điểm cá nhân']], ending: 'Schreiben Sie einen strukturierten Text. Beachten Sie die Vorgaben der konkreten Prüfungsaufgabe.', word: null, register: 'neutral',
    parts: [['Einleitung', 'In den letzten Jahren …'], ['Vorteile', 'Ein großer Vorteil besteht darin, dass …'], ['Nachteile', 'Allerdings darf man nicht vergessen, dass …'], ['Position', 'Aus diesen Gründen bin ich der Meinung …']], tip: 'ÖSD B2 Aufgabe 2 thiên về lập luận/ý kiến. Cần khai triển ý bằng lý do, ví dụ và liên kết đoạn.',
    sample: 'In den letzten Jahren hat das Arbeiten im Homeoffice deutlich an Bedeutung gewonnen. Für viele Beschäftigte ist diese Arbeitsform attraktiv, weil sie mehr Flexibilität im Alltag ermöglicht.\n\nEin wesentlicher Vorteil besteht darin, dass lange Arbeitswege entfallen. Dadurch sparen Arbeitnehmerinnen und Arbeitnehmer Zeit und Geld. Außerdem können sie ihren Tagesablauf häufig besser organisieren. Allerdings gibt es auch Nachteile. Ohne den direkten Austausch mit Kolleginnen und Kollegen entstehen leichter Missverständnisse, und manche Menschen fühlen sich isoliert.\n\nMeiner Ansicht nach ist deshalb ein ausgewogenes Modell besonders sinnvoll. Wenn Unternehmen sowohl die Arbeit im Büro als auch das Homeoffice ermöglichen, können Beschäftigte die Vorteile beider Formen nutzen. Entscheidend ist, dass klare Regeln für Kommunikation und Erreichbarkeit vereinbart werden.',
    translation: 'Trong những năm gần đây, làm việc tại nhà ngày càng quan trọng. Hình thức này mang lại sự linh hoạt, tiết kiệm thời gian và chi phí đi lại, đồng thời giúp tổ chức công việc tốt hơn. Tuy nhiên, thiếu trao đổi trực tiếp dễ gây hiểu lầm và cô lập. Theo tôi, mô hình kết hợp giữa văn phòng và làm việc tại nhà là hợp lý nhất, với điều kiện có quy tắc giao tiếp rõ ràng.',
    vocab: [['Ein wesentlicher Vorteil besteht darin, dass …', 'Một ưu điểm đáng kể là …'], ['Allerdings gibt es auch Nachteile.', 'Tuy nhiên cũng có bất lợi.'], ['Meiner Ansicht nach …', 'Theo quan điểm của tôi …'], ['Entscheidend ist, dass …', 'Điều quyết định là …']], question: 'Cụm thích hợp để giới thiệu mặt hạn chế', choices: ['Allerdings gibt es auch Nachteile.', 'Liebe Grüße', 'Vielen Dank für Ihre Einladung.'], correct: 0, sourceUrl: 'https://osd.at/portfolio-item/osd-zertifikat-b2-zb2/',
  },
];

const providerLabels: Record<WritingTask['examProvider'], string> = {
  goethe_b1: 'Goethe B1', goethe_b2: 'Goethe B2', osd_zb1: 'ÖSD B1 (ZB1)', osd_zdo_b1: 'ÖSD B1 (ZDÖ)', osd_zb2: 'ÖSD B2',
};

const typeLabels: Record<WritingTask['taskType'], string> = {
  INFORMAL_EMAIL: 'E-Mail thân mật', FORUM_POST: 'Diễn đàn / Forumsbeitrag', FORMAL_EMAIL: 'E-Mail trang trọng', REPLY_EMAIL: 'Antwort-E-Mail', FORMAL_MESSAGE: 'Thông điệp công việc', ARGUMENTATIVE_TEXT: 'Bài lập luận',
};

function buildTask(definition: Definition): WritingTask {
  const providerCriteria = definition.level === 'B2'
    ? [{ key: 'content', labelDe: 'Aufgabenerfüllung', explanationVi: 'Đáp ứng đầy đủ yêu cầu và phát triển luận điểm.', maxPoints: 10 }, { key: 'cohesion', labelDe: 'Kohärenz', explanationVi: 'Liên kết mạch lạc giữa các ý.', maxPoints: 10 }, { key: 'language', labelDe: 'Wortschatz und Grammatik', explanationVi: 'Từ vựng và độ chính xác ngôn ngữ.', maxPoints: 10 }]
    : [{ key: 'content', labelDe: 'Aufgabenerfüllung', explanationVi: 'Xử lý đủ các Leitpunkte.', maxPoints: 10 }, { key: 'vocabulary', labelDe: 'Wortschatz', explanationVi: 'Dùng từ phù hợp ngữ cảnh.', maxPoints: 10 }, { key: 'grammar', labelDe: 'Strukturen', explanationVi: 'Cấu trúc và ngữ pháp rõ ràng.', maxPoints: 10 }];
  return {
    id: `writing-${definition.key}`, slug: definition.key, examProvider: definition.provider, level: definition.level, part: definition.part, partLabel: definition.partLabel, taskType: definition.type, title: definition.title, topic: definition.topic,
    durationSeconds: definition.seconds, durationScope: definition.scope, instructionDe: `${definition.heading}\n${definition.situation}`, instructionVi: definition.situation,
    bulletPoints: definition.points.map(([de, vi]) => `${de} · ${vi}`), requirements: definition.points.map(([textDe, textVi]) => ({ textDe, textVi, functionLabel: textDe.split(' ')[0] })),
    writingTarget: { approximateWords: definition.word, register: definition.register, textTypeLabel: typeLabels[definition.type] }, outline: definition.parts.map(([section, suggestionDe]) => ({ section, suggestionDe, tipVi: section === 'Schluss' || section === 'Fazit' ? 'Kết bài rõ ràng, nhắc lại mục tiêu giao tiếp.' : undefined })),
    modelAnswer: { textDe: definition.sample, textVi: definition.translation, annotations: definition.vocab.map(([phraseDe, explanationVi]) => ({ phraseDe, explanationVi })) }, redemittel: definition.vocab.map(([phraseDe, phraseVi], index) => ({ phraseDe, phraseVi, category: index === 0 ? 'Mở bài / triển khai' : index === definition.vocab.length - 1 ? 'Kết bài' : 'Redemittel' })),
    exercise: { questionVi: definition.question, choices: definition.choices, correctIndex: definition.correct }, rubric: { rubricId: `${definition.provider}-${definition.level.toLowerCase()}`, provider: definition.provider, criteria: providerCriteria }, source: { contentOrigin: 'SHD_AUTHORED', isOfficialExamTask: false, officialInfoUrl: definition.sourceUrl },
  };
}

export const writingTasks = WritingTaskSchema.array().parse(definitions.map(buildTask));
export const writingProviderLabels = providerLabels;
export const writingTaskTypeLabels = typeLabels;
