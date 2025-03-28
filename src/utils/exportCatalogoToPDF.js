import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const exportCatalogoToPDF = async (productos, cuotaLabel = "Precio") => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text(`Catálogo - ${cuotaLabel}`, 14, 20);

  const tableData = productos.map((producto, idx) => [
    idx + 1,
    producto.descripcion || "Sin descripción",
    producto.linea || "-",
    producto["tres_sin_interes"] || producto["precio_negocio"] || "Sin precio"
  ]);

  autoTable(doc, {
    head: [["#", "Producto", "Línea", cuotaLabel]],
    body: tableData,
    startY: 30,
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 90 },
      2: { cellWidth: 40 },
      3: { cellWidth: 40 },
    },
  });

  doc.save(`catalogo-${cuotaLabel.replace(/\s/g, "_").toLowerCase()}.pdf`);
};

export default exportCatalogoToPDF;
