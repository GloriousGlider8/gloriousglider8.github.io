from flask import Flask, send_from_directory
import os

app = Flask(__name__)
cwd = os.getcwd()

@app.route('/<path:filename>')
def serve_file(filename):
	if os.path.isdir(os.path.join(cwd, filename)):
		filename = filename + "/index.html"
	return send_from_directory(cwd, filename)

@app.route("/")
def index():
	return send_from_directory(cwd, "index.html")

if __name__ == '__main__':
	app.run(debug=False)
