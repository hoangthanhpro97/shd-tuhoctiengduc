export type ReadingStimulus = {
  title: string;
  content: string;
};

const b1Themes: Record<string, { blog: string; press: string; forum: string; rules: string }> = {
  'osd-b1-test-02': {
    blog: 'Freiwilligendienst in Portugal',
    press: 'Bildung, Nachbarschaft und nachhaltiger Tourismus',
    forum: 'Sollten Städte mehr autofreie Plätze schaffen?',
    rules: 'Hausordnung im Kultur- und Lernzentrum West',
  },
  'osd-b1-test-03': {
    blog: 'Leben in einer Wohngemeinschaft auf dem Land',
    press: 'Neue Lernangebote und Fahrradfreundliche Gemeinden',
    forum: 'Ist ein verpflichtender Ehrenamtstag für Jugendliche sinnvoll?',
    rules: 'Institutsordnung für die berufliche Weiterbildung',
  },
  'osd-b1-test-04': {
    blog: 'Ein neuer Anfang in der Stadt',
    press: 'Ausbildung, Umwelt und gemeinschaftliche Projekte',
    forum: 'Sollten Unternehmen eine Vier-Tage-Woche anbieten?',
    rules: 'Benutzungsordnung für das Medien- und Bürgerhaus',
  },
};

function ads(slug: string) {
  const suffix = slug.endsWith('03') ? 'Frühling' : slug.endsWith('04') ? 'Sommer' : 'Herbst';
  return `ANZEIGENÜBERSICHT · ${suffix}\n\nAnzeige a – Fahrradwerkstatt am Samstag\nReparaturkurse für Erwachsene, Ersatzteile und Beratung. Anmeldung bis Donnerstag, kleine Gruppen.\n\nAnzeige b – Sprachcafé im Stadtteil\nJeden Mittwoch treffen sich Lernende und Muttersprachler. Eintritt frei, Getränke vor Ort.\n\nAnzeige c – Betreuung für Haustiere\nZuverlässige Betreuung während Dienstreisen, Spaziergänge inklusive. Nur im Bezirk Nord.\n\nAnzeige d – Möbeltransport\nKleintransporte und Umzüge am Wochenende. Besichtigung nach Vereinbarung.\n\nAnzeige e – Kochkurs ohne Fleisch\nVegetarische Gerichte aus regionalen Zutaten, jeweils montags ab 18 Uhr.\n\nAnzeige f – Ferienwohnung am See\nRuhige Unterkunft für Familien, direkte Verbindung zum Bahnhof und eigener Garten.\n\nAnzeige g – Bewerbungstraining\nLebenslauf, Vorstellungsgespräch und berufliche Kommunikation auf Deutsch.\n\nAnzeige h – Computerkurs für Seniorinnen und Senioren\nGrundlagen, Online-Termine und Fotos speichern; geduldige Kursleitung.\n\nAnzeige i – Gartenhilfe gesucht\nKleine Gartenarbeiten im Frühling, flexible Termine und faire Bezahlung.\n\nAnzeige j – Konzertkarten tauschen\nPrivate Plattform für Konzert- und Theaterkarten, keine kommerziellen Angebote.`;
}

function partFour(theme: string, variant: string) {
  return `LESERBRIEFE · Thema: ${theme}\n\nLeserbrief 20 – Markus: „Ich finde den Vorschlag grundsätzlich richtig. Wenn die Stadt den öffentlichen Raum neu plant, müssen Anwohner aber früh informiert werden.“\n\nLeserbrief 21 – Sabine: „Für mich klingt die Idee gut, weil dadurch mehr Ruhe entsteht. Trotzdem braucht es Ausnahmen für Lieferdienste und Menschen mit Mobilitätseinschränkungen.“\n\nLeserbrief 22 – Thomas: „Ich bin dagegen. Viele Familien sind auf das Auto angewiesen und dürfen nicht das Gefühl bekommen, dass ihre Alltagssorgen unwichtig sind.“\n\nLeserbrief 23 – Aylin: „Eine vorsichtige Lösung mit einer Probephase wäre sinnvoll. Danach sollte man die Erfahrungen der Bürger auswerten.“\n\nLeserbrief 24 – Georg: „Die Diskussion wird zu emotional geführt. Entscheidend ist, ob der Vorschlag messbar die Lebensqualität verbessert.“\n\nLeserbrief 25 – Elena: „Ich unterstütze die Maßnahme, wenn gleichzeitig Busse häufiger fahren und die Wege für Radfahrer sicherer werden.“\n\nLeserbrief 26 – Martin: „Für meinen Alltag würde sich kaum etwas ändern. Deshalb sehe ich keinen Grund, die bisherige Regelung sofort abzuschaffen.“\n\nVariante ${variant}: Lesen Sie die Stellungnahmen genau und entscheiden Sie, ob die jeweilige Person die vorgeschlagene Maßnahme unterstützt.`;
}

