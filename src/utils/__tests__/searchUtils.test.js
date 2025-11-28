/**
 * Tests unitarios para funciones de búsqueda
 * Valida filtrado, normalización y búsqueda multiparámetro
 */
import { normalizeString, filterProducts, searchInProduct, isProductActive } from '../searchUtils';

describe('searchUtils', () => {
  describe('normalizeString', () => {
    test('debe normalizar strings removiendo acentos', () => {
      expect(normalizeString('cocina')).toBe('cocina');
      expect(normalizeString('Cocina')).toBe('cocina');
      expect(normalizeString('COCINA')).toBe('cocina');
      expect(normalizeString('Cocíña')).toBe('cocina');
      expect(normalizeString('Marmita')).toBe('marmita');
      expect(normalizeString('Mármita')).toBe('marmita');
    });

    test('debe manejar strings vacíos o null', () => {
      expect(normalizeString('')).toBe('');
      expect(normalizeString(null)).toBe('');
      expect(normalizeString(undefined)).toBe('');
    });

    test('debe trimear espacios', () => {
      expect(normalizeString('  cocina  ')).toBe('cocina');
      expect(normalizeString('  ')).toBe('');
    });
  });

  describe('searchInProduct', () => {
    const mockProduct = {
      descripcion: 'Cocina Essen',
      linea: 'Línea Premium',
      categoria: 'Cocinas',
      codigo: '12345',
    };

    // Nota: searchInProduct recibe el término ya normalizado
    // Por eso usamos normalizeString para los términos de búsqueda
    test('debe encontrar coincidencias en descripción', () => {
      expect(searchInProduct(mockProduct, normalizeString('cocina'))).toBe(true);
      expect(searchInProduct(mockProduct, normalizeString('essen'))).toBe(true);
      expect(searchInProduct(mockProduct, normalizeString('Cocina'))).toBe(true);
    });

    test('debe encontrar coincidencias en línea', () => {
      expect(searchInProduct(mockProduct, normalizeString('premium'))).toBe(true);
      expect(searchInProduct(mockProduct, normalizeString('linea'))).toBe(true);
    });

    test('debe encontrar coincidencias en categoría', () => {
      expect(searchInProduct(mockProduct, normalizeString('cocinas'))).toBe(true);
    });

    test('debe encontrar coincidencias en código', () => {
      expect(searchInProduct(mockProduct, normalizeString('12345'))).toBe(true);
      expect(searchInProduct(mockProduct, normalizeString('123'))).toBe(true);
    });

    test('debe ignorar mayúsculas/minúsculas', () => {
      expect(searchInProduct(mockProduct, normalizeString('COCINA'))).toBe(true);
      expect(searchInProduct(mockProduct, normalizeString('CoCiNa'))).toBe(true);
    });

    test('debe manejar acentos correctamente', () => {
      expect(searchInProduct({ descripcion: 'Mármita' }, normalizeString('marmita'))).toBe(true);
      expect(searchInProduct({ descripcion: 'Marmita' }, normalizeString('mármita'))).toBe(true);
    });

    test('debe retornar true si no hay término de búsqueda', () => {
      expect(searchInProduct(mockProduct, '')).toBe(true);
      expect(searchInProduct(mockProduct, null)).toBe(true);
    });

    test('debe retornar false si no hay coincidencias', () => {
      expect(searchInProduct(mockProduct, normalizeString('xyz'))).toBe(false);
      expect(searchInProduct(mockProduct, normalizeString('999'))).toBe(false);
    });
  });

  describe('filterProducts', () => {
    const mockProducts = [
      { id: 1, descripcion: 'Cocina Essen Premium', linea: 'Línea Premium', categoria: 'Cocinas', codigo: '001', vigencia: 'SI' },
      { id: 2, descripcion: 'Sartén Express', linea: 'Línea Clásica', categoria: 'Sartenes', codigo: '002', vigencia: 'SI' },
      { id: 3, descripcion: 'Marmita Grande', linea: 'Línea Premium', categoria: 'Marmitas', codigo: '003', vigencia: 'NO' },
      { id: 4, descripcion: 'Olla Essen', linea: 'Línea Clásica', categoria: 'Ollas', codigo: '004', vigencia: 'SI' },
    ];

    test('debe retornar todos los productos vigentes si no hay término de búsqueda', () => {
      const result = filterProducts(mockProducts, '', true);
      expect(result).toHaveLength(3);
      expect(result.every(p => p.vigencia === 'SI')).toBe(true);
    });

    test('debe filtrar por descripción', () => {
      const result = filterProducts(mockProducts, 'cocina', true);
      expect(result).toHaveLength(1);
      expect(result[0].descripcion).toBe('Cocina Essen Premium');
    });

    test('debe filtrar por línea', () => {
      const result = filterProducts(mockProducts, 'premium', true);
      expect(result).toHaveLength(1);
      expect(result[0].linea).toBe('Línea Premium');
    });

    test('debe filtrar por categoría', () => {
      const result = filterProducts(mockProducts, 'sartenes', true);
      expect(result).toHaveLength(1);
      expect(result[0].categoria).toBe('Sartenes');
    });

    test('debe filtrar por código', () => {
      const result = filterProducts(mockProducts, '001', true);
      expect(result).toHaveLength(1);
      expect(result[0].codigo).toBe('001');
    });

    test('debe ignorar productos no vigentes cuando onlyActive es true', () => {
      const result = filterProducts(mockProducts, 'marmita', true);
      expect(result).toHaveLength(0); // La marmita tiene vigencia 'NO'
    });

    test('debe incluir productos no vigentes cuando onlyActive es false', () => {
      const result = filterProducts(mockProducts, 'marmita', false);
      expect(result).toHaveLength(1);
      expect(result[0].vigencia).toBe('NO');
    });

    test('debe manejar búsqueda case-insensitive', () => {
      const result1 = filterProducts(mockProducts, 'COCINA', true);
      const result2 = filterProducts(mockProducts, 'cocina', true);
      const result3 = filterProducts(mockProducts, 'Cocina', true);
      
      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
    });

    test('debe retornar array vacío si no hay productos', () => {
      expect(filterProducts([], 'cocina', true)).toEqual([]);
      expect(filterProducts(null, 'cocina', true)).toEqual([]);
      expect(filterProducts(undefined, 'cocina', true)).toEqual([]);
    });

    test('debe retornar array vacío si no hay coincidencias', () => {
      const result = filterProducts(mockProducts, 'xyz123', true);
      expect(result).toEqual([]);
    });

    test('debe manejar búsqueda parcial', () => {
      const result = filterProducts(mockProducts, 'ess', true);
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(p => p.descripcion.includes('Essen'))).toBe(true);
    });
  });

  describe('isProductActive', () => {
    test('debe retornar true para productos vigentes', () => {
      expect(isProductActive({ vigencia: 'SI' })).toBe(true);
      expect(isProductActive({ vigencia: 'si' })).toBe(false); // Case sensitive
    });

    test('debe retornar false para productos no vigentes', () => {
      expect(isProductActive({ vigencia: 'NO' })).toBe(false);
      expect(isProductActive({ vigencia: null })).toBe(false);
      expect(isProductActive({})).toBe(false);
    });
  });
});

