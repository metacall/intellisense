/**
 * Analyzes an array of numbers and returns statistical data.
 *
 * @param {number[]} numbers - The array of numbers to analyze.
 * @returns {{ sorted: number[], sum: number, average: number, median: number }} 
 *          An object containing sorted numbers, sum, average, and median.
 */
export function analyzeNumbers(numbers: number[]): { sorted: number[], sum: number, average: number, median: number } {
  const sorted = [...numbers].sort((a, b) => a - b);
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  const average = sum / numbers.length;
  const median = numbers.length % 2 === 0
    ? (sorted[numbers.length / 2 - 1] + sorted[numbers.length / 2]) / 2
    : sorted[Math.floor(numbers.length / 2)];

  return { sorted, sum, average, median };
}


export function sum(a: number, b: number): number {
  return a + b;
}