"use strict";

const crypto = require('crypto');

class PaytmChecksum {

	static encrypt(input, key) {
		const cipher = crypto.createCipheriv('AES-128-CBC', key, '@@@@&&&&####$$$$');
		let encrypted = cipher.update(input, 'binary', 'base64');
		encrypted += cipher.final('base64');
		return encrypted;
	}

	static decrypt(encrypted, key) {
		const decipher = crypto.createDecipheriv('AES-128-CBC', key, '@@@@&&&&####$$$$');
		let decrypted = decipher.update(encrypted, 'base64', 'binary');
		decrypted += decipher.final('binary');
		return decrypted;
	}

	static generateSignature(params, key) {
		if (typeof params !== "string") {
			params = PaytmChecksum.getStringByParams(params);
		}
		return PaytmChecksum.generateSignatureByString(params, key);
	}

	static verifySignature(params, key, checksum) {
		if (typeof params !== "string") {
			params = PaytmChecksum.getStringByParams(params);
		}
		return PaytmChecksum.verifySignatureByString(params, key, checksum);
	}

	static async generateSignatureByString(params, key) {
		const salt = PaytmChecksum.generateRandomString(4);
		return PaytmChecksum.calculateChecksum(params, key, salt);
	}

	static verifySignatureByString(params, key, checksum) {
		const paytmHash = PaytmChecksum.calculateHash(params, key, checksum.substr(checksum.length - 4));
		return paytmHash === checksum;
	}

	static generateRandomString(length) {
		return crypto.randomBytes(Math.ceil(length * 3/4))
			.toString('base64')   
			.slice(0,length)      
			.replace(/\+/g,'0')  
			.replace(/\//g,'0'); 
	}

	static getStringByParams(params) {
		const data = {};
		Object.keys(params).sort().forEach((key) => {
			data[key] = params[key] !== null && params[key].toLowerCase() !== "null" ? params[key] : "";
		});
		return Object.values(data).join('|');
	}

	static calculateHash(params, key, salt) {
		const finalString = params + '|' + salt;
		return crypto.createHmac('sha256', key).update(finalString).digest('hex') + salt;
	}

	static calculateChecksum(params, key, salt) {
		const hashString = PaytmChecksum.calculateHash(params, key, salt);
		return PaytmChecksum.encrypt(hashString, key);
	}
}

module.exports = PaytmChecksum;
