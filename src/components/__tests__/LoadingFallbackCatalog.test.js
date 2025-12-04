import React from 'react';
import { render, screen, act } from '@testing-library/react';
import LoadingFallbackCatalog from '../LoadingFallbackCatalog';

jest.useFakeTimers();

describe('LoadingFallbackCatalog', () => {
  test('no se muestra inmediatamente y aparece luego del delay', () => {
    render(<LoadingFallbackCatalog delayMs={500} />);

    // Inicialmente no debe estar el texto
    expect(
      screen.queryByText(/El catálogo está tardando más de lo habitual/i)
    ).toBeNull();

    // Avanzar el tiempo
    act(() => {
      jest.advanceTimersByTime(600);
    });

    expect(
      screen.getByText(/El catálogo está tardando más de lo habitual/i)
    ).toBeInTheDocument();
  });
});


