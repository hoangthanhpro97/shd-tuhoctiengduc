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
}

// 1. Scan and copy all NAM files (75) and NU files (17)
const rawNamFiles = fs.readdirSync(rawNamDir).filter((f) => f.endsWith('.mp3')).sort();
const rawNuFiles = fs.readdirSync(rawNuDir).filter((f) => f.endsWith('.mp3')).sort();

console.log(`Found ${rawNamFiles.length} raw NAM files and ${rawNuFiles.length} raw NU files.`);

const namUrlMap = new Map(); // key -> url
const nuUrlMap = new Map(); // key -> url

function normalizeKey(str) {
  return str
    .replace(/\.mp3$/i, '')
    .replace(/\.+$/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

rawNamFiles.forEach((file, index) => {
  const paddedIndex = String(index + 1).padStart(2, '0');
  const targetName = `nam-${paddedIndex}.mp3`;
  const src = path.join(rawNamDir, file);
  const dest = path.join(targetDiktatDir, targetName);
  fs.copyFileSync(src, dest);
  const key = normalizeKey(file);
  namUrlMap.set(key, `/audio/diktat/${targetName}`);
});

rawNuFiles.forEach((file, index) => {
  const paddedIndex = String(index + 1).padStart(2, '0');
  const targetName = `nu-${paddedIndex}.mp3`;
  const src = path.join(rawNuDir, file);
  const dest = path.join(targetDiktatDir, targetName);
  fs.copyFileSync(src, dest);
  const key = normalizeKey(file);
  nuUrlMap.set(key, `/audio/diktat/${targetName}`);
});

console.log(`Copied ${rawNamFiles.length} nam files and ${rawNuFiles.length} nu files to ${targetDiktatDir}`);

// Curated definitions for all 77 unique sentences with proper German punctuation, Vietnamese translations, and rich vocabulary:
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
};

// Check that every single key in namUrlMap and nuUrlMap is present in SENTENCE_METADATA:
const allKeys = new Set([...namUrlMap.keys(), ...nuUrlMap.keys()]);
console.log(`Total unique sentence keys to import: ${allKeys.size}`);

for (const k of allKeys) {
  if (!SENTENCE_METADATA[k]) {
    throw new Error(`Missing metadata for sentence key: "${k}"`);
  }
}

// 5 Exercise partitions
const exerciseConfigs = [
  {
    slug: 'diktat-b1-phan-xa-song-giong',
    title: 'Phản xạ nghe chép 2 giọng Nam – Nữ',
    subtitle: 'Luyện phản xạ chép chính tả đối chiếu 2 ngữ điệu Nam và Nữ',
    level: 'B1',
    keys: [
      'arbeit ist ein wichtiger teil des lebens',
      'bring mir bitte mein hemd',
      'das ist das erste mal, das ich hier bin',
      'das lernen einer sprache macht mir spaß',
      'die auswirkungen der droge sind unbekannt',
      'er war auf dem weg zum basketballtraining',
      'ich nehme oft den bus zur schule',
      'ich schätze das du eine krankenschwester bist',
      'ich würde gerne ein auto mieten',
      'ist es heute heiß -- ja, ist es',
      'mein vater arbeitet in einer bank',
      'russland ist ein sehr großes land',
      'um wieviel uhr bist du schlafen gegangen',
      'wenn es dir gefällt kann ich mehr kaufen',
      'würdest du gerne mit mir zu abend essen',
    ], // 15 items
  },
  {
    slug: 'diktat-b1-giao-tiep-phan-xa',
    title: 'Giao tiếp & Câu hỏi phản xạ đời sống',
    subtitle: 'Các câu hỏi Ja/Nein và W-Fragen phản xạ trong giao tiếp hàng ngày',
    level: 'B1',
    keys: [
      'bist du lehrer -- ja, bin ich',
      'hast du dich schon beim college beworben',
      'hast du die nummer für ein taxi',
      'hörst du ihr gerade zu',
      'ist keenan dort - ja, er ist gerade angekommen',
      'kannst du das für mich wegwerfen',
      'legst du das bitte für mich ins auto',
      'magst du deine arbeitskollegen',
      'magst du gruselige filme',
      'regnet es hier oft',
      'seit wann lebst du hier',
      'um wieviel uhr öffnet der laden',
      'warum bist du so dramatisch',
      'wer ist der bekannteste prominente',
      'wo arbeitet dein bruder',
      'wo ist das nächste krankenhaus',
    ], // 16 items
  },
  {
    slug: 'diktat-b1-truong-hoc-cong-viec',
    title: 'Trường học, Công việc & Sinh hoạt hàng ngày',
    subtitle: 'Chủ đề học đường, trường đại học, công sở và đời sống thường nhật',
    level: 'B1',
    keys: [
      'bitte füllen sie dieses formular aus',
      'catherine arbeitet sehr hart',
      'das schuljahr endet im juni',
      'dem stuhl fehlt ein bein',
      'die universität hat eine menge studenten',
      'diese stadt hat drei kirchen',
      'er geht immer früh zur arbeit',
      'es gibt viele dinge in der schule',
      'es ist eine restaurant hier in der nähe',
      'es tut mir leid, ich habe keinen stift',
      'ich habe den müll bereits rausgebracht',
      'ich habe nach meinem geldbeutel gesucht',
      'ich habe noch nicht zu mittag gegessen',
      'ich muss jetzt gehen. tschüss',
      'sie isst eine orange',
    ], // 15 items
  },
  {
    slug: 'diktat-b1-tinh-huong-xa-hoi',
    title: 'Tình huống xã hội & Bày tỏ quan điểm',
    subtitle: 'Xử lý tình huống giao tiếp, cảm xúc và trao đổi quan điểm',
    level: 'B1',
    keys: [
      'danke für deine fortdauernde unterstützung',
      'die dorfbewohner haben den wald zerstört',
      'es gab einen autounfall',
      'es ist länger als 2 meilen',
      'gold ist ein seltenes element',
      'heute ist es draußen sonnig',
      'kinder mögen normalerweise süßigkeiten',
      'mein freund hat drei hunde',
      'mein lehrer ist so nett zu mir',
      'newton fand die theorie der schwerkraft',
      'oktober ist mein lieblingsmonat',
      'schmetterlinge haben zwei flügel',
      'sie haben früher kontaktlinsen benutzt',
      'sie mögen post-rock-musik',
      'sie sitzt auf dem sofa',
      'tom hat seinen geruchssinn verloren',
    ], // 16 items
  },
  {
    slug: 'diktat-b1-cau-phuc-menh-de-phu',
    title: 'Cấu trúc câu phức & Mệnh đề phụ tiếng Đức',
    subtitle: 'Mệnh đề quan hệ, mệnh đề dass/weil/wenn và cấu trúc Konjunktiv II',
    level: 'B1',
    keys: [
      'ich bin mir sicher, dass sie recht hat',
      'ich dachte, er hätte etwas anderes gesagt',
      'ich finde die situation eigenartig',
      'ich glaube, dass ich zum arzt muss',
      'ich werde diesen moment niemals vergessen',
      'ich würde gerne eine reservierung vornehmen',
      'ich würde gerne mit dir reden, bitte',
      'sie ist die anführererin des gruppenprojekts',
      'sie ist eine exzellenter köchin',
      'was bedeutet es amerikanisch zu sein',
      'was ist der herkömmliche weg das zu tun',
      'was ist hier die primäre attraktion',
      'was machen leute hier normalerweise',
      'was machst du unter dem tisch',
      'wie würdest du die situation bewerten',
    ], // 15 items
  },
];

let globalSentenceId = 1;
const exercises = exerciseConfigs.map((cfg) => {
  const items = cfg.keys.map((k) => {
    const meta = SENTENCE_METADATA[k];
    const words = meta.textDe.split(/\s+/u).filter(Boolean);
    const id = `diktat-s${String(globalSentenceId++).padStart(2, '0')}`;
    const male = namUrlMap.get(k) ?? null;
    const female = nuUrlMap.get(k) ?? null;
    return {
      id,
      textDe: meta.textDe,
      textVi: meta.textVi,
      audioUrlMale: male,
      audioUrlFemale: female,
      audioUrl: male ?? female ?? '',
      wordCount: words.length,
      vocabulary: meta.vocabulary,
    };
  });

  return {
    slug: cfg.slug,
    title: cfg.title,
    subtitle: cfg.subtitle,
    level: cfg.level,
    questionCount: items.length,
    items,
  };
});

const fileContent = `/**
 * AUTO-GENERATED BY scripts/import-diktat-audio.mjs
 * DO NOT EDIT MANUALLY. 77 UNIQUE B1 GERMAN SENTENCES WITH DUAL/SINGLE AUDIO.
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

export function getDiktatExerciseBySlug(slug: string): DiktatExercisePackage | undefined {
  return importedDiktatPackages.find((pkg) => pkg.slug === slug);
}
`;

fs.writeFileSync(targetDataFile, fileContent, 'utf8');
console.log(`Successfully generated ${targetDataFile} with ${exercises.length} exercises and ${globalSentenceId - 1} sentences.`);
