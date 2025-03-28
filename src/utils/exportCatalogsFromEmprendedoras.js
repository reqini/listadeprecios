import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from './axios';

const exportCatalog = async (cuotaKey, catalogName) => {
  try {
    const result = await axios.get(`/api/productos?cuota=${cuotaKey}`);
    const productos = result.data.filter(p => p[cuotaKey] && p[cuotaKey] !== 'NO');

    const productosParaPDF = productos.map(producto => ({
      imagen: producto.imagen,
      descripcion: producto.descripcion,
      cuota_formateada: producto[cuotaKey],
    }));

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(catalogName, 14, 20);

    const tableColumn = ["Imagen", "Nombre del Producto", "Cuota"];
    const tableRows = [];

    productosParaPDF.forEach((producto) => {
      const img = producto.imagen || '';
      const nombre = producto.descripcion;
      const cuota = producto.cuota_formateada;

      tableRows.push([
        { content: '', styles: { cellWidth: 20 }, image: img },
        nombre,
        cuota,
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: { cellPadding: 3, fontSize: 9 },
      didDrawCell: (data) => {
        if (data.column.index === 0 && data.cell.section === 'body') {
          if (data.cell.raw.image) {
            doc.addImage(data.cell.raw.image, 'JPEG', data.cell.x + 2, data.cell.y + 2, 16, 16);
          }
        }
      }
    });

    doc.save(`${catalogName}.pdf`);
  } catch (error) {
    console.error('Error generando PDF:', error);
    alert("Ocurrió un error generando el PDF.");
  }
};

export default exportCatalog;
