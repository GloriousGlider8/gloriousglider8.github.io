document.addEventListener("DOMContentLoaded", (event) => {

// Add link icon to headings
document.querySelectorAll("h2").forEach(heading => {
	heading.innerHTML = heading.innerHTML.concat(`<i class="fa-solid fa-link link-icon"></i>`)
})

// Add copy and edit buttons to code
document.querySelectorAll("pre").forEach(codeBlock => {
	codeBlock.innerHTML = `<i class="fa-solid fa-copy code-copy-button"></i><i class="fa-solid fa-pencil code-edit-button"></i>`.concat(codeBlock.innerHTML)
})

// Process collapsible content
var coll = document.getElementsByClassName("collapsible");
	var i;

		for (i = 0; i < coll.length; i++) {
		coll[i].addEventListener("click", function() {
		let content = this.nextElementSibling;
		if (content.style.height && content.style.height !== "0px") {
			content.style.border = "0px solid var(--background-200)";
			content.style.height = "0px";
		} else {
			content.style.border = "1px solid var(--background-200)";
			content.style.height = content.scrollHeight + "px";
		}
		this.classList.toggle("collapsible-active");
	});}

	// Define cliboard update function
	function updateClipboard(newClip) {
		navigator.clipboard.writeText(newClip).then(
			() => {
			return true;
			},
			() => {
				alert("Failed to update clipboard.")
			return false;
			},
		);
	}

	// Add functionality and hover text to code copy buttons
	document.querySelectorAll(".code-copy-button").forEach(btn => {
		btn.innerHTML = btn.innerHTML.concat(`<p class="icon-hint">Copy Code<br/>Snippet</p>`)
		btn.addEventListener("click", () => {
			const codeEl = btn.parentElement.querySelector("code");
			if (!codeEl) return;
			updateClipboard(codeEl.innerText);
		});
	});

	// Add functionality and hover text to code edit buttons
	document.querySelectorAll(".code-edit-button").forEach(btn => {
		btn.innerHTML = btn.innerHTML.concat(`<p class="icon-hint">Open in<br/>Playground</p>`)
		btn.addEventListener("click", () => {
			const codeEl = btn.parentElement.querySelector("code");
			if (!codeEl) return;
			const codeText = codeEl.innerText;

			localStorage.setItem("tmp_playground_code_redir", codeText);
			window.location.href = "/fu-mii/playground.html?useTmpCode=true";
		});
	});

	// Add functionality and hover text to heading link buttons
	document.querySelectorAll(".link-icon").forEach(btn => {
		btn.innerHTML = btn.innerHTML.concat(`<p class="icon-hint">Copy Quick Link</p>`)
		btn.addEventListener("click", () => {
			const codeEl = btn.parentElement;
			if (!codeEl) return;
			updateClipboard(`${window.location.href.split("#")[0]}#${codeEl.id}`);
		});
	});
})