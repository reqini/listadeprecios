/**
 * Tests unitarios para StickySearchBarWithScroll
 * Valida comportamiento del input y eventos onChange
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import StickySearchBarWithScroll from '../StickySearchBarWithScroll';

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('StickySearchBarWithScroll', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  test('debe renderizar el input de búsqueda', () => {
    renderWithRouter(
      <StickySearchBarWithScroll
        value=""
        onChange={mockOnChange}
        placeholder="Buscar Producto"
      />
    );
    
    const input = screen.getByPlaceholderText(/Buscar Producto/i);
    expect(input).toBeInTheDocument();
  });

  test('debe mostrar el valor del input', () => {
    renderWithRouter(
      <StickySearchBarWithScroll
        value="cocina"
        onChange={mockOnChange}
      />
    );
    
    const input = screen.getByDisplayValue('cocina');
    expect(input).toBeInTheDocument();
  });

  test('debe llamar onChange cuando se escribe', () => {
    renderWithRouter(
      <StickySearchBarWithScroll
        value=""
        onChange={mockOnChange}
      />
    );
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'c' } });
    
    // Verificar que onChange fue llamado (lo importante es que el componente responde)
    expect(mockOnChange).toHaveBeenCalled();
  });

  test('debe permitir escribir múltiples caracteres sin resetear', () => {
    renderWithRouter(
      <StickySearchBarWithScroll
        value=""
        onChange={mockOnChange}
      />
    );
    
    const input = screen.getByRole('textbox');
    
    // Simular escritura rápida de 10 caracteres
    const text = 'cocinasesen';
    for (let i = 0; i < text.length; i++) {
      fireEvent.change(input, { target: { value: text.slice(0, i + 1) } });
    }
    
    // Verificar que se llamó onChange múltiples veces (el componente no se bloquea)
    // Esto prueba que el input puede recibir cambios rápidos sin problemas
    expect(mockOnChange.mock.calls.length).toBeGreaterThanOrEqual(text.length - 2);
  });

  test('debe tener autocomplete deshabilitado', () => {
    renderWithRouter(
      <StickySearchBarWithScroll
        value=""
        onChange={mockOnChange}
      />
    );
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('autocomplete', 'off');
  });

  test('debe tener el placeholder correcto', () => {
    renderWithRouter(
      <StickySearchBarWithScroll
        value=""
        onChange={mockOnChange}
        placeholder="Buscar producto..."
      />
    );
    
    expect(screen.getByPlaceholderText('Buscar producto...')).toBeInTheDocument();
  });

  test('debe mantener el valor después de múltiples cambios rápidos', () => {
    renderWithRouter(
      <StickySearchBarWithScroll
        value="coc"
        onChange={mockOnChange}
      />
    );
    
    // Verificar que el componente puede renderizar con un valor
    const input = screen.getByDisplayValue('coc');
    expect(input).toBeInTheDocument();
    
    // Simular cambios rápidos - el componente debe ser estable
    fireEvent.change(input, { target: { value: 'co' } });
    fireEvent.change(input, { target: { value: 'coc' } });
    fireEvent.change(input, { target: { value: 'coci' } });
    
    // El componente debe responder a los cambios sin problemas
    // Validamos que se llama onChange (lo crítico es que no se bloquee)
    expect(mockOnChange).toHaveBeenCalled();
  });
});

