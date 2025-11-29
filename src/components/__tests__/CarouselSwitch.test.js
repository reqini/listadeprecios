import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CarouselSwitch from '../CarouselSwitch';

const renderWithTheme = (component) => {
  const theme = createTheme();
  return render(
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </ThemeProvider>
  );
};

describe('CarouselSwitch', () => {
  const STORAGE_KEY = 'carousel_switch_cocinaty';
  
  beforeEach(() => {
    // Limpiar localStorage antes de cada test
    localStorage.clear();
    // Limpiar URL params
    window.history.replaceState({}, '', '/');
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Visibilidad para diferentes usuarios', () => {
    it('no debe mostrarse para usuarios que no son cocinaty', () => {
      localStorage.setItem('activeSession', 'usuario_normal');
      
      const { container } = renderWithTheme(<CarouselSwitch />);
      expect(container.firstChild).toBeNull();
    });

    it('debe mostrarse para el usuario cocinaty', () => {
      localStorage.setItem('activeSession', 'cocinaty');
      
      renderWithTheme(<CarouselSwitch />);
      expect(screen.getByText(/Carrusel Habilitado/i)).toBeInTheDocument();
    });

    it('debe mostrarse para cocinaty sin importar mayúsculas/minúsculas', () => {
      localStorage.setItem('activeSession', 'COCINATY');
      
      renderWithTheme(<CarouselSwitch />);
      expect(screen.getByText(/Carrusel Habilitado/i)).toBeInTheDocument();
    });
  });

  describe('Funcionalidad del switch', () => {
    beforeEach(() => {
      localStorage.setItem('activeSession', 'cocinaty');
    });

    it('debe estar desactivado inicialmente', () => {
      renderWithTheme(<CarouselSwitch />);
      const switchElement = screen.getByRole('checkbox');
      expect(switchElement).not.toBeChecked();
    });

    it('debe activarse al hacer click', () => {
      renderWithTheme(<CarouselSwitch />);
      const switchElement = screen.getByRole('checkbox');
      
      fireEvent.click(switchElement);
      
      expect(switchElement).toBeChecked();
      expect(localStorage.getItem(STORAGE_KEY)).toBeTruthy();
    });

    it('debe desactivarse al hacer click nuevamente', () => {
      renderWithTheme(<CarouselSwitch />);
      const switchElement = screen.getByRole('checkbox');
      
      // Activar
      fireEvent.click(switchElement);
      expect(switchElement).toBeChecked();
      
      // Desactivar
      fireEvent.click(switchElement);
      expect(switchElement).not.toBeChecked();
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('debe guardar timestamp en localStorage al activarse', () => {
      renderWithTheme(<CarouselSwitch />);
      const switchElement = screen.getByRole('checkbox');
      
      fireEvent.click(switchElement);
      
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      expect(stored).toHaveProperty('enabled', true);
      expect(stored).toHaveProperty('timestamp');
      expect(typeof stored.timestamp).toBe('number');
    });
  });

  describe('Timer de 1 hora', () => {
    beforeEach(() => {
      localStorage.setItem('activeSession', 'cocinaty');
    });

    it('debe mostrar tiempo restante cuando está activado', async () => {
      const timestamp = Date.now();
      const data = {
        enabled: true,
        timestamp: timestamp,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

      renderWithTheme(<CarouselSwitch />);
      
      // Debe mostrar el timer
      await waitFor(() => {
        expect(screen.getByText(/⏱️/)).toBeInTheDocument();
      });
    });

    it('debe expirar después de 1 hora', async () => {
      const ONE_HOUR_MS = 60 * 60 * 1000;
      const expiredTimestamp = Date.now() - ONE_HOUR_MS - 1000; // 1 hora + 1 segundo atrás
      
      const data = {
        enabled: true,
        timestamp: expiredTimestamp,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

      renderWithTheme(<CarouselSwitch />);
      
      await waitFor(() => {
        const switchElement = screen.getByRole('checkbox');
        expect(switchElement).not.toBeChecked();
      });
    });

    it('debe mostrar chip de expirado cuando el tiempo se acaba', async () => {
      const ONE_HOUR_MS = 60 * 60 * 1000;
      const expiredTimestamp = Date.now() - ONE_HOUR_MS - 1000;
      
      const data = {
        enabled: true,
        timestamp: expiredTimestamp,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

      renderWithTheme(<CarouselSwitch />);
      
      await waitFor(() => {
        expect(screen.getByText(/⏰ Expirado/)).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe('Sincronización con URL', () => {
    beforeEach(() => {
      localStorage.setItem('activeSession', 'cocinaty');
    });

    it('debe agregar query param carousel=enabled cuando se activa', () => {
      renderWithTheme(<CarouselSwitch />);
      const switchElement = screen.getByRole('checkbox');
      
      fireEvent.click(switchElement);
      
      expect(window.location.search).toContain('carousel=enabled');
    });

    it('debe remover query param cuando se desactiva', () => {
      window.history.replaceState({}, '', '/catalogo12?carousel=enabled');
      
      renderWithTheme(<CarouselSwitch />);
      const switchElement = screen.getByRole('checkbox');
      
      // Primero asegurarse de que esté activado
      if (!switchElement.checked) {
        fireEvent.click(switchElement);
      }
      
      // Luego desactivar
      fireEvent.click(switchElement);
      
      expect(window.location.search).not.toContain('carousel=enabled');
    });

    it('debe activarse si viene el parámetro en la URL', () => {
      window.history.replaceState({}, '', '/catalogo12?carousel=enabled');
      
      renderWithTheme(<CarouselSwitch />);
      
      const switchElement = screen.getByRole('checkbox');
      expect(switchElement).toBeChecked();
    });
  });
});

