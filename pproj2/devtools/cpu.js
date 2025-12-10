import { Ver3StoreData, Ver3CharInfo } from "/js-mii/src/Ver3StoreData.js"
import { DisplayMiiBox, CharInfoToImgSrc } from "/src/miidisplay.js"

let cpudiffData
let groupData

let context
let contextEl

const colorOverrides = {
	MGDMO_Good: "#00782F",
	MGDMO_Bad: "#D21E14"
}

const specialIds = [
	"MGDMO_Good",
	"MGDMO_Bad"
]

let ug = 0
let sp = 0

//#region Helper Funcs
async function pickFFSDFile() {
	const input = document.createElement("input");
	input.type = "file";
	input.accept = ".ffsd";

	const filePromise = new Promise(resolve => {
		input.onchange = () => {
			if (!input.files || input.files.length === 0) {
				resolve(null);
			} else {
				resolve(input.files[0]);
			}
		};
	});

	input.click();

	const file = await filePromise;
	if (!file) return null;

	const arrayBuffer = await file.arrayBuffer();
	return new Uint8Array(arrayBuffer);
}

function calculateTally() {
	document.getElementById("current-count").innerHTML = `<span class="underline">Group Count:</span><br/>
	Beginner (1): ${cpudiffData.group[0].length}<br/>
	Standard (2): ${cpudiffData.group[1].length}<br/>
	Advanced (3): ${cpudiffData.group[2].length}<br/>
	Expert (4): ${cpudiffData.group[3].length}<br/>
	Master (5): ${cpudiffData.group[4].length}<br/>
	<span class="text-yellow">Ungrouped</span> (?): ${ug}<br/>
	Special: ${sp}<br/>
	<span class="bold">Total: ${Object.keys(cpudiffData.diff).length}</span>`
}

function updateWarnings() {
	let a = false

	if (ug > 0) {document.getElementById("ugmii-warning").style.display = "block"; a = true}
	else {document.getElementById("ugmii-warning").style.display = "none"}

	if (![cpudiffData.group[0].length, cpudiffData.group[1].length, cpudiffData.group[2].length, cpudiffData.group[3].length, cpudiffData.group[4].length].every( (val, i, arr) => val === arr[0] )) {document.getElementById("unbal-warning").style.display = "block"; a = true}
	else {document.getElementById("unbal-warning").style.display = "none"}

	if (a) {document.getElementById("warn-mb").style.display = "block"}
	else {document.getElementById("warn-mb").style.display = "none"}
}

function findMii(id) {
	for (const mii of groupData.miis) {if (mii.name == id) {return mii}}
	return undefined
}

function removeMii(id) {
	let i = 0
	for (const mii of groupData.miis) {if (mii.name == id) {break}; i++}
	groupData.miis.splice(i, 1)
}

//#region Context Functions
function contextOpen(id, el) {
	if (context || contextEl) {return}

	el.classList.add("active")

	context = id
	contextEl = el

	const ctxMenu = document.getElementById("mii-context-menu")

	let t = "Ungrouped"
	
	if (specialIds.includes(id)) {t = "Special"}
	if (Object.keys(cpudiffData.diff).includes(id)) {t = `Level ${cpudiffData.diff[id]}`}

	document.getElementById("context-text").innerHTML = `<span class="bold">${id}</span><br/>${t}`
	
	ctxMenu.style.opacity = "1"
	ctxMenu.style.pointerEvents = "all"
	ctxMenu.style.top = `${el.getBoundingClientRect().top - (ctxMenu.scrollHeight / 4)}px`
	ctxMenu.style.left = `${el.getBoundingClientRect().left + 90}px`
}

function contextClose() {
	contextEl.classList.remove("active")

	context = undefined
	contextEl = undefined

	const ctxMenu = document.getElementById("mii-context-menu")
	ctxMenu.style.opacity = "0"
	ctxMenu.style.pointerEvents = "none"
}

