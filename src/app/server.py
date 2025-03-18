from flask import Flask, request, jsonify
from flask_cors import CORS
import ast
import inspect

app = Flask(__name__)
CORS(app)

def validate_code(user_code):
    """Check if user code is valid Python syntax."""
    try:
        ast.parse(user_code)
        return True, ""
    except SyntaxError as e:
        return False, f"Syntax Error: {e}"

def execute_code(user_code):
    """Safely execute user code and return sorting results."""
    is_valid, error_message = validate_code(user_code)
    if not is_valid:
        return {"error": error_message}

    try:
        exec_globals = {}
        exec(user_code, {"__builtins__": {}}, exec_globals)  # Safe exec

        for name, func in exec_globals.items():
            if callable(func) and "sort" in name.lower():
                params = inspect.signature(func).parameters
                if len(params) == 1:  
                    sample_input = [5, 3, 8, 4, 2]
                    result = func(sample_input)
                    return {"sorted_output": result or sample_input}

        return {"message": "No valid sorting function found."}

    except Exception as e:
        return {"error": str(e)}

@app.route('/run', methods=['POST'])
def run_code():
    """Handle API request to execute user-provided code."""
    data = request.json
    user_code = data.get("code", "")

    print("Received Code:\n", repr(user_code))  

    if not user_code.strip():
        return jsonify({"error": "No code provided."}), 400

    result = execute_code(user_code)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
