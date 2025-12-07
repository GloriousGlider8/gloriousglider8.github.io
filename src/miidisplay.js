import { Ver3StoreData } from "/js-mii/src/Ver3StoreData.js"

const FavouriteColors = [
	"#D21E14",
	"#FF6E19",
	"#FFD81F",
	"#78D21F",
	"#00782F",
	"#0A48B4",
	"#3CAAE0",
	"#F5587D",
	"#7328AD",
	"#483817",
	"#E0E0E0",
	"#000000"
]

const TrueFavouriteColors = [
	"#D21E14",
	"#FF6E19",
	"#FFD81F",
	"#78D21F",
	"#00782F",
	"#0A48B4",
	"#3CAAE0",
	"#F5587D",
	"#7328AD",
	"#483817",
	"#E0E0E0",
	"#181814"
]

function HexToRGBString(hex) {
	if (hex.startsWith('#')) hex = hex.slice(1);

	const r = parseInt(hex.slice(0, 2), 16);
	const g = parseInt(hex.slice(2, 4), 16);
	const b = parseInt(hex.slice(4, 6), 16);

	return `${r}, ${g}, ${b}`;
}

// TODO change this to use miifu
export async function CharInfoToImgSrc(charInfo) {
	let stDataBytes = new Uint8Array(96)
	Ver3StoreData.toStoreDataBytes(stDataBytes, charInfo)

	return "/assets/placeholder-100.png"
	return `https://mii-unsecure.ariankordi.net/miis/image.png?data=${stDataBytes.toHex()}&type=face_only&resourceType=middle&width=100`
}

export async function DisplayMiiBox(charInfo, displayName, colorOverride) {
	const div = document.createElement("div")

	div.classList.add("mii-icon")
	div.style.setProperty("--color", HexToRGBString(FavouriteColors[charInfo.getFavoriteColor()]))
	if (colorOverride) {div.style.setProperty("--color", HexToRGBString(colorOverride))}

	const img = document.createElement("img")

	img.draggable = false
	img.src = await CharInfoToImgSrc(charInfo)
	div.appendChild(img)

	const p = document.createElement("p")

	p.classList.add("mii-name-hover")
	p.innerHTML = `${displayName}`
	div.appendChild(p)

	return div
}