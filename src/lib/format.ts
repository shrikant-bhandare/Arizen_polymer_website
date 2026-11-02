const inr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

/** Indian-grouped rupee amount, e.g. 85000 → "₹85,000". */
export function rupees(amount: number): string {
  return `₹${inr.format(amount)}`;
}

export function pad2(n: number): string {
  return String(n).padStart(2, '0');
}
