const CryptoJS = require('crypto-js');
const crypto = require('crypto');
const eccrypto = require('eccrypto');

function hashSHA512(message, saltParam = 0) {
    const salt = saltParam === 0 ? Math.random().toFixed(3).toString() : saltParam;
    const hash = CryptoJS.SHA512(message + salt);
    return {
        salt,
        hashString: hash.toString(CryptoJS.enc.Base64)
    }
}

function encryptAES(message, key) {
    return CryptoJS.AES.encrypt(message, key).toString();
}

function decryptAES(cipherText, key) {
    const bytes = CryptoJS.AES.decrypt(cipherText, key);
    return bytes.toString(CryptoJS.enc.Utf8);
}

function encryptRSA(message) {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    return {
        cipherText: crypto.publicEncrypt({
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256'
        },
        Buffer.from(message)), privateKey };
}

function decryptRSA(cipherText, privateKey) {
    return crypto.privateDecrypt({
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
    }, Buffer.from(cipherText, 'base64'));
}

async function encryptECIES(message) {
    const privateKey = eccrypto.generatePrivate();
    const publicKey = eccrypto.getPublic(privateKey);
    try {
        return {
            cipherText: await eccrypto.encrypt(publicKey, Buffer.from(message)),
            privateKey
        };    
    } catch (error) {
        throw error;
    }
}

async function decryptECIES(encryptInfo, privateKey) {
    try {
        return await eccrypto.decrypt(Buffer.from(privateKey, 'base64'), {
            ciphertext: Buffer.from(encryptInfo.cipherText, 'base64'),
            iv: Buffer.from(encryptInfo.iv, 'base64'),
            mac: Buffer.from(encryptInfo.mac, 'base64'),
            ephemPublicKey: Buffer.from(encryptInfo.ephemPublicKey, 'base64'),
        });
    } catch (error) {
        throw error;
    }
}

function generateSignature(message) {
    const hash = CryptoJS.SHA256(message).toString(CryptoJS.enc.Base64);
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    const cipherText = crypto.privateEncrypt({
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
        oaepHash: 'sha256'
    }, Buffer.from(hash));
    return {
        signature: cipherText.toString('base64'), publicKey };
}

function validateSignature(message, signature, publicKey) {
    const hashedMessage = CryptoJS.SHA256(message).toString(CryptoJS.enc.Base64);
    const hashedSign = crypto.publicDecrypt({
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
        oaepHash: 'sha256'
    }, Buffer.from(signature, 'base64'));
    return {
        hashedMessage,
        hashedSign: hashedSign.toString(),
        valid: hashedMessage === hashedSign.toString() ? true : false
    };
}

module.exports = {
    hashSHA512,
    encryptAES,
    decryptAES,
    encryptRSA,
    decryptRSA,
    encryptECIES,
    decryptECIES,
    generateSignature,
    validateSignature
}