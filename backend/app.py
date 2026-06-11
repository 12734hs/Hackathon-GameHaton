from flask import Flask, request

app = Flask(__name__)

@app.route("/login", methods=['POST'])
def login():
    data = request.get_json
    return data

if __name__ == '__main__':
    app.run()