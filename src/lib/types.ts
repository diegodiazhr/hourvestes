
import type { Timestamp } from "firebase/firestore";

export type CASCategory = 'Creatividad' | 'Actividad' | 'Servicio';

export const learningOutcomes = [
  'Identificar las propias fortalezas y desarrollar áreas de crecimiento',
  'Demostrar que se han afrontado retos, desarrollando nuevas habilidades en el proceso',
  'Demostrar cómo iniciar y planificar una experiencia CAS',
  'Mostrar compromiso y perseverancia en las experiencias CAS',
  'Demostrar las habilidades y reconocer los beneficios del trabajo en equipo',
  'Demostrar compromiso con cuestiones de importancia global',
  'Reconocer y considerar la ética de las elecciones y acciones',
] as const;

export type LearningOutcome = (typeof learningOutcomes)[number];

export type Evidence = {
  id: string;
  title: string;
  type: 'image' | 'video' | 'document';
  url: string;
  date: Date;
};

export type TimeEntry = {
  startTime: string;
  endTime: string | null;
}

export type Project = {
  id: string;
  name: string;
  description: string;
  category: CASCategory;
  startDate: Date;
  endDate: Date | null;
  learningOutcomes: LearningOutcome[];
  personalGoals: string;
  reflections: string;
  evidence: Evidence[];
  progress: 'Planificación' | 'En curso' | 'Completado';
  timeEntries?: TimeEntry[];
};

export type ProjectDocument = {
  name: string;
  description: string;
  category: CASCategory;
  startDate: Timestamp;
  endDate: Timestamp | null;
  learningOutcomes: LearningOutcome[];
  personalGoals: string;
  reflections: string;
  evidence: Evidence[];
  progress: 'Planificación' | 'En curso' | 'Completado';
  timeEntries?: TimeEntry[];
};
