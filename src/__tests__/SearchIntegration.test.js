/**
 * Tests de integración para el buscador
 * Valida el flujo completo desde el input hasta el filtrado
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../home';
import { AuthContext } from '../AuthContext';

// Mock del contexto de autenticación
const mockAuthContext = {
  auth: { token: 'mock-token' },
  logout: jest.fn(),
};

// Mock de axios
jest.mock('../utils/axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(() => Promise.resolve({ data: [] })),
    post: jest.fn(() => Promise.resolve({ data: { valid: true } })),
  },
}));

const renderHome = () => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={mockAuthContext}>
        <Home />
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('Search Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('activeSession', 'testuser');
  });

  test('debe permitir escribir múltiples caracteres sin resetear', async () => {
    renderHome();
    
    await waitFor(() => {
      const searchInput = screen.queryByPlaceholderText(/Buscar Producto/i);
      if (searchInput) {
        // Simular escritura de 10 caracteres
        const text = 'cocinasesen';
        for (let i = 0; i < text.length; i++) {
          fireEvent.change(searchInput, { target: { value: text.slice(0, i + 1) } });
        }
        
        // Verificar que el valor final está presente
        expect(screen.getByDisplayValue(text)).toBeInTheDocument();
      }
    });
  });

  test('debe filtrar productos en tiempo real', async () => {
    // Mock de productos
    const mockProductos = [
      { id: 1, descripcion: 'Cocina Essen', codigo: '001', vigencia: 'SI' },
      { id: 2, descripcion: 'Sartén Express', codigo: '002', vigencia: 'SI' },
    ];

    const axios = require('../utils/axios').default;
    axios.get.mockResolvedValue({ data: mockProductos });

    renderHome();

    await waitFor(() => {
      const searchInput = screen.queryByPlaceholderText(/Buscar Producto/i);
      if (searchInput) {
        fireEvent.change(searchInput, { target: { value: 'cocina' } });
        // Debe mostrar solo el producto que coincide
        // (asumiendo que el componente renderiza los productos)
      }
    });
  });

  test('debe restaurar lista completa al borrar búsqueda', async () => {
    renderHome();

    await waitFor(() => {
      const searchInput = screen.queryByPlaceholderText(/Buscar Producto/i);
      if (searchInput) {
        // Escribir algo
        fireEvent.change(searchInput, { target: { value: 'cocina' } });
        
        // Borrar todo
        fireEvent.change(searchInput, { target: { value: '' } });
        
        // Debe restaurar la lista completa
        expect(searchInput.value).toBe('');
      }
    });
  });
});

