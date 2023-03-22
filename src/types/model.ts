export enum UniversityEventType {
  Vorlesung = 'VL',
  Uebung = 'UE',
  Tutorium = 'Tutorium',
  IntegrierteVeranstaltung = 'Integrierte Veranstaltung',
  Seminar = 'Seminar',
  Unbekannt = 'unkown',
}

export type UniversityEvent = {
  name: string;
  link?: string;
  eventID: string | null;
  type: UniversityEventType;
  lecturer: string | undefined | null;
  dates: UniversityEventDate[];
};

export type UniversityEventDate = {
  raw: string;
};

export type Modul = {
  name: string;
  events: UniversityEvent[];
};

export type ModulListenGruppe = {
  name: string;
  value: number | null;
};

export type Root = {
  modules: Record<string, Modul>;
};