function downloadUint8Array(data, filename) {
	const blob = new Blob([data], { type: "application/octet-stream" });
	const url = URL.createObjectURL(blob);

	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);

	URL.revokeObjectURL(url);
}

function contextDownload() {
	downloadUint8Array(findMii(context).contents, `export-${context}.ffsd`)
}

function contextAssign() {
	if (specialIds.includes(context)) {alert("Cannot assign a group to special Miis."); return}

	let group = prompt("Assign to which group?\n1 - Beginner\n2 - Standard\n3 - Expert\n4 - Advanced\n5 - Master", "1")
	if (!group) {return}
	try {group = parseInt(group)} catch (err) {alert("Enter a valid number."); return}

	if (!Object.keys(cpudiffData.diff).includes(context)) {
		ug--
		document.getElementById("mii-list").appendChild(contextEl)
	} else {
		cpudiffData.group[cpudiffData.diff[context] - 1].splice(cpudiffData.group[cpudiffData.diff[context] - 1].indexOf(context), 1)
	}

	cpudiffData.diff[context] = group
	cpudiffData.group[group - 1].push(context)

	contextEl.querySelector(':scope > #label').innerHTML = `${group}`

	calculateTally()
	updateWarnings()
}

function contextDelete() {
	removeMii(context)

	if (specialIds.includes(context)) {sp--} else if (!Object.keys(cpudiffData.diff).includes(context)) {ug--}

	cpudiffData.group.forEach((t) => {if (t.includes(context)) {t.splice(t.indexOf(context), 1)}})
	if (Object.keys(cpudiffData.diff).includes(context)) {delete cpudiffData.diff[context]}
	
	contextClose()
	contextEl.remove()

	calculateTally()
	updateWarnings()
}

window.contextDelete = contextDelete
window.contextAssign = contextAssign
window.contextDownload = contextDownload

document.addEventListener("DOMContentLoaded", (e) => {document.getElementById("mii-context-menu").addEventListener("mouseleave", (e1 => {contextClose()}))})

//#region New Mii

async function newMii() {
	const ffsdData = await pickFFSDFile()
	if (!ffsdData) {return}

	const mii = {
		name: prompt("Assign a Mii ID.\nTYPE_Display Name\nTypes:\nDFT - Default\nCPU - CPU\nSPC - Special\nMGDMO - Minigame Demo (must be MGDMO_Good or MGDMO_Bad)", "DFT_Sam"),
		contents: ffsdData
	}

	const miiList = document.getElementById("mii-list")
	const mgdmoList = document.getElementById("mgdmo-list")
	const ungrpList = document.getElementById("ungrp-list")

	groupData.miis.push(mii)
	groupData.numMiis++

	let charInfo = new Ver3CharInfo()

	Ver3StoreData.setFromBytes(mii.contents, charInfo)

	let mElement = await DisplayMiiBox(charInfo, mii.name, colorOverrides[mii.name])
	mElement.id = `mii-card-${mii.name}`

	const p = document.createElement("p")
	p.innerHTML = `?`
	p.id = "label"
	if (cpudiffData.diff[mii.name]) {p.innerHTML = `${cpudiffData.diff[mii.name]}`}
	p.style.position = "relative"
	p.style.top = "-95px"
	p.style.left = "4px"

	if (specialIds.includes(mii.name)) {
		mgdmoList.appendChild(mElement)
		sp++
	} else {
		mElement.appendChild(p)
		miiList.appendChild(mElement)
		if (!cpudiffData.diff[mii.name]) {ungrpList.appendChild(mElement); ug++}
	}

	mElement.addEventListener("click", (e) => {contextOpen(mElement.id.replaceAll("mii-card-", ""), mElement)})

	calculateTally()
	updateWarnings()
}

window.newMii = newMii

//#region File Export

