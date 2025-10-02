
'use client';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Project, UserProfile, School, TimeEntry } from './types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

function formatDuration(milliseconds: number) {
    if (milliseconds < 0) milliseconds = 0;
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export async function generateStudentReport(
  student: UserProfile,
  projects: Project[],
  school: School | null
) {
  const doc = new jsPDF();
  const schoolInfo = school ?? { name: student.school || 'Institución no especificada' };


  // --- PDF Header ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Informe de Progreso CAS', 105, 20, { align: 'center' });
  
  if (schoolInfo.logoUrl) {
    try {
      // This is a workaround to bypass CORS issues when loading images from GCS in jsPDF
      const response = await fetch(schoolInfo.logoUrl);
      const blob = await response.blob();
      const dataUrl = await new Promise<string>(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      doc.addImage(dataUrl, 'PNG', 15, 12, 20, 20);
    } catch(e) {
      console.error("Could not load school logo for PDF due to CORS or other issue, proceeding without it.", e);
    }
  }


  doc.setFontSize(14);
  doc.text(student.name, 105, 30, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(schoolInfo.name, 105, 36, { align: 'center' });
  doc.text(`Generado: ${format(new Date(), 'dd/MM/yyyy')}`, 105, 42, { align: 'center' });


  let yPos = 60;

  for (const project of projects) {
    // Check if we need a new page
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    // --- Project Header ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(project.name, 15, yPos);
    yPos += 8;

    // --- Project Details ---
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Categoría: ${project.category} | Progreso: ${project.progress}`, 15, yPos);
    yPos += 10;

    // --- Description ---
    doc.setFont('helvetica', 'bold');
    doc.text('Descripción:', 15, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    const descriptionLines = doc.splitTextToSize(project.description, 180);
    doc.text(descriptionLines, 15, yPos);
    yPos += descriptionLines.length * 5 + 5;
    
    // --- Goals ---
    doc.setFont('helvetica', 'bold');
    doc.text('Metas Personales:', 15, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    const goalsLines = doc.splitTextToSize(project.personalGoals, 180);
    doc.text(goalsLines, 15, yPos);
    yPos += goalsLines.length * 5 + 5;
    
    // --- Learning Outcomes ---
    doc.setFont('helvetica', 'bold');
    doc.text('Resultados de Aprendizaje:', 15, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    project.learningOutcomes.forEach(outcome => {
      doc.text(`- ${outcome}`, 18, yPos);
      yPos += 5;
    });
    yPos += 5;

    // --- Time Logs ---
    if (project.timeEntries && project.timeEntries.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Registro de Tiempo:', 15, yPos);
      yPos += 6;

      const timeBody = project.timeEntries
        .filter(entry => entry.endTime)
        .map(entry => {
            const durationMs = new Date(entry.endTime!).getTime() - new Date(entry.startTime).getTime();
            return [
                format(new Date(entry.startTime), 'dd/MM/yy'),
                entry.manual ? 'Entrada Manual' : `${format(new Date(entry.startTime), 'HH:mm')} - ${format(new Date(entry.endTime!), 'HH:mm')}`,
                formatDuration(durationMs)
            ];
      });

      const totalTimeMs = project.timeEntries.reduce((acc, entry) => {
        if (!entry.endTime) return acc;
        return acc + (new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime());
      }, 0);

      autoTable(doc, {
        startY: yPos,
        head: [['Fecha', 'Detalle', 'Duración (HH:MM:SS)']],
        body: timeBody,
        theme: 'striped',
        headStyles: { fillColor: [38, 38, 38] }
      });
      
      const table = (doc as any).lastAutoTable;
      yPos = table.finalY + 5;
      
      doc.setFont('helvetica', 'bold');
      doc.text(`Tiempo Total: ${formatDuration(totalTimeMs)}`, 15, yPos);
      yPos += 10;
    }
    
    // --- Reflections ---
    doc.setFont('helvetica', 'bold');
    doc.text('Reflexiones:', 15, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    const reflectionLines = doc.splitTextToSize(project.reflections || 'El alumno no ha escrito ninguna reflexión.', 180);
    doc.text(reflectionLines, 15, yPos);
    yPos += reflectionLines.length * 5 + 5;

    // --- Evidence ---
    if (project.evidence && project.evidence.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Evidencias:', 15, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      project.evidence.forEach(item => {
        doc.textWithLink(`- ${item.title} (${item.type})`, 18, yPos, { url: item.url });
        yPos += 5;
      });
      yPos += 5;
    }
    
    doc.line(15, yPos, 195, yPos); // Separator line
    yPos += 10;
  }


  doc.save(`Informe_CAS_${student.name.replace(/ /g, '_')}.pdf`);
}
