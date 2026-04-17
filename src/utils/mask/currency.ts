export const formatCurrency = (v: number) => {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};
