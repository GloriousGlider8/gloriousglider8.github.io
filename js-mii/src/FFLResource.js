// Generated automatically with "fut". Do not edit.
// i editied it anyway :P

import { ZlibImpl } from "/js-mii/src/zlibimpl.js";

export class BitConverter
{

	/**
	 * Converts packed 10_10_10_2 SNORM (signed normalized) to float[3]
	 */
	static convert1010102ToFloat(packed, outVec, offset)
	{
		let nx = packed << 22 >> 22;
		let ny = packed << 12 >> 22;
		let nz = packed << 2 >> 22;
		outVec[offset * 3 + 0] = nx / 511.0;
		outVec[offset * 3 + 1] = ny / 511.0;
		outVec[offset * 3 + 2] = nz / 511.0;
	}

	/**
	 * Converts packed 8_8_8_8 SNORM (signed normalized) to float[4]
	 */
	static convert8888SnormToFloat(packed, outVec)
	{
		let r = packed >> 16 & 255;
		let g = packed >> 8 & 255;
		let b = packed & 255;
		let a = packed >> 24 & 255;
		if (r > 127)
			r -= 256;
		if (g > 127)
			g -= 256;
		if (b > 127)
			b -= 256;
		if (a > 127)
			a -= 256;
		outVec[0] = r / 127.0;
		outVec[1] = g / 127.0;
		outVec[2] = b / 127.0;
		outVec[3] = a / 127.0;
	}

	/**
	 * Converts 16-bit half-float to 32-bit float (IEEE754)
	 */
	static halfToFloat(half)
	{
		let sign = half >> 15 & 1;
		let exp = half >> 10 & 31;
		let mant = half & 1023;
		let f;
		if (exp == 0) {
			if (mant == 0) {
				f = sign << 31;
			}
			else {
				exp = 1;
				while ((mant & 1024) == 0) {
					mant <<= 1;
					exp--;
				}
				mant &= 1023;
				exp += 112;
				f = sign << 31 | exp << 23 | mant << 13;
			}
		}
		else if (exp == 31) {
			f = sign << 31 | 2139095040 | mant << 13;
		}
		else {
			let add = 112;
			exp = exp + add;
			f = sign << 31 | exp << 23 | mant << 13;
		}
		return BitConverter.uIntToFloat(f);
	}

	/**
	 * Convert 32-bit unsigned integer to floating point.
	 * As of 3.2.10, Fusion does not include any method to
	 * convert bits to float, so native implementations are provided
	 * along with a generic slow and terrible but functional fallback.
	 */
	static uIntToFloat(bits)
	{
		let sign = (BigInt(bits) & 2147483648n) != 0;
		let exp = bits >> 23 & 255;
		let frac = bits & 8388607;
		let mantissa;
		let value;
		if (exp == 0) {
			if (frac == 0) {
				return sign ? -0.0 : 0.0;
			}
			mantissa = frac / Math.pow(2.0, 23);
			value = Math.pow(2.0, -126) * mantissa;
		}
		else if (exp == 255) {
			if (frac != 0)
				return NaN;
			return sign ? -Infinity : Infinity;
		}
		else {
			mantissa = 1.0 + frac / Math.pow(2.0, 23);
			value = mantissa * Math.pow(2.0, exp - 127);
		}
		return sign ? -value : value;
	}

	static floatToInt(v)
	{
		throw new Error("Not implemented for pure Fusion.");
	}
}

export class FUByteUtils
{
	/**
	 * Currently only supports Big Endian.
	 */
	data;
	offset = 0;

	seek(where)
	{
		this.offset = where;
	}

	padding(size)
	{
		this.offset += size;
	}

	readUInt(size)
	{
		let res = 0;
		for (let i = 0; i < size; i++) {
			res = res << 8 | this.data[this.offset++];
		}
		return res;
	}

	readFloat()
	{
		let raw = this.readUInt(4);
		return BitConverter.uIntToFloat(raw);
	}

	readUTF8(size)
	{
		this.offset += size;
		return new TextDecoder().decode(this.data.subarray(this.offset - size, this.offset - size + size));
	}

	readRaw(size, buffer)
	{
		buffer.set(this.data.subarray(this.offset, this.offset + size));
		this.offset += size;
	}
}

