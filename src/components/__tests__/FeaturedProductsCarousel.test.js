/**
 * Tests básicos para FeaturedProductsCarousel
 * Valida renderizado, elementos placeholder y scroll horizontal
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import FeaturedProductsCarousel from '../FeaturedProductsCarousel';

const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
});

// Mock de formatPrice
jest.mock('../../utils/priceUtils', () => ({
  formatPrice: (price) => `$${price?.toLocaleString('es-AR') || '0'}`,
}));

// Mock de useMediaQuery para evitar problemas en tests
jest.mock('@mui/material/useMediaQuery', () => {
  return jest.fn(() => false); // Por defecto desktop
});

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {component}
    </ThemeProvider>
  );
};

describe('FeaturedProductsCarousel', () => {
  describe('Renderizado del carrusel', () => {
    test('El carrusel se renderiza en el DOM', () => {
      renderWithTheme(<FeaturedProductsCarousel />);
      
      // Verificar que el título está presente
      const title = screen.getByText(/Productos Destacados/i);
      expect(title).toBeInTheDocument();
    });

    test('El carrusel tiene el título correcto', () => {
      renderWithTheme(<FeaturedProductsCarousel />);
      
      const title = screen.getByText(/⭐ Productos Destacados/i);
      expect(title).toBeInTheDocument();
    });

    test('El carrusel tiene subtítulo', () => {
      renderWithTheme(<FeaturedProductsCarousel />);
      
      const subtitle = screen.getByText(/Los más populares/i);
      expect(subtitle).toBeInTheDocument();
    });
  });

  describe('Elementos placeholder', () => {
    test('Se renderizan los productos placeholder', () => {
      renderWithTheme(<FeaturedProductsCarousel />);
      
      // Verificar que al menos un producto placeholder está presente
      const product1 = screen.getByText(/Sartén Express 24cm/i);
      expect(product1).toBeInTheDocument();
    });

    test('Se renderizan múltiples productos placeholder', () => {
      renderWithTheme(<FeaturedProductsCarousel />);
      
      // Verificar varios productos
      expect(screen.getByText(/Sartén Express 24cm/i)).toBeInTheDocument();
      expect(screen.getByText(/Olla Essen 5L/i)).toBeInTheDocument();
      expect(screen.getByText(/Wok Essen 30cm/i)).toBeInTheDocument();
    });

    test('Los productos muestran precios formateados', () => {
      renderWithTheme(<FeaturedProductsCarousel />);
      
      // Verificar que los precios están presentes (formateados)
      const prices = screen.getAllByText(/\$\d+/);
      expect(prices.length).toBeGreaterThan(0);
    });
  });

  describe('Estructura del carrusel', () => {
    test('El contenedor de scroll está presente', () => {
      const { container } = renderWithTheme(<FeaturedProductsCarousel />);
      
      // Buscar el contenedor con scroll horizontal
      const scrollContainer = container.querySelector('[style*="overflow-x"]');
      expect(scrollContainer).toBeInTheDocument();
    });

    test('Las cards de productos están presentes', () => {
      const { container } = renderWithTheme(<FeaturedProductsCarousel />);
      
      // Buscar cards (componentes Card de MUI)
      const cards = container.querySelectorAll('.MuiCard-root');
      expect(cards.length).toBeGreaterThan(0);
    });

    test('Las imágenes de productos están presentes', () => {
      const { container } = renderWithTheme(<FeaturedProductsCarousel />);
      
      // Buscar imágenes
      const images = container.querySelectorAll('img');
      expect(images.length).toBeGreaterThan(0);
    });
  });

  describe('Scroll horizontal', () => {
    test('El contenedor tiene scroll horizontal habilitado', () => {
      const { container } = renderWithTheme(<FeaturedProductsCarousel />);
      
      const scrollContainer = container.querySelector('[style*="overflow-x: auto"]');
      expect(scrollContainer).toBeInTheDocument();
    });

    test('El contenedor tiene scroll-snap configurado', () => {
      const { container } = renderWithTheme(<FeaturedProductsCarousel />);
      
      const scrollContainer = container.querySelector('[style*="scroll-snap-type"]');
      expect(scrollContainer).toBeInTheDocument();
    });
  });
});

