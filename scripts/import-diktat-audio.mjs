import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rawNamDir = path.join(root, 'apps', 'web', 'public', 'audio', 'raw-diktat', 'NAM');
const rawNuDir = path.join(root, 'apps', 'web', 'public', 'audio', 'raw-diktat', 'NU');
const targetDiktatDir = path.join(root, 'apps', 'web', 'public', 'audio', 'diktat');
const targetDataFile = path.join(root, 'apps', 'web', 'data', 'diktat-imported.ts');

if (!fs.existsSync(targetDiktatDir)) {
  fs.mkdirSync(targetDiktatDir, { recursive: true });
} else {
  // Clear old files before exporting new files
  const existingFiles = fs.readdirSync(targetDiktatDir);
  for (const f of existingFiles) {
    if (f.endsWith('.mp3')) {
      fs.unlinkSync(path.join(targetDiktatDir, f));
    }
  }
}

function normalizeKey(str) {
  return str
    .replace(/\.mp3$/i, '')
    .replace(/\.+$/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

// 1. Scan and copy all NAM files and NU files dynamically
const rawNamFiles = fs.readdirSync(rawNamDir).filter((f) => f.endsWith('.mp3')).sort();
const rawNuFiles = fs.readdirSync(rawNuDir).filter((f) => f.endsWith('.mp3')).sort();

console.log(`Found ${rawNamFiles.length} raw NAM files and ${rawNuFiles.length} raw NU files.`);

const namItems = rawNamFiles.map((file, index) => {
  const paddedIndex = String(index + 1).padStart(3, '0');
  const targetName = `nam-${paddedIndex}.mp3`;
  const src = path.join(rawNamDir, file);
  const dest = path.join(targetDiktatDir, targetName);
  fs.copyFileSync(src, dest);
  return {
    rawFile: file,
    key: normalizeKey(file),
    voice: 'male',
    audioUrl: `/audio/diktat/${targetName}`,
  };
});

const nuItems = rawNuFiles.map((file, index) => {
  const paddedIndex = String(index + 1).padStart(3, '0');
  const targetName = `nu-${paddedIndex}.mp3`;
  const src = path.join(rawNuDir, file);
  const dest = path.join(targetDiktatDir, targetName);
  fs.copyFileSync(src, dest);
  return {
    rawFile: file,
    key: normalizeKey(file),
    voice: 'female',
    audioUrl: `/audio/diktat/${targetName}`,
  };
});

console.log(`Copied ${namItems.length} nam files and ${nuItems.length} nu files to ${targetDiktatDir}`);

export const SENTENCE_METADATA = {
  // === 15 DUAL-VOICE SENTENCES ===
  'arbeit ist ein wichtiger teil des lebens': {
    textDe: 'Arbeit ist ein wichtiger Teil des Lebens.',
    textVi: 'Công việc là một phần quan trọng của cuộc sống.',
    vocabulary: [
      { term: 'die Arbeit', article: 'die', ipa: '/ˈaʁbaɪ̯t/', meaning: 'công việc, lao động' },
      { term: 'der Teil', article: 'der', ipa: '/taɪ̯l/', meaning: 'phần, bộ phận' },
      { term: 'das Leben', article: 'das', ipa: '/ˈleːbn̩/', meaning: 'cuộc sống' },
      { term: 'wichtig', ipa: '/ˈvɪçtɪç/', meaning: 'quan trọng' },
    ],
  },
  'bring mir bitte mein hemd': {
    textDe: 'Bring mir bitte mein Hemd.',
    textVi: 'Làm ơn mang giúp tôi chiếc áo sơ mi.',
    vocabulary: [
      { term: 'das Hemd', article: 'das', ipa: '/hɛmt/', meaning: 'áo sơ mi' },
      { term: 'bringen', ipa: '/ˈbʁɪŋən/', meaning: 'mang lại, mang tới' },
      { term: 'bitte', ipa: '/ˈbɪtə/', meaning: 'làm ơn, xin vui lòng' },
    ],
  },
  'das ist das erste mal, das ich hier bin': {
    textDe: 'Das ist das erste Mal, dass ich hier bin.',
    textVi: 'Đây là lần đầu tiên tôi đến nơi này.',
    vocabulary: [
      { term: 'das Mal', article: 'das', ipa: '/maːl/', meaning: 'lần, dịp' },
      { term: 'erst', ipa: '/eːɐ̯st/', meaning: 'đầu tiên' },
      { term: 'hier', ipa: '/hiːɐ̯/', meaning: 'ở đây, nơi này' },
    ],
  },
  'das lernen einer sprache macht mir spaß': {
    textDe: 'Das Lernen einer Sprache macht mir Spaß.',
    textVi: 'Việc học một ngôn ngữ mang lại nhiều niềm vui cho tôi.',
    vocabulary: [
      { term: 'das Lernen', article: 'das', ipa: '/ˈlɛʁnən/', meaning: 'việc học tập' },
      { term: 'die Sprache', article: 'die', ipa: '/ˈʃpʁaːxə/', meaning: 'ngôn ngữ, tiếng' },
      { term: 'der Spaß', article: 'der', ipa: '/ʃpaːs/', meaning: 'niềm vui, sự thích thú' },
      { term: 'Spaß machen', ipa: '/ʃpaːs ˈmaxn̩/', meaning: 'mang lại niềm vui, thú vị' },
    ],
  },
  'die auswirkungen der droge sind unbekannt': {
    textDe: 'Die Auswirkungen der Droge sind unbekannt.',
    textVi: 'Những tác động của loại thuốc này vẫn chưa được biết rõ.',
    vocabulary: [
      { term: 'die Auswirkung', article: 'die', ipa: '/ˈaʊ̯sˌvɪʁkʊŋ/', meaning: 'tác động, ảnh hưởng' },
      { term: 'die Droge', article: 'die', ipa: '/ˈdʁoːɡə/', meaning: 'dược phẩm, chất kích thích' },
      { term: 'unbekannt', ipa: '/ˈʊnbəˌkant/', meaning: 'chưa rõ, không quen thuộc' },
    ],
  },
  'er war auf dem weg zum basketballtraining': {
    textDe: 'Er war auf dem Weg zum Basketballtraining.',
    textVi: 'Anh ấy đang trên đường đến buổi tập bóng rổ.',
    vocabulary: [
      { term: 'der Weg', article: 'der', ipa: '/veːk/', meaning: 'con đường, lộ trình' },
      { term: 'das Training', article: 'das', ipa: '/ˈtʁeːnɪŋ/', meaning: 'buổi tập luyện' },
      { term: 'auf dem Weg sein', ipa: '/aʊ̯f deːm veːk zaɪ̯n/', meaning: 'đang trên đường' },
    ],
  },
  'ich nehme oft den bus zur schule': {
    textDe: 'Ich nehme oft den Bus zur Schule.',
    textVi: 'Tôi thường đi xe buýt đến trường.',
    vocabulary: [
      { term: 'der Bus', article: 'der', ipa: '/bʊs/', meaning: 'xe buýt' },
      { term: 'die Schule', article: 'die', ipa: '/ˈʃuːlə/', meaning: 'trường học' },
      { term: 'nehmen', ipa: '/ˈneːmən/', meaning: 'đi, bắt (phương tiện), cầm' },
      { term: 'oft', ipa: '/ɔft/', meaning: 'thường xuyên' },
    ],
  },
  'ich schätze das du eine krankenschwester bist': {
    textDe: 'Ich schätze, dass du eine Krankenschwester bist.',
    textVi: 'Tôi đoán rằng bạn là một nữ y tá.',
    vocabulary: [
      { term: 'die Krankenschwester', article: 'die', ipa: '/ˈkʁaŋkn̩ˌʃvɛstɐ/', meaning: 'y tá nữ' },
      { term: 'schätzen', ipa: '/ˈʃɛtsn̩/', meaning: 'ước đoán, đánh giá cao' },
    ],
  },
  'ich würde gerne ein auto mieten': {
    textDe: 'Ich würde gerne ein Auto mieten.',
    textVi: 'Tôi muốn thuê một chiếc ô tô.',
    vocabulary: [
      { term: 'das Auto', article: 'das', ipa: '/ˈaʊ̯to/', meaning: 'ô tô, xe hơi' },
      { term: 'mieten', ipa: '/ˈmiːtn̩/', meaning: 'thuê (nhà, xe)' },
      { term: 'würde gerne', ipa: '/ˈvʏʁdə ˈɡɛʁnə/', meaning: 'rất muốn, có nguyện vọng' },
    ],
  },
  'ist es heute heiß -- ja, ist es': {
    textDe: 'Ist es heute heiß? – Ja, ist es.',
    textVi: 'Hôm nay trời có nóng không? – Vâng, nóng đấy.',
    vocabulary: [
      { term: 'heiß', ipa: '/haɪ̯s/', meaning: 'nóng bức' },
      { term: 'heute', ipa: '/ˈhɔɪ̯tə/', meaning: 'hôm nay' },
    ],
  },
  'mein vater arbeitet in einer bank': {
    textDe: 'Mein Vater arbeitet in einer Bank.',
    textVi: 'Bố tôi làm việc trong một ngân hàng.',
    vocabulary: [
      { term: 'der Vater', article: 'der', ipa: '/ˈfaːtɐ/', meaning: 'người cha, bố' },
      { term: 'die Bank', article: 'die', ipa: '/baŋk/', meaning: 'ngân hàng' },
      { term: 'arbeiten', ipa: '/ˈaʁbaɪ̯tn̩/', meaning: 'làm việc' },
    ],
  },
  'russland ist ein sehr großes land': {
    textDe: 'Russland ist ein sehr großes Land.',
    textVi: 'Nước Nga là một quốc gia rất rộng lớn.',
    vocabulary: [
      { term: 'das Land', article: 'das', ipa: '/lant/', meaning: 'đất nước, quốc gia' },
      { term: 'groß', ipa: '/ɡʁoːs/', meaning: 'to lớn, rộng lớn' },
      { term: 'sehr', ipa: '/zeːɐ̯/', meaning: 'rất' },
    ],
  },
  'um wieviel uhr bist du schlafen gegangen': {
    textDe: 'Um wie viel Uhr bist du schlafen gegangen?',
    textVi: 'Bạn đã đi ngủ lúc mấy giờ vậy?',
    vocabulary: [
      { term: 'die Uhr', article: 'die', ipa: '/uːɐ̯/', meaning: 'giờ, đồng hồ' },
      { term: 'schlafen gehen', ipa: '/ˈʃlaːfn̩ ˈɡeːən/', meaning: 'đi ngủ' },
      { term: 'um wie viel Uhr', ipa: '/ʊm viː fiːl uːɐ̯/', meaning: 'vào lúc mấy giờ' },
    ],
  },
  'wenn es dir gefällt kann ich mehr kaufen': {
    textDe: 'Wenn es dir gefällt, kann ich mehr kaufen.',
    textVi: 'Nếu bạn thích thì tôi có thể mua thêm.',
    vocabulary: [
      { term: 'gefallen', ipa: '/ɡəˈfaln̩/', meaning: 'thích, vừa ý' },
      { term: 'kaufen', ipa: '/ˈkaʊ̯fn̩/', meaning: 'mua' },
      { term: 'mehr', ipa: '/meːɐ̯/', meaning: 'nhiều hơn, thêm' },
    ],
  },
  'würdest du gerne mit mir zu abend essen': {
    textDe: 'Würdest du gerne mit mir zu Abend essen?',
    textVi: 'Bạn có muốn dùng bữa tối cùng tôi không?',
    vocabulary: [
      { term: 'das Abendessen', article: 'das', ipa: '/ˈaːbn̩tˌʔɛsn̩/', meaning: 'bữa tối' },
      { term: 'zu Abend essen', ipa: '/tsuː ˈaːbn̩t ˈʔɛsn̩/', meaning: 'ăn tối' },
      { term: 'zusammen', ipa: '/tsuˈzamən/', meaning: 'cùng nhau' },
    ],
  },

  // === BÀI 2: GIAO TIẾP & CÂU HỎI PHẢN XẠ ĐỜI SỐNG (16 CÂU) ===
  'bist du lehrer -- ja, bin ich': {
    textDe: 'Bist du Lehrer? – Ja, bin ich.',
    textVi: 'Bạn là giáo viên à? – Đúng vậy, tôi là giáo viên.',
    vocabulary: [
      { term: 'der Lehrer', article: 'der', ipa: '/ˈleːʁɐ/', meaning: 'giáo viên nam' },
      { term: 'sein', ipa: '/zaɪ̯n/', meaning: 'thì, là, ở' },
    ],
  },
  'hast du dich schon beim college beworben': {
    textDe: 'Hast du dich schon beim College beworben?',
    textVi: 'Bạn đã nộp đơn vào trường cao đẳng chưa?',
    vocabulary: [
      { term: 'das College', article: 'das', ipa: '/ˈkɔlɪtʃ/', meaning: 'trường cao đẳng/đại học' },
      { term: 'sich bewerben', ipa: '/zɪç bəˈvɛʁbn̩/', meaning: 'nộp đơn ứng tuyển' },
      { term: 'schon', ipa: '/ʃoːn/', meaning: 'đã, rồi' },
    ],
  },
  'hast du die nummer für ein taxi': {
    textDe: 'Hast du die Nummer für ein Taxi?',
    textVi: 'Bạn có số điện thoại của xe taxi không?',
    vocabulary: [
      { term: 'die Nummer', article: 'die', ipa: '/ˈnʊmɐ/', meaning: 'số điện thoại, con số' },
      { term: 'das Taxi', article: 'das', ipa: '/ˈtaksi/', meaning: 'xe taxi' },
    ],
  },
  'hörst du ihr gerade zu': {
    textDe: 'Hörst du ihr gerade zu?',
    textVi: 'Bạn có đang lắng nghe cô ấy nói không đấy?',
    vocabulary: [
      { term: 'zuhören', ipa: '/ˈtsuːˌhøːʁən/', meaning: 'chú ý lắng nghe ai' },
      { term: 'gerade', ipa: '/ɡəˈʁaːdə/', meaning: 'ngay lúc này, vừa mới' },
    ],
  },
  'ist keenan dort - ja, er ist gerade angekommen': {
    textDe: 'Ist Keenan dort? – Ja, er ist gerade angekommen.',
    textVi: 'Keenan có ở đó không? – Có, anh ấy vừa mới tới.',
    vocabulary: [
      { term: 'ankommen', ipa: '/ˈanˌkɔmən/', meaning: 'đến nơi, cập bến' },
      { term: 'gerade', ipa: '/ɡəˈʁaːdə/', meaning: 'vừa mới' },
    ],
  },
  'kannst du das für mich wegwerfen': {
    textDe: 'Kannst du das für mich wegwerfen?',
    textVi: 'Bạn có thể vứt cái này giùm tôi được không?',
    vocabulary: [
      { term: 'wegwerfen', ipa: '/ˈvɛkˌvɛʁfn̩/', meaning: 'vứt bỏ, ném đi' },
      { term: 'können', ipa: '/ˈkœnən/', meaning: 'có thể' },
    ],
  },
  'legst du das bitte für mich ins auto': {
    textDe: 'Legst du das bitte für mich ins Auto?',
    textVi: 'Bạn làm ơn để cái này vào trong xe ô tô giúp tôi nhé?',
    vocabulary: [
      { term: 'legen', ipa: '/ˈleːɡn̩/', meaning: 'đặt, để nằm' },
      { term: 'das Auto', article: 'das', ipa: '/ˈaʊ̯to/', meaning: 'ô tô' },
    ],
  },
  'magst du deine arbeitskollegen': {
    textDe: 'Magst du deine Arbeitskollegen?',
    textVi: 'Bạn có quý mến các đồng nghiệp ở chỗ làm không?',
    vocabulary: [
      { term: 'der Arbeitskollege', article: 'der', ipa: '/ˈaʁbaɪ̯tskoˌleːɡə/', meaning: 'đồng nghiệp nam' },
      { term: 'mögen', ipa: '/ˈmøːɡn̩/', meaning: 'thích, mến' },
    ],
  },
  'magst du gruselige filme': {
    textDe: 'Magst du gruselige Filme?',
    textVi: 'Bạn có thích xem phim kinh dị không?',
    vocabulary: [
      { term: 'der Film', article: 'der', ipa: '/fɪlm/', meaning: 'bộ phim' },
      { term: 'gruselig', ipa: '/ˈɡʁuːzəlɪç/', meaning: 'rùng rợn, đáng sợ' },
    ],
  },
  'regnet es hier oft': {
    textDe: 'Regnet es hier oft?',
    textVi: 'Ở đây trời có hay mưa không?',
    vocabulary: [
      { term: 'regnen', ipa: '/ˈʁeːɡnən/', meaning: 'mưa' },
      { term: 'oft', ipa: '/ɔft/', meaning: 'thường xuyên' },
    ],
  },
  'seit wann lebst du hier': {
    textDe: 'Seit wann lebst du hier?',
    textVi: 'Bạn sống ở đây từ khi nào thế?',
    vocabulary: [
      { term: 'leben', ipa: '/ˈleːbn̩/', meaning: 'sống, sinh sống' },
      { term: 'seit wann', ipa: '/zaɪ̯t van/', meaning: 'từ bao giờ, từ khi nào' },
    ],
  },
  'um wieviel uhr öffnet der laden': {
    textDe: 'Um wie viel Uhr öffnet der Laden?',
    textVi: 'Mấy giờ thì cửa hàng mở cửa vậy?',
    vocabulary: [
      { term: 'der Laden', article: 'der', ipa: '/ˈlaːdn̩/', meaning: 'cửa hàng, tiệm' },
      { term: 'öffnen', ipa: '/ˈœfnən/', meaning: 'mở cửa' },
    ],
  },
  'warum bist du so dramatisch': {
    textDe: 'Warum bist du so dramatisch?',
    textVi: 'Sao bạn lại làm quá lên kịch tính như thế?',
    vocabulary: [
      { term: 'dramatisch', ipa: '/dʁaˈmaːtɪʃ/', meaning: 'kịch tính, nghiêm trọng hóa' },
      { term: 'warum', ipa: '/vaˈʁʊm/', meaning: 'tại sao' },
    ],
  },
  'wer ist der bekannteste prominente': {
    textDe: 'Wer ist der bekannteste Prominente?',
    textVi: 'Ai là người nổi tiếng được biết đến nhiều nhất?',
    vocabulary: [
      { term: 'der Prominente', article: 'der', ipa: '/pʁomiˈnɛntə/', meaning: 'người nổi tiếng' },
      { term: 'bekannt', ipa: '/bəˈkant/', meaning: 'nổi tiếng, quen thuộc' },
    ],
  },
  'wo arbeitet dein bruder': {
    textDe: 'Wo arbeitet dein Bruder?',
    textVi: 'Anh trai của bạn làm việc ở đâu vậy?',
    vocabulary: [
      { term: 'der Bruder', article: 'der', ipa: '/ˈbʁuːdɐ/', meaning: 'anh em trai' },
      { term: 'arbeiten', ipa: '/ˈaʁbaɪ̯tn̩/', meaning: 'làm việc' },
    ],
  },
  'wo ist das nächste krankenhaus': {
    textDe: 'Wo ist das nächste Krankenhaus?',
    textVi: 'Bệnh viện gần nhất ở đâu thế?',
    vocabulary: [
      { term: 'das Krankenhaus', article: 'das', ipa: '/ˈkʁaŋkn̩ˌhaʊ̯s/', meaning: 'bệnh viện' },
      { term: 'nächst', ipa: '/nɛːçst/', meaning: 'gần nhất, kế tiếp' },
    ],
  },

  // === BÀI 3: TRƯỜNG HỌC, CÔNG VIỆC & SINH HOẠT HÀNG NGÀY (15 CÂU) ===
  'bitte füllen sie dieses formular aus': {
    textDe: 'Bitte füllen Sie dieses Formular aus.',
    textVi: 'Xin vui lòng điền vào mẫu đơn này.',
    vocabulary: [
      { term: 'das Formular', article: 'das', ipa: '/fɔʁmuˈlaːɐ̯/', meaning: 'mẫu đơn, phiếu khai' },
      { term: 'ausfüllen', ipa: '/ˈaʊ̯sˌfʏlən/', meaning: 'điền vào (đơn)' },
    ],
  },
  'catherine arbeitet sehr hart': {
    textDe: 'Catherine arbeitet sehr hart.',
    textVi: 'Catherine làm việc rất chăm chỉ.',
    vocabulary: [
      { term: 'hart', ipa: '/haʁt/', meaning: 'chăm chỉ, vất vả, cứng' },
      { term: 'arbeiten', ipa: '/ˈaʁbaɪ̯tn̩/', meaning: 'làm việc' },
    ],
  },
  'das schuljahr endet im juni': {
    textDe: 'Das Schuljahr endet im Juni.',
    textVi: 'Năm học kết thúc vào tháng Sáu.',
    vocabulary: [
      { term: 'das Schuljahr', article: 'das', ipa: '/ˈʃuːljaːɐ̯/', meaning: 'năm học' },
      { term: 'der Juni', article: 'der', ipa: '/ˈjuːni/', meaning: 'tháng Sáu' },
      { term: 'enden', ipa: '/ˈɛndn̩/', meaning: 'kết thúc' },
    ],
  },
  'dem stuhl fehlt ein bein': {
    textDe: 'Dem Stuhl fehlt ein Bein.',
    textVi: 'Chiếc ghế này bị gãy mất một chân.',
    vocabulary: [
      { term: 'der Stuhl', article: 'der', ipa: '/ʃtuːl/', meaning: 'chiếc ghế' },
      { term: 'das Bein', article: 'das', ipa: '/baɪ̯n/', meaning: 'chân (người/đồ vật)' },
      { term: 'fehlen', ipa: '/ˈfeːlən/', meaning: 'thiếu, vắng mặt' },
    ],
  },
  'die universität hat eine menge studenten': {
    textDe: 'Die Universität hat eine Menge Studenten.',
    textVi: 'Trường đại học có rất nhiều sinh viên theo học.',
    vocabulary: [
      { term: 'die Universität', article: 'die', ipa: '/univɛʁziˈtɛːt/', meaning: 'trường đại học' },
      { term: 'der Student', article: 'der', ipa: '/ʃtuˈdɛnt/', meaning: 'sinh viên đại học' },
      { term: 'eine Menge', article: 'die', ipa: '/ˈmɛŋə/', meaning: 'rất nhiều, một lượng lớn' },
    ],
  },
  'diese stadt hat drei kirchen': {
    textDe: 'Diese Stadt hat drei Kirchen.',
    textVi: 'Thành phố này có ba nhà thờ.',
    vocabulary: [
      { term: 'die Stadt', article: 'die', ipa: '/ʃtat/', meaning: 'thành phố' },
      { term: 'die Kirche', article: 'die', ipa: '/ˈkɪʁçə/', meaning: 'nhà thờ' },
    ],
  },
  'er geht immer früh zur arbeit': {
    textDe: 'Er geht immer früh zur Arbeit.',
    textVi: 'Anh ấy luôn đi làm từ rất sớm.',
    vocabulary: [
      { term: 'früh', ipa: '/fʁyː/', meaning: 'sớm' },
      { term: 'immer', ipa: '/ˈɪmɐ/', meaning: 'luôn luôn' },
      { term: 'zur Arbeit gehen', ipa: '/tsuːɐ̯ ˈaʁbaɪ̯t ˈɡeːən/', meaning: 'đi làm' },
    ],
  },
  'es gibt viele dinge in der schule': {
    textDe: 'Es gibt viele Dinge in der Schule.',
    textVi: 'Có rất nhiều điều thú vị ở trường học.',
    vocabulary: [
      { term: 'das Ding', article: 'das', ipa: '/dɪŋ/', meaning: 'điều, đồ vật' },
      { term: 'es gibt', ipa: '/ɛs ɡiːpt/', meaning: 'có (tồn tại)' },
    ],
  },
  'es ist eine restaurant hier in der nähe': {
    textDe: 'Es ist ein Restaurant hier in der Nähe.',
    textVi: 'Có một nhà hàng ở ngay gần đây.',
    vocabulary: [
      { term: 'das Restaurant', article: 'das', ipa: '/ʁɛstoˈʁãː/', meaning: 'nhà hàng' },
      { term: 'in der Nähe', article: 'die', ipa: '/ɪn deːɐ̯ ˈnɛːə/', meaning: 'ở gần đây' },
    ],
  },
  'es tut mir leid, ich habe keinen stift': {
    textDe: 'Es tut mir leid, ich habe keinen Stift.',
    textVi: 'Xin lỗi nhé, tôi không có cây bút nào ở đây cả.',
    vocabulary: [
      { term: 'der Stift', article: 'der', ipa: '/ʃtɪft/', meaning: 'cây bút viết' },
      { term: 'leidtun', ipa: '/ˈlaɪ̯tˌtuːn/', meaning: 'lấy làm tiếc, xin lỗi' },
    ],
  },
  'ich habe den müll bereits rausgebracht': {
    textDe: 'Ich habe den Müll bereits rausgebracht.',
    textVi: 'Tôi đã mang rác ra ngoài vứt rồi.',
    vocabulary: [
      { term: 'der Müll', article: 'der', ipa: '/mʏl/', meaning: 'rác thải' },
      { term: 'rausbringen', ipa: '/ˈʁaʊ̯sˌbʁɪŋən/', meaning: 'mang ra ngoài' },
      { term: 'bereits', ipa: '/bəˈʁaɪ̯ts/', meaning: 'đã, sẵn rồi' },
    ],
  },
  'ich habe nach meinem geldbeutel gesucht': {
    textDe: 'Ich habe nach meinem Geldbeutel gesucht.',
    textVi: 'Tôi vừa tìm kiếm chiếc ví tiền của mình.',
    vocabulary: [
      { term: 'der Geldbeutel', article: 'der', ipa: '/ˈɡɛltˌbɔɪ̯tl̩/', meaning: 'ví đựng tiền' },
      { term: 'suchen nach', ipa: '/ˈzuːxn̩ naːx/', meaning: 'tìm kiếm cái gì' },
    ],
  },
  'ich habe noch nicht zu mittag gegessen': {
    textDe: 'Ich habe noch nicht zu Mittag gegessen.',
    textVi: 'Tôi vẫn chưa ăn trưa.',
    vocabulary: [
      { term: 'das Mittagessen', article: 'das', ipa: '/ˈmɪtaːkˌʔɛsn̩/', meaning: 'bữa trưa' },
      { term: 'zu Mittag essen', ipa: '/tsuː ˈmɪtaːk ˈʔɛsn̩/', meaning: 'ăn trưa' },
      { term: 'noch nicht', ipa: '/nɔx nɪçt/', meaning: 'vẫn chưa' },
    ],
  },
  'ich muss jetzt gehen. tschüss': {
    textDe: 'Ich muss jetzt gehen. Tschüss!',
    textVi: 'Tôi phải đi bây giờ đây. Tạm biệt nhé!',
    vocabulary: [
      { term: 'müssen', ipa: '/ˈmʏsn̩/', meaning: 'phải, bắt buộc' },
      { term: 'jetzt', ipa: '/jɛtst/', meaning: 'bây giờ, ngay lúc này' },
      { term: 'tschüss', ipa: '/tʃyːs/', meaning: 'tạm biệt' },
    ],
  },
  'sie isst eine orange': {
    textDe: 'Sie isst eine Orange.',
    textVi: 'Cô ấy đang ăn một quả cam.',
    vocabulary: [
      { term: 'die Orange', article: 'die', ipa: '/oˈʁãːʒə/', meaning: 'quả cam' },
      { term: 'essen', ipa: '/ˈɛsn̩/', meaning: 'ăn uống' },
    ],
  },

  // === BÀI 4: TÌNH HUỐNG XÃ HỘI & BÀY TỎ QUAN ĐIỂM (16 CÂU) ===
  'danke für deine fortdauernde unterstützung': {
    textDe: 'Danke für deine fortdauernde Unterstützung.',
    textVi: 'Cảm ơn vì sự hỗ trợ không ngừng nghỉ của bạn.',
    vocabulary: [
      { term: 'die Unterstützung', article: 'die', ipa: '/ʊntɐˈʃtʏtsʊŋ/', meaning: 'sự hỗ trợ, giúp đỡ' },
      { term: 'fortdauernd', ipa: '/ˈfɔʁtˌdaʊ̯ɐnt/', meaning: 'liên tục, không ngừng' },
    ],
  },
  'die dorfbewohner haben den wald zerstört': {
    textDe: 'Die Dorfbewohner haben den Wald zerstört.',
    textVi: 'Những người dân trong làng đã phá hủy khu rừng.',
    vocabulary: [
      { term: 'der Dorfbewohner', article: 'der', ipa: '/ˈdɔʁfbəˌvoːnɐ/', meaning: 'người dân làng' },
      { term: 'der Wald', article: 'der', ipa: '/valt/', meaning: 'khu rừng' },
      { term: 'zerstören', ipa: '/tsɛɐ̯ˈʃtøːʁən/', meaning: 'phá hủy' },
    ],
  },
  'es gab einen autounfall': {
    textDe: 'Es gab einen Autounfall.',
    textVi: 'Đã xảy ra một vụ tai nạn ô tô.',
    vocabulary: [
      { term: 'der Autounfall', article: 'der', ipa: '/ˈaʊ̯toˌʔʊnfal/', meaning: 'tai nạn ô tô' },
      { term: 'es gab', ipa: '/ɛs ɡaːp/', meaning: 'đã xảy ra, đã có' },
    ],
  },
  'es ist länger als 2 meilen': {
    textDe: 'Es ist länger als 2 Meilen.',
    textVi: 'Quãng đường này dài hơn 2 dặm.',
    vocabulary: [
      { term: 'die Meile', article: 'die', ipa: '/ˈmaɪ̯lə/', meaning: 'dặm (đơn vị đo)' },
      { term: 'lang', ipa: '/laŋ/', meaning: 'dài' },
    ],
  },
  'gold ist ein seltenes element': {
    textDe: 'Gold ist ein seltenes Element.',
    textVi: 'Vàng là một nguyên tố quý hiếm.',
    vocabulary: [
      { term: 'das Gold', article: 'das', ipa: '/ɡɔlt/', meaning: 'vàng' },
      { term: 'das Element', article: 'das', ipa: '/eleˈmɛnt/', meaning: 'nguyên tố' },
      { term: 'selten', ipa: '/ˈzɛltn̩/', meaning: 'hiếm, ít gặp' },
    ],
  },
  'heute ist es draußen sonnig': {
    textDe: 'Heute ist es draußen sonnig.',
    textVi: 'Hôm nay ngoài trời nắng đẹp.',
    vocabulary: [
      { term: 'draußen', ipa: '/ˈdʁaʊ̯sn̩/', meaning: 'ở ngoài trời' },
      { term: 'sonnig', ipa: '/ˈzɔnɪç/', meaning: 'có nắng, chan hòa ánh nắng' },
    ],
  },
  'kinder mögen normalerweise süßigkeiten': {
    textDe: 'Kinder mögen normalerweise Süßigkeiten.',
    textVi: 'Trẻ em thường rất thích đồ ngọt.',
    vocabulary: [
      { term: 'das Kind', article: 'das', ipa: '/kɪnt/', meaning: 'đứa trẻ, trẻ con' },
      { term: 'die Süßigkeit', article: 'die', ipa: '/ˈzyːsɪçkaɪ̯t/', meaning: 'kẹo, bánh đồ ngọt' },
      { term: 'normalerweise', ipa: '/nɔʁˈmaːlɐˌvaɪ̯zə/', meaning: 'thông thường' },
    ],
  },
  'mein freund hat drei hunde': {
    textDe: 'Mein Freund hat drei Hunde.',
    textVi: 'Bạn của tôi nuôi ba chú chó.',
    vocabulary: [
      { term: 'der Hund', article: 'der', ipa: '/hʊnt/', meaning: 'con chó' },
      { term: 'der Freund', article: 'der', ipa: '/fʁɔɪ̯nt/', meaning: 'người bạn' },
    ],
  },
  'mein lehrer ist so nett zu mir': {
    textDe: 'Mein Lehrer ist so nett zu mir.',
    textVi: 'Thầy giáo đối xử rất tốt bụng với tôi.',
    vocabulary: [
      { term: 'nett', ipa: '/nɛt/', meaning: 'tốt bụng, thân thiện' },
      { term: 'zu jemandem nett sein', ipa: '/tsuː nɛt zaɪ̯n/', meaning: 'tốt với ai' },
    ],
  },
  'newton fand die theorie der schwerkraft': {
    textDe: 'Newton fand die Theorie der Schwerkraft.',
    textVi: 'Newton đã tìm ra thuyết vạn vật hấp dẫn.',
    vocabulary: [
      { term: 'die Theorie', article: 'die', ipa: '/teoˈʁiː/', meaning: 'lý thuyết, định lý' },
      { term: 'die Schwerkraft', article: 'die', ipa: '/ˈʃveːɐ̯kʁaft/', meaning: 'lực hấp dẫn, trọng lực' },
    ],
  },
  'oktober ist mein lieblingsmonat': {
    textDe: 'Oktober ist mein Lieblingsmonat.',
    textVi: 'Tháng Mười là tháng yêu thích nhất của tôi.',
    vocabulary: [
      { term: 'der Oktober', article: 'der', ipa: '/ɔkˈtoːbɐ/', meaning: 'tháng Mười' },
      { term: 'der Lieblingsmonat', article: 'der', ipa: '/ˈliːblɪŋsmoːnat/', meaning: 'tháng yêu thích nhất' },
    ],
  },
  'schmetterlinge haben zwei flügel': {
    textDe: 'Schmetterlinge haben zwei Flügel.',
    textVi: 'Những chú bướm có hai đôi cánh.',
    vocabulary: [
      { term: 'der Schmetterling', article: 'der', ipa: '/ˈʃmɛtɐlɪŋ/', meaning: 'con bướm' },
      { term: 'der Flügel', article: 'der', ipa: '/ˈflyːɡl̩/', meaning: 'đôi cánh' },
    ],
  },
  'sie haben früher kontaktlinsen benutzt': {
    textDe: 'Sie haben früher Kontaktlinsen benutzt.',
    textVi: 'Trước đây họ từng đeo kính áp tròng.',
    vocabulary: [
      { term: 'die Kontaktlinse', article: 'die', ipa: '/kɔnˈtaktˌlɪnzə/', meaning: 'kính áp tròng' },
      { term: 'früher', ipa: '/ˈfʁyːɐ̯/', meaning: 'trước kia, ngày xưa' },
      { term: 'benutzen', ipa: '/bəˈnʊtsn̩/', meaning: 'sử dụng, dùng' },
    ],
  },
  'sie mögen post-rock-musik': {
    textDe: 'Sie mögen Post-Rock-Musik.',
    textVi: 'Họ yêu thích thể loại nhạc Post-Rock.',
    vocabulary: [
      { term: 'die Musik', article: 'die', ipa: '/muˈziːk/', meaning: 'âm nhạc' },
      { term: 'die Post-Rock-Musik', article: 'die', ipa: '/poːst ʁɔk muˈziːk/', meaning: 'nhạc hậu rock' },
    ],
  },
  'sie sitzt auf dem sofa': {
    textDe: 'Sie sitzt auf dem Sofa.',
    textVi: 'Cô ấy đang ngồi nghỉ trên ghế sofa.',
    vocabulary: [
      { term: 'das Sofa', article: 'das', ipa: '/ˈzoːfa/', meaning: 'ghế đi-văng, ghế sô-pha' },
      { term: 'sitzen', ipa: '/ˈzɪtsn̩/', meaning: 'ngồi' },
    ],
  },
  'tom hat seinen geruchssinn verloren': {
    textDe: 'Tom hat seinen Geruchssinn verloren.',
    textVi: 'Tom đã bị mất đi khứu giác của mình.',
    vocabulary: [
      { term: 'der Geruchssinn', article: 'der', ipa: '/ɡəˈʁʊxsˌzɪn/', meaning: 'khứu giác' },
      { term: 'verlieren', ipa: '/fɛɐ̯ˈliːʁən/', meaning: 'đánh mất' },
    ],
  },

  // === BÀI 5: CẤU TRÚC CÂU PHỨC & MỆNH ĐỀ PHỤ TIẾNG ĐỨC (15 CÂU) ===
  'ich bin mir sicher, dass sie recht hat': {
    textDe: 'Ich bin mir sicher, dass sie recht hat.',
    textVi: 'Tôi chắc chắn rằng cô ấy đã nói đúng.',
    vocabulary: [
      { term: 'sicher', ipa: '/ˈzɪçɐ/', meaning: 'chắc chắn, an toàn' },
      { term: 'recht haben', ipa: '/ʁɛçt ˈhaːbn̩/', meaning: 'có lý, nói đúng' },
    ],
  },
  'ich dachte, er hätte etwas anderes gesagt': {
    textDe: 'Ich dachte, er hätte etwas anderes gesagt.',
    textVi: 'Tôi cứ ngỡ là anh ấy đã nói một điều gì khác cơ.',
    vocabulary: [
      { term: 'denken', ipa: '/ˈdɛŋkn̩/', meaning: 'nghĩ, tưởng rằng' },
      { term: 'etwas anderes', ipa: '/ˈɛtvas ˈʔandəʁəs/', meaning: 'điều khác biệt' },
    ],
  },
  'ich finde die situation eigenartig': {
    textDe: 'Ich finde die Situation eigenartig.',
    textVi: 'Tôi thấy tình huống này khá kỳ lạ và khác thường.',
    vocabulary: [
      { term: 'die Situation', article: 'die', ipa: '/zitu̯aˈtsi̯oːn/', meaning: 'tình huống, hoàn cảnh' },
      { term: 'eigenartig', ipa: '/ˈaɪ̯ɡn̩ˌʔaːɐ̯tɪç/', meaning: 'kỳ lạ, khác thường' },
    ],
  },
  'ich glaube, dass ich zum arzt muss': {
    textDe: 'Ich glaube, dass ich zum Arzt muss.',
    textVi: 'Tôi nghĩ rằng mình phải đi gặp bác sĩ thôi.',
    vocabulary: [
      { term: 'der Arzt', article: 'der', ipa: '/aːɐ̯tst/', meaning: 'bác sĩ' },
      { term: 'glauben', ipa: '/ˈɡlaʊ̯bn̩/', meaning: 'tin rằng, cho rằng' },
    ],
  },
  'ich werde diesen moment niemals vergessen': {
    textDe: 'Ich werde diesen Moment niemals vergessen.',
    textVi: 'Tôi sẽ không bao giờ quên đi khoảnh khắc thiêng liêng này.',
    vocabulary: [
      { term: 'der Moment', article: 'der', ipa: '/moˈmɛnt/', meaning: 'khoảnh khắc, giây phút' },
      { term: 'vergessen', ipa: '/fɛɐ̯ˈɡɛsn̩/', meaning: 'quên lãng' },
      { term: 'niemals', ipa: '/ˈniːmaːls/', meaning: 'không bao giờ' },
    ],
  },
  'ich würde gerne eine reservierung vornehmen': {
    textDe: 'Ich würde gerne eine Reservierung vornehmen.',
    textVi: 'Tôi muốn tiến hành đặt chỗ trước.',
    vocabulary: [
      { term: 'die Reservierung', article: 'die', ipa: '/ʁezɛʁˈviːʁʊŋ/', meaning: 'việc đặt chỗ trước' },
      { term: 'vornehmen', ipa: '/ˈfoːɐ̯ˌneːmən/', meaning: 'tiến hành, thực hiện' },
    ],
  },
  'ich würde gerne mit dir reden, bitte': {
    textDe: 'Ich würde gerne mit dir reden, bitte.',
    textVi: 'Làm ơn, tôi rất muốn được trò chuyện cùng bạn.',
    vocabulary: [
      { term: 'reden mit', ipa: '/ˈʁeːdn̩ mɪt/', meaning: 'trò chuyện, nói chuyện với ai' },
    ],
  },
  'sie ist die anführererin des gruppenprojekts': {
    textDe: 'Sie ist die Anführerin des Gruppenprojekts.',
    textVi: 'Cô ấy là trưởng nhóm của dự án làm việc chung này.',
    vocabulary: [
      { term: 'die Anführerin', article: 'die', ipa: '/ˈanfyːʁəʁɪn/', meaning: 'người dẫn đầu, trưởng nhóm nữ' },
      { term: 'das Gruppenprojekt', article: 'das', ipa: '/ˈɡʁʊpn̩pʁoˌjɛkt/', meaning: 'dự án nhóm' },
    ],
  },
  'sie ist eine exzellenter köchin': {
    textDe: 'Sie ist eine exzellente Köchin.',
    textVi: 'Cô ấy là một đầu bếp vô cùng xuất sắc.',
    vocabulary: [
      { term: 'die Köchin', article: 'die', ipa: '/ˈkœçɪn/', meaning: 'nữ đầu bếp' },
      { term: 'exzellent', ipa: '/ɛkstseˈlɛnt/', meaning: 'xuất sắc, tuyệt hảo' },
    ],
  },
  'was bedeutet es amerikanisch zu sein': {
    textDe: 'Was bedeutet es, amerikanisch zu sein?',
    textVi: 'Là người Mỹ có ý nghĩa như thế nào?',
    vocabulary: [
      { term: 'bedeuten', ipa: '/bəˈdɔɪ̯tn̩/', meaning: 'có ý nghĩa, mang nghĩa là' },
      { term: 'amerikanisch', ipa: '/ameʁiˈkaːnɪʃ/', meaning: 'thuộc về nước Mỹ' },
    ],
  },
  'was ist der herkömmliche weg das zu tun': {
    textDe: 'Was ist der herkömmliche Weg, das zu tun?',
    textVi: 'Đâu là cách thông thường truyền thống để làm điều đó?',
    vocabulary: [
      { term: 'der Weg', article: 'der', ipa: '/veːk/', meaning: 'phương thức, cách thức' },
      { term: 'herkömmlich', ipa: '/ˈheːɐ̯ˌkœmlɪç/', meaning: 'thông thường, truyền thống' },
    ],
  },
  'was ist hier die primäre attraktion': {
    textDe: 'Was ist hier die primäre Attraktion?',
    textVi: 'Điểm thu hút du khách chính ở nơi này là gì vậy?',
    vocabulary: [
      { term: 'die Attraktion', article: 'die', ipa: '/atʁakˈtsi̯oːn/', meaning: 'điểm thu hút, điểm hấp dẫn' },
      { term: 'primär', ipa: '/pʁiˈmɛːɐ̯/', meaning: 'chủ yếu, hàng đầu' },
    ],
  },
  'was machen leute hier normalerweise': {
    textDe: 'Was machen Leute hier normalerweise?',
    textVi: 'Mọi người ở đây thường làm những hoạt động gì?',
    vocabulary: [
      { term: 'die Leute', article: 'die', ipa: '/ˈlɔɪ̯tə/', meaning: 'mọi người (số nhiều)' },
      { term: 'normalerweise', ipa: '/nɔʁˈmaːlɐˌvaɪ̯zə/', meaning: 'thông thường' },
    ],
  },
  'was machst du unter dem tisch': {
    textDe: 'Was machst du unter dem Tisch?',
    textVi: 'Bạn đang làm gì dưới gầm bàn thế?',
    vocabulary: [
      { term: 'der Tisch', article: 'der', ipa: '/tɪʃ/', meaning: 'cái bàn' },
      { term: 'unter', ipa: '/ˈʊntɐ/', meaning: 'ở dưới, bên dưới' },
    ],
  },
  'wie würdest du die situation bewerten': {
    textDe: 'Wie würdest du die Situation bewerten?',
    textVi: 'Bạn sẽ đánh giá tình huống này như thế nào?',
    vocabulary: [
      { term: 'die Situation', article: 'die', ipa: '/zitu̯aˈtsi̯oːn/', meaning: 'tình huống' },
      { term: 'bewerten', ipa: '/bəˈveːɐ̯tn̩/', meaning: 'đánh giá, thẩm định' },
    ],
  },

  // === 40 DUAL-VOICE EXTENDED SENTENCES ===
  'bitte zieh deine schuhe aus': {
      "textDe": "Bitte zieh deine Schuhe aus.",
      "textVi": "Làm ơn hãy cởi giày của bạn ra.",
      "vocabulary": [
          {
              "term": "der Schuh",
              "article": "der",
              "ipa": "/ʃuː/",
              "meaning": "chiếc giày"
          },
          {
              "term": "ausziehen",
              "ipa": "/ˈaʊ̯sˌtsiːən/",
              "meaning": "cởi ra (giày, áo)"
          },
          {
              "term": "bitte",
              "ipa": "/ˈbɪtə/",
              "meaning": "làm ơn, xin vui lòng"
          }
      ]
  },
  'blau ist meine lieblingsfarbe': {
      "textDe": "Blau ist meine Lieblingsfarbe.",
      "textVi": "Màu xanh da trời là màu yêu thích của tôi.",
      "vocabulary": [
          {
              "term": "die Lieblingsfarbe",
              "article": "die",
              "ipa": "/ˈliːblɪŋsˌfaʁbə/",
              "meaning": "màu sắc yêu thích"
          },
          {
              "term": "blau",
              "ipa": "/blaʊ̯/",
              "meaning": "xanh lam, xanh da trời"
          }
      ]
  },
  'der lehrer ist der leiter im klassenzimmer': {
      "textDe": "Der Lehrer ist der Leiter im Klassenzimmer.",
      "textVi": "Thầy giáo là người quản lý trong lớp học.",
      "vocabulary": [
          {
              "term": "der Lehrer",
              "article": "der",
              "ipa": "/ˈleːʁɐ/",
              "meaning": "thầy giáo"
          },
          {
              "term": "der Leiter",
              "article": "der",
              "ipa": "/ˈlaɪ̯tɐ/",
              "meaning": "người phụ trách, người đứng đầu"
          },
          {
              "term": "das Klassenzimmer",
              "article": "das",
              "ipa": "/ˈklasn̩ˌtsɪmɐ/",
              "meaning": "phòng học, lớp học"
          }
      ]
  },
  'die lebenskosten in san francisco steigen': {
      "textDe": "Die Lebenskosten in San Francisco steigen.",
      "textVi": "Chi phí sinh hoạt tại San Francisco đang tăng lên.",
      "vocabulary": [
          {
              "term": "die Lebenskosten",
              "article": "die",
              "ipa": "/ˈleːbn̩sˌkɔstn̩/",
              "meaning": "chi phí sinh hoạt"
          },
          {
              "term": "steigen",
              "ipa": "/ˈʃtaɪ̯ɡn̩/",
              "meaning": "tăng lên, leo thang"
          }
      ]
  },
  'diese schlangen sind tödlich': {
      "textDe": "Diese Schlangen sind tödlich.",
      "textVi": "Những con rắn này có độc chết người.",
      "vocabulary": [
          {
              "term": "die Schlange",
              "article": "die",
              "ipa": "/ˈʃlaŋə/",
              "meaning": "con rắn"
          },
          {
              "term": "tödlich",
              "ipa": "/ˈtøːtlɪç/",
              "meaning": "gây chết người, nguy hiểm trí mạng"
          }
      ]
  },
  'du machst jeden tag andere sachen': {
      "textDe": "Du machst jeden Tag andere Sachen.",
      "textVi": "Mỗi ngày bạn đều làm những việc khác nhau.",
      "vocabulary": [
          {
              "term": "der Tag",
              "article": "der",
              "ipa": "/taːk/",
              "meaning": "ngày"
          },
          {
              "term": "die Sache",
              "article": "die",
              "ipa": "/ˈzaxə/",
              "meaning": "việc, đồ vật"
          },
          {
              "term": "anders",
              "ipa": "/ˈandɐs/",
              "meaning": "khác, khác biệt"
          }
      ]
  },
  'er arbeitet immer spät': {
      "textDe": "Er arbeitet immer spät.",
      "textVi": "Anh ấy luôn luôn làm việc đến muộn.",
      "vocabulary": [
          {
              "term": "arbeiten",
              "ipa": "/ˈaʁbaɪ̯tn̩/",
              "meaning": "làm việc"
          },
          {
              "term": "immer",
              "ipa": "/ˈɪmɐ/",
              "meaning": "luôn luôn"
          },
          {
              "term": "spät",
              "ipa": "/ʃpɛːt/",
              "meaning": "muộn, trễ"
          }
      ]
  },
  'er hat sie zum ersten mal geküsst': {
      "textDe": "Er hat sie zum ersten Mal geküsst.",
      "textVi": "Anh ấy đã trao cho cô ấy nụ hôn đầu tiên.",
      "vocabulary": [
          {
              "term": "das Mal",
              "article": "das",
              "ipa": "/maːl/",
              "meaning": "lần"
          },
          {
              "term": "küssen",
              "ipa": "/ˈkʏsn̩/",
              "meaning": "hôn"
          },
          {
              "term": "erst",
              "ipa": "/eːɐ̯st/",
              "meaning": "đầu tiên"
          }
      ]
  },
  'erfolg ist das ergebnis harter arbeit': {
      "textDe": "Erfolg ist das Ergebnis harter Arbeit.",
      "textVi": "Thành công chính là kết quả của sự nỗ lực làm việc chăm chỉ.",
      "vocabulary": [
          {
              "term": "der Erfolg",
              "article": "der",
              "ipa": "/ɛɐ̯ˈfɔlk/",
              "meaning": "thành công"
          },
          {
              "term": "das Ergebnis",
              "article": "das",
              "ipa": "/ɛɐ̯ˈɡeːpnɪs/",
              "meaning": "kết quả"
          },
          {
              "term": "die Arbeit",
              "article": "die",
              "ipa": "/ˈaʁbaɪ̯t/",
              "meaning": "lao động, công việc"
          },
          {
              "term": "hart",
              "ipa": "/haʁt/",
              "meaning": "chăm chỉ, gian khổ"
          }
      ]
  },
  'hast du jon gesehen -- er ist im badezimmer': {
      "textDe": "Hast du Jon gesehen? – Er ist im Badezimmer.",
      "textVi": "Bạn có thấy Jon đâu không? – Cậu ấy đang ở trong phòng tắm.",
      "vocabulary": [
          {
              "term": "das Badezimmer",
              "article": "das",
              "ipa": "/ˈbaːdəˌtsɪmɐ/",
              "meaning": "phòng tắm"
          },
          {
              "term": "sehen",
              "ipa": "/ˈzeːən/",
              "meaning": "nhìn thấy, trông thấy"
          }
      ]
  },
  'hast du schon in diesem restaurant gegessen': {
      "textDe": "Hast du schon in diesem Restaurant gegessen?",
      "textVi": "Bạn đã từng ăn tại nhà hàng này bao giờ chưa?",
      "vocabulary": [
          {
              "term": "das Restaurant",
              "article": "das",
              "ipa": "/ʁɛstoˈʁãː/",
              "meaning": "nhà hàng"
          },
          {
              "term": "essen",
              "ipa": "/ˈɛsn̩/",
              "meaning": "ăn uống"
          },
          {
              "term": "schon",
              "ipa": "/ʃoːn/",
              "meaning": "đã, từng"
          }
      ]
  },
  'ich bin optimistisch über die zukunft': {
      "textDe": "Ich bin optimistisch über die Zukunft.",
      "textVi": "Tôi rất lạc quan về tương lai.",
      "vocabulary": [
          {
              "term": "die Zukunft",
              "article": "die",
              "ipa": "/ˈtsuːkʊnft/",
              "meaning": "tương lai"
          },
          {
              "term": "optimistisch",
              "ipa": "/ɔptiˈmɪstɪʃ/",
              "meaning": "lạc quan"
          }
      ]
  },
  'ich fahre in vier tagen nach hause': {
      "textDe": "Ich fahre in vier Tagen nach Hause.",
      "textVi": "Tôi sẽ trở về nhà trong bốn ngày tới.",
      "vocabulary": [
          {
              "term": "der Tag",
              "article": "der",
              "ipa": "/taːk/",
              "meaning": "ngày"
          },
          {
              "term": "nach Hause",
              "ipa": "/naːx ˈhaʊ̯zə/",
              "meaning": "về nhà"
          },
          {
              "term": "fahren",
              "ipa": "/ˈfaːʁən/",
              "meaning": "lái xe, đi xe"
          }
      ]
  },
  'ich habe ein handyladegerät': {
      "textDe": "Ich habe ein Handyladegerät.",
      "textVi": "Tôi có một bộ sạc điện thoại di động.",
      "vocabulary": [
          {
              "term": "das Handyladegerät",
              "article": "das",
              "ipa": "/ˈhɛndiˌlaːdəɡəˌʁɛːt/",
              "meaning": "cục sạc điện thoại"
          },
          {
              "term": "das Handy",
              "article": "das",
              "ipa": "/ˈhɛndi/",
              "meaning": "điện thoại di động"
          },
          {
              "term": "haben",
              "ipa": "/ˈhaːbn̩/",
              "meaning": "có"
          }
      ]
  },
  'ich muss meine schuhe zubinden': {
      "textDe": "Ich muss meine Schuhe zubinden.",
      "textVi": "Tôi phải buộc lại dây giày của mình.",
      "vocabulary": [
          {
              "term": "die Schuhe",
              "article": "die",
              "ipa": "/ˈʃuːə/",
              "meaning": "đôi giày (số nhiều)"
          },
          {
              "term": "zubinden",
              "ipa": "/ˈtsuːˌbɪndn̩/",
              "meaning": "buộc lại, thắt lại"
          },
          {
              "term": "müssen",
              "ipa": "/ˈmʏsn̩/",
              "meaning": "phải"
          }
      ]
  },
  'ich will ein aufregendes abenteuer': {
      "textDe": "Ich will ein aufregendes Abenteuer.",
      "textVi": "Tôi muốn có một chuyến phiêu lưu thật thú vị.",
      "vocabulary": [
          {
              "term": "das Abenteuer",
              "article": "das",
              "ipa": "/ˈaːbn̩ˌtɔɪ̯ɐ/",
              "meaning": "chuyến phiêu lưu"
          },
          {
              "term": "aufregend",
              "ipa": "/ˈaʊ̯fˌʁeːɡn̩t/",
              "meaning": "thú vị, hấp dẫn"
          },
          {
              "term": "wollen",
              "ipa": "/ˈvɔlən/",
              "meaning": "muốn"
          }
      ]
  },
  'ihr auto ist auf dem weg zum flughafen': {
      "textDe": "Ihr Auto ist auf dem Weg zum Flughafen.",
      "textVi": "Chiếc ô tô của họ đang trên đường tới sân bay.",
      "vocabulary": [
          {
              "term": "das Auto",
              "article": "das",
              "ipa": "/ˈaʊ̯to/",
              "meaning": "ô tô, xe hơi"
          },
          {
              "term": "der Weg",
              "article": "der",
              "ipa": "/veːk/",
              "meaning": "đường đi"
          },
          {
              "term": "der Flughafen",
              "article": "der",
              "ipa": "/ˈfluːkˌhaːfn̩/",
              "meaning": "sân bay, phi trường"
          }
      ]
  },
  'interessierst du dich für amerikanische politik': {
      "textDe": "Interessierst du dich für amerikanische Politik?",
      "textVi": "Bạn có quan tâm đến chính trị nước Mỹ không?",
      "vocabulary": [
          {
              "term": "die Politik",
              "article": "die",
              "ipa": "/poliˈtiːk/",
              "meaning": "chính trị"
          },
          {
              "term": "sich interessieren für",
              "ipa": "/zɪç ɪntəʁɛˈsiːʁən fyːɐ̯/",
              "meaning": "quan tâm đến"
          },
          {
              "term": "amerikanisch",
              "ipa": "/ameʁiˈkaːnɪʃ/",
              "meaning": "thuộc về nước Mỹ"
          }
      ]
  },
  'jemand schwimmt im see': {
      "textDe": "Jemand schwimmt im See.",
      "textVi": "Có ai đó đang bơi ở dưới hồ.",
      "vocabulary": [
          {
              "term": "der See",
              "article": "der",
              "ipa": "/zeː/",
              "meaning": "hồ nước"
          },
          {
              "term": "schwimmen",
              "ipa": "/ˈʃvɪmən/",
              "meaning": "bơi lội"
          },
          {
              "term": "jemand",
              "ipa": "/ˈjeːmant/",
              "meaning": "ai đó, người nào đó"
          }
      ]
  },
  'kannst du den mann auf dem bild identifizieren': {
      "textDe": "Kannst du den Mann auf dem Bild identifizieren?",
      "textVi": "Bạn có thể nhận dạng được người đàn ông trong bức ảnh không?",
      "vocabulary": [
          {
              "term": "der Mann",
              "article": "der",
              "ipa": "/man/",
              "meaning": "người đàn ông"
          },
          {
              "term": "das Bild",
              "article": "das",
              "ipa": "/bɪlt/",
              "meaning": "bức tranh, bức ảnh"
          },
          {
              "term": "identifizieren",
              "ipa": "/idɛntifiˈtsiːʁən/",
              "meaning": "nhận diện, xác định"
          }
      ]
  },
  'leben wir in derselben staße': {
      "textDe": "Leben wir in derselben Straße?",
      "textVi": "Chúng ta có đang sống trên cùng một con phố không?",
      "vocabulary": [
          {
              "term": "die Straße",
              "article": "die",
              "ipa": "/ˈʃtʁaːsə/",
              "meaning": "con đường, đường phố"
          },
          {
              "term": "leben",
              "ipa": "/ˈleːbn̩/",
              "meaning": "sống, cư trú"
          },
          {
              "term": "derselbe",
              "ipa": "/deːɐ̯ˈzɛlbə/",
              "meaning": "cùng một"
          }
      ]
  },
  'linguistik ist die studie der sprache': {
      "textDe": "Linguistik ist die Studie der Sprache.",
      "textVi": "Ngôn ngữ học là công trình nghiên cứu về ngôn ngữ.",
      "vocabulary": [
          {
              "term": "die Linguistik",
              "article": "die",
              "ipa": "/lɪŋˈɡu̯ɪstɪk/",
              "meaning": "ngôn ngữ học"
          },
          {
              "term": "die Studie",
              "article": "die",
              "ipa": "/ˈʃtuːdi̯ə/",
              "meaning": "nghiên cứu, khảo sát"
          },
          {
              "term": "die Sprache",
              "article": "die",
              "ipa": "/ˈʃpʁaːxə/",
              "meaning": "ngôn ngữ"
          }
      ]
  },
  'rennt er oft draußen': {
      "textDe": "Rennt er oft draußen?",
      "textVi": "Cậu ấy có hay chạy bộ ở bên ngoài trời không?",
      "vocabulary": [
          {
              "term": "rennen",
              "ipa": "/ˈʁɛnən/",
              "meaning": "chạy"
          },
          {
              "term": "oft",
              "ipa": "/ɔft/",
              "meaning": "thường xuyên"
          },
          {
              "term": "draußen",
              "ipa": "/ˈdʁaʊ̯sn̩/",
              "meaning": "ở bên ngoài trời"
          }
      ]
  },
  'schach ist ein strategisches spiel': {
      "textDe": "Schach ist ein strategisches Spiel.",
      "textVi": "Cờ vua là một trò chơi mang tính chiến thuật.",
      "vocabulary": [
          {
              "term": "das Schach",
              "article": "das",
              "ipa": "/ʃax/",
              "meaning": "cờ vua"
          },
          {
              "term": "das Spiel",
              "article": "das",
              "ipa": "/ʃpiːl/",
              "meaning": "trò chơi"
          },
          {
              "term": "strategisch",
              "ipa": "/ʃtʁaˈteːɡɪʃ/",
              "meaning": "có tính chiến lược"
          }
      ]
  },
  'sei vorsichtig am kamin': {
      "textDe": "Sei vorsichtig am Kamin.",
      "textVi": "Hãy cẩn thận khi đứng gần lò sưởi.",
      "vocabulary": [
          {
              "term": "der Kamin",
              "article": "der",
              "ipa": "/kaˈmiːn/",
              "meaning": "lò sưởi"
          },
          {
              "term": "vorsichtig",
              "ipa": "/ˈfoːɐ̯ˌzɪçtɪç/",
              "meaning": "cẩn thận, cẩn trọng"
          }
      ]
  },
  'sie frühstückt oft nicht': {
      "textDe": "Sie frühstückt oft nicht.",
      "textVi": "Cô ấy thường xuyên bỏ bữa ăn sáng.",
      "vocabulary": [
          {
              "term": "frühstücken",
              "ipa": "/ˈfʁyːˌʃtʏkn̩/",
              "meaning": "ăn sáng"
          },
          {
              "term": "oft",
              "ipa": "/ɔft/",
              "meaning": "thường xuyên"
          }
      ]
  },
  'sie rasten die strecke entlang': {
      "textDe": "Sie rasten die Strecke entlang.",
      "textVi": "Họ phóng xe lao vút dọc theo con đường.",
      "vocabulary": [
          {
              "term": "die Strecke",
              "article": "die",
              "ipa": "/ˈʃtʁɛkə/",
              "meaning": "chặng đường, tuyến đường"
          },
          {
              "term": "rasen",
              "ipa": "/ˈʁaːzn̩/",
              "meaning": "phóng nhanh, lao nhanh"
          },
          {
              "term": "entlang",
              "ipa": "/ɛntˈlaŋ/",
              "meaning": "dọc theo"
          }
      ]
  },
  'verzeihung, was hast du gesagt': {
      "textDe": "Verzeihung, was hast du gesagt?",
      "textVi": "Xin lỗi, bạn vừa nói điều gì thế?",
      "vocabulary": [
          {
              "term": "die Verzeihung",
              "article": "die",
              "ipa": "/fɛɐ̯ˈtsaɪ̯ʊŋ/",
              "meaning": "sự tha thứ, xin lỗi"
          },
          {
              "term": "sagen",
              "ipa": "/ˈzaːɡn̩/",
              "meaning": "nói"
          }
      ]
  },
  'wann hat jeff den müll rausgebracht': {
      "textDe": "Wann hat Jeff den Müll rausgebracht?",
      "textVi": "Jeff đã đem rác đi đổ lúc mấy giờ?",
      "vocabulary": [
          {
              "term": "der Müll",
              "article": "der",
              "ipa": "/mʏl/",
              "meaning": "rác rưởi"
          },
          {
              "term": "rausbringen",
              "ipa": "/ˈʁaʊ̯sˌbʁɪŋən/",
              "meaning": "đem ra ngoài, mang đi đổ"
          },
          {
              "term": "wann",
              "ipa": "/van/",
              "meaning": "khi nào"
          }
      ]
  },
  'wann schließt das museum': {
      "textDe": "Wann schließt das Museum?",
      "textVi": "Khi nào thì bảo tàng đóng cửa?",
      "vocabulary": [
          {
              "term": "das Museum",
              "article": "das",
              "ipa": "/muˈzeːʊm/",
              "meaning": "viện bảo tàng"
          },
          {
              "term": "schließen",
              "ipa": "/ˈʃliːsn̩/",
              "meaning": "đóng cửa"
          },
          {
              "term": "wann",
              "ipa": "/van/",
              "meaning": "khi nào"
          }
      ]
  },
  'warst du gestern abend in der bibliothek': {
      "textDe": "Warst du gestern Abend in der Bibliothek?",
      "textVi": "Tối hôm qua bạn có ở thư viện không?",
      "vocabulary": [
          {
              "term": "die Bibliothek",
              "article": "die",
              "ipa": "/biblioˈteːk/",
              "meaning": "thư viện"
          },
          {
              "term": "gestern Abend",
              "ipa": "/ˈɡɛstɐn ˈaːbn̩t/",
              "meaning": "tối hôm qua"
          }
      ]
  },
  'warst du von den guten neuigkeiten überrascht': {
      "textDe": "Warst du von den guten Neuigkeiten überrascht?",
      "textVi": "Bạn có cảm thấy ngạc nhiên trước những tin tức tốt lành đó không?",
      "vocabulary": [
          {
              "term": "die Neuigkeit",
              "article": "die",
              "ipa": "/ˈnɔɪ̯ɪçkaɪ̯t/",
              "meaning": "tin tức mới, tin vui"
          },
          {
              "term": "überrascht",
              "ipa": "/yːbɐˈʁaʃt/",
              "meaning": "bất ngờ, ngạc nhiên"
          }
      ]
  },
  'weißt du, wie man zum hotel kommt': {
      "textDe": "Weißt du, wie man zum Hotel kommt?",
      "textVi": "Bạn có biết đường đi đến khách sạn như thế nào không?",
      "vocabulary": [
          {
              "term": "das Hotel",
              "article": "das",
              "ipa": "/hoˈtɛl/",
              "meaning": "khách sạn"
          },
          {
              "term": "wissen",
              "ipa": "/ˈvɪsn̩/",
              "meaning": "biết"
          },
          {
              "term": "kommen",
              "ipa": "/ˈkɔmən/",
              "meaning": "đi đến, tới"
          }
      ]
  },
  'wie geht es ihnen jetzt': {
      "textDe": "Wie geht es Ihnen jetzt?",
      "textVi": "Bây giờ ngài cảm thấy như thế nào rồi?",
      "vocabulary": [
          {
              "term": "wie geht es",
              "ipa": "/viː ɡeːt ɛs/",
              "meaning": "sức khỏe thế nào, ra sao"
          },
          {
              "term": "jetzt",
              "ipa": "/jɛtst/",
              "meaning": "bây giờ, hiện tại"
          }
      ]
  },
  'wie war das wetter als du auf hawaii warst': {
      "textDe": "Wie war das Wetter, als du auf Hawaii warst?",
      "textVi": "Thời tiết thế nào khi bạn ở Hawaii?",
      "vocabulary": [
          {
              "term": "das Wetter",
              "article": "das",
              "ipa": "/ˈvɛtɐ/",
              "meaning": "thời tiết"
          },
          {
              "term": "als",
              "ipa": "/als/",
              "meaning": "khi (trong quá khứ)"
          }
      ]
  },
  'wieviel hat das zugticket gekostet': {
      "textDe": "Wie viel hat das Zugticket gekostet?",
      "textVi": "Chiếc vé tàu hỏa có giá bao nhiêu tiền?",
      "vocabulary": [
          {
              "term": "das Zugticket",
              "article": "das",
              "ipa": "/ˈtsuːkˌtɪkət/",
              "meaning": "vé tàu hỏa"
          },
          {
              "term": "kosten",
              "ipa": "/ˈkɔstn̩/",
              "meaning": "có giá, trị giá"
          },
          {
              "term": "wie viel",
              "ipa": "/viː fiːl/",
              "meaning": "bao nhiêu"
          }
      ]
  },
  'wir haben rita gesehen, aber nicht javier': {
      "textDe": "Wir haben Rita gesehen, aber nicht Javier.",
      "textVi": "Chúng tôi đã gặp Rita, nhưng không gặp Javier.",
      "vocabulary": [
          {
              "term": "sehen",
              "ipa": "/ˈzeːən/",
              "meaning": "thấy, trông thấy"
          },
          {
              "term": "aber",
              "ipa": "/ˈaːbɐ/",
              "meaning": "nhưng"
          }
      ]
  },
  'wo ist das nächste restaurant': {
      "textDe": "Wo ist das nächste Restaurant?",
      "textVi": "Nhà hàng gần nhất nằm ở đâu vậy?",
      "vocabulary": [
          {
              "term": "das Restaurant",
              "article": "das",
              "ipa": "/ʁɛstoˈʁãː/",
              "meaning": "nhà hàng"
          },
          {
              "term": "nah",
              "ipa": "/naː/",
              "meaning": "gần (nächst: gần nhất)"
          },
          {
              "term": "wo",
              "ipa": "/voː/",
              "meaning": "ở đâu"
          }
      ]
  },
  'wo war sie am samstagmorgen': {
      "textDe": "Wo war sie am Samstagmorgen?",
      "textVi": "Cô ấy đã ở đâu vào sáng thứ Bảy?",
      "vocabulary": [
          {
              "term": "der Samstagmorgen",
              "article": "der",
              "ipa": "/ˈzamstaːkˌmɔʁɡn̩/",
              "meaning": "sáng thứ Bảy"
          },
          {
              "term": "wo",
              "ipa": "/voː/",
              "meaning": "ở đâu"
          }
      ]
  },
  'würdest du gerne einen film ausleihen': {
      "textDe": "Würdest du gerne einen Film ausleihen?",
      "textVi": "Bạn có muốn mượn một bộ phim về xem không?",
      "vocabulary": [
          {
              "term": "der Film",
              "article": "der",
              "ipa": "/fɪlm/",
              "meaning": "bộ phim"
          },
          {
              "term": "ausleihen",
              "ipa": "/ˈaʊ̯sˌlaɪ̯ən/",
              "meaning": "mượn, thuê"
          },
          {
              "term": "gerne",
              "ipa": "/ˈɡɛʁnə/",
              "meaning": "thích, sẵn lòng"
          }
      ]
  },
};

// Check that every single key in namItems and nuItems is present in SENTENCE_METADATA:
const allScannedKeys = new Set([...namItems.map((i) => i.key), ...nuItems.map((i) => i.key)]);
console.log(`Total unique sentence keys to import: ${allScannedKeys.size}`);

for (const k of allScannedKeys) {
  if (!SENTENCE_METADATA[k]) {
    throw new Error(`Missing metadata for sentence key: "${k}"`);
  }
}

// Map key -> items
const namItemMap = new Map(namItems.map((it) => [it.key, it]));
const nuItemMap = new Map(nuItems.map((it) => [it.key, it]));

const nuKeySet = new Set(nuItems.map((i) => i.key));
const namKeySet = new Set(namItems.map((i) => i.key));

const commonKeys = [...namKeySet].filter((k) => nuKeySet.has(k)).sort();
const namOnlyKeys = [...namKeySet].filter((k) => !nuKeySet.has(k)).sort();
const nuOnlyKeys = [...nuKeySet].filter((k) => !namKeySet.has(k)).sort();

console.log(`Found ${commonKeys.length} common keys, ${namOnlyKeys.length} NAM-only, ${nuOnlyKeys.length} NU-only.`);

// 11 Packages distribution:
// Total items = 172.
// Packages 1-7: 16 items each (10-11 male, 5-6 female)
// Packages 8-11: 15 items each (10 male, 5 female)
const NUM_PACKAGES = 11;
const packageBuckets = Array.from({ length: NUM_PACKAGES }, () => ({
  maleItems: [],
  femaleItems: [],
}));

// Distribute common keys:
// female item in pF = i % 11
// male item in pM = (i + 5) % 11
// Guaranteed: (i + 5) % 11 !== i % 11, so common sentences NEVER land in the same package!
commonKeys.forEach((k, i) => {
  const pF = i % NUM_PACKAGES;
  const pM = (i + 5) % NUM_PACKAGES;
  packageBuckets[pF].femaleItems.push(nuItemMap.get(k));
  packageBuckets[pM].maleItems.push(namItemMap.get(k));
});

// Distribute the 2 nu-only keys to packages 0 and 1:
nuOnlyKeys.forEach((k, i) => {
  packageBuckets[i % NUM_PACKAGES].femaleItems.push(nuItemMap.get(k));
});

// Distribute nam-only keys (60 items) to hit target totals:
// Target totals: 7 packages of 16, 4 packages of 15
const targetTotals = [16, 16, 16, 16, 16, 16, 16, 15, 15, 15, 15];
let remainingNamOnly = [...namOnlyKeys];

for (let p = 0; p < NUM_PACKAGES; p++) {
  const currentCount = packageBuckets[p].maleItems.length + packageBuckets[p].femaleItems.length;
  const needed = targetTotals[p] - currentCount;
  for (let n = 0; n < needed; n++) {
    const k = remainingNamOnly.shift();
    if (!k) break;
    packageBuckets[p].maleItems.push(namItemMap.get(k));
  }
}

if (remainingNamOnly.length > 0) {
  throw new Error(`Leftover nam-only keys: ${remainingNamOnly.length}`);
}

const packageConfigs = [
  {
    slug: 'diktat-b1-bai-01',
    title: 'Bài 01: Phản xạ giao tiếp hàng ngày',
    subtitle: 'Luyện nghe chép các mẫu câu hội thoại và giao tiếp cơ bản',
  },
  {
    slug: 'diktat-b1-bai-02',
    title: 'Bài 02: Cuộc sống & Môi trường',
    subtitle: 'Chủ đề sinh hoạt đời sống, tự nhiên và môi trường xung quanh',
  },
  {
    slug: 'diktat-b1-bai-03',
    title: 'Bài 03: Học tập & Công sở',
    subtitle: 'Luyện từ vựng và câu văn trong môi trường làm việc, trường học',
  },
  {
    slug: 'diktat-b1-bai-04',
    title: 'Bài 04: Thói quen & Hoạt động thường nhật',
    subtitle: 'Các thói quen sinh hoạt, sở thích và hoạt động hàng ngày',
  },
  {
    slug: 'diktat-b1-bai-05',
    title: 'Bài 05: Đi lại & Di chuyển công cộng',
    subtitle: 'Từ vựng và cấu trúc về phương tiện, đường sá và du lịch',
  },
  {
    slug: 'diktat-b1-bai-06',
    title: 'Bài 06: Mua sắm, Ẩm thực & Dịch vụ',
    subtitle: 'Các tình huống gọi món, mua hàng và sử dụng dịch vụ tiện ích',
  },
  {
    slug: 'diktat-b1-bai-07',
    title: 'Bài 07: Cảm xúc, Thái độ & Tương tác xã hội',
    subtitle: 'Bày tỏ cảm xúc, quan điểm cá nhân và tương tác với bạn bè',
  },
  {
    slug: 'diktat-b1-bai-08',
    title: 'Bài 08: Câu hỏi nghi vấn & Đảo ngữ phản xạ',
    subtitle: 'Rèn luyện phản xạ nghe bắt các dạng câu hỏi Ja/Nein và W-Fragen',
  },
  {
    slug: 'diktat-b1-bai-09',
    title: 'Bài 09: Đối thoại phản xạ & Tình huống giao tiếp',
    subtitle: 'Các câu hội thoại hỏi đáp thực tế với nhịp độ tự nhiên',
  },
  {
    slug: 'diktat-b1-bai-10',
    title: 'Bài 10: Mệnh đề phụ & Cấu trúc câu ghép',
    subtitle: 'Chinh phục mệnh đề dass, weil, wenn và cấu trúc liên từ',
  },
  {
    slug: 'diktat-b1-bai-11',
    title: 'Bài 11: Cấu trúc nâng cao & Diễn đạt học thuật',
    subtitle: 'Nâng cao độ chính xác chính tả với các cấu trúc ngữ pháp B1 vững chắc',
  },
];

let globalSentenceId = 1;
const exercises = packageConfigs.map((cfg, pIdx) => {
  const bucket = packageBuckets[pIdx];
  const m = [...bucket.maleItems];
  const f = [...bucket.femaleItems];
  const interleaved = [];

  // Interleave male and female items smoothly: e.g. 2 M, 1 F, 2 M, 1 F...
  while (m.length > 0 || f.length > 0) {
    if (m.length > 0) interleaved.push(m.shift());
    if (m.length > 0 && f.length < m.length / 2) interleaved.push(m.shift());
    if (f.length > 0) interleaved.push(f.shift());
  }

  // Verify no key collision in this package
  const seenKeys = new Set();
  interleaved.forEach((item) => {
    if (seenKeys.has(item.key)) {
      throw new Error(`CRITICAL: Duplicate sentence key "${item.key}" in package ${cfg.slug}`);
    }
    seenKeys.add(item.key);
  });

  const items = interleaved.map((raw) => {
    const meta = SENTENCE_METADATA[raw.key];
    const words = meta.textDe.split(/\s+/u).filter(Boolean);
    const id = `diktat-s${String(globalSentenceId++).padStart(3, '0')}`;
    return {
      id,
      textDe: meta.textDe,
      textVi: meta.textVi,
      voice: raw.voice,
      audioUrlMale: raw.voice === 'male' ? raw.audioUrl : null,
      audioUrlFemale: raw.voice === 'female' ? raw.audioUrl : null,
      audioUrl: raw.audioUrl,
      wordCount: words.length,
      vocabulary: meta.vocabulary,
    };
  });

  return {
    slug: cfg.slug,
    title: cfg.title,
    subtitle: cfg.subtitle,
    level: 'B1',
    questionCount: items.length,
    items,
  };
});

const fileContent = `/**
 * AUTO-GENERATED BY scripts/import-diktat-audio.mjs
 * DO NOT EDIT MANUALLY. 172 INDEPENDENT B1 GERMAN SENTENCES ACROSS 11 PACKAGES.
 */

export interface DiktatVocabularyItem {
  term: string;
  article?: 'der' | 'die' | 'das';
  ipa: string;
  meaning: string;
}

export interface DiktatSentenceItem {
  id: string;
  textDe: string;
  textVi: string;
  voice?: 'male' | 'female';
  audioUrlMale: string | null;
  audioUrlFemale: string | null;
  audioUrl: string;
  wordCount: number;
  vocabulary: DiktatVocabularyItem[];
}

export interface DiktatExercisePackage {
  slug: string;
  title: string;
  subtitle: string;
  level: 'B1';
  questionCount: number;
  items: DiktatSentenceItem[];
}

export const importedDiktatPackages: DiktatExercisePackage[] = ${JSON.stringify(exercises, null, 2)};

const legacySlugAliasMap: Record<string, string> = {
  'diktat-b1-phan-xa-song-giong': 'diktat-b1-bai-01',
  'diktat-b1-giao-tiep-phan-xa': 'diktat-b1-bai-02',
  'diktat-b1-truong-hoc-cong-viec': 'diktat-b1-bai-03',
  'diktat-b1-tinh-huong-xa-hoi': 'diktat-b1-bai-04',
  'diktat-b1-cau-phuc-menh-de-phu': 'diktat-b1-bai-10',
};

export function getDiktatExerciseBySlug(slug: string): DiktatExercisePackage | undefined {
  const resolvedSlug = legacySlugAliasMap[slug] || slug;
  return importedDiktatPackages.find((pkg) => pkg.slug === resolvedSlug);
}
`;

fs.writeFileSync(targetDataFile, fileContent, 'utf8');
console.log(`Successfully generated ${targetDataFile} with ${exercises.length} packages and ${globalSentenceId - 1} sentences.`);
