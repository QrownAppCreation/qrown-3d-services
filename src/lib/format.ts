export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
  
  export function formatCents(cents: number): string {
    return formatCurrency(cents / 100);
  }
  
  export function formatAmount(amount: number): string {
    return amount.toFixed(2);
  }