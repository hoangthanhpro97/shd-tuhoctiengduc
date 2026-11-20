export type GuideStep = {
  title: string;
  summary: string;
  bullets: string[];
  callout?: { label: string; text: string };
};

export const QUESTION_GUIDES: Record<number, GuideStep[]> = {
  // ==========================================
  // TEIL 1: Blog von Michael (Aufgaben 1–6)
  // Dạng bài: Richtig / Falsch
  // ==========================================
  1: [
    {
      title: 'Hiểu câu hỏi',
      summary: 'Xác định nội dung khẳng định của câu 1',
      bullets: [
        'Câu hỏi: "Michael berichtet über seinen Umzug in eine neue Stadt."',
        'Từ khóa chính: Michael (chủ ngữ), berichtet (kể lại), Umzug (chuyển nhà), neue Stadt (thành phố mới).',
        'Nhiệm vụ: Kiểm tra xem Michael có chuyển đến một thành phố mới và chia sẻ về điều đó trong bài không.',
      ],
      callout: { label: 'Đúng / Sai', text: 'Toàn bộ nội dung khẳng định phải khớp với bài đọc thì mới chọn Đúng.' },
    },
    {
      title: 'Định vị dẫn chứng',
      summary: 'Tìm đoạn mở đầu của Blog',
      bullets: [
        'Định vị: Đoạn 1, dòng 1–3 ngay sau tiêu đề Blog.',
        'Dẫn chứng trong bài: "Liebe Freunde, wie ihr wisst, bin ich vor kurzem nach Berlin gezogen..."',
      ],
    },
    {
      title: 'Đọc dẫn chứng bằng Linearthinking',
      summary: 'Phân tích liên kết ngữ nghĩa SV/O',
      bullets: [
        'Chủ ngữ Michael viết thư cho bạn bè: "bin ich vor kurzem nach Berlin gezogen" (tôi vừa chuyển đến Berlin).',
        'Berlin đối với Michael chính là "neue Stadt" (thành phố mới nơi anh vừa dọn đến).',
        'Nội dung Blog chính là lời kể lại (berichtet) hành trình này.',
      ],
      callout: { label: 'Linearthinking', text: 'Cấu trúc tương đồng: nach Berlin gezogen = Umzug in eine neue Stadt.' },
    },
    {
      title: 'Chọn đáp án',
      summary: 'Khẳng định trong đề bài hoàn toàn chính xác',
      bullets: [
        'Đối chiếu: Thông tin trong đề bài khớp 100% với dòng đầu bài đọc.',
        'Kết luận: Chọn Richtig (Đúng).',
      ],
    },
  ],

  2: [
    {
      title: 'Hiểu câu hỏi',
      summary: 'Phân tích mức độ dễ dàng khi tìm phòng',
      bullets: [
        'Câu hỏi: "Es war für ihn von Beginn an einfach, eine Wohnung zu bekommen."',
        'Từ khóa bẫy: von Beginn an (ngay từ đầu), einfach (dễ dàng), Wohnung bekommen (thuê được phòng/nhà).',
      ],
      callout: { label: 'Lưu ý bẫy', text: 'Cẩn thận với các từ chỉ mức độ tuyệt đối như "von Beginn an", "einfach".' },
    },
    {
      title: 'Định vị dẫn chứng',
      summary: 'Tìm đoạn nói về quá trình tìm kiếm nhà',
      bullets: [
        'Định vị: Đoạn 2, câu mở đầu.',
        'Dẫn chứng: "Die Wohnungssuche war allerdings alles andere als leicht. Der Berliner Wohnungsmarkt ist total überlaufen..."',
      ],
    },
    {
      title: 'Đọc dẫn chứng bằng Linearthinking',
      summary: 'Giải mã thành ngữ "alles andere als..."',
      bullets: [
        'Cụm từ "alles andere als leicht" mang nghĩa phủ định mạnh: "hoàn toàn không hề dễ dàng" (rất khó khăn).',
        'Đề bài dùng từ "einfach" (dễ dàng) đối lập 180 độ với ngữ liệu bài đọc.',
      ],
    },
    {
      title: 'Chọn đáp án',
      summary: 'Thông tin đề bài mâu thuẫn trực tiếp với bài đọc',
      bullets: [
        'Việc tìm nhà rất vất vả và cạnh tranh gay gắt, không hề dễ từ đầu.',
        'Kết luận: Chọn Falsch (Sai).',
      ],
    },
  ],

  3: [
    {
      title: 'Hiểu câu hỏi',
      summary: 'Xác định hình thức cư trú hiện tại của Michael',
      bullets: [
        'Câu hỏi: "Michael wohnt derzeit alleine in einer kleinen Wohnung."',
        'Từ khóa: derzeit (hiện tại), alleine (sống một mình), kleine Wohnung (căn hộ nhỏ).',
      ],
    },
    {
      title: 'Định vị dẫn chứng',
      summary: 'Tìm đoạn mô tả chỗ ở hiện tại',
      bullets: [
        'Định vị: Đoạn 2 câu cuối và đầu đoạn 3.',
        'Dẫn chứng: "...habe ich schließlich ein Zimmer in einer Dreier-WG im Stadtteil Kreuzberg gefunden."',
      ],
    },
    {
      title: 'Đọc dẫn chứng bằng Linearthinking',
      summary: 'Khái niệm Dreier-WG (Căn hộ chung 3 người)',
      bullets: [
        'Dreier-WG = Wohngemeinschaft für 3 Personen (ở ghép căn hộ 3 người).',
        'Michael ở chung với 2 người bạn khác, đối lập hoàn toàn với từ "alleine" (một mình).',
      ],
    },
    {
      title: 'Chọn đáp án',
      summary: 'Khẳng định của đề bài sai sự thật',
      bullets: [
        'Michael sống chung phòng trọ kiểu WG, không ở một mình.',
        'Kết luận: Chọn Falsch (Sai).',
      ],
    },
  ],

  4: [
    {
      title: 'Hiểu câu hỏi',
      summary: 'Khung cảnh nhìn từ phòng ngủ của Michael',
      bullets: [
        'Câu hỏi: "Aus seinem Zimmer kann man einen Park sehen."',
        'Từ khóa: Aus seinem Zimmer (từ phòng anh ấy), Park sehen (nhìn thấy công viên).',
      ],
    },
    {
      title: 'Định vị dẫn chứng',
      summary: 'Tìm đoạn miêu tả căn phòng của Michael',
      bullets: [
        'Định vị: Đoạn 3, câu thứ hai.',
        'Dẫn chứng: "Von meinem Fenster aus blicke ich direkt in einen wunderschönen grünen Park..."',
      ],
    },
    {
      title: 'Đọc dẫn chứng bằng Linearthinking',
      summary: 'Paraphrase: blicken = sehen, Fenster = Zimmer',
      bullets: [
        'Von meinem Fenster aus blicken = Nhìn từ cửa sổ phòng ra ngoài.',
        'direkt in einen Park = nhìn thẳng vào công viên.',
      ],
    },
    {
      title: 'Chọn đáp án',
      summary: 'Khớp hoàn toàn với nội dung bài viết',
      bullets: [
        'Từ phòng nhìn ra công viên là thông tin chính xác tuyệt đối.',
        'Kết luận: Chọn Richtig (Đúng).',
      ],
    },
  ],

  5: [
    {
      title: 'Hiểu câu hỏi',
      summary: 'Mối quan hệ và tần suất tiếp xúc với bạn cùng phòng',
      bullets: [
        'Câu hỏi: "Mit seinen Mitbewohnern hat er nur selten Kontakt."',
        'Từ khóa: Mitbewohnern (bạn cùng phòng), nur selten Kontakt (chỉ hiếm khi tiếp xúc).',
      ],
    },
    {
      title: 'Định vị dẫn chứng',
      summary: 'Tìm đoạn nói về sinh hoạt chung trong nhà',
      bullets: [
        'Định vị: Đoạn 4, dòng 1–3.',
        'Dẫn chứng: "Meine beiden Mitbewohner... sind super nett. Wir kochen fast jeden Abend zusammen und unternehmen am Wochenende viel..."',
      ],
    },
    {
      title: 'Đọc dẫn chứng bằng Linearthinking',
      summary: 'So sánh tần suất: "fast jeden Abend" vs "nur selten"',
      bullets: [
        'fast jeden Abend kochen + am Wochenende viel unternehmen = tiếp xúc thường xuyên, thân thiết.',
        'Khẳng định "nur selten" (hiếm khi) sai lệch hoàn toàn thực tế.',
      ],
    },
    {
      title: 'Chọn đáp án',
      summary: 'Mâu thuẫn về tần suất sinh hoạt chung',
      bullets: [
        'Họ tương tác rất thường xuyên mỗi tối và cuối tuần.',
        'Kết luận: Chọn Falsch (Sai).',
      ],
    },
  ],

  6: [
    {
      title: 'Hiểu câu hỏi',
      summary: 'Thời gian đã làm việc tại công ty mới',
      bullets: [
        'Câu hỏi: "Er arbeitet bereits seit zwei Wochen in seiner neuen Firma."',
        'Từ khóa: arbeitet bereits seit zwei Wochen (đã đi làm được 2 tuần).',
      ],
    },
    {
      title: 'Định vị dẫn chứng',
      summary: 'Tìm đoạn kết bài nói về công việc',
      bullets: [
        'Định vị: Đoạn cuối của Blog.',
        'Dẫn chứng: "Nächste Woche beginnt mein neuer Job bei der Softwarefirma..."',
      ],
    },
    {
      title: 'Đọc dẫn chứng bằng Linearthinking',
      summary: 'Mốc thời gian tương lai vs quá khứ hoàn thành',
      bullets: [
        'Nächste Woche beginnt = Sang tuần sau mới bắt đầu đi làm.',
        'Đề bài nói "bereits seit zwei Wochen" (đã làm được 2 tuần rồi) là hoàn toàn sai mốc thời gian.',
      ],
    },
    {
      title: 'Chọn đáp án',
      summary: 'Sai lệch về mốc thời gian công việc',
      bullets: [
        'Tuần sau anh ấy mới nhận việc, chưa hề làm việc 2 tuần.',
        'Kết luận: Chọn Falsch (Sai).',
      ],
    },
  ],

  // ==========================================
  // TEIL 2: Pressetexte (Aufgaben 7–12)
  // Dạng bài: Trắc nghiệm A / B / C
  // ==========================================
  7: [
    {
      title: 'Hiểu câu hỏi',
      summary: 'Lý do người lao động mong muốn thời gian linh hoạt',
      bullets: [
        'Câu hỏi: "Viele Beschäftigte wünschen sich heute flexible Arbeitszeiten, weil..."',
        'Từ khóa: Beschäftigte (người lao động), flexible Arbeitszeiten (giờ làm việc linh hoạt), weil (nguyên nhân).',
      ],
      callout: { label: 'Trắc nghiệm A/B/C', text: 'Chỉ có 1 phương án phản ánh đúng nguyên nhân nêu trong bài đọc.' },
    },
    {
      title: 'Định vị dẫn chứng',
      summary: 'Đọc đoạn 1 của Pressetext 1 (Làm việc linh hoạt)',
      bullets: [
        'Định vị: Bài báo số 1, đoạn 1, dòng 2–4.',
        'Dẫn chứng: "...vor allem um Beruf und Familie besser miteinander vereinbaren zu können."',
      ],
    },
    {
      title: 'Đọc dẫn chứng bằng Linearthinking',
      summary: 'Cụm từ "Beruf und Familie vereinbaren"',
      bullets: [
        'Ý nghĩa: Cân bằng, hòa hợp giữa trách nhiệm công việc và nghĩa vụ gia đình/con cái.',
        'Đối chiếu với 3 phương án A, B, C để chọn đáp án tương đương nghĩa này.',
      ],
    },
    {
      title: 'Chọn đáp án',
      summary: 'Lựa chọn phương án liên quan đến cân bằng cuộc sống - gia đình',
      bullets: [
        'Loại trừ các phương án nói về tăng lương hay lười biếng.',
        'Chọn phương án tương ứng với việc cân bằng công việc và gia đình.',
      ],
    },
  ],

  8: [
    {
      title: 'Hiểu câu hỏi',
      summary: 'Kết luận từ khảo sát/nghiên cứu về làm việc từ xa',
      bullets: [
        'Câu hỏi: "Aus der Studie geht hervor, dass mobiles Arbeiten..."',
        'Từ khóa: Studie (nghiên cứu), geht hervor (chỉ ra rằng), mobiles Arbeiten (làm việc di động/từ xa).',
      ],
    },
    {
      title: 'Định vị dẫn chứng',
      summary: 'Tìm đoạn nhắc đến cuộc nghiên cứu (Studie)',
      bullets: [
        'Định vị: Bài báo số 1, đoạn 2.',
        'Dẫn chứng: "Laut einer aktuellen Erhebung steigt die Produktivität der Angestellten..."',
      ],
    },
    {
      title: 'Đọc dẫn chứng bằng Linearthinking',
      summary: 'Từ đồng nghĩa: Erhebung = Studie, Produktivität steigt',
      bullets: [
        'Nghiên cứu khẳng định: Năng suất và hiệu quả lao động của nhân viên gia tăng khi được tự chủ không gian làm việc.',
      ],
    },
    {
      title: 'Chọn đáp án',
      summary: 'Chọn phương án về năng suất lao động',
      bullets: [
        'Chọn phương án chỉ ra rằng năng suất làm việc tăng lên (die Produktivität steigt).',
      ],
    },
  ],

  9: [
    {
      title: 'Hiểu câu hỏi',
      summary: 'Điều kiện/yêu cầu của giới chủ doanh nghiệp',
      bullets: [
        'Câu hỏi: "Arbeitgeber fordern im Gegenzug für das Homeoffice..."',
        'Từ khóa: Arbeitgeber fordern (người sử dụng lao động đòi hỏi), im Gegenzug (để đổi lại).',
      ],
    },
    {
      title: 'Định vị dẫn chứng',
      summary: 'Tìm đoạn cuối bài báo 1 về phía doanh nghiệp',
      bullets: [
        'Định vị: Bài báo số 1, đoạn 3.',
        'Dẫn chứng: "Unternehmen verlangen allerdings eine verlässliche Erreichbarkeit während der vereinbarten Kernarbeitszeiten."',
      ],
    },
    {
      title: 'Đọc dẫn chứng bằng Linearthinking',
      summary: 'Từ khóa "verlässliche Erreichbarkeit"',
      bullets: [
        'Erreichbarkeit = khả năng giữ liên lạc, sẵn sàng phản hồi điện thoại/email khi cần.',
        'Kernarbeitszeiten = khung giờ làm việc cốt lõi quy định chung.',
      ],
    },
    {
      title: 'Chọn đáp án',
      summary: 'Chọn phương án về giữ liên lạc đúng giờ',
      bullets: [
        'Chọn đáp án nhấn mạnh việc nhân viên phải đảm bảo liên lạc thông suốt trong giờ làm.',
      ],
    },
  ],

  10: [
    {
      title: 'Hiểu câu hỏi',
      summary: 'Mục tiêu của sáng kiến "Fahrradstadt"',
      bullets: [
        'Câu hỏi: "Die Initiative \'Fahrradstadt\' plant vor allem..."',
        'Từ khóa: Initiative \'Fahrradstadt\' (sáng kiến), plant vor allem (chủ yếu lên kế hoạch làm gì).',
      ],
    },
    {
      title: 'Định vị dẫn chứng',
      summary: 'Tìm bài báo số 2 về đề án thành phố xe đạp',
      bullets: [
        'Định vị: Bài báo số 2, đoạn 1.',
        'Dẫn chứng: "...den zügigen Ausbau getrennter und sicherer Radfahrstreifen im gesamten Zentrum."',
      ],
    },
    {
      title: 'Đọc dẫn chứng bằng Linearthinking',
      summary: 'Từ khóa "Ausbau getrennter und sicherer Radwege"',
      bullets: [
        'Ausbau = mở rộng, nâng cấp hạ tầng; getrennte Radwege = làn đường riêng biệt, an toàn cho xe đạp.',
      ],
    },
    {
      title: 'Chọn đáp án',
      summary: 'Chọn phương án mở rộng làn đường an toàn cho xe đạp',
      bullets: [
        'Chọn phương án tương ứng với việc xây dựng và mở rộng làn đường an toàn dành riêng cho xe đạp.',
      ],
    },
  ],

  11: [
    {
      title: 'Hiểu câu hỏi',
      summary: 'Đối tượng đưa ra lời phê bình, phản đối',
      bullets: [
        'Câu hỏi: "Kritik an dem neuen Verkehrskonzept kommt von..."',
        'Từ khóa: Kritik (sự chỉ trích), neues Verkehrskonzept (đề án giao thông mới), kommt von (đến từ ai).',
      ],
    },
    {
      title: 'Định vị dẫn chứng',
      summary: 'Tìm đoạn nhắc đến sự phản đối trong bài báo 2',
      bullets: [
        'Định vị: Bài báo số 2, đoạn 2.',
        'Dẫn chứng: "Vor allem lokale Händler und Geschäftsinhaber äußern schwere Bedenken wegen wegfallender Parkplätze."',
      ],
    },
    {
      title: 'Đọc dẫn chứng bằng Linearthinking',
      summary: 'Paraphrase: lokale Händler = Geschäftsinhaber = Einzelhandel',
      bullets: [
        'Các chủ cửa hàng buôn bán lo lắng vì mất chỗ đậu xe của khách hàng, ảnh hưởng doanh thu.',
      ],
    },
    {
      title: 'Chọn đáp án',
      summary: 'Chọn phương án đề cập đến tiểu thương/chủ cửa hàng',
      bullets: [
        'Chọn đáp án chỉ rõ giới kinh doanh, buôn bán cửa hàng tại khu vực trung tâm.',
      ],
    },
  ],

  12: [
    {
      title: 'Hiểu câu hỏi',
      summary: 'Kết quả bước đầu sau khi thí điểm làn xe đạp',
      bullets: [
        'Câu hỏi: "Erste Ergebnisse zeigen, dass durch die neuen Radwege..."',
        'Từ khóa: Erste Ergebnisse (kết quả ban đầu), zeigen (cho thấy).',
      ],
    },
    {
      title: 'Định vị dẫn chứng',
      summary: 'Tìm đoạn kết bài báo số 2',
      bullets: [
        'Định vị: Bài báo số 2, đoạn cuối.',
        'Dẫn chứng: "Erste Statistiken belegen bereits einen deutlichen Rückgang schwerer Unfälle mit Zweirädern."',
      ],
    },
    {
      title: 'Đọc dẫn chứng bằng Linearthinking',
      summary: 'Từ khóa "Rückgang schwerer Unfälle"',
      bullets: [
        'Rückgang = sự giảm sút, suy giảm; Unfälle = tai nạn.',
        'Ý nghĩa: Số vụ tai nạn nghiêm trọng liên quan đến xe 2 bánh đã giảm rõ rệt.',
      ],
    },
    {
      title: 'Chọn đáp án',
      summary: 'Chọn phương án về giảm thiểu tai nạn giao thông',
      bullets: [
        'Chọn đáp án nêu việc tai nạn xe đạp giảm bớt và mức độ an toàn tăng lên.',
      ],
    },
  ],

  // ==========================================
  // TEIL 3: Anzeigen zuordnen (Aufgaben 13–19)
  // Dạng bài: Ghép tình huống với bảng quảng cáo a–j
  // ==========================================
  13: [
    {
      title: 'Hiểu câu hỏi',
      summary: 'Tình huống 13: Peter cần sửa chiếc Mountainbike cũ',
      bullets: [
        'Nhu cầu: Tìm dịch vụ hoặc người am hiểu sửa chữa, thay thế phụ tùng cho xe đạp leo núi (Mountainbike).',
        'Từ khóa: Mountainbike, Fahrrad reparieren, Werkstatt, Ersatzteile.',
      ],
      callout: { label: 'Ma trận a–j', text: 'Mỗi tình huống tương ứng với duy nhất 1 mẩu quảng cáo phù hợp nhất.' },
    },
    {
      title: 'Định vị dẫn chứng',
      summary: 'Quét các mẩu tin quảng cáo về xe đạp (Fahrrad)',
      bullets: [
        'Tìm mẩu quảng cáo có từ khóa: "Fahrradreparatur", "Zweirad-Service", "Werkstatt für Räder".',
      ],
    },
    {
      title: 'Đọc dẫn chứng bằng Linearthinking',
      summary: 'Kiểm tra đầy đủ tiêu chí của Peter',
      bullets: [
        'Mẩu tin nhận sửa chữa mọi dòng xe, đặc biệt có bảo dưỡng và phụ tùng cho xe đạp địa hình.',
      ],
    },
    {
      title: 'Chọn đáp án',
      summary: 'Tích chọn chữ cái tương ứng trong ma trận a–j',
      bullets: [
        'Đối chiếu và bấm chọn chữ cái của mẩu quảng cáo tiệm sửa xe đạp.',
      ],
    },
  ],

  14: [
    {
      title: 'Hiểu câu hỏi',
      summary: 'Tình huống 14: Claudia cần người trông mèo 5 ngày',
      bullets: [
        'Nhu cầu: Đi công tác 5 ngày (Dienstreise), cần người chăm sóc mèo tại nhà hoặc gửi khách sạn thú cưng.',
        'Từ khóa: Katze, Tierbetreuung, Urlaubsbetreuung, 5 Tage.',
      ],
    },
    {
      title: 'Định vị dẫn chứng',
      summary: 'Tìm mẩu tin về dịch vụ chăm sóc thú cưng',
      bullets: [
        'Tìm mẩu tin có từ khóa: "Katzenbetreuung", "Haustiere versorgen", "mobile Tierpflege".',
      ],
    },
    {
      title: 'Đọc dẫn chứng bằng Linearthinking',
      summary: 'Đối chiếu điều kiện: chăm sóc mèo khi vắng nhà',
      bullets: [
        'Mẩu tin nhận cho mèo ăn, dọn dẹp và chăm sóc tận nhà khi chủ nhân đi công tác hoặc du lịch.',
      ],
    },
    {
      title: 'Chọn đáp án',
      summary: 'Tích chọn chữ cái mẩu tin chăm sóc mèo',
      bullets: [
        'Chọn đúng chữ cái của mẩu tin dịch vụ trông giữ và chăm sóc mèo.',
      ],
    },
  ],

  15: [
    {
      title: 'Hiểu câu hỏi',
      summary: 'Tình huống 15: Stefan luyện tiếng Đức phỏng vấn xin việc',
      bullets: [
        'Nhu cầu: Nâng cao trình độ tiếng Đức chuyên sâu cho các buổi phỏng vấn tuyển dụng kỹ thuật.',
        'Từ khóa: Deutschkurs, Vorstellungsgespräch, Bewerbungstraining, Beruf.',
      ],
    },
    {
      title: 'Định vị dẫn chứng',
      summary: 'Tìm quảng cáo khóa học tiếng Đức hướng nghiệp',
      bullets: [
        'Tìm mẩu tin có: "Deutsch für den Beruf", "Bewerbungscoaching", "Sprachtraining".',
      ],
    },
    {
      title: 'Đọc dẫn chứng bằng Linearthinking',
      summary: 'Khóa học tập trung đúng vào kỹ năng phỏng vấn',
      bullets: [
        'Phân biệt với các khóa học giao tiếp thông thường: Khóa học này chuyên rèn luyện phỏng vấn nghề nghiệp.',
      ],
    },
    {
      title: 'Chọn đáp án',
      summary: 'Tích chọn chữ cái mẩu tin đào tạo tiếng Đức nghề nghiệp',
      bullets: [
        'Chọn phương án trung tâm dạy tiếng Đức phục vụ xin việc và phỏng vấn.',
      ],
    },
  ],

  16: [
    {
      title: 'Hiểu câu hỏi',
      summary: 'Tình huống 16: Maria muốn bán lại xe ô tô cũ',
      bullets: [
        'Nhu cầu: Bán chiếc ô tô cũ (PKW) cho đơn vị thu mua nhanh chóng, thanh toán tiền mặt.',
        'Từ khóa: PKW verkaufen, Autoankauf, Gebrauchtwagen.',
      ],
    },
    {
      title: 'Định vị dẫn chứng',
      summary: 'Tìm quảng cáo thu mua xe ô tô cũ',
      bullets: [
        'Tìm mẩu tin có: "Wir kaufen Ihr Auto", "Gebrauchtwagen-Ankauf", "Barauszahlung".',
      ],
    },
    {
      title: 'Đọc dẫn chứng bằng Linearthinking',
      summary: 'Đơn vị thu mua xe mọi đời với thủ tục nhanh',
      bullets: [
        'Không nhầm lẫn với mẩu tin bán xe hoặc cho thuê xe: Đây là dịch vụ THU MUA (Ankauf).',
      ],
    },
    {
      title: 'Chọn đáp án',
      summary: 'Tích chọn mẩu tin thu mua ô tô cũ',
      bullets: [
        'Chọn chữ cái của đại lý chuyên mua lại xe ô tô đã qua sử dụng.',
      ],
    },
  ],

  17: [
    {
      title: 'Hiểu câu hỏi',
      summary: 'Tình huống 17: Gia đình Weber tour leo núi 3 ngày tại Tirol',
      bullets: [
        'Nhu cầu: Kế hoạch nghỉ dưỡng leo núi 3 ngày cho cả gia đình tại bang Tirol (Áo).',
        'Từ khóa: Familie, Bergtour, Tirol, 3 Tage, Wandern.',
      ],
    },
    {
      title: 'Định vị dẫn chứng',
      summary: 'Tìm quảng cáo du lịch dã ngoại vùng núi Tirol',
      bullets: [
        'Tìm mẩu tin có: "Wanderurlaub in Tirol", "Familienhotel", "geführte Touren".',
      ],
    },
    {
      title: 'Đọc dẫn chứng bằng Linearthinking',
      summary: 'Phù hợp đối tượng gia đình và thời gian ngắn ngày',
      bullets: [
        'Gói tour thiết kế thân thiện cho gia đình có trẻ em, lịch trình 3 ngày tại vùng núi Tirol.',
      ],
    },
    {
      title: 'Chọn đáp án',
      summary: 'Tích chọn mẩu tin du lịch nghỉ dưỡng leo núi Tirol',
      bullets: [
        'Chọn chữ cái tương ứng với khách sạn/tour leo núi gia đình tại Tirol.',
      ],
    },
  ],

  18: [
    {
      title: 'Hiểu câu hỏi',
      summary: 'Tình huống 18: Lukas bị virus máy tính cần cứu hộ khẩn cấp',
      bullets: [
        'Nhu cầu: Laptop bị nhiễm virus, máy tính không làm việc được, cần khắc phục ngay.',
        'Từ khóa: Computervirus, Laptop, Notdienst, PC-Hilfe, Reparatur.',
      ],
    },
    {
      title: 'Định vị dẫn chứng',
      summary: 'Tìm dịch vụ sửa chữa phần mềm máy tính khẩn cấp',
      bullets: [
        'Tìm mẩu tin có: "PC-Notdienst", "Virenentfernung", "Soforthilfe für Laptops".',
      ],
    },
    {
      title: 'Đọc dẫn chứng bằng Linearthinking',
      summary: 'Dịch vụ xử lý sự cố virus và phục hồi hệ điều hành',
      bullets: [
        'Cứu hộ khẩn cấp tại nhà hoặc trực tuyến, chuyên diệt mã độc và cài đặt lại máy tính an toàn.',
      ],
    },
    {
      title: 'Chọn đáp án',
      summary: 'Tích chọn mẩu tin cứu hộ máy tính và diệt virus',
      bullets: [
        'Chọn đúng chữ cái của dịch vụ kỹ thuật sửa laptop và xử lý virus.',
      ],
    },
  ],

  19: [
    {
      title: 'Hiểu câu hỏi',
      summary: 'Tình huống 19: Johanna tìm phòng trọ giá sinh viên tại Graz',
      bullets: [
        'Nhu cầu: Sinh viên bắt đầu học kỳ mùa thu tại thành phố Graz, cần tìm phòng trọ giá cả vừa túi tiền.',
        'Từ khóa: Studentenzimmer, Graz, bezahlbar / günstig, ab Herbst.',
      ],
    },
    {
      title: 'Định vị dẫn chứng',
      summary: 'Tìm mẩu tin cho thuê phòng trọ sinh viên ở Graz',
      bullets: [
        'Tìm mẩu tin có: "Wohnen in Graz", "Zimmer für Studierende", "günstige Miete".',
      ],
    },
    {
      title: 'Đọc dẫn chứng bằng Linearthinking',
      summary: 'Khớp địa điểm (Graz) và đối tượng (sinh viên giá rẻ)',
      bullets: [
        'Phòng trọ gần khuôn viên đại học Graz, mức giá ưu đãi dành riêng cho sinh viên nhập học.',
      ],
    },
    {
      title: 'Chọn đáp án',
      summary: 'Tích chọn mẩu tin cho thuê phòng sinh viên tại Graz',
      bullets: [
        'Chọn chữ cái tương ứng với phòng trọ sinh viên giá rẻ tại Graz.',
      ],
    },
  ],

  // ==========================================
  // TEIL 4: Leserbriefe (Aufgaben 20–26)
  // Dạng bài: Ý kiến bạn đọc (Ja / Nein)
  // ==========================================
  20: [
    {
      title: 'Hiểu câu hỏi',
      summary: 'Đánh giá quan điểm của Markus về đồng phục học sinh',
      bullets: [
        'Câu hỏi: "Findet Markus Schuluniformen sinnvoll?"',
        'Nhiệm vụ: Xác định Markus ủng hộ (Ja) hay phản đối (Nein) việc mặc đồng phục học sinh.',
      ],
      callout: { label: 'Ja / Nein', text: 'Chỉ chọn Ja khi tác giả bức thư bày tỏ sự đồng tình, ủng hộ.' },
    },
    {
      title: 'Định vị dẫn chứng',
      summary: 'Đọc bức thư của Markus',
      bullets: [
        'Định vị: Bức thư mang tên "Markus".',
        'Dẫn chứng: "Ich befürworte Schuluniformen ausdrücklich. Sie verhindern den ständigen Markenterror..."',
      ],
    },
    {
      title: 'Đọc dẫn chứng bằng Linearthinking',
      summary: 'Phân tích từ vựng lập trường: "befürworte"',
      bullets: [
        'befürworten = tán thành, ủng hộ.',
        'Lý do đưa ra: chấm dứt áp lực đua đòi hàng hiệu (Markenterror), tạo sự bình đẳng giữa học sinh.',
      ],
    },
    {
      title: 'Chọn đáp án',
      summary: 'Markus hoàn toàn ủng hộ việc mặc đồng phục',
      bullets: [
        'Lập trường đồng tình rõ ràng.',
        'Kết luận: Chọn Ja (Có).',
      ],
    },
  ],

  21: [
    {
      title: 'Hiểu câu hỏi',
      summary: 'Thái độ của Sabine đối với đồng phục học sinh',
      bullets: [
        'Câu hỏi: "Ist Sabine für Schuluniformen?"',
        'Nhiệm vụ: Kiểm tra xem Sabine có đứng về phe ủng hộ (für) đồng phục hay không.',
      ],
    },
    {
      title: 'Định vị dẫn chứng',
      summary: 'Đọc bức thư của Sabine',
      bullets: [
        'Định vị: Bức thư mang tên "Sabine".',
        'Dẫn chứng: "Eine einheitliche Kleidung nimmt den Jugendlichen jede Möglichkeit, ihre eigene Persönlichkeit auszudrücken..."',
      ],
    },
    {
      title: 'Đọc dẫn chứng bằng Linearthinking',
      summary: 'Phân tích luận điểm tự do cá nhân',
      bullets: [
        'Sabine cho rằng đồng phục tước đoạt cơ hội thể hiện cá tính riêng của giới trẻ.',
        'Sabine cực lực phản đối (gegen Schuluniformen).',
      ],
    },
    {
      title: 'Chọn đáp án',
      summary: 'Sabine phản đối kịch liệt',
      bullets: [
        'Sabine không ủng hộ đồng phục.',
        'Kết luận: Chọn Nein (Không).',
      ],
    },
  ],

  22: [
    {
      title: 'Hiểu câu hỏi',
      summary: 'Quan điểm của Thomas về việc đưa đồng phục vào trường học',
      bullets: [
        'Câu hỏi: "Befürwortet Thomas die Einführung von Schulkleidung?"',
        'Nhiệm vụ: Xem xét Thomas có ủng hộ đưa trang phục học đường vào trường hay không.',
      ],
    },
    {
      title: 'Định vị dẫn chứng',
      summary: 'Đọc bức thư của Thomas',
      bullets: [
        'Định vị: Bức thư mang tên "Thomas".',
        'Dẫn chứng: "Aus meiner Sicht als Vater entlastet eine einheitliche Schulkleidung das Familienbudget enorm..."',
      ],
    },
    {
      title: 'Đọc dẫn chứng bằng Linearthinking',
      summary: 'Góc nhìn phụ huynh: tiết kiệm ngân sách gia đình',
      bullets: [
        'Thomas khẳng định đồng phục giảm bớt gánh nặng chi phí mua sắm quần áo cho gia đình.',
        'Thomas nhiệt tình ủng hộ sáng kiến này.',
      ],
    },
    {
      title: 'Chọn đáp án',
      summary: 'Thomas ủng hộ đưa đồng phục vào trường',
      bullets: [
        'Quan điểm tán thành từ góc độ phụ huynh học sinh.',
        'Kết luận: Chọn Ja (Có).',
      ],
    },
  ],

  23: [
    {
      title: 'Hiểu câu hỏi',
      summary: 'Julia có coi đồng phục là biện pháp hợp thời không',
      bullets: [
        'Câu hỏi: "Hält Julia Schuluniformen für eine zeitgemäße Maßnahme?"',
        'Từ khóa: zeitgemäße Maßnahme (biện pháp hợp thời đại, phù hợp ngày nay).',
      ],
    },
    {
      title: 'Định vị dẫn chứng',
      summary: 'Đọc bức thư của Julia',
      bullets: [
        'Định vị: Bức thư mang tên "Julia".',
        'Dẫn chứng: "Schuluniformen stammen aus dem vorigen Jahrhundert und passen überhaupt nicht in eine moderne, offene Gesellschaft."',
      ],
    },
    {
      title: 'Đọc dẫn chứng bằng Linearthinking',
      summary: 'Đối lập: "vorigen Jahrhundert" vs "zeitgemäß"',
      bullets: [
        'Julia đánh giá đồng phục là tàn tích thế kỷ trước, hoàn toàn không phù hợp với xã hội hiện đại.',
        'Tức là KHÔNG HỢP THỜI (nicht zeitgemäß).',
      ],
    },
    {
      title: 'Chọn đáp án',
      summary: 'Julia coi đây là biện pháp lạc hậu',
      bullets: [
        'Julia không coi đồng phục là biện pháp hợp thời.',
        'Kết luận: Chọn Nein (Không).',
      ],
    },
  ],

  24: [
    {
      title: 'Hiểu câu hỏi',
      summary: 'Christian có ủng hộ quy định bắt buộc mặc đồng phục không',
      bullets: [
        'Câu hỏi: "Befürwortet Christian eine Uniformpflicht an Schulen?"',
        'Từ khóa: Uniformpflicht (nghĩa vụ/quy định bắt buộc mặc đồng phục).',
      ],
    },
    {
      title: 'Định vị dẫn chứng',
      summary: 'Đọc bức thư của Christian',
      bullets: [
        'Định vị: Bức thư mang tên "Christian".',
        'Dẫn chứng: "Das Gemeinschaftsgefühl wird durch gemeinsame Kleidung gestärkt. Ich bin absolut dafür, dies verpflichtend einzuführen."',
      ],
    },
    {
      title: 'Đọc dẫn chứng bằng Linearthinking',
      summary: 'Từ khóa khẳng định: "absolut dafür"',
      bullets: [
        'Christian nhấn mạnh tinh thần đoàn kết tập thể được củng cố nhờ đồng phục.',
        '"absolut dafür" = hoàn toàn tán thành việc bắt buộc áp dụng.',
      ],
    },
    {
      title: 'Chọn đáp án',
      summary: 'Christian nhiệt tình ủng hộ quy định bắt buộc',
      bullets: [
        'Quan điểm ủng hộ tuyệt đối.',
        'Kết luận: Chọn Ja (Có).',
      ],
    },
  ],

  25: [
    {
      title: 'Hiểu câu hỏi',
      summary: 'Laura có tin rằng đồng phục giúp giảm các vấn đề học đường không',
      bullets: [
        'Câu hỏi: "Glaubt Laura, dass Uniformen Schulprobleme verringern?"',
        'Từ khóa: Schulprobleme verringern (giảm bớt các vấn đề/mâu thuẫn học đường).',
      ],
    },
    {
      title: 'Định vị dẫn chứng',
      summary: 'Đọc bức thư của Laura',
      bullets: [
        'Định vị: Bức thư mang tên "Laura".',
        'Dẫn chứng: "Mobbing und soziale Konflikte verschwinden nicht durch Kleidung. Die eigentlichen Ursachen liegen viel tiefer..."',
      ],
    },
    {
      title: 'Đọc dẫn chứng bằng Linearthinking',
      summary: 'Lập luận nguyên nhân gốc rễ',
      bullets: [
        'Bắt nạt và xung đột bắt nguồn từ tâm lý và hành vi, không thể biến mất chỉ vì chiếc áo đồng phục.',
        'Laura không tin đồng phục giải quyết được vấn nạn này.',
      ],
    },
    {
      title: 'Chọn đáp án',
      summary: 'Laura không tin vào tác dụng giảm thiểu vấn đề học đường',
      bullets: [
        'Laura phản bác tác dụng giải quyết vấn đề của đồng phục.',
        'Kết luận: Chọn Nein (Không).',
      ],
    },
  ],

  26: [
    {
      title: 'Hiểu câu hỏi',
      summary: 'Felix có ủng hộ việc hạn chế quyền tự do lựa chọn trang phục không',
      bullets: [
        'Câu hỏi: "Befürwortet Felix die Einschränkung der Kleiderwahl?"',
        'Từ khóa: Einschränkung der Kleiderwahl (hạn chế sự tự do lựa chọn trang phục).',
      ],
    },
    {
      title: 'Định vị dẫn chứng',
      summary: 'Đọc bức thư của Felix',
      bullets: [
        'Định vị: Bức thư mang tên "Felix".',
        'Dẫn chứng: "Jeder Schüler sollte das Recht haben, sich so zu kleiden, wie er möchte. Ein Verbot von individueller Kleidung halte ich für grundfalsch."',
      ],
    },
    {
      title: 'Đọc dẫn chứng bằng Linearthinking',
      summary: 'Từ khóa phản đối: "halte ich für grundfalsch"',
      bullets: [
        'Felix khẳng định quyền tự do ăn mặc của học sinh phải được tôn trọng.',
        'Việc cấm đoán/hạn chế lựa chọn trang phục bị Felix coi là hoàn toàn sai lầm.',
      ],
    },
    {
      title: 'Chọn đáp án',
      summary: 'Felix phản đối mọi sự hạn chế tự do trang phục',
      bullets: [
        'Felix không ủng hộ việc hạn chế lựa chọn quần áo.',
        'Kết luận: Chọn Nein (Không).',
      ],
    },
  ],

  // ==========================================
  // TEIL 5: Hausordnung der Bibliothek (Aufgaben 27–30)
  // Dạng bài: Trắc nghiệm A / B / C
  // ==========================================
  27: [
    {
      title: 'Hiểu câu hỏi',
      summary: 'Quy định về túi xách và ba lô trong phòng đọc thư viện',
      bullets: [
        'Câu hỏi: "Was gilt bezüglich Taschen und Rucksäcken im Lesesaal?"',
        'Từ khóa: Taschen und Rucksäcke (túi xách và ba lô), im Lesesaal (trong phòng đọc).',
      ],
      callout: { label: 'Nội quy thư viện', text: 'Đọc chính xác điều khoản, chú ý từ cấm (verboten) hoặc bắt buộc (müssen).' },
    },
    {
      title: 'Định vị dẫn chứng',
      summary: 'Tìm mục quy định về đồ dùng cá nhân và tủ gửi đồ',
      bullets: [
        'Định vị: Mục 1 của Nội quy thư viện ("Garderobe und Schließfächer").',
        'Dẫn chứng: "Größere Taschen und Rucksäcke dürfen nicht in den Lesesaal mitgenommen werden. Sie sind in den Schließfächern im Foyer einzuschließen."',
      ],
    },
    {
      title: 'Đọc dẫn chứng bằng Linearthinking',
      summary: 'Cấu trúc cấm và yêu cầu bắt buộc',
      bullets: [
        'dürfen nicht mitgenommen werden = không được phép mang vào phòng đọc.',
        'sind in Schließfächern einzuschließen = bắt buộc phải cất vào tủ khóa ngoài tiền sảnh.',
      ],
    },
    {
      title: 'Chọn đáp án',
      summary: 'Chọn phương án gửi ba lô túi xách vào tủ khóa',
      bullets: [
        'Chọn đáp án nêu rõ túi xách và ba lô phải để lại trong tủ khóa trước khi vào phòng đọc.',
      ],
    },
  ],

  28: [
    {
      title: 'Hiểu câu hỏi',
      summary: 'Quy tắc sử dụng điện thoại di động trong thư viện',
      bullets: [
        'Câu hỏi: "Wie dürfen Mobiltelefone in der Bibliothek genutzt werden?"',
        'Từ khóa: Mobiltelefone (điện thoại di động), wie genutzt werden (được dùng như thế nào).',
      ],
    },
    {
      title: 'Định vị dẫn chứng',
      summary: 'Tìm mục quy định về thiết bị di động và vùng yên lặng',
      bullets: [
        'Định vị: Mục "Mobiltelefone und Lärmschutz".',
        'Dẫn chứng: "Telefone sind auf lautlos zu schalten. Telefonieren ist ausschließlich im Eingangsbereich außerhalb der Lesezonen gestattet."',
      ],
    },
    {
      title: 'Đọc dẫn chứng bằng Linearthinking',
      summary: 'Điều kiện: im lặng & gọi điện đúng khu vực',
      bullets: [
        'auf lautlos schalten = chuyển sang chế độ im lặng.',
        'ausschließlich im Eingangsbereich telefonieren = chỉ được gọi điện thoại tại khu vực lối vào/sảnh.',
      ],
    },
    {
      title: 'Chọn đáp án',
      summary: 'Chọn phương án để điện thoại im lặng và chỉ gọi ngoài sảnh',
      bullets: [
        'Chọn đáp án cấm nghe gọi trong phòng đọc và yêu cầu tắt chuông.',
      ],
    },
  ],

  29: [
    {
      title: 'Hiểu câu hỏi',
      summary: 'Quy định về đồ uống tại vị trí bàn học',
      bullets: [
        'Câu hỏi: "Welche Regelung gilt für Getränke am Arbeitsplatz?"',
        'Từ khóa: Regelung (quy định), Getränke (đồ uống), am Arbeitsplatz (tại bàn học/làm việc).',
      ],
    },
    {
      title: 'Định vị dẫn chứng',
      summary: 'Tìm mục quy định về ăn uống trong thư viện',
      bullets: [
        'Định vị: Mục "Essen und Trinken".',
        'Dẫn chứng: "Das Mitbringen von Speisen ist untersagt. Erlaubt ist ausschließlich Wasser in wiederverschließbaren Flaschen."',
      ],
    },
    {
      title: 'Đọc dẫn chứng bằng Linearthinking',
      summary: 'Phạm vi cho phép: "nur Wasser in verschließbaren Flaschen"',
      bullets: [
        'Chỉ cho phép duy nhất nước lọc trong bình hoặc chai có nắp đóng kín được.',
        'Mọi loại nước ngọt, cà phê cốc hở hay đồ ăn đều bị nghiêm cấm hoàn toàn.',
      ],
    },
    {
      title: 'Chọn đáp án',
      summary: 'Chọn phương án chỉ cho phép nước trong bình có nắp đậy',
      bullets: [
        'Chọn đáp án nêu đúng: chỉ được uống nước trong bình có nắp vặn kín.',
      ],
    },
  ],

  30: [
    {
      title: 'Hiểu câu hỏi',
      summary: 'Điều kiện để được gia hạn thời gian mượn tài liệu',
      bullets: [
        'Câu hỏi: "Unter welcher Bedingung kann die Leihfrist verlängert werden?"',
        'Từ khóa: Bedingung (điều kiện), Leihfrist verlängern (gia hạn thời hạn mượn sách).',
      ],
    },
    {
      title: 'Định vị dẫn chứng',
      summary: 'Tìm mục quy định về mượn và gia hạn sách',
      bullets: [
        'Định vị: Mục "Ausleihe und Verlängerung der Leihfrist".',
        'Dẫn chứng: "Eine Verlängerung um weitere vier Wochen ist online möglich, vorausgesetzt, es liegt keine Reservierung durch einen anderen Nutzer vor."',
      ],
    },
    {
      title: 'Đọc dẫn chứng bằng Linearthinking',
      summary: 'Điều kiện tiên quyết: "keine Reservierung vorliegt"',
      bullets: [
        'vorausgesetzt = với điều kiện là.',
        'keine Reservierung durch andere = chưa có người đọc khác đặt trước cuốn sách đó.',
      ],
    },
    {
      title: 'Chọn đáp án',
      summary: 'Chọn phương án sách chưa bị ai đặt trước',
      bullets: [
        'Chọn đáp án chỉ rõ việc gia hạn chỉ thành công khi chưa có bạn đọc nào khác đặt trước tài liệu.',
      ],
    },
  ],
};

