import { mapEntregaYaRowToProduct, getEntregaYaProducts } from '../entregaYaAPI';
import axios from '../axios';

// Mock de axios
jest.mock('../axios');
jest.mock('../priceUtils', () => ({
  parsePrice: (price) => {
    if (typeof price === 'string') {
      return parseFloat(price.replace(/[$,\s]/g, '')) || 0;
    }
    return price || 0;
  },
}));

describe('entregaYaAPI', () => {
  describe('mapEntregaYaRowToProduct', () => {
    it('debe mapear correctamente una fila completa', () => {
      const row = {
        codigo: 'PROD001',
        nombre: 'Producto Test',
        descripcion: 'Descripción del producto',
        precio_negocio: '15000',
        foto: 'https://example.com/image.jpg',
        categoria: 'Electrodomésticos',
        stock: '5',
        entrega_ya: 'SI',
        vigencia: 'SI',
        linea: 'Línea A',
        tags: 'nuevo,popular',
      };

      const result = mapEntregaYaRowToProduct(row);

      expect(result.codigo).toBe('PROD001');
      expect(result.nombre).toBe('Producto Test');
      expect(result.precio).toBe(15000);
      expect(result.imagen).toBe('https://example.com/image.jpg');
      expect(result.stock).toBe(5);
      expect(result.entregaInmediata).toBe(true);
      expect(result.vigente).toBe(true);
    });

    it('debe manejar campos faltantes', () => {
      const row = {
        codigo: 'PROD002',
        nombre: 'Producto Sin Descripción',
      };

      const result = mapEntregaYaRowToProduct(row);

      expect(result.codigo).toBe('PROD002');
      expect(result.descripcion).toBe('');
      expect(result.precio).toBe(0);
      expect(result.imagen).toBe('');
    });

    it('debe normalizar diferentes formatos de precio', () => {
      const row1 = { codigo: 'P1', precio: '15000' };
      const row2 = { codigo: 'P2', precio: '$15,000' };
      const row3 = { codigo: 'P3', precio_negocio: 15000 };

      const result1 = mapEntregaYaRowToProduct(row1);
      const result2 = mapEntregaYaRowToProduct(row2);
      const result3 = mapEntregaYaRowToProduct(row3);

      expect(result1.precio).toBeGreaterThan(0);
      expect(result2.precio).toBeGreaterThan(0);
      expect(result3.precio).toBe(15000);
    });

    it('debe detectar última unidad correctamente', () => {
      const row1 = { codigo: 'P1', stock: '1' };
      const row2 = { codigo: 'P2', stock: '2', ultima_unidad: 'SI' };

      const result1 = mapEntregaYaRowToProduct(row1);
      const result2 = mapEntregaYaRowToProduct(row2);

      expect(result1.esUltimaUnidad).toBe(true);
      expect(result2.esUltimaUnidad).toBe(true);
    });

    it('debe manejar diferentes nombres de campos para la misma información', () => {
      const row = {
        id: '123',
        titulo: 'Producto con título',
        imagen_url: 'https://example.com/img.jpg',
        rubro: 'Categoría A',
      };

      const result = mapEntregaYaRowToProduct(row);

      expect(result.id).toBe('123');
      expect(result.nombre).toBe('Producto con título');
      expect(result.imagen).toBe('https://example.com/img.jpg');
      expect(result.categoria).toBe('Categoría A');
    });
  });

  describe('getEntregaYaProducts', () => {
    it('debe obtener productos del endpoint específico', async () => {
      const mockProducts = [
        { codigo: 'P1', nombre: 'Producto 1', precio: '10000' },
        { codigo: 'P2', nombre: 'Producto 2', precio: '20000' },
      ];

      axios.get.mockResolvedValueOnce({
        data: mockProducts,
      });

      const result = await getEntregaYaProducts();

      expect(axios.get).toHaveBeenCalledWith('/api/entrega-ya');
      expect(result).toHaveLength(2);
      expect(result[0].nombre).toBe('Producto 1');
    });

    it('debe hacer fallback a /api/productos si el endpoint específico falla', async () => {
      const mockAllProducts = [
        { codigo: 'P1', nombre: 'Producto 1', hoja: 'entrega-ya', precio: '10000' },
        { codigo: 'P2', nombre: 'Producto 2', hoja: 'otra', precio: '20000' },
      ];

      axios.get
        .mockRejectedValueOnce(new Error('Endpoint no existe'))
        .mockResolvedValueOnce({ data: mockAllProducts });

      const result = await getEntregaYaProducts();

      expect(axios.get).toHaveBeenCalledWith('/api/productos');
      expect(result).toHaveLength(1);
      expect(result[0].codigo).toBe('P1');
    });

    it('debe manejar errores correctamente', async () => {
      axios.get.mockRejectedValue(new Error('Error de red'));

      await expect(getEntregaYaProducts()).rejects.toThrow('Error de red');
    });

    it('debe filtrar productos no vigentes y repuestos', async () => {
      const mockProducts = [
        { codigo: 'P1', nombre: 'Producto 1', hoja: 'entrega-ya', vigencia: 'SI', precio: '10000' },
        { codigo: 'P2', nombre: 'Repuesto', hoja: 'entrega-ya', linea: 'repuestos', precio: '5000' },
        { codigo: 'P3', nombre: 'No vigente', hoja: 'entrega-ya', vigencia: 'NO', precio: '8000' },
      ];

      axios.get
        .mockRejectedValueOnce(new Error('Endpoint no existe'))
        .mockResolvedValueOnce({ data: mockProducts });

      const result = await getEntregaYaProducts();

      expect(result).toHaveLength(1);
      expect(result[0].codigo).toBe('P1');
    });
  });
});

