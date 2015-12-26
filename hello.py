import os
from flask import Flask, Response, render_template, request

app = Flask(__name__)

@app.route('/')
def home():
    return 'Hello World!'
