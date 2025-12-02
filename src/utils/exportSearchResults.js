/**
 * Módulo de exportación de resultados de búsqueda
 * Soporta: PDF, Excel, CSV
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { formatPrice } from './priceUtils';

/**
 * Exporta resultados de búsqueda a PDF
 * @param {Object} results - Resultados fusionados de búsqueda
 * @param {string} query - Término de búsqueda
 */
export async function exportToPDF(results, query) {
  const doc = new jsPDF();
  
  // Título
  doc.setFontSize(20);
  doc.text('Búsqueda Global de Productos', 14, 22);
  
  doc.setFontSize(12);
  doc.text(`Búsqueda: "${query}"`, 14, 30);
  doc.text(`Fecha: ${new Date().toLocaleString('es-AR')}`, 14, 36);
  
  let yPos = 45;

  // Resultados locales
  if (results.local && results.local.length > 0) {
    doc.setFontSize(16);
    doc.text('Catálogo Interno', 14, yPos);
    yPos += 5;
    
    const localData = results.local.map(p => [
      p.descripcion || p.nombre || '',
      p.linea || p.categoria || '',
      formatPrice(p.precio || 0),
      p.vigencia || 'SI',
      p.stock || 0,
    ]);

    doc.autoTable({
      startY: yPos,
      head: [['Producto', 'Línea', 'Precio', 'Vigencia', 'Stock']],
      body: localData,
      theme: 'striped',
      headStyles: { fillColor: [33, 150, 243] },
    });
    
    yPos = doc.lastAutoTable.finalY + 15;
  }

  // Resultados web
  if (results.web && results.web.length > 0) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(16);
    doc.text('Resultados Web', 14, yPos);
    yPos += 5;
    
    const webData = results.web.slice(0, 30).map(p => [
      p.nombre || '',
      p.tienda || p.fuente || '',
      formatPrice(p.precio || 0),
      p.calificacion ? p.calificacion.toFixed(1) : 'N/A',
      p.envioGratis ? 'Sí' : 'No',
    ]);

    doc.autoTable({
      startY: yPos,
      head: [['Producto', 'Tienda', 'Precio', 'Calificación', 'Envío Gratis']],
      body: webData,
      theme: 'striped',
      headStyles: { fillColor: [76, 175, 80] },
    });
    
    yPos = doc.lastAutoTable.finalY + 15;
  }

  // Comparaciones
  if (results.comparisons && results.comparisons.length > 0) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(16);
    doc.text('Comparaciones de Precios', 14, yPos);
    yPos += 5;
    
    const comparisonData = results.comparisons.map(c => [
      c.productos[0]?.nombre || '',
      formatPrice(c.precioMin || 0),
      formatPrice(c.precioMax || 0),
      formatPrice(c.precioPromedio || 0),
      c.totalFuentes || 0,
    ]);

    doc.autoTable({
      startY: yPos,
      head: [['Producto', 'Precio Mín', 'Precio Máx', 'Precio Promedio', 'Fuentes']],
      body: comparisonData,
      theme: 'striped',
      headStyles: { fillColor: [255, 152, 0] },
    });
  }

  // Guardar
  const fileName = `busqueda_${query.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`;
  doc.save(fileName);
}

/**
 * Exporta resultados a Excel
 * @param {Object} results - Resultados fusionados
 * @param {string} query - Término de búsqueda
 */
