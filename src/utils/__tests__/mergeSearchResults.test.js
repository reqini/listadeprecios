import { mergeSearchResults } from '../mergeSearchResults';

describe('mergeSearchResults', () => {
  const mockQuery = 'sartén';

  test('fusiona resultados locales correctamente', () => {
    const localResults = [
      {
        id: '1',
        descripcion: 'Sartén 24cm',
        precio: 20000,
        linea: 'Cocina',
      },
    ];

    const webResults = {
      mercadolibre: [],
      google: [],
      bing: [],
    };

    const result = mergeSearchResults(localResults, webResults, mockQuery);

    expect(result.local).toBeDefined();
    expect(result.local.length).toBeGreaterThan(0);
    expect(result.local[0].esLocal).toBe(true);
    expect(result.local[0].relevanciaScore).toBeDefined();
  });

  test('fusiona resultados web correctamente', () => {
    const localResults = [];
    const webResults = {
      mercadolibre: [
        {
          id: 'ml1',
          nombre: 'Sartén 24cm',
          precio: 25000,
          tienda: 'MercadoLibre',
          fuente: 'mercadolibre',
        },
      ],
      google: [],
      bing: [],
    };

    const result = mergeSearchResults(localResults, webResults, mockQuery);

    expect(result.web).toBeDefined();
    expect(result.web.length).toBeGreaterThan(0);
    expect(result.web[0].esLocal).toBe(false);
  });

  test('encuentra comparaciones de productos similares', () => {
    const localResults = [
      {
        id: '1',
        descripcion: 'Sartén 24cm',
        precio: 20000,
      },
    ];

    const webResults = {
      mercadolibre: [
        {
          id: 'ml1',
          nombre: 'Sartén 24cm',
          precio: 25000,
          tienda: 'MercadoLibre',
          fuente: 'mercadolibre',
        },
      ],
      google: [],
      bing: [],
    };

    const result = mergeSearchResults(localResults, webResults, mockQuery);

    expect(result.comparisons).toBeDefined();
    expect(Array.isArray(result.comparisons)).toBe(true);
  });

  test('identifica el producto más barato', () => {
    const localResults = [];
    const webResults = {
      mercadolibre: [
        {
          id: 'ml1',
          nombre: 'Producto 1',
          precio: 15000,
          fuente: 'mercadolibre',
        },
        {
          id: 'ml2',
          nombre: 'Producto 2',
          precio: 20000,
          fuente: 'mercadolibre',
        },
      ],
      google: [],
      bing: [],
    };

    const result = mergeSearchResults(localResults, webResults, mockQuery);

    expect(result.cheapest).toBeDefined();
    expect(result.cheapest.precio).toBe(15000);
  });

  test('retorna estadísticas correctas', () => {
    const localResults = [
      { id: '1', descripcion: 'Test', precio: 1000 },
    ];
    const webResults = {
      mercadolibre: [
        { id: 'ml1', nombre: 'Test', precio: 2000, fuente: 'mercadolibre' },
      ],
      google: [],
      bing: [],
    };

    const result = mergeSearchResults(localResults, webResults, 'test');

    expect(result.stats).toBeDefined();
    expect(result.stats.totalLocal).toBeGreaterThan(0);
    expect(result.stats.totalWeb).toBeGreaterThan(0);
    expect(result.stats.query).toBe('test');
    expect(result.stats.timestamp).toBeDefined();
  });
});