export const FFLiTextureFormat = {
	GREYSCALE : 0,
	GREYSCALE_ALPHA : 1,
	R_G_B_A : 2
}

export class FFLiResourceShapeElementTypeMax
{

	static VALUE = 9;
}

export const FFLiResourceShapeElementType = {
	POSITION : 0,
	NORMAL : 1,
	TEXCOORD : 2,
	TANGENT : 3,
	COLOR : 4,
	INDEX : 5,
	TRANSFORM_HAIR : 6,
	TRANSFORM_FACELINE : 7,
	BOUNDING_BOX : 8
}

export class Vec3
{
	x = NaN;
	y = NaN;
	z = NaN;

	fromByteUtils(data)
	{
		this.x = data.readFloat();
		this.y = data.readFloat();
		this.z = data.readFloat();
	}

	setNaN()
	{
		this.x = NaN;
		this.y = NaN;
		this.z = NaN;
	}
}

export class BoundingBox
{
	min = new Vec3();
	max = new Vec3();

	fromByteUtils(data)
	{
		this.min.fromByteUtils(data);
		this.max.fromByteUtils(data);
	}

	setNaN()
	{
		this.min.setNaN();
		this.max.setNaN();
	}
}

export class WindowBitConverter
{

	static fFLiResourceWindowBitsToZlibWindowBits(windowBits)
	{
		if (windowBits <= 7) {
			return windowBits + 8;
		}
		if (windowBits >= 8 && windowBits <= 15) {
			return windowBits + 16;
		}
		if (windowBits == 16) {
			return 47;
		}
		return 15;
	}
}

export class FFLiResourceLoaderObjects
{
	resourceHeader;
	textureHeader;
	shapeHeader;
	textureBeard = new Array(3);
	textureCap = new Array(132);
	textureEye = new Array(62);
	textureEyebrow = new Array(24);
	textureWrinkle = new Array(12);
	textureMakeup = new Array(12);
	textureGlasses = new Array(9);
	textureMole = new Array(2);
	textureMouth = new Array(37);
	textureMustache = new Array(6);
	textureNoseline = new Array(18);
	shapeBeard = new Array(4);
	shapeCapNormal = new Array(132);
	shapeCapHat = new Array(132);
	shapeFaceline = new Array(12);
	shapeGlasses = new Array(1);
	shapeMask = new Array(12);
	shapeNoseline = new Array(18);
	shapeNose = new Array(18);
	shapeHairNormal = new Array(132);
	shapeHairHat = new Array(132);
	shapeForeheadNormal = new Array(132);
	shapeForeheadHat = new Array(132);
}

export class FFLiPartData
{
	used = false;
	header;
	footer;
	data;

	fromByteUtils(bUtils, size)
	{
		for (let i = 0; i < 6; i++) {
			if (this.header.elementSize[i] <= 200000000 && this.header.elementSize[i] > 0) {
				bUtils.seek(this.header.elementOffset[i]);
				bUtils.readRaw(this.header.elementSize[i], this.data[i]);
			}
		}
		let a = true;
		for (const i of this.header.elementSize) {
			if (i != 0 && i <= 200000000) {
				a = false;
			}
		}
		if (a) {
			this.setUnused();
			return;
		}
		bUtils.seek(size - 16);
		this.footer.fromByteUtils(bUtils);
	}

	loadHeader(data)
	{
		const bUtils = new FUByteUtils();
		bUtils.data = data;
		this.header.fromByteUtils(bUtils);
		this.used = true;
		return bUtils;
	}

	setUnused()
	{
		this.used = false;
		this.header.setUnused();
	}
}

export class FFLiPartDataHeader
{
	constructor()
	{
		for (let _i0 = 0; _i0 < 6; _i0++) {
			this.transform[_i0] = new Vec3();
		}
	}
	elementOffset = new Int32Array(6);
	elementSize = new Int32Array(6);
	boundingBox = new BoundingBox();
	transform = new Array(6);

