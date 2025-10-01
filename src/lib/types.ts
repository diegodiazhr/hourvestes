
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
  startTime: string; // ISO String. For manual entries, this is the start of the day.
  endTime: string | null; // ISO String or null for active timers. For manual entries, this is the calculated end time.
  manual?: boolean; // Flag to indicate a manual entry
  durationHours?: number; // Stores the manually entered duration
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
    evidence: Omit<Evidence, 'id' | 'date'> & { date: Timestamp }[];
}

export type UserRole = 'Alumno' | 'Profesor' | 'Administrador';

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  school: string; // School name is the ID for the school settings
  teacherId?: string;
  classId?: string;
};

export type School = {
    id: string;
    name: string;
    logoUrl?: string;
    aiEnabled: boolean;
    casEndDate?: Date;
    adminTeacherId: string;
}

export type SchoolDocument = Omit<School, 'id' | 'casEndDate'> & {
    casEndDate?: Timestamp;
}

export type Class = {
    id: string;
    name: string;
    teacherId: string;
    school: string;
    casEndDate: Date;
    studentCount: number;
    students: UserProfile[];
}

export type ClassDocument = Omit<Class, 'id' | 'casEndDate' | 'students' | 'studentCount'> & {
    casEndDate: Timestamp;
};


export const GOAL_HOURS = 300;
