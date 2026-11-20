export type ExamStimulusParagraph = {
  id: string;
  label: 'Abschnitt A' | 'Abschnitt B' | 'Abschnitt C';
  textDe: string;
};

export type ExamStimulusOverride = {
  examSlug: string;
  sectionPart: number;
  title: string;
  paragraphs: ExamStimulusParagraph[];
};

export const examStimulusOverrides: ExamStimulusOverride[] = [
  {
    examSlug: 'demo-b1-mock-02',
    sectionPart: 1,
    title: 'Duale Ausbildung in Deutschland: Chancen und Herausforderungen für internationale Fachkräfte',
    paragraphs: [
      { id: 'exam-b1-abschnitt-a', label: 'Abschnitt A', textDe: 'Eine duale Ausbildung verbindet die Arbeit in einem Betrieb mit dem Unterricht an einer Berufsschule. An drei oder vier Tagen pro Woche lernen die Auszubildenden praktische Abläufe im Unternehmen. An den übrigen Tagen besuchen sie die Berufsschule und erwerben dort fachliche Grundlagen. Dieses Wechselmodell ermöglicht es jungen Menschen, früh Berufserfahrung zu sammeln und gleichzeitig einen anerkannten Abschluss zu erreichen.' },
      { id: 'exam-b1-abschnitt-b', label: 'Abschnitt B', textDe: 'Für internationale Fachkräfte bietet dieses System besondere Chancen. Wer bereits Berufserfahrung aus dem Ausland mitbringt, kann seine praktischen Kenntnisse einbringen und Schritt für Schritt neue Arbeitsabläufe kennenlernen. Gute Deutschkenntnisse sind jedoch wichtig, weil Sicherheitsregeln, Fachbegriffe und Gespräche mit Kolleginnen und Kollegen sicher verstanden werden müssen. Viele Betriebe unterstützen ihre Mitarbeitenden deshalb mit Sprachkursen und einer festen Ansprechperson.' },
      { id: 'exam-b1-abschnitt-c', label: 'Abschnitt C', textDe: 'Trotz der Vorteile ist der Einstieg nicht immer einfach. Schichtarbeit, neue Erwartungen im Betrieb und die ungewohnte Verbindung von Arbeit und Schule können anstrengend sein. Auch die Anerkennung früherer Abschlüsse dauert manchmal länger als erwartet. Wer einen realistischen Lernplan erstellt, Fragen stellt und regelmäßig Rückmeldungen einholt, verbessert jedoch seine Chancen deutlich. Am Ende profitieren beide Seiten: Die Fachkraft erhält eine langfristige Perspektive, und der Betrieb gewinnt eine gut vorbereitete Mitarbeiterin oder einen gut vorbereiteten Mitarbeiter.' },
    ],
  },
];

export function getExamStimulusOverride(examSlug: string, sectionPart: number) {
  return examStimulusOverrides.find((item) => item.examSlug === examSlug && item.sectionPart === sectionPart);
}
