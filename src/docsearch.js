let siteMap = undefined

const sidebarHTML = `
<div style="width: 100%; height: 80px;">
	<h3 style="width: 100%; text-align: center; margin: 5px;" id="quest-title">Learning the Basics</h3>
	<progress value="1" max="5" style="width: 95%; left: 2.5%; position: absolute;" id="quest-progress"></progress>
	<button type="button" class="button" style="position: absolute; width: 95%; left: 2.5%; top: 58px">Take a Quiz</button>
</div>
<hr>
<input id="sidebar-page-search" type="text" class="page-search" placeholder="Search..." style="margin: 0;">
<div style="margin: 0; width: 100%; top: 140px; position: absolute;" id="page-list">
</div>`

const pageLocation = window.location.pathname

const getJSON = async url => {
  const response = await fetch(url)
  if(!response.ok)
    throw new Error(response.statusText)

  const data = response.json()
  return data
}

function newNavEntry(element, entry) {
	if (entry.base) {
		const a = document.createElement("a")
		a.href = entry.uri
		a.className = "sidebar-page-listing clickable"
		a.textContent = entry.name
		element.appendChild(a)
		return
	}

	if (entry.id === "!NEWSECT") {
		const p = document.createElement("p")
		p.className = "sidebar-page-listing-section"
		p.textContent = entry.name
		element.appendChild(p)
		return
	}

	// normal section
	const a = document.createElement("a")
	a.className = "sidebar-page-listing"
	a.id = `pagelist-${entry.id}`
	a.innerHTML = `${entry.name}<i class="fa-solid fa-caret-right sidebar-page-expand"></i>`
	element.appendChild(a)

	const children = document.createElement("div")
	children.id = `pagelist-children-${entry.id}`
	children.className = "sidebar-page-listing-children"
	a.appendChild(children)

	for (const child of entry.children) {
		if (child.base && child.uri.toLowerCase().replace(".html", "") == pageLocation.toLowerCase().replace(".html", "")) {
			a.classList.add("open")
			requestAnimationFrame(() => {
				children.style.height = children.scrollHeight + "px"
			})
		}
		newNavEntry(children, child)
	}
}

function sidebarSearchHandler() {

}

async function loadNavBar() {
	const docSidebar = document.getElementById("doc-sidebar")
	docSidebar.innerHTML = sidebarHTML

	const pageList = document.getElementById("page-list")
	siteMap = await getJSON("/fu-mii/map.json")

	for (const page of siteMap) {
		newNavEntry(pageList, page)
	}

	document.querySelectorAll(".sidebar-page-expand").forEach(btn => {
		btn.addEventListener("click", () => {
			btn.parentElement.classList.toggle("open")
			const children = btn.parentElement.querySelector(".sidebar-page-listing-children")
			if (btn.parentElement.classList.contains("open")) {
				children.style.height = children.scrollHeight + "px";
			} else {
				children.style.height = "0";
			}
		})
	})
}