export const PART_DEFAULT_GUIDES: Record<number, GuideStep[]> = {
  1: [
    { title: 'Hiểu câu hỏi', summary: 'Đọc kỹ câu nhận định', bullets: ['Gạch chân từ khóa chính của câu nhận định.', 'Chú ý các thông tin về nhân vật, thời gian, địa điểm và số lượng.'], callout: { label: 'Đúng / Sai', text: 'Khẳng định phải khớp hoàn toàn với bài đọc thì mới chọn Đúng.' } },
    { title: 'Định vị dẫn chứng', summary: 'Xác định đoạn trích liên quan', bullets: ['Tìm kiếm thông tin tương đương trong bài viết.', 'Luôn đọc trọn vẹn cả câu và ngữ cảnh trước sau.'] },
    { title: 'Đọc dẫn chứng bằng Linearthinking', summary: 'Phân tích logic ngữ nghĩa', bullets: ['Đối chiếu cấu trúc câu và từ đồng nghĩa.', 'Phân biệt thông tin trực tiếp với phỏng đoán.'] },
    { title: 'Chọn đáp án', summary: 'Khẳng định quyết định', bullets: ['So sánh câu hỏi với bài đọc lần cuối.', 'Chọn Richtig hoặc Falsch.'] },
  ],
  2: [
    { title: 'Hiểu câu hỏi', summary: 'Đọc câu hỏi và 3 lựa chọn', bullets: ['Đọc câu hỏi trước để nắm thông tin cần tìm.', 'Xem lướt 3 phương án A, B, C.'], callout: { label: 'Trắc nghiệm A/B/C', text: 'Chỉ có duy nhất một phương án đúng được hỗ trợ bởi dẫn chứng trong bài.' } },
    { title: 'Định vị dẫn chứng', summary: 'Tìm đoạn văn trong bài báo', bullets: ['Xác định từ khóa và từ đồng nghĩa trong bài báo.', 'Đọc kỹ câu chứa dẫn chứng.'] },
    { title: 'Đọc dẫn chứng bằng Linearthinking', summary: 'Đối chiếu và loại trừ phương án sai', bullets: ['Loại bỏ phương án chỉ đúng một nửa hoặc mâu thuẫn.', 'Đối chiếu phương án phù hợp nhất với bài đọc.'] },
    { title: 'Chọn đáp án', summary: 'Chọn phương án A, B hoặc C', bullets: ['Kiểm tra lại tính chính xác.', 'Lưu lựa chọn của bạn.'] },
  ],
  3: [
    { title: 'Hiểu câu hỏi', summary: 'Xác định mục tiêu tìm kiếm', bullets: ['Đọc kỹ tình huống của người cần tìm.', 'Nắm rõ nhu cầu dịch vụ, địa điểm và điều kiện kèm theo.'], callout: { label: 'Ghép nối thông tin', text: 'Mỗi tình huống ghép với một mẩu quảng cáo phù hợp nhất.' } },
    { title: 'Định vị dẫn chứng', summary: 'Rà soát các mẩu tin quảng cáo', bullets: ['Tìm các mẩu tin liên quan đến từ khóa của tình huống.', 'Chú ý các hạn chế về giá cả, thời gian, khu vực.'] },
    { title: 'Đọc dẫn chứng bằng Linearthinking', summary: 'Áp dụng phương pháp loại trừ', bullets: ['So sánh các tiêu chí bắt buộc của tình huống với quảng cáo.', 'Loại bỏ mẩu tin chỉ đáp ứng một phần nhỏ.'] },
    { title: 'Chọn đáp án', summary: 'Chọn ký hiệu trong ma trận a–j', bullets: ['Đối chiếu lại toàn bộ mẩu tin.', 'Bấm chọn chữ cái tương ứng trong bảng ma trận.'] },
  ],
  4: [
    { title: 'Hiểu câu hỏi', summary: 'Xác định ý kiến cần tìm', bullets: ['Đọc câu hỏi để biết đang hỏi về quan điểm của ai.', 'Chú ý xem hỏi về sự đồng tình hay phản đối.'] },
    { title: 'Định vị dẫn chứng', summary: 'Tìm bức thư của người tương ứng', bullets: ['Định vị đúng bức thư mang tên người được hỏi.', 'Tìm các cụm từ thể hiện thái độ, đánh giá.'] },
    { title: 'Đọc dẫn chứng bằng Linearthinking', summary: 'Hiểu sâu lập luận của tác giả', bullets: ['Theo dõi mạch lập luận từ luận điểm đến ví dụ.', 'Không nhầm lẫn ý kiến tác giả với quan điểm đối lập được trích dẫn.'] },
    { title: 'Chọn đáp án', summary: 'Chốt Ja hoặc Nein', bullets: ['So sánh câu hỏi với toàn bộ lập trường của người viết.', 'Chọn Ja nếu đồng ý, Nein nếu phản đối.'] },
  ],
  5: [
    { title: 'Hiểu câu hỏi', summary: 'Nắm rõ quy tắc hoặc hướng dẫn', bullets: ['Đọc câu hỏi và các lựa chọn A, B, C.', 'Xác định đây là quy định bắt buộc, cho phép hay nghiêm cấm.'], callout: { label: 'Nội quy thư viện', text: 'Chú ý động từ khuyết thiếu: müssen (phải), dürfen nicht (không được phép).' } },
    { title: 'Định vị dẫn chứng', summary: 'Tìm điều khoản liên quan trong nội quy', bullets: ['Tìm tiêu đề mục hoặc từ khóa trong bản nội quy.', 'Đọc trọn vẹn điều khoản liên quan.'] },
    { title: 'Đọc dẫn chứng bằng Linearthinking', summary: 'Kiểm tra điều kiện và trường hợp ngoại lệ', bullets: ['Phân biệt giữa quyền hạn và nghĩa vụ.', 'Kiểm tra xem có ngoại lệ nào hạn chế quy định không.'] },
    { title: 'Chọn đáp án', summary: 'Chọn phương án phù hợp nhất', bullets: ['Đối chiếu từng phương án với văn bản quy định.', 'Chọn phương án A, B hoặc C chính xác nhất.'] },
  ],
};

export function getGuideForQuestion(part: number, order?: number): GuideStep[] {
  if (order && QUESTION_GUIDES[order]) {
    return QUESTION_GUIDES[order];
  }
  return PART_DEFAULT_GUIDES[part] ?? PART_DEFAULT_GUIDES[1];
}
