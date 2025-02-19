export function tsSum(a: number, b: number) {
  return a + b;
}

export function tsSum2(a: any, b: any) {
  return (a + b).toString();
}

export function analyzeNumbers(numbers: number[]): { sorted: number[]; sum: number; average: number; median: number } {
  if (!Array.isArray(numbers) || numbers.length === 0) {
    throw new Error("Input must be a non-empty array of numbers");
  }

  const sorted = [...numbers].sort((a, b) => a - b);
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  const average = sum / numbers.length;

  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

  return { sorted, sum, average, median };
}

/**
 * Adds a number and a string that is parsed to a number
 */
export function sum2(a: number, b: string) {
  return a + parseInt(b);
}

export function sum3(a: number, b: number, c: number) {
  return a + b + c;
}