export async function exportToExcel(results, query) {
  const wb = XLSX.utils.book_new();
  
  // Hoja 1: Resumen
  const summaryData = [
    ['Búsqueda Global de Productos'],
    ['Término de búsqueda:', query],
    ['Fecha:', new Date().toLocaleString('es-AR')],
    [],
    ['Resumen'],
    ['Resultados locales:', results.local?.length || 0],
    ['Resultados web:', results.web?.length || 0],
    ['Comparaciones:', results.comparisons?.length || 0],
    [],
  ];
  
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen');
  
  // Hoja 2: Catálogo interno
  if (results.local && results.local.length > 0) {
    const localHeaders = ['Producto', 'Código', 'Línea', 'Categoría', 'Precio', 'Stock', 'Vigencia'];
    const localData = results.local.map(p => [
      p.descripcion || p.nombre || '',
      p.codigo || '',
      p.linea || '',
      p.categoria || '',
      p.precio || 0,
      p.stock || 0,
      p.vigencia || 'SI',
    ]);
    
    const wsLocal = XLSX.utils.aoa_to_sheet([localHeaders, ...localData]);
    XLSX.utils.book_append_sheet(wb, wsLocal, 'Catálogo Interno');
  }
  
  // Hoja 3: Resultados web
  if (results.web && results.web.length > 0) {
    const webHeaders = ['Producto', 'Tienda', 'Fuente', 'Precio', 'Calificación', 'Envío Gratis', 'Vendidos', 'URL'];
    const webData = results.web.map(p => [
      p.nombre || '',
      p.tienda || '',
      p.fuente || '',
      p.precio || 0,
      p.calificacion || '',
      p.envioGratis ? 'Sí' : 'No',
      p.vendidos || 0,
      p.url || '',
    ]);
    
    const wsWeb = XLSX.utils.aoa_to_sheet([webHeaders, ...webData]);
    XLSX.utils.book_append_sheet(wb, wsWeb, 'Resultados Web');
  }
  
  // Hoja 4: Comparaciones
  if (results.comparisons && results.comparisons.length > 0) {
    const compHeaders = ['Producto', 'Precio Mínimo', 'Precio Máximo', 'Precio Promedio', 'Número de Fuentes'];
    const compData = results.comparisons.map(c => [
      c.productos[0]?.nombre || '',
      c.precioMin || 0,
      c.precioMax || 0,
      c.precioPromedio || 0,
      c.totalFuentes || 0,
    ]);
    
    const wsComp = XLSX.utils.aoa_to_sheet([compHeaders, ...compData]);
    XLSX.utils.book_append_sheet(wb, wsComp, 'Comparaciones');
  }
  
  // Guardar
  const fileName = `busqueda_${query.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Exporta resultados a CSV
 * @param {Object} results - Resultados fusionados
 * @param {string} query - Término de búsqueda
 */
export async function exportToCSV(results, query) {
  const allResults = [];
  
  // Agregar resultados locales
  if (results.local && results.local.length > 0) {
    results.local.forEach(p => {
      allResults.push({
        Tipo: 'Catálogo Interno',
        Producto: p.descripcion || p.nombre || '',
        Código: p.codigo || '',
        Línea: p.linea || '',
        Categoría: p.categoria || '',
        Precio: p.precio || 0,
        Stock: p.stock || 0,
        Vigencia: p.vigencia || 'SI',
        Tienda: '',
        URL: '',
        Calificación: '',
      });
    });
  }
  
  // Agregar resultados web
  if (results.web && results.web.length > 0) {
    results.web.forEach(p => {
      allResults.push({
        Tipo: 'Web',
        Producto: p.nombre || '',
        Código: '',
        Línea: '',
        Categoría: '',
        Precio: p.precio || 0,
        Stock: '',
        Vigencia: '',
        Tienda: p.tienda || p.fuente || '',
        URL: p.url || '',
        Calificación: p.calificacion || '',
      });
    });
  }
  
  // Convertir a CSV
  const headers = Object.keys(allResults[0] || {});
  const csvRows = [
    headers.join(','),
    ...allResults.map(row => 
      headers.map(header => {
        const value = row[header] || '';
        // Escapar comillas
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    ),
  ];
  
  const csv = csvRows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `busqueda_${query.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Función principal de exportación
 * @param {Object} results - Resultados fusionados
 * @param {string} format - Formato: 'pdf', 'excel', 'csv'
 * @param {string} query - Término de búsqueda
 */
export async function exportSearchResults(results, format, query) {
  try {
    switch (format.toLowerCase()) {
      case 'pdf':
        await exportToPDF(results, query);
        break;
      case 'excel':
      case 'xlsx':
        await exportToExcel(results, query);
        break;
      case 'csv':
        await exportToCSV(results, query);
        break;
      default:
        throw new Error(`Formato no soportado: ${format}`);
    }
  } catch (error) {
    console.error('Error exportando resultados:', error);
    throw error;
  }
}

