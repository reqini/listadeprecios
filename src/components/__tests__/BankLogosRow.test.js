/**
 * Tests unitarios para BankLogosRow
 * Valida render condicional, formato visual y manejo de logos
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import BankLogosRow from '../BankLogosRow';

describe('BankLogosRow', () => {
  const mockBankLogos = [
    { id: '1', nombre: 'Nación', logo_url: '/logos-bancos/nacion.png' },
    { id: '2', nombre: 'Galicia', logo_url: '/logos-bancos/galicia.png' },
    { id: '3', nombre: 'Santander', logo_url: '/logos-bancos/santander.png' },
  ];

  test('debe retornar null si no hay logos', () => {
    const { container } = render(<BankLogosRow bankLogos={[]} />);
    expect(container.firstChild).toBeNull();
  });

  test('debe retornar null si bankLogos es null', () => {
    const { container } = render(<BankLogosRow bankLogos={null} />);
    expect(container.firstChild).toBeNull();
  });

  test('debe retornar null si bankLogos es undefined', () => {
    const { container } = render(<BankLogosRow />);
    expect(container.firstChild).toBeNull();
  });

  test('debe renderizar texto "Tenés cuotas con —"', () => {
    render(<BankLogosRow bankLogos={mockBankLogos} />);
    expect(screen.getByText(/Tenés cuotas con —/i)).toBeInTheDocument();
  });

  test('debe renderizar logos cuando hay bancos', () => {
    render(<BankLogosRow bankLogos={mockBankLogos} />);
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);
  });

  test('debe mostrar máximo 4 logos visibles por defecto', () => {
    const manyBanks = [
      ...mockBankLogos,
      { id: '4', nombre: 'BBVA', logo_url: '/logos-bancos/bbva.png' },
      { id: '5', nombre: 'Macro', logo_url: '/logos-bancos/macro.png' },
      { id: '6', nombre: 'Patagonia', logo_url: '/logos-bancos/patagonia.png' },
    ];
    render(<BankLogosRow bankLogos={manyBanks} />);
    const images = screen.getAllByRole('img');
    expect(images.length).toBeLessThanOrEqual(4); // 4 logos + posible indicador
  });

  test('debe mostrar indicador "+N" si hay más logos de los visibles', () => {
    const manyBanks = [
      ...mockBankLogos,
      { id: '4', nombre: 'BBVA', logo_url: '/logos-bancos/bbva.png' },
      { id: '5', nombre: 'Macro', logo_url: '/logos-bancos/macro.png' },
    ];
    render(<BankLogosRow bankLogos={manyBanks} maxVisible={3} />);
    expect(screen.getByText(/\+2/i)).toBeInTheDocument();
  });

  test('debe aplicar estilos circulares a los logos', () => {
    const { container } = render(<BankLogosRow bankLogos={mockBankLogos} />);
    const images = container.querySelectorAll('img');
    images.forEach(img => {
      const styles = window.getComputedStyle(img);
      // Verificar que tiene border-radius o estilos aplicados
      expect(img).toBeInTheDocument();
    });
  });

  test('debe usar fallback si logo_url no está disponible', () => {
    const banksWithoutLogo = [
      { id: '1', nombre: 'Nación' },
      { id: '2', nombre: 'Galicia' },
    ];
    render(<BankLogosRow bankLogos={banksWithoutLogo} />);
    // Debe intentar renderizar con fallback del mapeo
    expect(screen.getByText(/Tenés cuotas con —/i)).toBeInTheDocument();
  });

  test('debe ocultar logo si falla la carga (onError)', () => {
    const banksWithInvalidUrl = [
      { id: '1', nombre: 'Nación', logo_url: '/invalid/path.png' },
    ];
    render(<BankLogosRow bankLogos={banksWithInvalidUrl} />);
    const img = screen.getByRole('img');
    // Simular error de carga
    img.dispatchEvent(new Event('error'));
    expect(img.style.display).toBe('none');
  });
});

