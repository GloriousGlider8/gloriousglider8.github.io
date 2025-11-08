import { zlibSync, unzlibSync } from "/jslib/fflate.js";

export class ZlibImpl {
	static decompress(input, output, windowBits, originalSize) {
		unzlibSync(input, {windowBits: windowBits, out: output});
	}

	static compress(input, output, level, windowBits) {
		zlibSync(input, { level: level, windowBits: windowBits, out: output });
	}
}