	fromByteUtils(bUtils)
	{
		for (let i = 0; i < 6; i++) {
			this.elementOffset[i] = bUtils.readUInt(4);
		}
		for (let i = 0; i < 6; i++) {
			this.elementSize[i] = bUtils.readUInt(4);
		}
		if (this.elementSize[FFLiResourceShapeElementType.INDEX] < 200000) {
			this.elementSize[FFLiResourceShapeElementType.INDEX] *= 2;
		}
		this.boundingBox.fromByteUtils(bUtils);
		for (let i = 0; i < 6; i++) {
			this.transform[i].fromByteUtils(bUtils);
		}
	}

	setUnused()
	{
		this.boundingBox.setNaN();
	}
}

export class FFLiPartDataFooter
{
	mipOffset;
	width;
	height;
	format;
	mipCount;

	fromByteUtils(data)
	{
		this.mipOffset = data.readUInt(4);
		this.width = data.readUInt(2);
		this.height = data.readUInt(2);
		let t = data.readUInt(1);
		if (t < 3) {
			this.format = t;
		}
		this.mipCount = data.readUInt(1);
		data.padding(2);
	}
}

export class FFLiResourcePartsInfo
{
	offset;
	uncompressedSize;
	compressedSize;
	compressionLevel;
	windowBits;
	memoryLevel;
	strategy;
	partData;
	#bReader = new FUByteUtils();

	fromByteUtils(data, objects)
	{
		this.offset = data.readUInt(4);
		this.uncompressedSize = data.readUInt(4);
		console.assert(this.uncompressedSize < 20000000 && this.uncompressedSize % 2 == 0, "Uncompressed Size invalid (should pass UncompressedSize < 20000000 and (UncompressedSize % 2) == 0)");
		this.compressedSize = data.readUInt(4);
		console.assert(this.compressedSize <= 20000000, "Compressed Size too large (should be <= 20000000)");
		this.compressionLevel = data.readUInt(1);
		console.assert(this.uncompressedSize == 0 || this.compressionLevel < 11, "Compression Level invalid (should pass UncompressedSize == 0 or CompressionLevel < 11)");
		this.windowBits = data.readUInt(1);
		this.memoryLevel = data.readUInt(1);
		console.assert(this.uncompressedSize == 0 || this.memoryLevel < 9, "Memory Level invalid (should pass UncompressedSize == 0 or MemoryLevel < 9)");
		this.strategy = data.readUInt(1);
		console.assert(this.strategy <= 6, "Strategy too large (should be <= 6)");
	}

	loadHeader(data, dataBuffer, compressedBuffer)
	{
		if (this.uncompressedSize == 0) {
			this.partData.setUnused();
			return;
		}
		let oOffset = data.offset;
		data.seek(this.offset);
		if (this.strategy == 5) {
			data.readRaw(this.compressedSize, dataBuffer);
			this.#bReader = this.partData.loadHeader(dataBuffer);
			data.seek(oOffset);
			return;
		}
		data.readRaw(this.compressedSize, compressedBuffer);
		ZlibImpl.decompress(compressedBuffer, dataBuffer, WindowBitConverter.fFLiResourceWindowBitsToZlibWindowBits(this.windowBits), this.uncompressedSize);
		this.#bReader = this.partData.loadHeader(dataBuffer);
		data.seek(oOffset);
	}

	loadPart()
	{
		if (this.partData.used) {
			this.partData.fromByteUtils(this.#bReader, this.uncompressedSize);
		}
	}
}

export class FFLiResourceHeader
{
	uncompressedBufferSize;
	expandedBufferSize;
	isExpand;

	fromByteUtils(data, objects)
	{
		console.assert(data.readUTF8(4) == "FFRA", "Magic Header invalid (should be FFRA)");
		console.assert(data.readUInt(4) == 458752, "Version invalid (should be 0x00070000)");
		this.uncompressedBufferSize = data.readUInt(4);
		console.assert(this.uncompressedBufferSize >= 1024, "Uncompressed Buffer Size too small (should be >=1024)");
		this.expandedBufferSize = data.readUInt(4);
		console.assert(this.expandedBufferSize >= 1, "Expanded Buffer Size too small (should be >=1)");
		this.isExpand = data.readUInt(4) == 1;
	}
}

export class FFLiResourceTextureHeader
{
	textureMaxSize = new Int32Array(11);

