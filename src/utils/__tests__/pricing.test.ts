import { describe, expect, it } from 'vitest';

import {
  calculateIngredientCost,
  calculateMarkup,
  calculatePricing,
  calculateTotalRecipeCost,
  calculateUnitCost,
  convertUnit,
} from '../pricing';

describe('Pricing Engine — calculateUnitCost', () => {
  it('should calculate unit cost correctly', () => {
    expect(calculateUnitCost(10, 1000)).toBe(0.01);
  });

  it('should return 0 when purchase quantity is 0', () => {
    expect(calculateUnitCost(10, 0)).toBe(0);
  });

  it('should return 0 when purchase quantity is negative', () => {
    expect(calculateUnitCost(10, -5)).toBe(0);
  });

  it('should handle decimal values', () => {
    expect(calculateUnitCost(5.5, 250)).toBeCloseTo(0.022, 3);
  });
});

describe('Pricing Engine — calculateIngredientCost', () => {
  it('should calculate the cost of an ingredient in a recipe', () => {
    const cost = calculateIngredientCost({
      purchase_price: 5,
      purchase_quantity: 1000,
      quantity_used: 200,
    });
    expect(cost).toBe(1);
  });

  it('should handle fractional quantities', () => {
    const cost = calculateIngredientCost({
      purchase_price: 12,
      purchase_quantity: 12,
      quantity_used: 3,
    });
    expect(cost).toBe(3);
  });

  it('should return 0 when quantity used is 0', () => {
    const cost = calculateIngredientCost({
      purchase_price: 10,
      purchase_quantity: 500,
      quantity_used: 0,
    });

    expect(cost).toBe(0);
  });
});

describe('Pricing Engine — calculateTotalRecipeCost', () => {
  it('should sum the cost of all ingredients', () => {
    const ingredients = [
      { purchase_price: 5, purchase_quantity: 1000, quantity_used: 200 },
      { purchase_price: 12, purchase_quantity: 12, quantity_used: 3 },
      { purchase_price: 8, purchase_quantity: 500, quantity_used: 100 },
    ];

    const total = calculateTotalRecipeCost(ingredients);

    expect(total).toBeCloseTo(5.6, 2);
  });

  it('should return 0 for empty ingredient list', () => {
    expect(calculateTotalRecipeCost([])).toBe(0);
  });
});

describe('Pricing Engine — calculateMarkup', () => {
  it('should calculate markup correctly', () => {
    expect(calculateMarkup(15, 30)).toBeCloseTo(0.55, 4);
  });

  it('should return 1 when fees and margin are 0', () => {
    expect(calculateMarkup(0, 0)).toBe(1);
  });

  it('should return negative when fees exceed 100%', () => {
    expect(calculateMarkup(60, 50)).toBeCloseTo(-0.1, 4);
  });

  it('should return 0 when fees are exactly 100%', () => {
    expect(calculateMarkup(50, 50)).toBe(0);
  });
});

describe('Pricing Engine — calculatePricing (integration)', () => {
  it('should calculate full pricing for a viable product', () => {
    const result = calculatePricing({
      total_recipe_cost: 5.6,
      fixed_costs_allowance: 2,
      delivery_fee_percentage: 15,
      profit_margin_desired: 30,
    });

    expect(result.is_viable).toBe(true);
    expect(result.cost_with_fixed).toBe(7.6);
    expect(result.markup).toBeCloseTo(0.55, 4);
    expect(result.suggested_price).toBeCloseTo(13.82, 1);
    expect(result.delivery_fee_value).toBeCloseTo(2.07, 1);
    expect(result.expected_profit).toBeCloseTo(4.15, 0);
  });

  it('should return is_viable false when markup is not positive', () => {
    const result = calculatePricing({
      total_recipe_cost: 10,
      fixed_costs_allowance: 5,
      delivery_fee_percentage: 60,
      profit_margin_desired: 50,
    });

    expect(result.is_viable).toBe(false);
    expect(result.suggested_price).toBe(0);
  });

  it('should handle zero delivery fee and zero margin', () => {
    const result = calculatePricing({
      total_recipe_cost: 10,
      fixed_costs_allowance: 0,
      delivery_fee_percentage: 0,
      profit_margin_desired: 0,
    });

    expect(result.is_viable).toBe(true);
    expect(result.markup).toBe(1);
    expect(result.suggested_price).toBe(10);
    expect(result.delivery_fee_value).toBe(0);
    expect(result.expected_profit).toBe(0);
  });

  it('should handle only fixed costs (no margin, no delivery)', () => {
    const result = calculatePricing({
      total_recipe_cost: 8,
      fixed_costs_allowance: 4,
      delivery_fee_percentage: 0,
      profit_margin_desired: 0,
    });

    expect(result.suggested_price).toBe(12);
    expect(result.expected_profit).toBe(0);
  });

  it('should calculate real-world scenario: pizza', () => {
    const result = calculatePricing({
      total_recipe_cost: 8,
      fixed_costs_allowance: 3,
      delivery_fee_percentage: 12,
      profit_margin_desired: 35,
    });

    expect(result.is_viable).toBe(true);
    expect(result.markup).toBeCloseTo(0.53, 4);
    expect(result.suggested_price).toBeCloseTo(20.75, 0);
    expect(result.delivery_fee_value).toBeCloseTo(2.49, 0);
    expect(result.expected_profit).toBeCloseTo(7.26, 0);
  });
});

describe('Unit Conversion — convertUnit', () => {
  it('should convert g to kg', () => {
    expect(convertUnit(1500, 'g', 'kg')).toBe(1.5);
  });

  it('should convert kg to g', () => {
    expect(convertUnit(2.5, 'kg', 'g')).toBe(2500);
  });

  it('should convert ml to L', () => {
    expect(convertUnit(750, 'ml', 'l')).toBe(0.75);
  });

  it('should convert L to ml', () => {
    expect(convertUnit(1.2, 'l', 'ml')).toBe(1200);
  });

  it('should return same value for same unit', () => {
    expect(convertUnit(500, 'g', 'g')).toBe(500);
  });

  it('should return null for unsupported conversions', () => {
    expect(convertUnit(500, 'g', 'ml')).toBeNull();
  });

  it('should handle case-insensitive units', () => {
    expect(convertUnit(1000, 'G', 'KG')).toBe(1);
  });
});
