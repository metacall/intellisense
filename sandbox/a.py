import metacall
from b.ts import tsSum, tsSum2, analyzeNumbers


print(tsSum(2, 6))
print(tsSum2(43, 5))

a = tsSum(3, 3)

a = analyzeNumbers([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
a = analyzeNumbers([3, 4, 6,4])
print(a)
x = a['sorted']
print(x)