function partFive(title: string) {
  return `${title}\n\n1. Öffnungszeiten\nDie Räume dürfen montags bis freitags von 7.30 bis 20.00 Uhr genutzt werden. Am Samstag endet der Betrieb um 16.00 Uhr.\n\n2. Mitgebrachte Gegenstände\nTaschen und Rucksäcke bleiben in den dafür vorgesehenen Schließfächern. Wertsachen dürfen nicht unbeaufsichtigt liegen bleiben.\n\n3. Technische Geräte und Getränke\nMobiltelefone werden lautlos gestellt. Getränke sind nur in verschließbaren Flaschen erlaubt; warme Speisen dürfen nicht an den Arbeitsplätzen verzehrt werden.\n\n4. Sicherheit\nBei Feueralarm verlassen alle Personen das Gebäude über den ausgeschilderten Notausgang und folgen den Anweisungen des Personals.\n\n5. Verstöße\nBei wiederholten Verstößen kann die Nutzung zeitweise eingeschränkt werden. Schäden müssen unverzüglich gemeldet und gegebenenfalls ersetzt werden.`;
}

export function getReadingStimulus(examSlug: string, part: number, level: 'B1' | 'B2' = examSlug.includes('b2') ? 'B2' : 'B1'): ReadingStimulus {
  const theme = b1Themes[examSlug] ?? { blog: `ÖSD ${level} Modelltest ${examSlug.match(/(\d+)$/)?.[1] ?? '01'}`, press: 'Gesellschaft und nachhaltige Entwicklung', forum: 'Eine aktuelle Frage im Alltag', rules: 'Hausordnung und Nutzungsregeln' };
  if (part === 1) return { title: `Teil 1 · Blogbeitrag / E-Mail: ${theme.blog}`, content: `BLOGBEITRAG\n\nLiebe Leserinnen und Leser,\n\nvor einigen Monaten habe ich mich entschieden, eine neue Erfahrung zu machen und für eine begrenzte Zeit in einer anderen Umgebung zu leben. Am Anfang war vieles ungewohnt: der neue Tagesablauf, die Gespräche mit Menschen aus verschiedenen Ländern und die Verantwortung für meine eigenen Aufgaben. Ich musste lernen, meine Zeit besser zu planen und offen nachzufragen, wenn ich etwas nicht verstanden hatte.\n\nBesonders hilfreich war die Zusammenarbeit im Team. Jeden Tag gab es Situationen, in denen ich neue Wörter benutzen und praktische Lösungen finden musste. Dadurch wurde ich sicherer, auch wenn nicht alles sofort funktioniert hat. Am Wochenende habe ich die Umgebung erkundet, lokale Veranstaltungen besucht und Menschen kennengelernt, die mir einen anderen Blick auf den Alltag gegeben haben.\n\nHeute weiß ich, dass diese Zeit nicht nur fachlich, sondern auch persönlich wichtig war. Ich empfehle eine solche Erfahrung allen, die selbstständiger werden, ihre Sprachkenntnisse anwenden und Verantwortung übernehmen möchten. Man braucht Geduld, aber die Mühe lohnt sich.` };
  if (part === 2) return { title: `Teil 2 · Zwei Pressetexte: ${theme.press}`, content: `TEXT 1 · Lernen im Alltag\n\nImmer mehr Gemeinden verbinden Bibliotheken, Schulen und Vereine, damit Erwachsene leichter an Weiterbildung teilnehmen können. Die Projekte bieten kurze Kurse am Abend, digitale Arbeitsplätze und Beratung bei der Suche nach passenden Angeboten. Nach dem ersten Jahr berichten die Organisatoren, dass besonders Menschen mit unregelmäßigen Arbeitszeiten davon profitieren. Für die nächste Phase sind zusätzliche Sprachkurse und Kinderbetreuung während einzelner Veranstaltungen geplant.\n\nTEXT 2 · Verantwortung in der Region\n\nEin zweiter Bericht beschäftigt sich mit Maßnahmen, die den Alltag in kleineren Städten nachhaltiger machen sollen. Besucherinnen und Besucher werden über öffentliche Verkehrsmittel, regionale Produkte und geschützte Wege informiert. Die Betriebe vor Ort begrüßen die Entwicklung, weil eine längere Aufenthaltsdauer und eine faire Zusammenarbeit neue Möglichkeiten schaffen. Fachleute betonen jedoch, dass die Wirkung nur dann dauerhaft ist, wenn Verwaltung, Unternehmen und Bevölkerung gemeinsam planen.` };
  if (part === 3) return { title: `Teil 3 · Situationen und Anzeigen: ${theme.blog}`, content: ads(examSlug) };
  if (part === 4) return { title: `Teil 4 · Leserbriefe: ${theme.forum}`, content: partFour(theme.forum, examSlug) };
  return { title: `Teil 5 · Ordnung / Regelwerk: ${theme.rules}`, content: partFive(theme.rules) };
}
