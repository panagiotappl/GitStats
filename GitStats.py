from flask import Flask, render_template
from analyzer import Analyzer

app = Flask(__name__)


@app.route('/')
def hello_world():
    # analyzer = Analyzer()
    # statistics = analyzer.analyze("/home/yiota/Desktop/CLI-git-repository-report")
    # print statistics
    return render_template("index.html")


if __name__ == '__main__':
    app.run()
