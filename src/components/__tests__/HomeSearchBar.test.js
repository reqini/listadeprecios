import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import HomeSearchBar from '../HomeSearchBar';

// Mock de useMediaQuery para evitar problemas en tests
jest.mock('@mui/material/useMediaQuery', () => {
  return jest.fn(() => false); // Por defecto desktop
});

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

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {component}
    </ThemeProvider>
  );
};

describe('HomeSearchBar', () => {
  test('renderiza correctamente', () => {
    const handleChange = jest.fn();
    renderWithTheme(<HomeSearchBar value="" onChange={handleChange} />);
    
    const input = screen.getByPlaceholderText(/buscar productos/i);
    expect(input).toBeInTheDocument();
  });

  test('permite escribir múltiples caracteres sin bloqueo', async () => {
    const handleChange = jest.fn();
    renderWithTheme(<HomeSearchBar value="" onChange={handleChange} />);
    
    const input = screen.getByTestId('home-search-input');
    
    // Escribir múltiples caracteres en tiempo real
    fireEvent.change(input, { target: { value: 'O' } });
    fireEvent.change(input, { target: { value: 'Ol' } });
    fireEvent.change(input, { target: { value: 'Oll' } });
    fireEvent.change(input, { target: { value: 'Olla' } });
    
    await waitFor(() => {
      expect(handleChange).toHaveBeenCalled();
    }, { timeout: 1000 });
    
    expect(handleChange).toHaveBeenLastCalledWith('Olla');
  });

  test('muestra botón de limpiar cuando hay texto', () => {
    renderWithTheme(<HomeSearchBar value="Sartén" onChange={jest.fn()} />);
    
    const clearButton = screen.getByLabelText(/limpiar/i);
    expect(clearButton).toBeInTheDocument();
  });

  test('no muestra botón de limpiar cuando está vacío', () => {
    renderWithTheme(<HomeSearchBar value="" onChange={jest.fn()} />);
    
    const clearButton = screen.queryByLabelText(/limpiar/i);
    expect(clearButton).not.toBeInTheDocument();
  });

  test('limpia el input al hacer click en el botón limpiar', () => {
    const handleChange = jest.fn();
    renderWithTheme(<HomeSearchBar value="Olla" onChange={handleChange} />);
    
    const clearButton = screen.getByLabelText(/limpiar/i);
    fireEvent.click(clearButton);
    
    expect(handleChange).toHaveBeenCalledWith('');
  });

  test('filtrado en tiempo real mientras se escribe', async () => {
    const handleChange = jest.fn();
    renderWithTheme(<HomeSearchBar value="" onChange={handleChange} />);
    
    const input = screen.getByTestId('home-search-input');
    
    // Simular escritura rápida
    const searchTerms = ['E', 'Es', 'Ess', 'Essen'];
    
    searchTerms.forEach((term, index) => {
      fireEvent.change(input, { target: { value: term } });
      expect(handleChange).toHaveBeenNthCalledWith(index + 1, term);
    });
  });

  test('acepta placeholder personalizado', () => {
    const customPlaceholder = 'Buscar aquí...';
    renderWithTheme(
      <HomeSearchBar value="" onChange={jest.fn()} placeholder={customPlaceholder} />
    );
    
    const input = screen.getByPlaceholderText(customPlaceholder);
    expect(input).toBeInTheDocument();
  });

  test('muestra el valor actual en el input', () => {
    renderWithTheme(<HomeSearchBar value="Wok Essen" onChange={jest.fn()} />);
    
    const input = screen.getByTestId('home-search-input');
    expect(input).toHaveValue('Wok Essen');
  });

  test('tiene posición sticky para quedarse en la parte superior', () => {
    const { container } = renderWithTheme(
      <HomeSearchBar value="" onChange={jest.fn()} />
    );
    
    const searchBar = container.querySelector('[class*="MuiBox-root"]');
    expect(searchBar).toHaveStyle({ position: 'sticky' });
  });
});

