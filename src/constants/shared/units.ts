import type { UnitOfMeasure } from '~/types/database';

export const UNIT_LABELS: Record<UnitOfMeasure, string> = {
  g: 'Gramas (g)',
  kg: 'Quilos (kg)',
  ml: 'Mililitros (ml)',
  l: 'Litros (l)',
  un: 'Unidades (un)',
};

export const UNIT_SUFFIX: Record<UnitOfMeasure, string> = {
  g: '/g',
  kg: '/kg',
  ml: '/ml',
  l: '/l',
  un: '/un',
};