async function fileExport() {
	let zip = new JSZip()

	let assets = zip.folder("assets")
	assets.file("cpudiff.json", JSON.stringify(cpudiffData))

	let ffsdFolder = zip.folder("facelibcontent").folder("ffsd")
	
	for (const mii of groupData.miis) {
		ffsdFolder.file(`${mii.name}.ffsd`, mii.contents)
	}

	downloadUint8Array(await zip.generateAsync({type: "uint8array"}), "mii-patch-export.zip")
}

window.fileExport = fileExport

//#region Construct Site
async function constructSite() {
	const miiList = document.getElementById("mii-list")
	const mgdmoList = document.getElementById("mgdmo-list")
	const ungrpList = document.getElementById("ungrp-list")

	for (const mii of groupData.miis) {
		let charInfo = new Ver3CharInfo()

		Ver3StoreData.setFromBytes(mii.contents, charInfo)

		let mElement = await DisplayMiiBox(charInfo, mii.name, colorOverrides[mii.name])
		mElement.id = `mii-card-${mii.name}`

		const p = document.createElement("p")
		p.innerHTML = `?`
		p.id = "label"
		if (cpudiffData.diff[mii.name]) {p.innerHTML = `${cpudiffData.diff[mii.name]}`}
		p.style.position = "relative"
		p.style.top = "-95px"
		p.style.left = "4px"

		if (specialIds.includes(mii.name)) {
			mgdmoList.appendChild(mElement)
			sp++
		} else {
			mElement.appendChild(p)
			miiList.appendChild(mElement)
			if (!cpudiffData.diff[mii.name]) {ungrpList.appendChild(mElement); ug++}
		}
	}

	calculateTally()
	updateWarnings()

	document.querySelectorAll(".mii-icon").forEach((el) => {el.addEventListener("click", (e) => {contextOpen(el.id.replaceAll("mii-card-", ""), el)})})

	document.getElementById("site").style.display = "block"
}

//#region Submit Files

async function submitFiles() {
	let mExistList = []

	document.getElementById("err-file-missing").style.display = "none"
	document.getElementById("err-file-invalid").style.display = "none"

	const cpudiffFile = document.getElementById("cpudiff-json").files[0]

	if (!cpudiffFile) {
		document.getElementById("err-file-missing").style.display = "block"
		return;
	}

	const cpudiffJSON = await cpudiffFile.text()

	try {
		cpudiffData = JSON.parse(cpudiffJSON)
	} catch (err) {
		document.getElementById("err-file-invalid").style.display = "block"
		return;
	}

	const groupFile = document.getElementById("group-gdfl").files[0]

	if (!groupFile) {
		document.getElementById("err-file-missing").style.display = "block"
		return;
	}

	const groupUint8Array = new Uint8Array(await groupFile.arrayBuffer())

	try {
		groupData = new GdflGroup(new KaitaiStream(groupUint8Array))
	} catch (err) {
		document.getElementById("err-file-invalid").style.display = "block"
		return;
	}

	document.getElementById("file-upload").style.display = "none"

	for (const mii of groupData.miis) {
		mExistList.push(mii.name)
	}

	let diffEntryToRemove = []
	let groupEntryToRemove = []

	let alertEntries = ""

	for (const mii of Object.keys(cpudiffData.diff)) {
		if (!mExistList.includes(mii)) {
			diffEntryToRemove.push(mii)
			alertEntries = `${alertEntries}\n[diff] ${mii}`
			delete cpudiffData.diff[mii]
		}
	}

	let i = 0
	for (const group of cpudiffData.group) {let i1 = 0;for (const mii of group) {
		if (!mExistList.includes(mii)) {
			groupEntryToRemove.push(mii)
			alertEntries = `${alertEntries}\n[group][${i}] ${mii}`
			group.splice(i1, 1)
		}
		i1++
	}i++}

	if (diffEntryToRemove.length > 0 || groupEntryToRemove.length > 0) {
		alert(`cpudiff.json references Miis that are not present in group.gdfl!\nThe following entries will be removed:${alertEntries}`)
	}

	constructSite()
}

window.submitFiles = submitFiles