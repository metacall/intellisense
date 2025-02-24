import metacall
import json

def testFunction(a: int) -> int:
    return a

def metacall_inspect_from_py():
    inspection_data = metacall.metacall_inspect()
    with open('metacall_inspection.json', 'w') as f:
        json.dump(inspection_data, f, indent=2)

metacall_inspect_from_py() # doesnt show the function inspects correctly