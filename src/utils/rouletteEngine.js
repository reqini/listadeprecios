/**
 * Motor de la ruleta de premios
 * Distribución de probabilidades controlada
 * Más secciones de 5% y Asas, Mate único
 */

export const prizes = [
  { name: "5% descuento", type: "discount", value: 5, chance: 0.50 },
  { name: "Asas de silicona", type: "gift", value: "asas", chance: 0.25 },
  { name: "5% descuento", type: "discount", value: 5, chance: 0.15 },
  { name: "10% descuento", type: "discount", value: 10, chance: 0.08 },
  { name: "Asas de silicona", type: "gift", value: "asas", chance: 0.02 },
  { name: "Mate", type: "gift", value: "mate", chance: 0.00 }, // Único, se agrega al final
];

// Premios para la ruleta visual (con repeticiones)
export const wheelPrizes = [
  { name: "5% descuento", type: "discount", value: 5, color: "#FF6B6B" },
  { name: "Asas de silicona", type: "gift", value: "asas", color: "#4ECDC4" },
  { name: "5% descuento", type: "discount", value: 5, color: "#FF6B6B" },
  { name: "10% descuento", type: "discount", value: 10, color: "#FFE66D" },
  { name: "Asas de silicona", type: "gift", value: "asas", color: "#4ECDC4" },
  { name: "5% descuento", type: "discount", value: 5, color: "#FF6B6B" },
  { name: "Asas de silicona", type: "gift", value: "asas", color: "#4ECDC4" },
  { name: "5% descuento", type: "discount", value: 5, color: "#FF6B6B" },
  { name: "Mate", type: "gift", value: "mate", color: "#95E1D3" }, // Único
];

/**
 * Gira la ruleta y retorna un premio según las probabilidades
 * @returns {Object} Premio ganado con { name, type, value }
 */
export function spinRoulette() {
  const rand = Math.random();
  let sum = 0;

  // Calcular probabilidades acumuladas
  const prizesWithChance = prizes.filter(p => p.chance > 0);
  const totalChance = prizesWithChance.reduce((acc, p) => acc + p.chance, 0);
  
  // Normalizar probabilidades
  for (const prize of prizesWithChance) {
    const normalizedChance = prize.chance / totalChance;
    sum += normalizedChance;
    if (rand <= sum) {
      return { ...prize };
    }
  }

  // Fallback (no debería llegar aquí, pero por seguridad)
  return prizesWithChance[0];
}
