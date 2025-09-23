import type { Project } from './types';
import { PlaceHolderImages } from './placeholder-images';

const evidenceImages = PlaceHolderImages.filter(img => img.id.startsWith('evidence-'));

export const projects: Project[] = [
  {
    id: '1',
    name: 'Pintura de Mural Comunitario',
    description:
      'Organicé y lideré a un grupo de estudiantes para pintar un mural en el centro comunitario local. El proyecto implicó diseñar el mural, conseguir los materiales y colaborar con la dirección del centro.',
    category: 'Creatividad',
    startDate: new Date('2023-09-01'),
    endDate: new Date('2023-10-15'),
    learningOutcomes: [
      'Demostrar cómo iniciar y planificar una experiencia CAS',
      'Demostrar las habilidades y reconocer los beneficios del trabajo en equipo',
      'Reconocer y considerar la ética de las elecciones y acciones',
    ],
    personalGoals:
      'Mi objetivo es mejorar mis habilidades de liderazgo y aprender a gestionar un proyecto creativo a largo plazo de principio a fin. También quiero tener un impacto positivo y duradero en mi comunidad local.',
    reflections:
      'Este proyecto me enseñó la importancia de una comunicación y planificación claras. Trabajar con un equipo diverso fue un reto, pero finalmente muy gratificante. Aprendí a adaptarme a problemas inesperados, como retrasos por el clima y escasez de materiales. El mural final trajo mucha alegría a la comunidad, que fue la parte más satisfactoria.',
    evidence: [
        { id: 'ev-2', title: 'Pintando el mural', type: 'image', url: evidenceImages.find(i=>i.id === 'evidence-2')?.imageUrl || '', date: new Date() },
        { id: 'ev-1', title: 'Planificación en equipo', type: 'image', url: evidenceImages.find(i=>i.id === 'evidence-1')?.imageUrl || '', date: new Date() },
    ],
    progress: 'Completado',
    timeEntries: [
      { startTime: '2023-09-05T10:00:00Z', endTime: '2023-09-05T12:30:00Z' },
      { startTime: '2023-09-12T10:00:00Z', endTime: '2023-09-12T13:00:00Z' },
      { startTime: '2023-09-19T10:00:00Z', endTime: '2023-09-19T14:00:00Z' },
    ]
  },
  {
    id: '2',
    name: 'Carrera Benéfica de 5K',
    description:
      'Participé en el entrenamiento y la realización de una carrera de 5K para recaudar fondos para un refugio de animales local. Esto implicó un programa de entrenamiento constante y una campaña de recaudación de fondos.',
    category: 'Actividad',
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-04-20'),
    learningOutcomes: [
      'Identificar las propias fortalezas y desarrollar áreas de crecimiento',
      'Mostrar compromiso y perseverancia en las experiencias CAS',
      'Demostrar compromiso con cuestiones de importancia global',
    ],
    personalGoals:
      'Quiero mejorar mi condición física y resistencia. También pretendo desarrollar mis habilidades de recaudación de fondos y promoción para apoyar una causa que me importa.',
    reflections:
      'El entrenamiento fue físicamente exigente, pero me esforcé y vi una mejora significativa en mis tiempos de carrera. Me enseñó disciplina y perseverancia. El aspecto de la recaudación de fondos era nuevo para mí y aprendí a usar eficazmente las redes sociales para llegar a un público más amplio. Cruzar la línea de meta fue un gran logro personal.',
    evidence: [
      { id: 'ev-1', title: 'Progreso de la recaudación', type: 'document', url: evidenceImages.find(i=>i.id === 'evidence-1')?.imageUrl || '', date: new Date() },
    ],
    progress: 'Completado',
    timeEntries: [
      { startTime: '2024-03-05T18:00:00Z', endTime: '2024-03-05T19:00:00Z' },
      { startTime: '2024-03-07T18:00:00Z', endTime: '2024-03-07T19:15:00Z' },
      { startTime: '2024-03-12T18:00:00Z', endTime: '2024-03-12T19:30:00Z' },
    ]
  },
  {
    id: '3',
    name: 'Programación con Causa',
    description:
      'Trabajé con un equipo para desarrollar una aplicación móvil sencilla para una organización sin fines de lucro que ayuda a registrar las horas de voluntariado. El proyecto implicó aprender un nuevo lenguaje de programación y colaborar de forma remota.',
    category: 'Servicio',
    startDate: new Date('2024-01-10'),
    endDate: new Date('2024-05-30'),
    learningOutcomes: [
      'Demostrar que se han afrontado retos, desarrollando nuevas habilidades en el proceso',
      'Demostrar las habilidades y reconocer los beneficios del trabajo en equipo',
    ],
    personalGoals:
      'Aprender una nueva habilidad de programación (React Native) y aplicarla a un problema del mundo real. También quiero experimentar el trabajo en un equipo de desarrollo ágil.',
    reflections:
      'Aprender un nuevo framework fue un reto, pero dividir el problema en tareas más pequeñas ayudó mucho. La colaboración remota requirió herramientas de comunicación sólidas y reuniones periódicas. Fue increíble ver cómo nuestras habilidades técnicas podían ayudar directamente a una organización a ser más eficiente. Ahora tengo más confianza en mis habilidades de programación.',
    evidence: [
      { id: 'ev-4', title: 'Código en pantalla', type: 'image', url: evidenceImages.find(i=>i.id === 'evidence-4')?.imageUrl || '', date: new Date() },
      { id: 'ev-3', title: 'Reunión virtual de equipo', type: 'video', url: evidenceImages.find(i=>i.id === 'evidence-3')?.imageUrl || '', date: new Date() },
    ],
    progress: 'En curso',
    timeEntries: [
      { startTime: '2024-02-01T16:00:00Z', endTime: '2024-02-01T18:00:00Z' },
      { startTime: '2024-02-08T16:00:00Z', endTime: '2024-02-08T18:30:00Z' },
      { startTime: '2024-02-15T16:00:00Z', endTime: null },
    ]
  },
];
