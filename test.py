import os
from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello():
    return render_template("test.html")

if __name__ == "__main__":
#    DevData.populate_database() #to populate the database in development environment
    Application.app.debug = True
    Application.app.run(host='0.0.0.0')
