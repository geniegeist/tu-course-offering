import Page from '@/components/Page';
import {
  Box,
  Button,
  Container,
  List,
  ListItem,
  Stack,
  styled,
  Typography,
  useTheme,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionSummary, { AccordionSummaryProps } from '@mui/material/AccordionSummary';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import { getLink } from '@/utils/getLink';
import { Modul, Root, UniversityEvent, UniversityEventType } from '@/types/model';
import { fetchModulListenGruppe, fetchVertiefungsModule } from '@/services/scraper';
import delay from 'delay';
import { formatRawDate, isValidRawDate } from '@/utils/formatRawDate';
import Label from '@/components/Label';
import FullCalendar from '@fullcalendar/react'; // must go before plugins
import timeGridPlugin from '@fullcalendar/timegrid';
import { useState } from 'react';
import { EventInput } from '@fullcalendar/core';
import { Mock_Root } from '@/model/example';

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&:before': {
    display: 'none',
  },
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, .05)' : 'rgba(0, 0, 0, .03)',
  flexDirection: 'row-reverse',
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(90deg)',
  },
  '& .MuiAccordionSummary-content': {
    marginLeft: theme.spacing(1),
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: '1px solid rgba(0, 0, 0, .125)',
}));

export const ContentStyle = styled('div')(({ theme }) => ({
  maxWidth: 750,
  margin: 'auto',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
}));

type Props = {
  root: Root;
  updatedAt: string;
};

export default function Home(props: Props) {
  const theme = useTheme();

  const [selectedEventIDs, setSelectedEventIDs] = useState<string[]>([]);

  const events: EventInput[] = [];

  selectedEventIDs.forEach((id) => {
    const keys = Object.keys(props.root.modules);

    let event: UniversityEvent | undefined;

    keys.forEach((k) => {
      const mod = props.root.modules[k];
      const _event = mod.events.find((e) => e.eventID === id);
      if (_event) {
        event = _event;
      }
    });

    if (!event) {
      return;
    }

    const dates = event.dates.map((d) => formatRawDate(d.raw));

    dates.forEach((date) => {
      if (!isValidRawDate(date)) {
        return;
      }

      const splits = date.split(',');
      const weekday = splits[0];
      const days = splits[1].trim();

      const beginHour = parseInt(days.split('-')[0].trim().split(':')[0]);
      const beginMin = parseInt(days.split('-')[0].trim().split(':')[1]);
      const endHour = parseInt(days.split('-')[1].trim().split(':')[0]);
      const endMin = parseInt(days.split('-')[1].trim().split(':')[1]);

      let begin: Date | undefined;
      let end: Date | undefined;

      switch (weekday) {
        case 'Mo.': {
          begin = new Date(2023, 3, 17, beginHour, beginMin);
          end = new Date(2023, 3, 17, endHour, endMin);
          break;
        }
        case 'Di.': {
          begin = new Date(2023, 3, 18, beginHour, beginMin);
          end = new Date(2023, 3, 18, endHour, endMin);
          break;
        }
        case 'Mi.': {
          begin = new Date(2023, 3, 19, beginHour, beginMin);
          end = new Date(2023, 3, 19, endHour, endMin);
          break;
        }
        case 'Do.': {
          begin = new Date(2023, 3, 20, beginHour, beginMin);
          end = new Date(2023, 3, 20, endHour, endMin);
          break;
        }
        case 'Fr.': {
          begin = new Date(2023, 3, 21, beginHour, beginMin);
          end = new Date(2023, 3, 21, endHour, endMin);
          break;
        }
      }

      const d = {
        date: begin,
        end,
        title: `${event?.name} (${event?.type})`,
        textColor: 'white',
        color:
          event?.type === UniversityEventType.Vorlesung
            ? theme.palette.primary.main
            : theme.palette.success.main,
      };

      events.push(d);
    });
  });

  return (
    <Page title="Sommersemester 2023" sx={{ bgcolor: 'background.default', height: '100vh' }}>
      <Container sx={{ py: 8, bgcolor: 'background.default' }}>
        <Typography variant="h2">Mathe-Kursverzeichnis SS 2023</Typography>
        <Typography variant="h3" color="text.secondary" gutterBottom>
          Technische Universität Berlin
        </Typography>

        <Box sx={{ my: 2 }}>
          <Typography variant="body1">
            Das Verzeichnis wird täglich einmal aktualisiert.
            <br />
            Zuletzt aktualisiert: {new Date(props.updatedAt).toTimeString()}
            . <br />
            Alle Daten stammen von{' '}
            <a href="https://moseskonto.tu-berlin.de">moseskonto.tu-berlin.de</a>.
          </Typography>
          <Typography sx={{ mt: 1 }} variant="body1">
            Verbesserungsvorschläge an:{' '}
            <a href="mailto:vorderbein_stapfen0v@icloud.com">vorderbein_stapfen0v@icloud.com</a>
          </Typography>
        </Box>

        <Box sx={{ my: 2 }}>
          <Typography variant="h5" gutterBottom>
            Mein Wochenplan
          </Typography>
          <FullCalendar
            plugins={[timeGridPlugin]}
            initialView="timeGridWeek"
            weekends={false}
            height={550}
            allDaySlot={false}
            locale={'de'}
            headerToolbar={false}
            slotDuration={'0:30'}
            events={events}
            initialDate={new Date(2023, 3, 17, 14, 0)}
            scrollTime={'08:00:00'}
          />
        </Box>

        <Typography sx={{ mt: 4 }} variant="h5" gutterBottom>
          Verzeichnis
        </Typography>
        <Stack direction="column" sx={{ my: 2 }}>
          {Object.keys(props.root.modules)
            .sort((a, b) => a.localeCompare(b))
            .map((key) => {
              const mod = props.root.modules[key];

              return (
                <Accordion key={key} sx={{ bgcolor: 'white', p: 0 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1" fontWeight={'regular'}>
                      {mod.name}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 0, height: '100%' }}>
                    <List sx={{}}>
                      {mod.events
                        .sort((a, b) => a.type.localeCompare(b.type))
                        .map((ev) => {
                          return (
                            <ListItem key={ev.type}>
                              <Box sx={{ minWidth: 140, mr: 2 }}>
                                <Typography
                                  variant="body1"
                                  sx={{
                                    textDecoration: 'underline',
                                    color: 'primary.main',
                                  }}
                                  component={'a'}
                                  href={getLink(ev.eventID ?? '')}
                                  target="_blank"
                                >
                                  <strong>{ev.type}</strong>{' '}
                                  {ev.lecturer ? ` (${ev.lecturer.split(',')[0]})` : ''}
                                </Typography>
                              </Box>

                              {ev.dates.length > 0 &&
                                isValidRawDate(formatRawDate(ev.dates[0].raw)) && (
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      if (selectedEventIDs.includes(ev.eventID ?? '')) {
                                        setSelectedEventIDs(
                                          selectedEventIDs.filter((s) => s !== ev.eventID)
                                        );
                                      } else {
                                        setSelectedEventIDs([
                                          ...selectedEventIDs,
                                          ev.eventID ?? '',
                                        ]);
                                      }
                                    }}
                                    sx={{ textTransform: 'none', minWidth: 100 }}
                                  >
                                    {!selectedEventIDs.includes(ev.eventID ?? '')
                                      ? 'Hinzufügen'
                                      : 'Entfernen'}
                                  </Button>
                                )}
                              <Stack
                                spacing={1}
                                gap={1}
                                direction="row"
                                sx={{ pl: 3, maxWidth: '100%' }}
                                flexWrap={'wrap'}
                              >
                                {ev.dates.map((s) => (
                                  <Label
                                    variant="ghost"
                                    key={s.raw}
                                    color={
                                      ev.type === UniversityEventType.Vorlesung
                                        ? 'primary'
                                        : 'success'
                                    }
                                  >
                                    {formatRawDate(s.raw)}
                                  </Label>
                                ))}
                              </Stack>
                            </ListItem>
                          );
                        })}
                    </List>
                  </AccordionDetails>
                </Accordion>
              );
            })}
        </Stack>
      </Container>
    </Page>
  );
}

