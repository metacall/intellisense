"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tsSum = tsSum;
exports.tsSum2 = tsSum2;
exports.analyzeNumbers = analyzeNumbers;
exports.sum2 = sum2;
exports.sum3 = sum3;
function tsSum(a, b) {
    return a + b;
}
function tsSum2(a, b) {
    return (a + b).toString();
}
function analyzeNumbers(numbers) {
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
/*
* This is the jsDoc this is
*/
function sum2(a, b) {
    return a + parseInt(b);
}
function sum3(a, b, c) {
    return a + b + c;
}
//# sourceMappingURL=b.js.map