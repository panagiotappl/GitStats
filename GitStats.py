from flask import Flask, render_template, jsonify
import json
from flask import request
import jinja2
import os

from analyzer import Analyzer

app = Flask(__name__)


@app.route('/')
def hello_world():
    # analyzer = Analyzer()
    # statistics = analyzer.analyze("/home/yiota/Desktop/CLI-git-repository-report")
    # print statistics
    return render_template("index.html")


@app.route('/analyze', methods=['POST'])
def analyze():
    analyzer = Analyzer()
    data = json.loads(request.data.decode())
    path = data["path"]
    print path
    statistics = analyzer.analyze(path)
    if not statistics:
        return jsonify({}), 404
    return jsonify(statistics)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 33507))
    app.run(host='0.0.0.0', port=port)
