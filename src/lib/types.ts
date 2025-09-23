export type CASCategory = 'Creativity' | 'Activity' | 'Service';

export const learningOutcomes = [
  'Identify own strengths and develop areas for growth',
  'Demonstrate that challenges have been undertaken, developing new skills in the process',
  'Demonstrate how to initiate and plan a CAS experience',
  'Show commitment to and perseverance in CAS experiences',
  'Demonstrate the skills and recognize the benefits of working collaboratively',
  'Demonstrate engagement with issues of global significance',
  'Recognize and consider the ethics of choices and actions',
] as const;

export type LearningOutcome = (typeof learningOutcomes)[number];

export type Evidence = {
  id: string;
  title: string;
  type: 'image' | 'video' | 'document';
  url: string;
  date: Date;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  category: CASCategory;
  startDate: Date;
  endDate: Date;
  learningOutcomes: LearningOutcome[];
  personalGoals: string;
  reflections: string;
  evidence: Evidence[];
  progress: 'Planning' | 'In Progress' | 'Completed';
};