export async function getStaticProps() {
  console.log('NODE_ENV: ', process.env.NODE_ENV);
  const now = new Date();
  const modules: Record<string, Modul> =
    process.env.NODE_ENV === 'development' ? JSON.parse(Mock_Root) : {};

  if (process.env.NODE_ENV !== 'development') {
    const studiengange = [42, 88];

    for (let j = 0; j < studiengange.length; j++) {
      const studiengang = studiengange[j];
      const modulListenGruppe = await fetchModulListenGruppe(studiengang);

      for (let i = 0; i < modulListenGruppe.length; i++) {
        const { value, name } = modulListenGruppe[i];

        if (name === 'Listengruppe wählen...') {
          continue;
        }

        if (value !== null) {
          const events = await fetchVertiefungsModule(value, studiengang);
          events.forEach((ev) => {
            if (!modules[ev.name]) {
              modules[ev.name] = {
                name: ev.name,
                events: [ev],
              };
            } else {
              const events = [...modules[ev.name].events, ev];
              const uniqueEvents = [
                ...new Map(events.map((item) => [item.eventID, item])).values(),
              ];
              modules[ev.name] = {
                ...modules[ev.name],
                events: uniqueEvents,
              };
            }
          });
          await delay(1000);
        }
      }
    }
  }

  const root: Root = {
    modules,
  };

  return {
    props: {
      root,
      updatedAt: now.toISOString(),
    },
    revalidate: 60 * 60 * 8, // In seconds
  };
}
