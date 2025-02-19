import metacall
from b.ts import tsSum, tsSum2, analyzeNumbers
import json


print(tsSum(2, 6))
print(tsSum2(43, 5))


a = tsSum(10, 4)
b = tsSum2(4, 3)

a = analyzeNumbers([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
print(a)
x = a['sorted']
print(x)


def metacall_inspect_from_py():
    inspection_data = metacall.metacall_inspect()
    with open('metacall_inspection.json', 'w') as f:
        json.dump(inspection_data, f, indent=2)
