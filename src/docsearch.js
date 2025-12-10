let siteMap = undefined

const sidebarHTML = `
<input id="sidebar-page-search" type="text" class="page-search" placeholder="Search..." style="margin: 0; margin-top: 10px;">
<div style="margin: 0; width: 100%; top: 50px; position: absolute; overflow-y: auto;" id="page-list">
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
	const div = document.createElement("div")
	div.id = `pagelist-wrapper-${entry.id}`
	div.classList.add("smooth-height")
	div.style.height = "39px"
	const a = document.createElement("a")
	a.className = "sidebar-page-listing"
	a.id = `pagelist-${entry.id}`
	a.innerHTML = `${entry.name}<i class="fa-solid fa-caret-right sidebar-page-expand"></i>`
	element.appendChild(div)
	div.appendChild(a)

	const children = document.createElement("div")
	children.id = `pagelist-children-${entry.id}`
	children.className = "sidebar-page-listing-children"
	a.appendChild(children)

	for (const child of entry.children) {
		if (child.base && child.uri.toLowerCase().replace(".html", "") == pageLocation.toLowerCase().replace(".html", "")) {
			a.classList.add("open")
			requestAnimationFrame(() => {
				children.style.height = children.scrollHeight + "px"
				div.style.height = children.scrollHeight + 39 + "px"
			})
		}
		newNavEntry(children, child)
	}
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
				children.style.height = children.scrollHeight + "px"
				btn.parentElement.parentElement.style.height = children.scrollHeight + 39 + "px"
			} else {
				children.style.height = "0"
				btn.parentElement.parentElement.style.height = "39px"
			}
		})
	})

	document.getElementById("sidebar-page-search").addEventListener("input", (e) => {
		const text = e.target.value.toLowerCase()

		if (text == "") {
			for (const child of pageList.children) {
				child.classList.remove("hidden")
			}
		} else {
			for (const child of pageList.children) {
				if (child.innerText.toLowerCase().includes(text) && !child.classList.contains("sidebar-page-listing-section")) {
					child.classList.remove("hidden")
				} else {
					child.classList.add("hidden")
				}
			}
		}
	})
}