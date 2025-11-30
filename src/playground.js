import * as monaco from "https://esm.run/monaco-editor"
import * as libfut from "libfut.js"

document.addEventListener("DOMContentLoaded", () => {
	const params = new URLSearchParams(window.location.search)

	let theme = ""
	if (window.matchMedia("(prefers-color-scheme: dark)").matches) {theme = "vs-dark"} else {theme = "vs-light"}

	let value = `public class Hello {
	public static void Main(string[] args) {
		Console.WriteLine("Hello, Fusion!");
	}
}`

	if (params.get("useTmpCode") == "true") {
		value = localStorage.getItem("tmp_playground_code_redir")
		localStorage.removeItem("tmp_playground_code_redir")
	}

	monaco.editor.create(document.getElementById("editor-container"), {
		value: value,
		language: "csharp",
		theme: theme
	})
})