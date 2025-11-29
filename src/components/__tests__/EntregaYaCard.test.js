import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EntregaYaCard from '../EntregaYaCard';

// Mock de formatPrice
jest.mock('../../utils/priceUtils', () => ({
  formatPrice: (price) => `$${price.toLocaleString('es-AR')}`,
}));

describe('EntregaYaCard', () => {
  const mockProduct = {
    id: '1',
    codigo: 'PROD001',
    nombre: 'Producto de Prueba',
    descripcion: 'Descripción del producto de prueba',
    precio: 15000,
    imagen: 'https://example.com/image.jpg',
    categoria: 'Electrodomésticos',
    stock: 5,
    entregaInmediata: true,
    esUltimaUnidad: false,
  };

  const mockHandlers = {
    onAddToCart: jest.fn(),
    onToggleFavorite: jest.fn(),
    onProductClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe renderizar el nombre del producto', () => {
    render(
      <EntregaYaCard
        product={mockProduct}
        {...mockHandlers}
      />
    );
    
    expect(screen.getByText('Producto de Prueba')).toBeInTheDocument();
  });

  it('debe renderizar el precio formateado', () => {
    render(
      <EntregaYaCard
        product={mockProduct}
        {...mockHandlers}
      />
    );
    
    expect(screen.getByText('$15.000')).toBeInTheDocument();
  });

  it('debe mostrar el badge "Entrega YA"', () => {
    render(
      <EntregaYaCard
        product={mockProduct}
        {...mockHandlers}
      />
    );
    
    expect(screen.getByText('Entrega YA')).toBeInTheDocument();
  });

  it('debe mostrar el badge "Última unidad" cuando esUltimaUnidad es true', () => {
    const productWithLastUnit = {
      ...mockProduct,
      esUltimaUnidad: true,
      stock: 1,
    };
    
    render(
      <EntregaYaCard
        product={productWithLastUnit}
        {...mockHandlers}
      />
    );
    
    expect(screen.getByText('Última unidad')).toBeInTheDocument();
  });

  it('debe llamar a onAddToCart cuando se hace clic en el botón de agregar', () => {
    render(
      <EntregaYaCard
        product={mockProduct}
        {...mockHandlers}
      />
    );
    
    const addButton = screen.getByText('+');
    fireEvent.click(addButton);
    
    expect(mockHandlers.onAddToCart).toHaveBeenCalledWith(mockProduct);
  });

  it('debe llamar a onToggleFavorite cuando se hace clic en el botón de favorito', () => {
    render(
      <EntregaYaCard
        product={mockProduct}
        {...mockHandlers}
      />
    );
    
    const favoriteButton = screen.getByRole('button', { name: /favorite/i });
    fireEvent.click(favoriteButton);
    
    expect(mockHandlers.onToggleFavorite).toHaveBeenCalledWith(mockProduct);
  });

  it('debe mostrar el ícono de favorito lleno cuando isFavorite es true', () => {
    render(
      <EntregaYaCard
        product={mockProduct}
        isFavorite={true}
        {...mockHandlers}
      />
    );
    
    const favoriteIcon = screen.getByTestId('FavoriteIcon') || screen.getByLabelText(/favorite/i);
    expect(favoriteIcon).toBeInTheDocument();
  });
});

