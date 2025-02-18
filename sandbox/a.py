import metacall
from b.ts import tsSum, tsSum2, analyzeNumbers
import json


print(tsSum(2, 6))
print(tsSum2(43, 5))


a = tsSum(10, 4)
b = tsSum2(4, 3)


def metacall_inspect_from_py():
    inspection_data = metacall.metacall_inspect()
    with open('metacall_inspection.json', 'w') as f:
        json.dump(inspection_data, f, indent=2)