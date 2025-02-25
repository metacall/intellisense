import ast
import json
import sys
import os

def extract_functions(file_path):
    if not os.path.exists(file_path):
        print(json.dumps({"error": f"File {file_path} not found"}))
        sys.exit(1)

    with open(file_path, "r") as file:
        tree = ast.parse(file.read(), filename=file_path)

    functions = {
        node.name: {"file": file_path, "line": node.lineno - 1}
        for node in ast.walk(tree) if isinstance(node, ast.FunctionDef)
    }

    return functions

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file provided"}))
        sys.exit(1)

    python_file = os.path.abspath(sys.argv[1])  # Convert to full path
    function_map = extract_functions(python_file)
    print(json.dumps(function_map, indent=2))  # Output JSON mapping