import type { Project } from './types';
import { PlaceHolderImages } from './placeholder-images';

const evidenceImages = PlaceHolderImages.filter(img => img.id.startsWith('evidence-'));

export const projects: Project[] = [
  {
    id: '1',
    name: 'Community Mural Painting',
    description:
      'Organized and led a group of students to paint a mural at the local community center. The project involved designing the mural, sourcing materials, and collaborating with the center\'s management.',
    category: 'Creativity',
    startDate: new Date('2023-09-01'),
    endDate: new Date('2023-10-15'),
    learningOutcomes: [
      'Demonstrate how to initiate and plan a CAS experience',
      'Demonstrate the skills and recognize the benefits of working collaboratively',
      'Recognize and consider the ethics of choices and actions',
    ],
    personalGoals:
      'My goal is to improve my leadership skills and learn how to manage a long-term creative project from start to finish. I also want to make a lasting positive impact on my local community.',
    reflections:
      'This project taught me the importance of clear communication and planning. Working with a diverse team was challenging but ultimately rewarding. I learned to adapt to unexpected issues, like weather delays and material shortages. The final mural brought so much joy to the community, which was the most fulfilling part.',
    evidence: [
        { id: 'ev-2', title: 'Painting the mural', type: 'image', url: evidenceImages.find(i=>i.id === 'evidence-2')?.imageUrl || '', date: new Date() },
        { id: 'ev-1', title: 'Team planning', type: 'image', url: evidenceImages.find(i=>i.id === 'evidence-1')?.imageUrl || '', date: new Date() },
    ],
    progress: 'Completed',
  },
  {
    id: '2',
    name: 'Charity 5K Run',
    description:
      'Participated in training for and completing a 5K run to raise funds for a local animal shelter. This involved a consistent training schedule and a fundraising campaign.',
    category: 'Activity',
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-04-20'),
    learningOutcomes: [
      'Identify own strengths and develop areas for growth',
      'Show commitment to and perseverance in CAS experiences',
      'Demonstrate engagement with issues of global significance',
    ],
    personalGoals:
      'I want to improve my physical fitness and endurance. I also aim to develop my fundraising and advocacy skills to support a cause I care about.',
    reflections:
      'The training was physically demanding, but I pushed through and saw significant improvement in my running times. It taught me discipline and perseverance. The fundraising aspect was new to me, and I learned how to effectively use social media to reach a wider audience. Crossing the finish line was a huge personal achievement.',
    evidence: [
      { id: 'ev-1', title: 'Fundraising progress', type: 'document', url: evidenceImages.find(i=>i.id === 'evidence-1')?.imageUrl || '', date: new Date() },
    ],
    progress: 'Completed',
  },
  {
    id: '3',
    name: 'Coding for a Cause',
    description:
      'Worked with a team to develop a simple mobile app for a non-profit organization that helps track volunteer hours. The project involved learning a new programming language and collaborating remotely.',
    category: 'Service',
    startDate: new Date('2024-01-10'),
    endDate: new Date('2024-05-30'),
    learningOutcomes: [
      'Demonstrate that challenges have been undertaken, developing new skills in the process',
      'Demonstrate the skills and recognize the benefits of working collaboratively',
    ],
    personalGoals:
      'To learn a new programming skill (React Native) and apply it to a real-world problem. I also want to experience working in an agile development team.',
    reflections:
      'Learning a new framework was challenging, but breaking down the problem into smaller tasks helped a lot. Remote collaboration required strong communication tools and regular check-ins. It was amazing to see how our technical skills could directly help an organization become more efficient. I am now more confident in my coding abilities.',
    evidence: [
      { id: 'ev-4', title: 'Code on screen', type: 'image', url: evidenceImages.find(i=>i.id === 'evidence-4')?.imageUrl || '', date: new Date() },
      { id: 'ev-3', title: 'Virtual team meeting', type: 'video', url: evidenceImages.find(i=>i.id === 'evidence-3')?.imageUrl || '', date: new Date() },
    ],
    progress: 'In Progress',
  },
];
