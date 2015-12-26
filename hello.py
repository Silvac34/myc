import os
from flask import Flask, Response, render_template, request

class Application:
    app = Flask(__name__)

    def __init__(self):
        pass

@app.route('/')
def home():
    return render_template("test.html")
