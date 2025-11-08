import * as FFLResource from "/js-mii/src/FFLResource.js";
import * as Ver3StoreData from "/js-mii/src/Ver3StoreData.js";
import * as ThreeManager from "/js-mii/src/3dmanager.js";

//#region FFL setup
let resources = {
	"fh": null,
	"fm": null,
	"cf": null,
	"af": null
}

let objects = {
	"fh": null,
	"fm": null,
	"cf": null,
	"af": null
}

function fillParts(obj, key, count) {
	obj[key] = [];
	for (let i = 0; i < count; i++)
		obj[key][i] = new FFLResource.FFLiResourcePartsInfo();
}

function getObjects(o) {
	return [].concat(
		o.textureBeard,
		o.textureCap,
		o.textureEye,
		o.textureEyebrow,
		o.textureWrinkle,
		o.textureMakeup,
		o.textureGlasses,
		o.textureMole,
		o.textureMouth,
		o.textureMustache,
		o.textureNoseline,
		o.shapeBeard,
		o.shapeCapNormal,
		o.shapeCapHat,
		o.shapeFaceline,
		o.shapeGlasses,
		o.shapeMask,
		o.shapeNoseline,
		o.shapeNose,
		o.shapeHairNormal,
		o.shapeHairHat,
		o.shapeForeheadNormal,
		o.shapeForeheadHat,
	);
}

function loadPart(value, index, array) {
	value.partData = new FFLResource.FFLiPartData();
	value.partData.header = new FFLResource.FFLiPartDataHeader();
	value.partData.footer = new FFLResource.FFLiPartDataFooter();
	value.partData.data = [];

	value.loadHeader(this, new Uint8Array(value.uncompressedSize), new Uint8Array(value.compressedSize));

	if (value.partData.used) {
		value.partData.header.elementSize.forEach(function(value, index, array) {
			if (value <= 200000000 && value > 0) {
				this.partData.data.push(new Uint8Array(value));
			} else {
				this.partData.data.push(new Uint8Array(0));
			}
		}.bind(value));
		
		value.loadPart();
	}
}

async function loadResource(uri, resourceID) {
	const response = await fetch(uri);
	if (!response.ok) throw new Error(`Could not load ${uri}: ${response.status}`);

	resources[resourceID] = new FFLResource.FFLResource();
	let o = new FFLResource.FFLiResourceLoaderObjects();

	o.resourceHeader = new FFLResource.FFLiResourceHeader();
	o.textureHeader = new FFLResource.FFLiResourceTextureHeader();
	o.shapeHeader = new FFLResource.FFLiResourceShapeHeader();

	fillParts(o, "textureBeard", 3);
	fillParts(o, "textureCap", 132);
	fillParts(o, "textureEye", 62);
	fillParts(o, "textureEyebrow", 24);
	fillParts(o, "textureWrinkle", 12);
	fillParts(o, "textureMakeup", 12);
	fillParts(o, "textureGlasses", 9);
	fillParts(o, "textureMole", 2);
	fillParts(o, "textureMouth", 37);
	fillParts(o, "textureMustache", 6);
	fillParts(o, "textureNoseline", 18);

	fillParts(o, "shapeBeard", 4);
	fillParts(o, "shapeCapNormal", 132);
	fillParts(o, "shapeCapHat", 132);
	fillParts(o, "shapeFaceline", 12);
	fillParts(o, "shapeGlasses", 1);
	fillParts(o, "shapeMask", 12);
	fillParts(o, "shapeNoseline", 18);
	fillParts(o, "shapeNose", 18);
	fillParts(o, "shapeHairNormal", 132);
	fillParts(o, "shapeHairHat", 132);
	fillParts(o, "shapeForeheadNormal", 132);
	fillParts(o, "shapeForeheadHat", 132);

	let kfu = new FFLResource.FUByteUtils();
	kfu.data = new Uint8Array(await response.arrayBuffer());
	resources[resourceID].fromByteUtils(kfu, o);

	kfu.seek(0);
	getObjects(o).forEach(loadPart.bind(kfu));
	objects[resourceID] = o;
}
//#endregion

function f32ArrayFromU8ArrayBE(uint8Array) {
	const count = uint8Array.length / 4;
	const floats = new Float32Array(count);
	const view = new DataView(uint8Array.buffer, uint8Array.byteOffset, uint8Array.byteLength);

	for (let i = 0; i < count; i++) {
		floats[i] = view.getFloat32(i * 4, false);
	}
	return floats;
}

function u16ArrayFromU8ArrayBE(uint8Array) {
	const count = uint8Array.length / 2;
	const uints = new Uint16Array(count);
	const view = new DataView(uint8Array.buffer, uint8Array.byteOffset, uint8Array.byteLength);

	for (let i = 0; i < count; i++) {
		uints[i] = view.getUint16(i * 2, false);
	}
	return uints;
}

export async function rjsTest() {
	await loadResource("/assets/FFLResMiddle.dat", "fm");

	console.log(objects.fm);

	const verticies = f32ArrayFromU8ArrayBE(objects.fm.shapeFaceline[0].partData.data[FFLResource.FFLiResourceShapeElementType.POSITION]);
	const indices = Array.from(u16ArrayFromU8ArrayBE(objects.fm.shapeFaceline[0].partData.data[FFLResource.FFLiResourceShapeElementType.INDEX]));

	console.log(indices);
	console.log(verticies);
	ThreeManager.draw(verticies);
}

export function render(data, expression, resource) {

}