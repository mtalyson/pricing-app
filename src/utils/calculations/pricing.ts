import type { IngredientCostInput, PricingInput, PricingResult } from '~/types';

export function calculateUnitCost(
  purchasePrice: number,
  purchaseQuantity: number,
): number {
  if (purchaseQuantity <= 0) {
    return 0;
  }
  return purchasePrice / purchaseQuantity;
}

export function calculateIngredientCost(input: IngredientCostInput): number {
  const unitCost = calculateUnitCost(
    input.purchase_price,
    input.purchase_quantity,
  );
  return unitCost * input.quantity_used;
}

export function calculateTotalRecipeCost(
  ingredients: IngredientCostInput[],
): number {
  return ingredients.reduce(
    (total, ingredient) => total + calculateIngredientCost(ingredient),
    0,
  );
}

export function calculateMarkup(
  deliveryFeePercentage: number,
  profitMarginDesired: number,
): number {
  return 1 - deliveryFeePercentage / 100 - profitMarginDesired / 100;
}

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

function round(value: number, decimals = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

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

  if (fromLower === toLower) {
    return value;
  }

  return null;
}
