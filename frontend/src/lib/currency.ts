// Currency formatting utilities for Indian Rupees (₹)

export const formatRupees = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatRupeesWithDecimals = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatRupeesCompact = (amount: number): string => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  } else {
    return formatRupees(amount);
  }
};

export const parseRupees = (value: string): number => {
  // Remove ₹ symbol and commas, then parse
  const cleanValue = value.replace(/[₹,\s]/g, '');
  return parseFloat(cleanValue) || 0;
};

export const getRupeeSymbol = (): string => '₹';
