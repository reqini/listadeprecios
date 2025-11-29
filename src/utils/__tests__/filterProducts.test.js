import { filterProducts, filterValidProducts, filterAllProducts } from '../filterProducts';

describe('filterProducts', () => {
  const productos = [
    {
      id: 1,
      descripcion: 'Olla Essen 5.5L',
      nombre: 'Olla 5.5L',
      categoria: 'Ollas',
      linea: 'Clásica',
      banco: 'Galicia',
      codigo: 'ESS001',
    },
    {
      id: 2,
      descripcion: 'Sartén Antiadherente',
      nombre: 'Sartén',
      categoria: 'Sartenes',
      linea: 'Premium',
      banco: 'Santander',
      codigo: 'ESS002',
    },
    {
      id: 3,
      descripcion: 'Wok Essen',
      nombre: 'Wok',
      categoria: 'Woks',
      linea: 'Clásica',
      banco: 'Galicia',
      codigo: 'ESS003',
    },
  ];

  test('devuelve todos los productos si searchTerm está vacío', () => {
    const resultado = filterProducts(productos, '');
    expect(resultado).toEqual(productos);
  });

  test('filtra por descripción', () => {
    const resultado = filterProducts(productos, 'Olla');
    expect(resultado).toHaveLength(1);
    expect(resultado[0].id).toBe(1);
  });

  test('filtra por nombre', () => {
    const resultado = filterProducts(productos, 'Sartén');
    expect(resultado).toHaveLength(1);
    expect(resultado[0].id).toBe(2);
  });

  test('filtra por categoría', () => {
    const resultado = filterProducts(productos, 'Sartenes');
    expect(resultado).toHaveLength(1);
    expect(resultado[0].id).toBe(2);
  });

  test('filtra por banco', () => {
    const resultado = filterProducts(productos, 'Galicia');
    expect(resultado).toHaveLength(2);
    expect(resultado.map(p => p.id)).toEqual([1, 3]);
  });

  test('búsqueda es case-insensitive', () => {
    const resultado = filterProducts(productos, 'OLLA');
    expect(resultado).toHaveLength(1);
    expect(resultado[0].id).toBe(1);
  });

  test('búsqueda sin acentos funciona', () => {
    const productosConAcentos = [
      { id: 1, descripcion: 'Cocción' },
      { id: 2, descripcion: 'Preparación' },
    ];
    const resultado = filterProducts(productosConAcentos, 'coccion');
    expect(resultado).toHaveLength(1);
    expect(resultado[0].id).toBe(1);
  });

  test('devuelve array vacío si no hay coincidencias', () => {
    const resultado = filterProducts(productos, 'ProductoInexistente');
    expect(resultado).toEqual([]);
  });
});

describe('filterValidProducts', () => {
  test('excluye repuestos', () => {
    const productos = [
      { id: 1, linea: 'Clásica', vigencia: 'si' },
      { id: 2, linea: 'repuestos', vigencia: 'si' },
      { id: 3, linea: 'Premium', vigencia: 'si' },
    ];
    const resultado = filterValidProducts(productos);
    expect(resultado).toHaveLength(2);
    expect(resultado.map(p => p.id)).toEqual([1, 3]);
  });

  test('excluye productos no vigentes', () => {
    const productos = [
      { id: 1, linea: 'Clásica', vigencia: 'si' },
      { id: 2, linea: 'Premium', vigencia: 'no' },
      { id: 3, linea: 'Clásica', vigencia: 'si' },
    ];
    const resultado = filterValidProducts(productos);
    expect(resultado).toHaveLength(2);
    expect(resultado.map(p => p.id)).toEqual([1, 3]);
  });

  test('excluye repuestos Y no vigentes', () => {
    const productos = [
      { id: 1, linea: 'Clásica', vigencia: 'si' },
      { id: 2, linea: 'repuestos', vigencia: 'si' },
      { id: 3, linea: 'Premium', vigencia: 'no' },
    ];
    const resultado = filterValidProducts(productos);
    expect(resultado).toHaveLength(1);
    expect(resultado[0].id).toBe(1);
  });
});

describe('filterAllProducts', () => {
  test('combina filtrado de búsqueda y validación', () => {
    const productos = [
      { id: 1, descripcion: 'Olla Essen', linea: 'Clásica', vigencia: 'si' },
      { id: 2, descripcion: 'Sartén', linea: 'repuestos', vigencia: 'si' },
      { id: 3, descripcion: 'Wok', linea: 'Premium', vigencia: 'no' },
      { id: 4, descripcion: 'Olla Premium', linea: 'Premium', vigencia: 'si' },
    ];
    const resultado = filterAllProducts(productos, 'Olla');
    expect(resultado).toHaveLength(2);
    expect(resultado.map(p => p.id)).toEqual([1, 4]);
  });
});

