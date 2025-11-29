/**
 * Tests para ModernCartBottomSheet
 * Verifica apertura/cierre y cambio de cuotas
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ModernCartBottomSheet from '../ModernCartBottomSheet';

const theme = createTheme();

// Mock de formatPrice y parsePrice
jest.mock('../../utils/priceUtils', () => ({
  formatPrice: (price) => `$${price?.toLocaleString('es-AR') || '0'}`,
  parsePrice: (price) => {
    if (typeof price === 'string') {
      return parseFloat(price.replace(/[^\d.-]/g, '')) || 0;
    }
    return price || 0;
  },
}));

const renderWithTheme = (component) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('ModernCartBottomSheet', () => {
  const mockSetCart = jest.fn();
  const defaultProps = {
    cart: [],
    setCart: mockSetCart,
    cuotaKey: 'tres_sin_interes',
    cuotasTexto: '3 cuotas sin interés',
  };

  beforeEach(() => {
    mockSetCart.mockClear();
    // Restaurar overflow del body
    document.body.style.overflow = 'unset';
  });

  afterEach(() => {
    // Limpiar overflow del body
    document.body.style.overflow = 'unset';
  });

  describe('Apertura y Cierre del Carrito', () => {
    test('No muestra el botón flotante cuando el carrito está vacío', () => {
      renderWithTheme(<ModernCartBottomSheet {...defaultProps} />);
      const floatingButton = screen.queryByText(/Tu selección/i);
      expect(floatingButton).not.toBeInTheDocument();
    });

    test('Muestra el botón flotante cuando hay productos en el carrito', () => {
      const cartWithItems = [
        {
          codigo: '123',
          descripcion: 'Producto Test',
          tres_sin_interes: '10000',
          cantidad: 1,
        },
      ];

      renderWithTheme(
        <ModernCartBottomSheet {...defaultProps} cart={cartWithItems} />
      );

      // Esperar a que el carrito se abra automáticamente
      waitFor(() => {
        const drawer = screen.queryByRole('presentation');
        expect(drawer).toBeInTheDocument();
      });
    });

    test('Se abre automáticamente cuando se agrega un producto', async () => {
      const { rerender } = renderWithTheme(
        <ModernCartBottomSheet {...defaultProps} />
      );

      const cartWithItems = [
        {
          codigo: '123',
          descripcion: 'Producto Test',
          tres_sin_interes: '10000',
          cantidad: 1,
        },
      ];

      rerender(
        <ThemeProvider theme={theme}>
          <ModernCartBottomSheet {...defaultProps} cart={cartWithItems} />
        </ThemeProvider>
      );

      await waitFor(() => {
        const drawer = screen.queryByRole('presentation');
        expect(drawer).toBeInTheDocument();
      });
    });

    test('Se cierra cuando se hace click en el botón X', async () => {
      const cartWithItems = [
        {
          codigo: '123',
          descripcion: 'Producto Test',
          tres_sin_interes: '10000',
          cantidad: 1,
        },
      ];

      renderWithTheme(
        <ModernCartBottomSheet {...defaultProps} cart={cartWithItems} />
      );

      await waitFor(() => {
        const closeButton = screen.getByLabelText(/Cerrar carrito/i);
        expect(closeButton).toBeInTheDocument();
      });

      const closeButton = screen.getByLabelText(/Cerrar carrito/i);
      fireEvent.click(closeButton);

      await waitFor(() => {
        const drawer = screen.queryByRole('presentation');
        expect(drawer).not.toBeInTheDocument();
      });
    });

    test('Se cierra cuando se presiona ESC', async () => {
      const cartWithItems = [
        {
          codigo: '123',
          descripcion: 'Producto Test',
          tres_sin_interes: '10000',
          cantidad: 1,
        },
      ];

      renderWithTheme(
        <ModernCartBottomSheet {...defaultProps} cart={cartWithItems} />
      );

      await waitFor(() => {
        const drawer = screen.queryByRole('presentation');
        expect(drawer).toBeInTheDocument();
      });

      // Simular tecla ESC
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

      await waitFor(() => {
        const drawer = screen.queryByRole('presentation');
        expect(drawer).not.toBeInTheDocument();
      });
    });

    test('Se cierra automáticamente cuando el carrito se vacía', async () => {
      const cartWithItems = [
        {
          codigo: '123',
          descripcion: 'Producto Test',
          tres_sin_interes: '10000',
          cantidad: 1,
        },
      ];

      const { rerender } = renderWithTheme(
        <ModernCartBottomSheet {...defaultProps} cart={cartWithItems} />
      );

      await waitFor(() => {
        const drawer = screen.queryByRole('presentation');
        expect(drawer).toBeInTheDocument();
      });

      // Vaciar el carrito
      rerender(
        <ThemeProvider theme={theme}>
          <ModernCartBottomSheet {...defaultProps} cart={[]} />
        </ThemeProvider>
      );

      await waitFor(() => {
        const drawer = screen.queryByRole('presentation');
        expect(drawer).not.toBeInTheDocument();
      });
    });
  });

  describe('Texto de Cuotas', () => {
    test('Muestra la cuota correcta cuando el producto tiene selectedCuotaLabel', async () => {
      const cartWithItems = [
        {
          codigo: '123',
          descripcion: 'Producto Test',
          tres_sin_interes: '10000',
          cantidad: 1,
          selectedCuotaKey: 'doce_sin_interes',
          selectedCuotaValue: 5000,
          selectedCuotaLabel: '12 cuotas sin interés',
        },
      ];

      renderWithTheme(
        <ModernCartBottomSheet {...defaultProps} cart={cartWithItems} />
      );

      await waitFor(() => {
        expect(screen.getByText(/12 cuotas sin interés/i)).toBeInTheDocument();
      });

      // NO debe mostrar "3 cuotas" (el default)
      expect(screen.queryByText(/3 cuotas/i)).not.toBeInTheDocument();
    });

    test('Muestra la cuota correcta cuando el producto tiene selectedCuotaKey', async () => {
      const cartWithItems = [
        {
          codigo: '123',
          descripcion: 'Producto Test',
          seis_sin_interes: '8000',
          cantidad: 1,
          selectedCuotaKey: 'seis_sin_interes',
          selectedCuotaValue: 8000,
        },
      ];

      renderWithTheme(
        <ModernCartBottomSheet {...defaultProps} cart={cartWithItems} />
      );

      await waitFor(() => {
        expect(screen.getByText(/6 cuotas sin interés/i)).toBeInTheDocument();
      });
    });

    test('Usa el prop cuotasTexto como fallback cuando no hay información de cuota', async () => {
      const cartWithItems = [
        {
          codigo: '123',
          descripcion: 'Producto Test',
          tres_sin_interes: '10000',
          cantidad: 1,
          // Sin selectedCuotaKey ni selectedCuotaLabel
        },
      ];

      renderWithTheme(
        <ModernCartBottomSheet
          {...defaultProps}
          cart={cartWithItems}
          cuotasTexto="3 cuotas sin interés"
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/3 cuotas sin interés/i)).toBeInTheDocument();
      });
    });

    test('Muestra cuota diferente para cada producto en el carrito', async () => {
      const cartWithItems = [
        {
          codigo: '123',
          descripcion: 'Producto 1',
          tres_sin_interes: '10000',
          cantidad: 1,
          selectedCuotaKey: 'tres_sin_interes',
          selectedCuotaLabel: '3 cuotas sin interés',
        },
        {
          codigo: '456',
          descripcion: 'Producto 2',
          doce_sin_interes: '5000',
          cantidad: 1,
          selectedCuotaKey: 'doce_sin_interes',
          selectedCuotaLabel: '12 cuotas sin interés',
        },
      ];

      renderWithTheme(
        <ModernCartBottomSheet {...defaultProps} cart={cartWithItems} />
      );

      await waitFor(() => {
        expect(screen.getByText(/3 cuotas sin interés/i)).toBeInTheDocument();
        expect(screen.getByText(/12 cuotas sin interés/i)).toBeInTheDocument();
      });
    });
  });

  describe('Funcionalidad del Carrito', () => {
    test('Muestra el total correcto', async () => {
      const cartWithItems = [
        {
          codigo: '123',
          descripcion: 'Producto Test',
          tres_sin_interes: '10000',
          cantidad: 1,
          selectedCuotaValue: 10000,
        },
        {
          codigo: '456',
          descripcion: 'Producto Test 2',
          tres_sin_interes: '5000',
          cantidad: 2,
          selectedCuotaValue: 5000,
        },
      ];

      renderWithTheme(
        <ModernCartBottomSheet {...defaultProps} cart={cartWithItems} />
      );

      await waitFor(() => {
        // Total debería ser 10000 + (5000 * 2) = 20000
        expect(screen.getByText(/\$20,000/i)).toBeInTheDocument();
      });
    });

    test('Permite eliminar un producto del carrito', async () => {
      const cartWithItems = [
        {
          codigo: '123',
          descripcion: 'Producto Test',
          tres_sin_interes: '10000',
          cantidad: 1,
        },
      ];

      renderWithTheme(
        <ModernCartBottomSheet {...defaultProps} cart={cartWithItems} />
      );

      await waitFor(() => {
        const deleteButton = screen.getByTitle(/Eliminar producto/i);
        expect(deleteButton).toBeInTheDocument();
      });

      const deleteButton = screen.getByTitle(/Eliminar producto/i);
      fireEvent.click(deleteButton);

      expect(mockSetCart).toHaveBeenCalled();
    });

    test('Permite actualizar la cantidad de un producto', async () => {
      const cartWithItems = [
        {
          codigo: '123',
          descripcion: 'Producto Test',
          tres_sin_interes: '10000',
          cantidad: 1,
        },
      ];

      renderWithTheme(
        <ModernCartBottomSheet {...defaultProps} cart={cartWithItems} />
      );

      await waitFor(() => {
        const addButton = screen.getAllByRole('button').find(
          (btn) => btn.querySelector('svg[data-testid="AddIcon"]')
        );
        expect(addButton).toBeInTheDocument();
      });

      const addButtons = screen.getAllByRole('button');
      const addButton = addButtons.find(
        (btn) => btn.querySelector('svg[data-testid="AddIcon"]')
      );

      if (addButton) {
        fireEvent.click(addButton);
        expect(mockSetCart).toHaveBeenCalled();
      }
    });
  });
});



