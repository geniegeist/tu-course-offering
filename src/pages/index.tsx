import Page from '@/components/Page';
import {
  Avatar,
  Container,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Stack,
  styled,
  Typography,
} from '@mui/material';
import { mockup } from '@/model/example';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionSummary, {
  AccordionSummaryProps,
} from '@mui/material/AccordionSummary';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import { getLink } from '@/utils/getLink';
import { Modul, Root } from '@/types/model';
import { mock } from 'node:test';
import {
  fetchModulListenGruppe,
  fetchVertiefungsModule,
} from '@/services/scraper';
import delay from 'delay';

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
    theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, .05)'
      : 'rgba(0, 0, 0, .03)',
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
  return (
    <Page
      title="Sommersemester 2023"
      sx={{ bgcolor: 'background.default', height: '100vh' }}
    >
      <Container sx={{ py: 8, bgcolor: 'background.default' }}>
        <Typography variant="h2">
          Mathe-Vorlesungsverzeichnis SS 2023
        </Typography>
        <Typography variant="h3" color="text.secondary">
          Technische Universität Berlin
        </Typography>

        <Typography variant="subtitle1" color="text.secondary">
          Zuletzt aktualisiert: {props.updatedAt}
        </Typography>

        <Stack direction="column" sx={{ my: 2 }}>
          {Object.keys(props.root.modules)
            .sort((a, b) => a.localeCompare(b))
            .map((key) => {
              const module = props.root.modules[key];

              return (
                <Accordion key={key}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>{module.name}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List>
                      {module.events.map((ev) => {
                        return (
                          <ListItem key={ev.type} disablePadding>
                            <ListItemButton
                              dense
                              href={getLink(ev.eventID ?? '')}
                              target="_blank"
                            >
                              {ev.type}
                            </ListItemButton>
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
  const now = new Date();

  const studiengange = [42, 88];
  const modules: Record<string, Modul> = {};

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

  const root: Root = {
    modules,
  };

  return {
    props: {
      root,
      updatedAt: now.toISOString(),
    },
    revalidate: 60 * 60 * 24, // In seconds
  };
}
