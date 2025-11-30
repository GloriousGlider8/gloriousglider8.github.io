// Generated automatically with "fut". Do not edit.

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
		
            // Not ideal: place into new ArrayBuffer.
            const arr = new Uint32Array([bits]);
            // Get DataView and read back as float.
            return new DataView(arr.buffer)
                .getFloat32(0, true);
        return 0.0;
	}

	static floatToInt(v)
	{
		
            const arr = new Float32Array([v]);
            return new DataView(arr.buffer).getUint32(0, true);
        return 0;
	}
}

/**
 * Convenience class to read values from bitfields
 */
export class BitfieldReader
{
	value;
	#offset;

	/**
	 * Move the bit pointer to <code>where</code> bits
	 */
	seek(where)
	{
		this.#offset = where;
	}

	/**
	 * Move the bit pointer ahead by <code>size</code> bit
	 * This is prefered in place of <code>Seek</code>
	 */
	padding(size)
	{
		this.#offset += size;
	}

	/**
	 * Reads 1 bit and returns it as a <code>bool</code>
	 */
	readBool()
	{
		return (this.value & 1 << this.#offset++) != 0;
	}

	/**
	 * Reads <code>size</code> bits into a <code>byte</code>
	 */
	readBits(size)
	{
		let result = 0;
		for (let i = 0; i < size; i++) {
			let bit = this.value >> this.#offset++ & 1;
			result |= bit << i;
		}
		return result;
	}
}

/**
 * Convenience class to read values from bytes.
 * All methods assume big-endian byte order.
 */
export class ByteReader
{
	data;
	offset = 0;

	/**
	 * Move the file pointer to <code>where</code> bytes.
	 */
	seek(where)
	{
		this.offset = where;
	}

	/**
	 * Move the file pointer ahead by <code>size</code> bytes.
	 * This is prefered in place of <code>Seek</code>.
	 */
	padding(size)
	{
		this.offset += size;
	}

	/**
	 * Reads 1 byte into a <code>byte</code>.
	 * Range: <code>0 .. 255</code>.
	 */
	readByte()
	{
		return this.data[this.offset++];
	}

	/**
	 * Reads <code>size</code> bytes and stores them in a <code>ushort</code>.
	 * Range: <code>0 .. 65535</code>.
	 */
	readUShort(size)
	{
		let res = 0;
		for (let i = 0; i < size; i++) {
			res = res << 8 | this.data[this.offset++];
		}
		return res;
	}

	/**
	 * Reads <code>size</code> bytes and stores them in a <code>uint</code>.
	 * Range: <code>0 .. 2147483647</code>.
	 */
	readUInt(size)
	{
		let res = 0;
		for (let i = 0; i < size; i++) {
			res = res << 8 | this.data[this.offset++];
		}
		return res;
	}

	/**
	 * Reads <code>size</code> bytes and stores them in a <code>short</code>.
	 * Range: <code>-32768 .. 32767</code>.
	 */
	readSShort(size)
	{
		let res = 0;
		for (let i = 0; i < size; i++) {
			res = res << 8 | this.data[this.offset++];
		}
		let sign_bit = 1 << (size * 8 - 1);
		if ((res & sign_bit) != 0) {
			res -= 1 << size * 8;
		}
		return res;
	}

	/**
	 * Reads <code>size</code> bytes and stores them in an <code>int</code>.
	 * Range: <code>-2147483648 .. 2147483647</code>.
	 */
	readSInt(size)
	{
		let res = 0;
		for (let i = 0; i < size; i++) {
			res = res << 8 | this.data[this.offset++];
		}
		let sign_bit = 1 << (size * 8 - 1);
		if ((res & sign_bit) != 0) {
			res -= 1 << size * 8;
		}
		return res;
	}

	/**
	 * Reads <code>size</code> bytes and stores them in a <code>long</code>.
	 * Range <code>-9223372036854775808 .. 9223372036854775807</code>.
	 */
	readSLong(size)
	{
		let res = 0n;
		for (let i = 0; i < size; i++) {
			res = res << 8n | BigInt(this.data[this.offset++]);
		}
		let sign_bit = 1 << (size * 8 - 1);
		if ((res & BigInt(sign_bit)) != 0) {
			res -= BigInt(1 << size * 8);
		}
		return res;
	}

