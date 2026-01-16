import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type ResultType = {
    studentName: string | null;
    grade: string | null;
    feedback: string | null;
};

type EvaluationType = {
    examType: string | null;
    createdAt: Date | null;
    averageGrade: string | null;
};

export function exportToCSV(results: ResultType[], filename: string) {
    // Headers
    const headers = ['Nombre', 'Nota', 'Feedback'];

    // Rows
    const rows = results.map(r => [
        r.studentName || 'Sin nombre',
        r.grade || '0',
        (r.feedback || '').replace(/"/g, '""') // Escape quotes
    ]);

    // Build CSV
    const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Download
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' }); // UTF-8 BOM
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
}

export function exportToPDF(evaluation: EvaluationType, results: ResultType[], filename: string) {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text('Resultados de Evaluación', 14, 20);

    // Info
    doc.setFontSize(11);
    doc.text(`Tipo: ${evaluation.examType || 'Evaluación'}`, 14, 30);
    doc.text(`Fecha: ${evaluation.createdAt ? new Date(evaluation.createdAt).toLocaleDateString('es-AR') : 'N/A'}`, 14, 37);
    doc.text(`Promedio: ${evaluation.averageGrade || '0'}/10`, 14, 44);
    doc.text(`Total Estudiantes: ${results.length}`, 14, 51);

    // Prepare table data
    const tableData = results.map(r => [
        r.studentName || 'Sin nombre',
        `${r.grade || '0'}/10`,
        truncateText(r.feedback || 'Sin feedback', 50)
    ]);

    // Table
    autoTable(doc, {
        head: [['Nombre', 'Nota', 'Feedback']],
        body: tableData,
        startY: 60,
        styles: {
            fontSize: 9,
            cellPadding: 3,
        },
        headStyles: {
            fillColor: [66, 139, 202],
            fontStyle: 'bold',
        },
        columnStyles: {
            0: { cellWidth: 40 },  // Nombre
            1: { cellWidth: 20 },  // Nota
            2: { cellWidth: 120 }, // Feedback
        },
        margin: { left: 14, right: 14 },
    });

    // Download
    doc.save(`${filename}.pdf`);
}

function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}
