import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import GlobalProductSearch from '../GlobalProductSearch';
import axios from '../../utils/axios';
import { searchAllSources } from '../../services/webSearchAPI';
import { mergeSearchResults } from '../../utils/mergeSearchResults';

// Mocks
jest.mock('../../utils/axios');
jest.mock('../../services/webSearchAPI');
jest.mock('../../utils/mergeSearchResults');

describe('GlobalProductSearch', () => {
  const mockOnClose = jest.fn();
  const mockOnProductClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    
    // Mock de productos locales
    axios.get.mockResolvedValue({
      data: [
        {
          id: '1',
          codigo: 'PROD001',
          descripcion: 'Producto de prueba',
          precio: 10000,
          linea: 'Test',
          vigencia: 'SI',
        },
      ],
    });

    // Mock de búsqueda web
    searchAllSources.mockResolvedValue({
      mercadolibre: [
        {
          id: 'ml1',
          nombre: 'Producto ML',
          precio: 15000,
          tienda: 'MercadoLibre',
          fuente: 'mercadolibre',
        },
      ],
      google: [],
      bing: [],
      error: null,
    });

    // Mock de merge
    mergeSearchResults.mockReturnValue({
      local: [
        {
          id: '1',
          descripcion: 'Producto de prueba',
          precio: 10000,
          relevanciaScore: 50,
          esLocal: true,
          fuente: 'Catálogo Interno',
        },
      ],
      web: [
        {
          id: 'ml1',
          nombre: 'Producto ML',
          precio: 15000,
          relevanciaScore: 60,
          esLocal: false,
          fuente: 'mercadolibre',
        },
      ],
      comparisons: [],
      cheapest: {
        id: 'ml1',
        nombre: 'Producto ML',
        precio: 15000,
      },
      stats: {
        totalLocal: 1,
        totalWeb: 1,
        totalComparisons: 0,
        query: 'prueba',
        timestamp: new Date().toISOString(),
      },
    });
  });

  test('renderiza correctamente', () => {
    render(<GlobalProductSearch onClose={mockOnClose} onProductClick={mockOnProductClick} />);
    
    expect(screen.getByText(/Búsqueda Global de Productos/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Buscar productos/i)).toBeInTheDocument();
  });

  test('muestra estado inicial cuando no hay búsqueda', () => {
    render(<GlobalProductSearch onClose={mockOnClose} />);
    
    expect(screen.getByText(/Busca cualquier producto/i)).toBeInTheDocument();
  });

  test('realiza búsqueda al escribir', async () => {
    render(<GlobalProductSearch onClose={mockOnClose} />);
    
    const input = screen.getByPlaceholderText(/Buscar productos/i);
    fireEvent.change(input, { target: { value: 'prueba' } });
    
    await waitFor(() => {
      expect(searchAllSources).toHaveBeenCalledWith('prueba');
    }, { timeout: 1000 });
  });

  test('muestra loading durante la búsqueda', async () => {
    // Mock con delay
    searchAllSources.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        mercadolibre: [],
        google: [],
        bing: [],
        error: null,
      }), 100))
    );

    render(<GlobalProductSearch onClose={mockOnClose} />);
    
    const input = screen.getByPlaceholderText(/Buscar productos/i);
    fireEvent.change(input, { target: { value: 'test' } });
    
    await waitFor(() => {
      expect(screen.getByText(/Buscando en catálogo y web/i)).toBeInTheDocument();
    });
  });

  test('limpia búsqueda al hacer click en botón clear', () => {
    render(<GlobalProductSearch onClose={mockOnClose} />);
    
    const input = screen.getByPlaceholderText(/Buscar productos/i);
    fireEvent.change(input, { target: { value: 'test' } });
    
    const clearButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(clearButton);
    
    expect(input.value).toBe('');
  });

  test('cierra al presionar Escape', () => {
    render(<GlobalProductSearch onClose={mockOnClose} />);
    
    const input = screen.getByPlaceholderText(/Buscar productos/i);
    fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('no busca con menos de 2 caracteres', async () => {
    render(<GlobalProductSearch onClose={mockOnClose} />);
    
    const input = screen.getByPlaceholderText(/Buscar productos/i);
    fireEvent.change(input, { target: { value: 'a' } });
    
    await waitFor(() => {
      expect(searchAllSources).not.toHaveBeenCalled();
    }, { timeout: 1000 });
  });
});