	/**
	 * Reads 1 byte into a <code>BitfieldReader</code>.
	 * This serves as a convenience method and still advances the pointer.
	 */
	getBitfield()
	{
		const b = new BitfieldReader();
		b.value = this.data[this.offset++];
		return b;
	}

	/**
	 * Reads 4 bytes and stores them in a <code>float</code>.
	 * Uses the IEEE 754 format.
	 */
	readFloat()
	{
		let raw = this.readUInt(4);
		return BitConverter.uIntToFloat(raw);
	}

	/**
	 * Reads <code>size</code> bytes and interprets them as a UTF8 string.
	 */
	readUTF8(size)
	{
		this.offset += size;
		return new TextDecoder().decode(this.data.subarray(this.offset - size, this.offset - size + size));
	}

	/**
	 * Reads <code>size</code> bytes and stores them in <code>buffer</code>.
	 */
	readRaw(size, buffer)
	{
		buffer.set(this.data.subarray(this.offset, this.offset + size));
		this.offset += size;
	}
}

/**
 * ZLib compression implementation.
 * Must be overrided using a library for your target language!
 */
export class ZlibImpl
{

	/**
	 * Write the decompressed contents of <code>input</code> into <code>output</code>.
	 * <code>windowBits</code> and <code>originalSize</code> must also be specified.
	 */
	decompress(input, output, windowBits, compressedSize, originalSize)
	{
	}

	/**
	 * Write the Compressed contents of <code>input</code> into <code>output</code>.
	 * <code>level</code> and <code>windowBits</code> must also be specified.
	 */
	compress(input, output, level, windowBits)
	{
	}
}

export const FFLiTextureFormat = {
	GREYSCALE : 0,
	GREYSCALE_ALPHA : 1,
	R_G_B_A : 2
}

/**
 * The index that each shape element is stored at.
 * Exmaple: <code>data[FFLiResourceShapeElementType.Position.ToInt()]</code> would get vertex position data.
 */
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

	/**
	 * Reads 3 IEEE 754 4-byte floats into <code>x</code>, <code>y</code> and <code>z</code> respectively.
	 */
	fromByteReader(data)
	{
		this.x = data.readFloat();
		this.y = data.readFloat();
		this.z = data.readFloat();
	}

	/**
	 * Convenience function to set <code>x</code>, <code>y</code> and <code>z</code> to <code>Math.NaN</code>.
	 */
	setNaN()
	{
		this.x = NaN;
		this.y = NaN;
		this.z = NaN;
	}
}

/**
 * Represents the minimum and maximum values of vertex positions in shapes.
 */
export class BoundingBox
{
	min = new Vec3();
	max = new Vec3();

	/**
	 * Reads 2 <code>Vec3</code>s into <code>min</code> and <code>max</code> respectively.
	 */
	fromByteReader(data)
	{
		this.min.fromByteReader(data);
		this.max.fromByteReader(data);
	}

	/**
	 * Convenience function to set the <code>x</code>, <code>y</code> and <code>z</code> values of <code>min</code> and <code>max</code> to <code>Math.NaN</code>.
	 */
	setNaN()
	{
		this.min.setNaN();
		this.max.setNaN();
	}
}

/**
 * Convenience class containing 1 function to convert <code>FFLiResourcePartsInfo.WindowBits</code> to ZLib <code>windowBits</code>.
 */
export class WindowBitConverter
{

	/**
	 * Converts <code>FFLiResourcePartsInfo.WindowBits</code> to ZLib <code>windowBits</code>.
	 */
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

/**
 * Passed to <code>FFLResource.FromByteReader</code> to provide more options for memory-management.
 */
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
	textureGlass = new Array(9);
	textureMole = new Array(2);
	textureMouth = new Array(37);
	textureMustache = new Array(6);
	textureNoseline = new Array(18);
	shapeBeard = new Array(4);
	shapeCapNormal = new Array(132);
	shapeCapHat = new Array(132);
	shapeFaceline = new Array(12);
	shapeGlass = new Array(1);
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

