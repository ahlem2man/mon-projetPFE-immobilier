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
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text("Rapport des Transactions Financières", 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Généré le : ${new Date().toLocaleString()}`, 14, 30);

  const tableColumn = ["ID", "Utilisateur", "Montant", "Date", "Statut"];
  const tableRows = [];

  data.forEach(p => {
    const paymentData = [
      p._id.substring(0, 8),
      p.userId?.name || 'N/A',
      `${p.amount} EUR`,
      new Date(p.createdAt).toLocaleDateString(),
      p.status
    ];
    tableRows.push(paymentData);
  });

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 40,
    theme: 'striped'
  });

  doc.save(`${fileName}.pdf`);
};