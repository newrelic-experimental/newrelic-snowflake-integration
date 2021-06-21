// function obfuscateStringWithKey(textToObfuscate, encodingKey) {

// 	let encodingKeyBytes = Buffer.from(encodingKey);
// 	let encodingKeyLen = encodingKeyBytes.length;

// 	let textToObfuscateBytes = Buffer.from(textToObfuscate);
// 	let textToObfuscateLen = textToObfuscate.length;

// 	if (encodingKeyLen == 0 || textToObfuscateLen == 0) {
// 		return ""
// 	}

// 	let obfuscatedTextBytes = [];

// 	for (let i = 0; i < textToObfuscateLen; i++) {
// 		obfuscatedTextBytes[i] = textToObfuscateBytes[i] ^ encodingKeyBytes[i%encodingKeyLen]
// 	}

// 	let obfuscatedText = Buffer.from(obfuscatedTextBytes).toString('base64');

// 	return obfuscatedText
// }

const deobfuscate = function(textToDeobfuscate, encodingKey) {
	// decode from base64

	// perform bitwise XOR on the bytes using the encodingKey

	// return the value

	let decodedText = Buffer.from(textToDeobfuscate, 'base64').toString()

	let encodingKeyBytes = Buffer.from(encodingKey);
	let encodingKeyLen = encodingKeyBytes.length;

	let textToDeobfuscateBytes = Buffer.from(decodedText);
	let textToDeobfuscateLen = decodedText.length;

	if (encodingKeyLen == 0 || textToDeobfuscateLen == 0) {
		return ""
	}

	let deobfuscatedTextBytes = [];

	for (let i = 0; i < textToDeobfuscateLen; i++) {
		deobfuscatedTextBytes[i] = textToDeobfuscateBytes[i] ^ encodingKeyBytes[i%encodingKeyLen]
	}

	return Buffer.from(deobfuscatedTextBytes).toString();
}

module.exports = deobfuscate;