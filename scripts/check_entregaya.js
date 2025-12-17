#!/usr/bin/env node
// Script para verificar directamente la Google Sheet de Entrega-Ya (gid=10927216)
const url = 'https://docs.google.com/spreadsheets/d/1ATl5Avm6NjoiaPrVOG8xw8fLAZeBfuf5HG-sGBMCGQw/gviz/tq?tqx=out:json&gid=10927216';

async function fetchSheet() {
  try {
    const res = await fetch(url, { method: 'GET' });
    const text = await res.text();
    // Extraer el JSON dentro de google.visualization.Query.setResponse(...)
    const marker = 'google.visualization.Query.setResponse(';
    const start = text.indexOf(marker);
    if (start === -1) {
      throw new Error('Formato inesperado: no se encontró el callback de Google Visualization');
    }
    const openIdx = start + marker.length;
    // Buscar el cierre correspondiente ');' al final
    const endIdx = text.lastIndexOf(');');
    if (endIdx === -1) {
      throw new Error('Formato inesperado: no se encontró el cierre del callback');
    }
    const jsonText = text.substring(openIdx, endIdx);
    const data = JSON.parse(jsonText);
    const cols = (data.table.cols || []).map(c => (c.label || c.id || '').toString().trim());
    const rows = (data.table.rows || []).map(r => {
      const obj = {};
      (r.c || []).forEach((cell, i) => {
        const key = cols[i] || `col_${i}`;
        obj[key] = cell && cell.v !== null && cell.v !== undefined ? cell.v : '';
      });
      return obj;
    });

    console.log('Filas totales obtenidas:', rows.length);

    // Mostrar primeros 20 filas con campos relevantes
    const relevantKeys = ['codigo', 'id', 'descripcion', 'nombre', 'precio_contado', 'psvp_lista', 'entrega_inmediata', 'entrega_ya', 'hoja', 'sheet'];
    const preview = rows.slice(0, 20).map((r, idx) => {
      const out = { _row: idx + 1 };
      relevantKeys.forEach(k => {
        if (r[k] !== undefined) out[k] = r[k];
      });
      return out;
    });

    console.log('Preview (primeras 20 filas, campos detectados):');
    console.table(preview);

    // Contar cuántas filas parecen pertenecer a "entrega-ya"
    const variantes = ['entregas-ya','entregas_ya','entregas ya','entregasya','entrega-ya','entrega_ya','entrega ya'];
    const isEntrega = (r) => {
      const hoja = String(r.hoja || r.sheet || r.HOJA || r.SHEET || r.hoja_nombre || r.sheet_name || '').toLowerCase().trim();
      if (hoja && variantes.some(v => hoja.includes(v.replace(/[-_\s]/g, '')) || hoja === v)) return true;
      const ent = String(r.entrega_inmediata || r.entrega_ya || r.entrega || '').toLowerCase();
      if (ent === 'si' || ent === 'yes' || ent === 'true' || ent === '1') return true;
      return false;
    };

    const entregayaRows = rows.filter(isEntrega);
    console.log('Filas que parecen pertenecer a entrega-ya:', entregayaRows.length);
    if (entregayaRows.length > 0) {
      const list = entregayaRows.map(r => ({ codigo: r.codigo || r.id || '', descripcion: r.descripcion || r.nombre || '', precio_contado: r.precio_contado || r.precio || r.precio_contado_lista || '', psvp_lista: r.psvp_lista || r.psvp || '' }));
      console.table(list);
    }

  } catch (err) {
    console.error('Error al consultar la Google Sheet:', err);
    process.exit(1);
  }
}

fetchSheet();