	fromByteReader(bUtils, size)
	{
		for (let i = 0; i < 6; i++) {
			if (this.header.elementSize[i] <= 20000000 && this.header.elementSize[i] > 0) {
				bUtils.seek(this.header.elementOffset[i]);
				bUtils.readRaw(this.header.elementSize[i], this.data[i]);
			}
		}
		let a = true;
		for (const i of this.header.elementSize) {
			if (i <= 20000000 && i > 0) {
				a = false;
			}
		}
		if (a) {
			this.setUnused();
			return;
		}
		bUtils.seek(size - 16);
		this.footer.fromByteReader(bUtils);
	}

	loadHeader(data)
	{
		const bUtils = new ByteReader();
		bUtils.data = data;
		this.header.fromByteReader(bUtils);
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

	fromByteReader(bUtils)
	{
		for (let i = 0; i < 6; i++) {
			this.elementOffset[i] = bUtils.readSInt(4);
		}
		for (let i = 0; i < 6; i++) {
			this.elementSize[i] = bUtils.readSInt(4);
		}
		if (this.elementSize[FFLiResourceShapeElementType.INDEX] < 20000000) {
			this.elementSize[FFLiResourceShapeElementType.INDEX] *= 2;
		}
		this.boundingBox.fromByteReader(bUtils);
		for (let i = 0; i < 6; i++) {
			this.transform[i].fromByteReader(bUtils);
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

	fromByteReader(data)
	{
		this.mipOffset = data.readUInt(4);
		this.width = data.readUShort(2);
		this.height = data.readUShort(2);
		let t = data.readByte();
		if (t < 3) {
			this.format = t;
		}
		this.mipCount = data.readByte();
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
	#bReader;

	fromByteReader(data, objects)
	{
		this.offset = data.readUInt(4);
		this.uncompressedSize = data.readUInt(4);
		console.assert(this.uncompressedSize < 20000000 && this.uncompressedSize % 2 == 0, "Uncompressed Size invalid (should pass UncompressedSize < 20000000 and (UncompressedSize % 2) == 0)");
		this.compressedSize = data.readUInt(4);
		console.assert(this.compressedSize <= 20000000, "Compressed Size too large (should be <= 20000000)");
		this.compressionLevel = data.readByte();
		console.assert(this.uncompressedSize == 0 || this.compressionLevel < 11, "Compression Level invalid (should pass UncompressedSize == 0 or CompressionLevel < 11)");
		this.windowBits = data.readByte();
		this.memoryLevel = data.readByte();
		console.assert(this.uncompressedSize == 0 || this.memoryLevel < 9, "Memory Level invalid (should pass UncompressedSize == 0 or MemoryLevel < 9)");
		this.strategy = data.readByte();
		console.assert(this.strategy <= 6, "Strategy too large (should be <= 6)");
	}

	loadHeader(data, dataBuffer, compressedBuffer, compressionImplementation)
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
		compressionImplementation.decompress(compressedBuffer, dataBuffer, WindowBitConverter.fFLiResourceWindowBitsToZlibWindowBits(this.windowBits), this.compressedSize, this.uncompressedSize);
		this.#bReader = this.partData.loadHeader(dataBuffer);
		data.seek(oOffset);
	}

	loadPart()
	{
		if (this.partData.used) {
			this.partData.fromByteReader(this.#bReader, this.uncompressedSize);
		}
	}
}

export class FFLiResourceHeader
{
	uncompressedBufferSize;
	expandedBufferSize;
	isExpand;

	fromByteReader(data, objects)
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

	fromByteReader(data, objects)
	{
		for (let i = 0; i < 11; i++) {
			this.textureMaxSize[i] = data.readUInt(4);
			console.assert(this.textureMaxSize[i] < 20000000 && this.textureMaxSize[i] % 4 == 0, "Texture Max Size invalid (should pass TextureMaxSize < 20000000 and (TextureMaxSize % 4) == 0)");
		}
		for (let i = 0; i < 3; i++) {
			objects.textureBeard[i].fromByteReader(data, objects);
		}
		for (let i = 0; i < 132; i++) {
			objects.textureCap[i].fromByteReader(data, objects);
		}
		for (let i = 0; i < 62; i++) {
			objects.textureEye[i].fromByteReader(data, objects);
		}
		for (let i = 0; i < 24; i++) {
			objects.textureEyebrow[i].fromByteReader(data, objects);
		}
		for (let i = 0; i < 12; i++) {
			objects.textureWrinkle[i].fromByteReader(data, objects);
		}
		for (let i = 0; i < 12; i++) {
			objects.textureMakeup[i].fromByteReader(data, objects);
		}
		for (let i = 0; i < 9; i++) {
			objects.textureGlass[i].fromByteReader(data, objects);
		}
		for (let i = 0; i < 2; i++) {
			objects.textureMole[i].fromByteReader(data, objects);
		}
		for (let i = 0; i < 37; i++) {
			objects.textureMouth[i].fromByteReader(data, objects);
		}
		for (let i = 0; i < 6; i++) {
			objects.textureMustache[i].fromByteReader(data, objects);
		}
		for (let i = 0; i < 18; i++) {
			objects.textureNoseline[i].fromByteReader(data, objects);
		}
	}
}

export class FFLiResourceShapeHeader
{
	shapeMaxSize = new Int32Array(12);

	fromByteReader(data, objects)
	{
		for (let i = 0; i < 12; i++) {
			this.shapeMaxSize[i] = data.readUInt(4);
			console.assert(this.shapeMaxSize[i] < 20000000 && this.shapeMaxSize[i] % 2 == 0, "Shape Max Size invalid (should pass ShapeMaxSize < 20000000 and (ShapeMaxSize % 2) == 0)");
		}
		for (let i = 0; i < 4; i++) {
			objects.shapeBeard[i].fromByteReader(data, objects);
		}
		for (let i = 0; i < 132; i++) {
			objects.shapeCapNormal[i].fromByteReader(data, objects);
		}
		for (let i = 0; i < 132; i++) {
			objects.shapeCapHat[i].fromByteReader(data, objects);
		}
		for (let i = 0; i < 12; i++) {
			objects.shapeFaceline[i].fromByteReader(data, objects);
		}
		for (let i = 0; i < 1; i++) {
			objects.shapeGlass[i].fromByteReader(data, objects);
		}
		for (let i = 0; i < 12; i++) {
			objects.shapeMask[i].fromByteReader(data, objects);
		}
		for (let i = 0; i < 18; i++) {
			objects.shapeNoseline[i].fromByteReader(data, objects);
		}
		for (let i = 0; i < 18; i++) {
			objects.shapeNose[i].fromByteReader(data, objects);
		}
		for (let i = 0; i < 132; i++) {
			objects.shapeHairNormal[i].fromByteReader(data, objects);
		}
		for (let i = 0; i < 132; i++) {
			objects.shapeHairHat[i].fromByteReader(data, objects);
		}
		for (let i = 0; i < 132; i++) {
			objects.shapeForeheadNormal[i].fromByteReader(data, objects);
		}
		for (let i = 0; i < 132; i++) {
			objects.shapeForeheadHat[i].fromByteReader(data, objects);
		}
	}
}

/**
 * ## FFLResource
 * <code>FFLResource</code> is used for the loading of FFL / AFL Resource files.
 * ### Loading a Resource
 * Use <code>FFLResource.FromByteReader</code> to load a resource from a <code>ByteReader</code>, storing objects in a <code>FFLiResourceLoaderObjects</code> object.
 */
export class FFLResource
{
	/**
	 * Contains <code>true</code> if the resource has been loaded successfully.
	 */
	isLoaded = false;
	/**
	 * Contains <code>true</code> if the resource has been detected as <code>AFLResHigh_2_3.dat</code>.
	 * (<code>objects.ResourceHeader.ExpandedBufferSize == 0x2502DE0</code>)
	 */
	isAFL23 = false;
	/**
	 * Contains <code>true</code> if the resource has been detected as an <code>AFLRes*.dat</code> file.
	 * (<code>IsAFL23 || objects.ResourceHeader.ExpandedBufferSize == 0x239D5E0</code>)
	 */
	isAFL = false;

	/**
	 * Loads a resource from a <code>ByteReader</code>, storing objects in a <code>FFLiResourceLoaderObjects</code> object.
	 */
	fromByteReader(data, objects)
	{
		objects.resourceHeader.fromByteReader(data, objects);
		this.isAFL23 = objects.resourceHeader.expandedBufferSize == 38809056;
		this.isAFL = this.isAFL23 || objects.resourceHeader.expandedBufferSize == 37344736;
		objects.textureHeader.fromByteReader(data, objects);
		objects.shapeHeader.fromByteReader(data, objects);
		this.isLoaded = true;
	}
}
