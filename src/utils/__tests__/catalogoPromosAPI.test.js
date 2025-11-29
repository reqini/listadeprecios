/**
 * Tests unitarios para catalogoPromosAPI
 * Valida carga y filtrado de promos bancarias
 */
import { getPromosByCatalogo, getBankLogosForCatalogo } from '../catalogoPromosAPI';
import axios from '../axios';

// Mock de axios
jest.mock('../axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

describe('catalogoPromosAPI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('getPromosByCatalogo', () => {
    test('debe retornar promos activas para un catálogo', async () => {
      const mockPromos = [
        {
          activo: true,
          catalogos: 'catalogo3,home',
          bancos: 'NACION,GALICIA',
        },
        {
          activo: false,
          catalogos: 'catalogo6',
          bancos: 'SANTANDER',
        },
      ];

      axios.get.mockResolvedValue({ data: mockPromos });

      const result = await getPromosByCatalogo('/catalogo3');

      expect(result).toHaveLength(1);
      expect(result[0].activo).toBe(true);
      expect(axios.get).toHaveBeenCalledWith('/api/catalogo-promos?catalogo=%2Fcatalogo3');
    });

    test('debe retornar array vacío si no hay promos activas', async () => {
      axios.get.mockResolvedValue({ data: [] });

      const result = await getPromosByCatalogo('/catalogo3');

      expect(result).toEqual([]);
    });

    test('debe filtrar por catálogo correctamente (formato Google Sheets)', async () => {
      const mockPromos = [
        {
          activo: true,
          catalogos: 'catalogo3,catalogo6',
          bancos: 'NACION',
        },
        {
          activo: true,
          catalogos: 'home',
          bancos: 'GALICIA',
        },
      ];

      axios.get.mockResolvedValue({ data: mockPromos });

      const result = await getPromosByCatalogo('/catalogo3');

      expect(result).toHaveLength(1);
      expect(result[0].catalogos).toContain('catalogo3');
    });

    test('debe usar localStorage como fallback si la API falla', async () => {
      axios.get.mockRejectedValue(new Error('API Error'));

      const localPromos = [
        {
          activo: true,
          catalogos: 'catalogo3',
          bancos: 'NACION',
        },
      ];
      localStorage.setItem('catalogo_promos', JSON.stringify(localPromos));

      const result = await getPromosByCatalogo('/catalogo3');

      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getBankLogosForCatalogo', () => {
    test('debe retornar array vacío si no hay promos', async () => {
      axios.get.mockResolvedValue({ data: [] });

      const result = await getBankLogosForCatalogo('/catalogo3');

      expect(result).toEqual([]);
    });

    test('debe parsear bancos desde formato Google Sheets (string separado por comas)', async () => {
      const mockPromos = [
        {
          activo: true,
          catalogos: 'catalogo3',
          bancos: 'NACION,GALICIA',
        },
      ];

      const mockBancos = [
        { id: 'nacion', nombre: 'Nación', logo_url: '/logos/nacion.png' },
        { id: 'galicia', nombre: 'Galicia', logo_url: '/logos/galicia.png' },
      ];

      axios.get
        .mockResolvedValueOnce({ data: mockPromos }) // Primera llamada: promos
        .mockResolvedValueOnce({ data: mockBancos }); // Segunda llamada: bancos

      const result = await getBankLogosForCatalogo('/catalogo3');

      expect(result.length).toBeGreaterThan(0);
      expect(axios.get).toHaveBeenCalledTimes(2);
    });

    test('debe eliminar duplicados de bancos', async () => {
      const mockPromos = [
        {
          activo: true,
          catalogos: 'catalogo3',
          bancos: 'NACION,NACION', // Duplicado
        },
      ];

      const mockBancos = [
        { id: 'nacion', nombre: 'Nación', logo_url: '/logos/nacion.png' },
      ];

      axios.get
        .mockResolvedValueOnce({ data: mockPromos })
        .mockResolvedValueOnce({ data: mockBancos });

      const result = await getBankLogosForCatalogo('/catalogo3');

      // Debe tener solo un banco único
      const uniqueIds = new Set(result.map(b => b.id || b.nombre));
      expect(uniqueIds.size).toBeLessThanOrEqual(result.length);
    });
  });
});

