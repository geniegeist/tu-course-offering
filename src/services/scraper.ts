import {
  ModulListenGruppe,
  UniversityEvent,
  UniversityEventDate,
  UniversityEventType,
} from '@/types/model';
import axios from 'axios';
import cheerio from 'cheerio';

const currentSemester = 70;

export async function fetchModulListenGruppe(studiengang: number) {
  try {
    const baseURL = `https://moseskonto.tu-berlin.de/moses/verzeichnis/veranstaltungen/studiengangsbereich.html?semester=${currentSemester}&feature=VERZEICHNIS&extended=false&search=true&studiengang=${studiengang}`;

    const response = await axios.get(baseURL);

    const html = response.data;
    const $ = cheerio.load(html);

    const modullistengruppe: ModulListenGruppe[] = [];

    const options = $('.form-group')
      .find($('label:contains("Studiengangsbereich")'))
      .parent()
      .find('select')
      .find('option');

    options.each((index, el) => {
      const name = $(el).text();
      const value = $(el).attr('value');
      modullistengruppe.push({
        name,
        value: value ? parseInt(value) : null,
      });
    });

    return modullistengruppe;
  } catch (error) {
    throw error;
  }
}

export async function fetchVertiefungsModule(
  modullistengruppe: number,
  studiengang: number
) {
  const baseURL = `https://moseskonto.tu-berlin.de/moses/verzeichnis/veranstaltungen/studiengangsbereich.html?semester=${currentSemester}&feature=VERZEICHNIS&extended=false&search=true&studiengang=${studiengang}`;

  try {
    const response = await axios.get(
      `${baseURL}&modullistengruppe=${modullistengruppe}`
    );

    const html = response.data;

    const $ = cheerio.load(html);

    const events: UniversityEvent[] = [];

    const options = $('table[role=treegrid]').find($('tbody')).find($('tr'));

    // console.log($.html(options));

    options.each((index, el) => {
      const aElement = $(el).find($('td')).first().find($('a'));
      const secondColumnText = $(el).find($('td:nth-child(1)')).text();

      let type = UniversityEventType.Unbekannt;

      if (secondColumnText.includes('Vorlesung')) {
        type = UniversityEventType.Vorlesung;
      } else if (secondColumnText.includes('Übung')) {
        type = UniversityEventType.Uebung;
      } else if (secondColumnText.includes('Tutorium')) {
        type = UniversityEventType.Tutorium;
      } else if (secondColumnText.includes('Integrierte Veranstaltung')) {
        type = UniversityEventType.IntegrierteVeranstaltung;
      } else if (secondColumnText.includes('Seminar')) {
        type = UniversityEventType.Seminar;
      } else {
        console.log('Unknown: ', secondColumnText);
      }

      const dirtyName = $(aElement).text().trim();
      const name = dirtyName
        .replace('(Vorlesung)', '')
        .replace('(Übung)', '')
        .replace('(Tutorium)', '')
        .trim();
      const link = $(aElement).attr('href');

      if (!link) {
        return;
      }

      const beginIndex = link.indexOf('lehrveranstaltungsvorlage=') + 26;
      const eventID = link?.substring(
        beginIndex,
        link.substring(beginIndex).indexOf('&') + beginIndex
      );

      // https://api.jquery.com/attribute-starts-with-selector/
      const lecturer = $(`.popover-anchor[title^='${dirtyName}']`)
        .find($('.form-group'))
        .find($('label:contains("Dozierende")'))
        .parent()
        .contents()
        .last()
        .text();

      const dates: UniversityEventDate[] = [];
      const popovers = $(`.popover-anchor[title^='${dirtyName}']`);
      popovers.each((index, elem) => {
        const raw = $(elem)
          .find($('.form-group'))
          .find($('label:contains("Datum/Uhrzeit")'))
          .parent()
          .contents()
          .last()
          .text();
        dates.push({ raw });
      });

      events.push({
        name,
        link,
        eventID,
        type,
        lecturer,
        dates,
      });
    });

    return events;
  } catch (error) {
    throw error;
  }
}
