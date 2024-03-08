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