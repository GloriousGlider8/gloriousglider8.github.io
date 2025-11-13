const pageList = undefined

const sidebarHTML = `
<div style="width: 100%; height: 80px;">
	<h3 style="width: 100%; text-align: center; margin: 5px;" id="quest-title">Learning the Basics</h3>
	<progress value="1" max="5" style="width: 95%; left: 2.5%; position: absolute;" id="quest-progress"></progress>
	<button type="button" class="button" style="position: absolute; width: 95%; left: 2.5%; top: 58px">Take a Quiz</button>
</div>
<hr>
<input id="page-search" type="text" class="page-search" placeholder="Search..." style="margin: 0;">
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
		element.innerHTML = `${element.innerHTML}<a href="${entry.uri}" class="sidebar-page-listing clickable">${entry.name}</a>`
	} else {
		element.innerHTML = `${element.innerHTML}<a class="sidebar-page-listing" id="pagelist-${entry.id}">${entry.name}<i class="fa-solid fa-caret-right sidebar-page-expand"></i></a>`
		let entryElement = document.getElementById(`pagelist-${entry.id}`)
		entryElement.innerHTML = `${entryElement.innerHTML}<div id="pagelist-children-${entry.id}" class="sidebar-page-listing-children"></div>`
		for (const page of entry.children) {
			newNavEntry(document.getElementById(`pagelist-children-${entry.id}`), page)
		}
	}
}

async function loadNavBar() {
	const docSidebar = document.getElementById("doc-sidebar")
	docSidebar.innerHTML = sidebarHTML

	const pageList = document.getElementById("page-list")
	const siteMap = await getJSON("/fu-mii/map.json")

	console.log(siteMap)
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