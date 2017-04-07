from flask import Flask, render_template, jsonify
from flask import request
import jinja2

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
    statistics = analyzer.analyze(request.form.get("path"))

    return jsonify(statistics)


if __name__ == '__main__':
    app.run()
