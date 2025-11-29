import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import ModernSearchBar from '../ModernSearchBar';

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

describe('ModernSearchBar', () => {
  test('renderiza correctamente', () => {
    const handleChange = jest.fn();
    renderWithTheme(<ModernSearchBar value="" onChange={handleChange} />);
    
    const input = screen.getByPlaceholderText(/buscar productos/i);
    expect(input).toBeInTheDocument();
  });

  test('permite escribir múltiples caracteres sin bloqueo', async () => {
    const handleChange = jest.fn();
    renderWithTheme(<ModernSearchBar value="" onChange={handleChange} />);
    
    const input = screen.getByTestId('search-input');
    
    // Escribir múltiples caracteres
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
    renderWithTheme(<ModernSearchBar value="Olla" onChange={jest.fn()} />);
    
    const clearButton = screen.getByLabelText(/limpiar/i);
    expect(clearButton).toBeInTheDocument();
  });

  test('no muestra botón de limpiar cuando está vacío', () => {
    renderWithTheme(<ModernSearchBar value="" onChange={jest.fn()} />);
    
    const clearButton = screen.queryByLabelText(/limpiar/i);
    expect(clearButton).not.toBeInTheDocument();
  });

  test('limpia el input al hacer click en el botón limpiar', () => {
    const handleChange = jest.fn();
    renderWithTheme(<ModernSearchBar value="Olla" onChange={handleChange} />);
    
    const clearButton = screen.getByLabelText(/limpiar/i);
    fireEvent.click(clearButton);
    
    expect(handleChange).toHaveBeenCalledWith('');
  });

  test('acepta placeholder personalizado', () => {
    const customPlaceholder = 'Buscar aquí...';
    renderWithTheme(
      <ModernSearchBar value="" onChange={jest.fn()} placeholder={customPlaceholder} />
    );
    
    const input = screen.getByPlaceholderText(customPlaceholder);
    expect(input).toBeInTheDocument();
  });

  test('muestra el valor actual en el input', () => {
    renderWithTheme(<ModernSearchBar value="Sartén" onChange={jest.fn()} />);
    
    const input = screen.getByTestId('search-input');
    expect(input).toHaveValue('Sartén');
  });
});

