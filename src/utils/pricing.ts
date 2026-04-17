/**
 * Motor de Cálculo — Pricing Engine
 *
 * Funções puras para cálculo de custos, markup, preço de venda e lucro.
 * Todas as fórmulas estão documentadas no AI_CONTEXT.md.
 */

export interface IngredientCostInput {
  purchase_price: number;
  purchase_quantity: number;
  quantity_used: number;
}

export interface PricingInput {
  /** Custo total dos ingredientes da receita */
  total_recipe_cost: number;
  /** Rateio de custos fixos (valor absoluto em R$) */
  fixed_costs_allowance: number;
  /** Percentual da taxa de delivery (ex: 15 para 15%) */
  delivery_fee_percentage: number;
  /** Margem de lucro desejada (ex: 30 para 30%) */
  profit_margin_desired: number;
}

export interface PricingResult {
  /** Custo total da receita (ingredientes) */
  total_recipe_cost: number;
  /** Custo com fixos incluídos */
  cost_with_fixed: number;
  /** Fator de markup */
  markup: number;
  /** Preço sugerido de venda */
  suggested_price: number;
  /** Valor da taxa de delivery */
  delivery_fee_value: number;
  /** Lucro líquido esperado */
  expected_profit: number;
  /** Markup é válido (> 0)? */
  is_viable: boolean;
}

/**
 * Calcula o custo unitário de um ingrediente.
 *
 * Fórmula: purchase_price / purchase_quantity
 */
export function calculateUnitCost(
  purchasePrice: number,
  purchaseQuantity: number,
): number {
  if (purchaseQuantity <= 0) {
    return 0;
  }
  return purchasePrice / purchaseQuantity;
}

/**
 * Calcula o custo de um ingrediente na receita.
 *
 * Fórmula: (purchase_price / purchase_quantity) * quantity_used
 */
export function calculateIngredientCost(input: IngredientCostInput): number {
  const unitCost = calculateUnitCost(
    input.purchase_price,
    input.purchase_quantity,
  );
  return unitCost * input.quantity_used;
}

/**
 * Calcula o custo total de uma receita (soma de todos os ingredientes).
 */
export function calculateTotalRecipeCost(
  ingredients: IngredientCostInput[],
): number {
  return ingredients.reduce(
    (total, ingredient) => total + calculateIngredientCost(ingredient),
    0,
  );
}

/**
 * Calcula o fator de markup.
 *
 * Fórmula: 1 - (delivery_fee_percentage / 100) - (profit_margin_desired / 100)
 *
 * Se o markup for <= 0, a precificação é inviável (as taxas + margem excedem 100%).
 */
export function calculateMarkup(
  deliveryFeePercentage: number,
  profitMarginDesired: number,
): number {
  return 1 - deliveryFeePercentage / 100 - profitMarginDesired / 100;
}

/**
 * Calcula a precificação completa de um produto.
 */
export function calculatePricing(input: PricingInput): PricingResult {
  const costWithFixed = input.total_recipe_cost + input.fixed_costs_allowance;

  const markup = calculateMarkup(
    input.delivery_fee_percentage,
    input.profit_margin_desired,
  );

  const isViable = markup > 0;

  const suggestedPrice = isViable ? costWithFixed / markup : 0;

  const deliveryFeeValue =
    suggestedPrice * (input.delivery_fee_percentage / 100);

  const expectedProfit = suggestedPrice - costWithFixed - deliveryFeeValue;

  return {
    total_recipe_cost: round(input.total_recipe_cost),
    cost_with_fixed: round(costWithFixed),
    markup: round(markup, 4),
    suggested_price: round(suggestedPrice),
    delivery_fee_value: round(deliveryFeeValue),
    expected_profit: round(expectedProfit),
    is_viable: isViable,
  };
}

/**
 * Arredonda um número para N casas decimais.
 */
function round(value: number, decimals = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Converte entre unidades de medida de massa/volume.
 * Suporta: g ↔ kg, ml ↔ L
 */
export function convertUnit(
  value: number,
  from: string,
  to: string,
): number | null {
  const conversions: Record<string, Record<string, number>> = {
    g: { kg: 0.001, g: 1 },
    kg: { g: 1000, kg: 1 },
    ml: { l: 0.001, ml: 1 },
    l: { ml: 1000, l: 1 },
  };

  const fromLower = from.toLowerCase();
  const toLower = to.toLowerCase();

  if (conversions[fromLower] && conversions[fromLower][toLower] !== undefined) {
    return value * conversions[fromLower][toLower];
  }

  // Same unit — no conversion needed
  if (fromLower === toLower) {
    return value;
  }

  return null; // Unsupported conversion
}
