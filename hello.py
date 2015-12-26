import os
from flask import Flask, Response, render_template, request
from pymongo import MongoClient, cursor

class Application:
    app = Flask(__name__)
    db = MongoClient('localhost')['Shrt']

    def __init__(self):
        pass

@Application.app.route('/')
def home():
    return render_template("test.html")