	fromByteUtils(data, objects)
	{
		for (let i = 0; i < 11; i++) {
			this.textureMaxSize[i] = data.readUInt(4);
			console.assert(this.textureMaxSize[i] < 20000000 && this.textureMaxSize[i] % 4 == 0, "Texture Max Size invalid (should pass TextureMaxSize < 20000000 and (TextureMaxSize % 4) == 0)");
		}
		for (let i = 0; i < 3; i++) {
			objects.textureBeard[i].fromByteUtils(data, objects);
		}
		for (let i = 0; i < 132; i++) {
			objects.textureCap[i].fromByteUtils(data, objects);
		}
		for (let i = 0; i < 62; i++) {
			objects.textureEye[i].fromByteUtils(data, objects);
		}
		for (let i = 0; i < 24; i++) {
			objects.textureEyebrow[i].fromByteUtils(data, objects);
		}
		for (let i = 0; i < 12; i++) {
			objects.textureWrinkle[i].fromByteUtils(data, objects);
		}
		for (let i = 0; i < 12; i++) {
			objects.textureMakeup[i].fromByteUtils(data, objects);
		}
		for (let i = 0; i < 9; i++) {
			objects.textureGlasses[i].fromByteUtils(data, objects);
		}
		for (let i = 0; i < 2; i++) {
			objects.textureMole[i].fromByteUtils(data, objects);
		}
		for (let i = 0; i < 37; i++) {
			objects.textureMouth[i].fromByteUtils(data, objects);
		}
		for (let i = 0; i < 6; i++) {
			objects.textureMustache[i].fromByteUtils(data, objects);
		}
		for (let i = 0; i < 18; i++) {
			objects.textureNoseline[i].fromByteUtils(data, objects);
		}
	}
}

export class FFLiResourceShapeHeader
{
	shapeMaxSize = new Int32Array(12);

	fromByteUtils(data, objects)
	{
		for (let i = 0; i < 12; i++) {
			this.shapeMaxSize[i] = data.readUInt(4);
			console.assert(this.shapeMaxSize[i] < 20000000 && this.shapeMaxSize[i] % 2 == 0, "Shape Max Size invalid (should pass ShapeMaxSize < 20000000 and (ShapeMaxSize % 2) == 0)");
		}
		for (let i = 0; i < 4; i++) {
			objects.shapeBeard[i].fromByteUtils(data, objects);
		}
		for (let i = 0; i < 132; i++) {
			objects.shapeCapNormal[i].fromByteUtils(data, objects);
		}
		for (let i = 0; i < 132; i++) {
			objects.shapeCapHat[i].fromByteUtils(data, objects);
		}
		for (let i = 0; i < 12; i++) {
			objects.shapeFaceline[i].fromByteUtils(data, objects);
		}
		for (let i = 0; i < 1; i++) {
			objects.shapeGlasses[i].fromByteUtils(data, objects);
		}
		for (let i = 0; i < 12; i++) {
			objects.shapeMask[i].fromByteUtils(data, objects);
		}
		for (let i = 0; i < 18; i++) {
			objects.shapeNoseline[i].fromByteUtils(data, objects);
		}
		for (let i = 0; i < 18; i++) {
			objects.shapeNose[i].fromByteUtils(data, objects);
		}
		for (let i = 0; i < 132; i++) {
			objects.shapeHairNormal[i].fromByteUtils(data, objects);
		}
		for (let i = 0; i < 132; i++) {
			objects.shapeHairHat[i].fromByteUtils(data, objects);
		}
		for (let i = 0; i < 132; i++) {
			objects.shapeForeheadNormal[i].fromByteUtils(data, objects);
		}
		for (let i = 0; i < 132; i++) {
			objects.shapeForeheadHat[i].fromByteUtils(data, objects);
		}
	}
}

export class FFLResource
{
	isLoaded = false;
	isAFL23;
	isAFL;

	fromByteUtils(data, objects)
	{
		objects.resourceHeader.fromByteUtils(data, objects);
		this.isAFL23 = objects.resourceHeader.expandedBufferSize == 38809056;
		this.isAFL = this.isAFL23 || objects.resourceHeader.expandedBufferSize == 37344736;
		objects.textureHeader.fromByteUtils(data, objects);
		objects.shapeHeader.fromByteUtils(data, objects);
	}
}
