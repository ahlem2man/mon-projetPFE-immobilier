import jsPDF from 'jspdf';
import 'jspdf-autotable';

// --- EXPORT CSV ---
export const exportToCSV = (data, fileName) => {
  if (data.length === 0) return;
  
  // En-têtes
  const headers = ["ID_Transaction,Utilisateur,Email,Montant,Date,Statut\n"];
  
  // Lignes
  const rows = data.map(p => {
    return `${p._id},${p.userId?.name || 'N/A'},${p.userId?.email || 'N/A'},${p.amount},${new Date(p.createdAt).toLocaleDateString()},${p.status}\n`;
  });

  const blob = new Blob([headers, ...rows], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${fileName}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// --- EXPORT PDF ---
export const exportToPDF = (data, fileName) => {
  if (!data || data.length === 0) return;
  
  try {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFontSize(18);
    doc.text("Rapport des Transactions Financières", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Généré le : ${new Date().toLocaleString()}`, 14, 30);

    const tableColumn = ["ID", "Utilisateur", "Montant", "Date", "Statut"];
    const columnWidth = (pageWidth - 28) / tableColumn.length;
    let yPosition = 40;

    // Header row
    doc.setFillColor(41, 128, 185);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');

    tableColumn.forEach((header, i) => {
      doc.rect(14 + i * columnWidth, yPosition - 5, columnWidth, 7, 'F');
      doc.text(header, 16 + i * columnWidth, yPosition + 1);
    });

    yPosition += 10;
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);

    // Data rows
    data.forEach((p) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }

      const row = [
        p._id.substring(0, 8),
        p.userId?.name || 'N/A',
        `${p.amount} EUR`,
        new Date(p.createdAt).toLocaleDateString(),
        p.status
      ];

      row.forEach((cell, i) => {
        doc.text(String(cell), 16 + i * columnWidth, yPosition);
      });

      yPosition += 8;
    });

    doc.save(`${fileName}.pdf`);
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    alert('Erreur lors de la génération du PDF');
  }
};