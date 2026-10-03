import { jsPDF } from 'jspdf';
import { AnalysisResult, ExperienceLevel } from '../types';

export function exportAnalysisToPdf(
  data: AnalysisResult,
  experienceLevel: ExperienceLevel,
  roleTitle?: string
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = 18;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 18) {
      doc.addPage();
      y = 20;
      addRunningHeader();
    }
  };

  const addRunningHeader = () => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 150);
    doc.text('HireCraft · Technical Interview & 7-Day Roadmap', margin, 10);
    doc.text(experienceLevel + ' Level', pageWidth - margin, 10, { align: 'right' });
    doc.setDrawColor(220, 220, 230);
    doc.setLineWidth(0.2);
    doc.line(margin, 12, pageWidth - margin, 12);
  };

  const resolvedTitle = roleTitle || data.role_summary?.identified_title || 'Software Engineering Role';

  // --- Header Banner ---
  doc.setFillColor(15, 23, 42); // slate-900
  doc.roundedRect(margin, y, contentWidth, 32, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text(resolvedTitle, margin + 6, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(165, 180, 252); // indigo-200
  doc.text(`Seniority Level: ${experienceLevel}  ·  Generated on ${new Date().toLocaleDateString()}`, margin + 6, y + 17);

  if (data.role_summary?.primary_tech_stack?.length) {
    doc.setFontSize(8);
    doc.setTextColor(203, 213, 225); // slate-300
    const stackStr = 'Key Tech: ' + data.role_summary.primary_tech_stack.join(', ');
    const splitStack = doc.splitTextToSize(stackStr, contentWidth - 12);
    doc.text(splitStack, margin + 6, y + 24);
  }

  y += 40;

  // --- Section 1: Top Required Skills ---
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('1. Top Required Skills & Competencies', margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);

  data.top_skills.forEach((skill, i) => {
    checkPageBreak(8);
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(margin, y - 4, contentWidth, 7, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229); // indigo-600
    doc.text(`•`, margin + 3, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text(skill, margin + 7, y);
    y += 9;
  });

  y += 4;

  // --- Section 2: Technical Interview Questions ---
  checkPageBreak(35);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text(`2. Technical Interview Questions (${data.technical_questions.length})`, margin, y);
  y += 7;

  data.technical_questions.forEach((q, i) => {
    const qLines = doc.splitTextToSize(`Q${i + 1}: ${q.question}`, contentWidth - 8);
    const boxHeight = qLines.length * 4.5 + 11;
    checkPageBreak(boxHeight + 4);

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y - 3, contentWidth, boxHeight, 2, 2, 'FD');

    // Focus Area Tag
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(14, 116, 144); // cyan-700
    doc.text(`FOCUS: ${q.focus_area.toUpperCase()}`, margin + 4, y + 2);

    // Question Text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(qLines, margin + 4, y + 7);

    y += boxHeight + 4;
  });

  y += 4;

  // --- Section 3: 7-Day Master Preparation Plan ---
  checkPageBreak(35);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('3. Seven-Day Master Preparation Curriculum', margin, y);
  y += 7;

  data.seven_day_plan.forEach((dayItem) => {
    checkPageBreak(25);
    doc.setFillColor(238, 242, 255); // indigo-50
    doc.roundedRect(margin, y - 3, contentWidth, 7, 1.5, 1.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(67, 56, 202); // indigo-700
    doc.text(`DAY ${dayItem.day}: ${dayItem.focus}`, margin + 4, y + 1.5);
    y += 8;

    dayItem.tasks.forEach((task) => {
      const taskLines = doc.splitTextToSize(task, contentWidth - 12);
      checkPageBreak(taskLines.length * 4.5 + 4);

      // Checkbox square
      doc.setDrawColor(148, 163, 184);
      doc.setLineWidth(0.3);
      doc.rect(margin + 3, y - 2.8, 3, 3);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.text(taskLines, margin + 8, y);
      y += taskLines.length * 4.5 + 2;
    });

    y += 3;
  });

  y += 4;

  // --- Section 4: Behavioral Questions & STAR ---
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('4. Behavioral Interview Questions (STAR Method)', margin, y);
  y += 7;

  data.behavioral_questions.forEach((bq, i) => {
    const bLines = doc.splitTextToSize(`${i + 1}. ${bq}`, contentWidth - 6);
    checkPageBreak(bLines.length * 4.5 + 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(bLines, margin + 3, y);
    y += bLines.length * 4.5 + 3;
  });

  y += 4;

  // --- Section 5: System Design & Architecture Topics ---
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('5. System Design & Architecture Topics', margin, y);
  y += 7;

  data.system_design_or_architecture_topics.forEach((topic, i) => {
    const tLines = doc.splitTextToSize(`• Scenario ${i + 1}: ${topic}`, contentWidth - 6);
    checkPageBreak(tLines.length * 4.5 + 3);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(tLines, margin + 3, y);
    y += tLines.length * 4.5 + 2;
  });

  y += 4;

  // --- Section 6: High-Leverage Reverse Interview Questions ---
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('6. Strategic Questions to Ask the Interviewer', margin, y);
  y += 7;

  data.questions_for_interviewer.forEach((rq, i) => {
    const rqLines = doc.splitTextToSize(`"${rq}"`, contentWidth - 6);
    checkPageBreak(rqLines.length * 4.5 + 3);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(55, 65, 81);
    doc.text(rqLines, margin + 3, y);
    y += rqLines.length * 4.5 + 3;
  });

  // --- Footers on all pages ---
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Page ${p} of ${totalPages}  ·  HireCraft Intelligence Studio`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  // Save the PDF
  const filename = `${resolvedTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_interview_roadmap.pdf`;
  doc.save(filename);
}
