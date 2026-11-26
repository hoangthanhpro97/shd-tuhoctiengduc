export function patchMdByPart(setNum, byPart) {
  if (setNum === '05') {
    byPart[3] = [
      {
        timestampStart: 0,
        timestampEnd: 30,
        rawSpeaker: 'Speaker 0',
        textDe:
          'Teil drei. Sie sitzen in einem Café und hören ein Gespräch zwischen Lea und Jonas über einen Bericht für das Stadtteilradio. Entscheiden Sie bei den Aussagen 16 bis 22 richtig oder falsch. Sie hören den Text einmal. Lesen Sie vor dem Hören die Aufgaben. Dazu haben Sie 60 Sekunden Zeit. Aufgaben 16, 17, 18, 19, 20, 21, 22.',
      },
      {
        timestampStart: 91,
        timestampEnd: 95,
        rawSpeaker: 'Speaker 2',
        textDe: 'Hallo Lea, hier ist noch Platz. Wie geht es dir nach deinem Besuch in Weitheim?',
      },
      {
        timestampStart: 96,
        timestampEnd: 111,
        rawSpeaker: 'Speaker 1',
        textDe:
          'Danke, ganz gut. Ich denke noch viel daran. Für unser Stadtteilradio war ich ja schon bei Straßenfesten und bei der Eröffnung der Bücherei, aber durch Straßen zu gehen, in denen kurz vorher das Wasser stand, das hatte ich als Reporterin noch nie erlebt.',
      },
      {
        timestampStart: 111,
        timestampEnd: 114,
        rawSpeaker: 'Speaker 2',
        textDe: 'Hast du denn leicht Leute gefunden, die mit dir sprechen wollten?',
      },
      {
        timestampStart: 114,
        timestampEnd: 131,
        rawSpeaker: 'Speaker 1',
        textDe:
          'Vorher hatte ich mir darüber Sorgen gemacht. Ich kannte dort niemanden. Dann hat mich eine Helferin, Sabine, am Bahnhof abgeholt. Sie wusste, welche Wege frei waren und hat Kontakte zu Bewohnern hergestellt. Ohne sie wäre ich ständig irgendwo falsch abgebogen. Das war wirklich eine große Hilfe.',
      },
      {
        timestampStart: 132,
        timestampEnd: 140,
        rawSpeaker: 'Speaker 2',
        textDe:
          'Beim Bearbeiten deiner Aufnahmen konnte ich mir die Straßen richtig vorstellen. Ich saß hier im Sender mit meinen Kopfhörern und habe die Stellen für den Beitrag zusammengeschnitten.',
      },
      {
        timestampStart: 141,
        timestampEnd: 149,
        rawSpeaker: 'Speaker 1',
        textDe:
          'Gut, dass du das übernommen hast. Ich war mit den Gesprächen vor Ort beschäftigt. Ich habe die Bewohner aufgenommen und dir die Dateien geschickt. Bei einem Gespräch ging es um die kleine Brücke am Park.',
      },
      {
        timestampStart: 149,
        timestampEnd: 152,
        rawSpeaker: 'Speaker 2',
        textDe: 'Ach ja, da war etwas mit einer Sperrung.',
      },
      {
        timestampStart: 152,
        timestampEnd: 167,
        rawSpeaker: 'Speaker 1',
        textDe:
          'Ein Anwohner erzählte mir, man könne noch nicht hinübergehen. Ich habe anschließend bei der Informationsstelle der Stadt angerufen und gefragt, ob das weiterhin stimmt. Erst nach deren Bestätigung habe ich die Information für unseren Bericht verwendet.',
      },
      {
        timestampStart: 168,
        timestampEnd: 171,
        rawSpeaker: 'Speaker 2',
        textDe: 'Bei einer Frauenstimme hattest du extra eine Notiz mitgeschickt.',
      },
      {
        timestampStart: 172,
        timestampEnd: 184,
        rawSpeaker: 'Speaker 1',
        textDe:
          'Die Frau wollte von ihrer beschädigten Wohnung erzählen. Wir durften ihre Stimme senden, solange wir ihren Namen wegließen. Damit war ich einverstanden. Ich habe mir das gleich neben der Aufnahme aufgeschrieben, damit es bei der Bearbeitung klar ist.',
      },
      {
        timestampStart: 184,
        timestampEnd: 192,
        rawSpeaker: 'Speaker 2',
        textDe:
          'Diese Notiz habe ich gesehen. Deine Dateien waren übrigens rechtzeitig für die geplante Sendung da, obwohl das Hochladen am Anfang nicht geklappt hatte.',
      },
      {
        timestampStart: 192,
        timestampEnd: 197,
        rawSpeaker: 'Speaker 1',
        textDe:
          'Ja, im Gemeindehaus hatte ich schließlich eine gute Verbindung. Trotzdem lief der Beitrag erst später.',
      },
      {
        timestampStart: 198,
        timestampEnd: 209,
        rawSpeaker: 'Speaker 2',
        textDe:
          'Wir mussten noch klären, ab wann die Postfiliale wieder Kunden empfängt. Auf dem Aushang stand ein anderes Datum als in der Nachricht, die wir bekommen hatten. Bis wir eine sichere Auskunft hatten, war unser geplanter Sendeplatz vorbei.',
      },
      {
        timestampStart: 209,
        timestampEnd: 212,
        rawSpeaker: 'Speaker 1',
        textDe: 'Jetzt haben wir wenigstens die richtige Information gesendet.',
      },
      {
        timestampStart: 213,
        timestampEnd: 216,
        rawSpeaker: 'Speaker 2',
        textDe: 'Und wann fährst du wieder hin? Hast du schon eine Idee für den nächsten Beitrag?',
      },
      {
        timestampStart: 217,
        timestampEnd: 227,
        rawSpeaker: 'Speaker 1',
        textDe:
          'Vielleicht nächste Woche. Die Bäckerin will ihren Laden wieder öffnen. Und die Busse sollen wieder durch die Hauptstraße fahren. Ich möchte die Leute dabei begleiten, wie sie wieder einkaufen und zur Arbeit kommen.',
      },
    ];
  }

  if (setNum === '10' && Array.isArray(byPart[1])) {
    const tailText3 =
      'Guten Tag Frau Reuter. Hier ist Anne vom Büro der Sprachschule. Ihre Überweisung für den Italienischkurs ist angekommen. Sie bekommen allerdings einen Teil davon zurück. Wir haben den Kurs neu organisiert. Insgesamt gibt es jetzt vier Unterrichtsstunden weniger, deshalb kostet er entsprechend weniger. Den Unterschied überweisen wir Ihnen in den nächsten Tagen auf Ihr Konto. Den überarbeiteten Stundenplan finden Sie bereits in Ihrem Postfach. Vielen Dank und auf Wiederhören. Guten Tag Frau Reuter. Hier ist Anne vom Büro der Sprachschule. Ihre Überweisung für den Italienischkurs ist angekommen. Sie bekommen allerdings einen Teil davon zurück. Wir haben den Kurs neu organisiert. Insgesamt gibt es jetzt vier Unterrichtsstunden weniger, deshalb kostet er entsprechend weniger. Den Unterschied überweisen wir Ihnen in den nächsten Tagen auf Ihr Konto. Den überarbeiteten Stundenplan finden Sie bereits in Ihrem Postfach. Vielen Dank und auf Wiederhören.';
    const lastIdx = byPart[1].length - 1;
    if (lastIdx >= 0 && /Frau Reuter/i.test(byPart[1][lastIdx].textDe)) {
      byPart[1][lastIdx] = {
        ...byPart[1][lastIdx],
        timestampEnd: 330,
        textDe: tailText3,
      };
    }
    byPart[1].push(
      {
        timestampStart: 330,
        timestampEnd: 346,
        rawSpeaker: 'Speaker 0',
        textDe: 'Aufgaben 7, 8.',
      },
      {
        timestampStart: 346,
        timestampEnd: 400,
        rawSpeaker: 'Speaker 5',
        textDe:
          'Hallo Julia, Tarek hier. Ich fahre am Freitag zu meinem Cousin und bin Sonntag zurück. Die Kamera kannst du ruhig bis Montag behalten, wie wir es ausgemacht haben. Auf dieser Reise reichen mir die Fotos mit dem Handy. Denk bitte daran, deine Bilder von der Speicherkarte zu löschen, bevor du mir die Kamera wiederbringst. Dann habe ich beim nächsten Einsatz gleich Platz. Ich hoffe, du hattest beim Fotografieren viel Spaß. Hallo Julia, Tarek hier. Ich fahre am Freitag zu meinem Cousin und bin Sonntag zurück. Die Kamera kannst du ruhig bis Montag behalten, wie wir es ausgemacht haben. Auf dieser Reise reichen mir die Fotos mit dem Handy. Denk bitte daran, deine Bilder von der Speicherkarte zu löschen, bevor du mir die Kamera wiederbringst. Dann habe ich beim nächsten Einsatz gleich Platz. Ich hoffe, du hattest beim Fotografieren viel Spaß.',
      },
      {
        timestampStart: 400,
        timestampEnd: 416,
        rawSpeaker: 'Speaker 0',
        textDe: 'Aufgaben 9, 10.',
      },
      {
        timestampStart: 416,
        timestampEnd: 467,
        rawSpeaker: 'Speaker 6',
        textDe:
          'Hallo Alex, Miriam hier. Wegen morgen: Ich überlege noch, ob ich das Auto nehme oder mit der Bahn komme. Falls ich fahre, bringe ich den Hund mit. Bei der Bahnfahrt bleibt er zu Hause bei meinem Partner. Vor dem Nachmittag schaffe ich es übrigens nicht zu dir. Vormittags wird mein neuer Schreibtisch geliefert und ich muss ihn persönlich annehmen. Sobald die Lieferung da ist, melde ich mich. Bis morgen! Hallo Alex, Miriam hier. Wegen morgen: Ich überlege noch, ob ich das Auto nehme oder mit der Bahn komme. Falls ich fahre, bringe ich den Hund mit. Bei der Bahnfahrt bleibt er zu Hause bei meinem Partner. Vor dem Nachmittag schaffe ich es übrigens nicht zu dir. Vormittags wird mein neuer Schreibtisch geliefert und ich muss ihn persönlich annehmen. Sobald die Lieferung da ist, melde ich mich. Bis morgen!',
      }
    );
  }

  if (setNum === '02' && Array.isArray(byPart[4])) {
    byPart[4] = byPart[4].map((t) => {
      if (
        /Genau dieser Zeitdruck betrifft auch die Küche/i.test(t.textDe) ||
        /Für unseren Betrieb wünsche ich mir/i.test(t.textDe) ||
        /Mir ist außerdem wichtig, wer in unserem Unternehmen arbeitet/i.test(t.textDe)
      ) {
        return { ...t, forcedRole: 'GAST_2' };
      }
      return t;
    });
  }

  if (setNum === '06' && Array.isArray(byPart[3])) {
    const fixed3 = [];
    for (const t of byPart[3]) {
      if (
        /^Ein gemeinsames Mittagessen\./i.test(t.textDe) &&
        /Da würde ich gern ab und zu mithelfen/i.test(t.textDe)
      ) {
        const c1 = t.textDe.search(/Da würde ich gern ab und zu mithelfen/i);
        const c2 = t.textDe.search(/Komm doch zum nächsten Treffen mit mir hin/i);
        const c3 = t.textDe.search(/Ich muss erst in meinen Dienstplan schauen/i);
        if (c1 > 0 && c2 > c1 && c3 > c2) {
          fixed3.push({ timestampStart: 192, timestampEnd: 205, rawSpeaker: 'SPK_EVA', textDe: t.textDe.slice(0, c1).trim() });
          fixed3.push({ timestampStart: 205, timestampEnd: 217, rawSpeaker: 'SPK_MARTIN', textDe: t.textDe.slice(c1, c2).trim() });
          fixed3.push({ timestampStart: 217, timestampEnd: 223, rawSpeaker: 'SPK_EVA', textDe: t.textDe.slice(c2, c3).trim() });
          fixed3.push({ timestampStart: 223, timestampEnd: t.timestampEnd, rawSpeaker: 'SPK_MARTIN', textDe: t.textDe.slice(c3).trim() });
          continue;
        }
      }
      fixed3.push(t);
    }
    let idx = 0;
    byPart[3] = fixed3.map((t) => {
      if (t.rawSpeaker === 'Speaker 0') return t;
      const role = idx % 2 === 0 ? 'SPK_MARTIN' : 'SPK_EVA';
      idx += 1;
      return { ...t, rawSpeaker: role };
    });
  }

  if (setNum === '08' && Array.isArray(byPart[3])) {
    const fixed3 = [];
    for (const t of byPart[3]) {
      if (t.rawSpeaker === 'Speaker 0') {
        fixed3.push(t);
        continue;
      }
      if (/^Hallo Eva, ist hier noch frei\?/i.test(t.textDe) && /\bSetz dich\./i.test(t.textDe)) {
        const cut = t.textDe.search(/\bSetz dich\./i);
        const partA = t.textDe.slice(0, cut).trim();
        const partB = t.textDe.slice(cut).trim();
        fixed3.push({ timestampStart: t.timestampStart, timestampEnd: 105, rawSpeaker: 'SPK_MARTIN', textDe: partA });
        fixed3.push({ timestampStart: 105, timestampEnd: t.timestampEnd, rawSpeaker: 'SPK_EVA', textDe: partB });
        continue;
      }
      const prev = fixed3[fixed3.length - 1];
      if (prev && /^Hoffentlich findet ihr eine Lösung\./i.test(prev.textDe) && /^Diesmal würde ich mir gerne/i.test(t.textDe)) {
        prev.timestampEnd = t.timestampEnd;
        prev.textDe = `${prev.textDe} ${t.textDe}`.trim();
        continue;
      }
      fixed3.push(t);
    }
    let idx = 0;
    byPart[3] = fixed3.map((t) => {
      if (t.rawSpeaker === 'Speaker 0') return t;
      const role = idx % 2 === 0 ? 'SPK_MARTIN' : 'SPK_EVA';
      idx += 1;
      return { ...t, rawSpeaker: role };
    });
  }

  if (setNum === '08' && Array.isArray(byPart[4])) {
    const fixed4 = [];
    for (const t of byPart[4]) {
      if (/^Im Laden sind solche Unterschiede eine praktische Frage\./i.test(t.textDe) && /Und wenn die Erwartungen im Lesekreis/i.test(t.textDe)) {
        const cut = t.textDe.search(/Und wenn die Erwartungen im Lesekreis/i);
        fixed4.push({ ...t, timestampEnd: 552, forcedRole: 'GAST_2', textDe: t.textDe.slice(0, cut).trim() });
        fixed4.push({ ...t, timestampStart: 552, forcedRole: 'MOD', textDe: t.textDe.slice(cut).trim() });
        continue;
      }
      let forcedRole = undefined;
      if (
        /^Für meine Sendung suche ich/i.test(t.textDe) ||
        /^Und wenn die Erwartungen im Lesekreis/i.test(t.textDe) ||
        /^Mich beschäftigt für eine spätere Sendung/i.test(t.textDe)
      ) {
        forcedRole = 'MOD';
      } else if (
        /^Das ist mir gerade erst passiert\./i.test(t.textDe) ||
        /^Manchmal wird es lebhaft\./i.test(t.textDe)
      ) {
        forcedRole = 'GAST_1';
      } else if (
        /^Im Laden sind solche Unterschiede/i.test(t.textDe) ||
        /^Ja, und dafür wünsche ich mir eine kurze Information/i.test(t.textDe)
      ) {
        forcedRole = 'GAST_2';
      }
      fixed4.push(forcedRole ? { ...t, forcedRole } : t);
    }
    byPart[4] = fixed4;
  }

  if (setNum === '09' && Array.isArray(byPart[3])) {
    let idx = 0;
    byPart[3] = byPart[3].map((t) => {
      if (t.rawSpeaker === 'Speaker 0' || /^Aufgaben\s+16\b/i.test(t.textDe)) {
        return { ...t, rawSpeaker: 'Speaker 0' };
      }
      const role = idx % 2 === 0 ? 'SPK_BEN' : 'SPK_KLARA';
      idx += 1;
      return { ...t, rawSpeaker: role };
    });
  }

  if (setNum === '09' && Array.isArray(byPart[4])) {
    const fixed4 = [];
    for (const t of byPart[4]) {
      const cut = t.textDe.search(/Da würde ich mich als Besucher wohl zuerst eintragen/i);
      if (cut > 0) {
        fixed4.push({ ...t, timestampEnd: 538, forcedRole: 'GAST_2', textDe: t.textDe.slice(0, cut).trim() });
        fixed4.push({ ...t, timestampStart: 538, forcedRole: 'MOD', textDe: t.textDe.slice(cut).trim() });
        continue;
      }
      fixed4.push(t);
    }
    byPart[4] = fixed4;
  }

  if (setNum === '12' && Array.isArray(byPart[4])) {
    byPart[4] = byPart[4].map((t) => {
      if (/^Bei unserer Arbeit gibt es noch eine ganz andere Frage\./i.test(t.textDe)) {
        return { ...t, forcedRole: 'GAST_2' };
      }
      return t;
    });
  }
}
