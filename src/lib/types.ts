
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

export type EvidenceType = 'image' | 'video' | 'document' | 'other';

export type Evidence = {
  id: string;
  title: string;
  type: EvidenceType;
  url: string;
  date: string; // ISO String
  fileName: string;
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
  userId: string;
};

// This is the shape of the data stored in Firestore, using Timestamps
export type ProjectDocument = Omit<Project, 'id' | 'startDate' | 'endDate' | 'evidence'> & {
    startDate: Timestamp;
    endDate: Timestamp | null;
    evidence: Omit<Evidence, 'date'> & { date: Timestamp }[];
}

export type UserRole = 'Alumno' | 'Profesor';

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  school?: string;
  teacherId?: string;
};

export const GOAL_HOURS = 300;