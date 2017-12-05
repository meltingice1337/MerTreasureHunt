const constants = require('../utils/constants');
const converters = require('../utils/converters');
const blake2b = require('blakejs').blake2b;
const keccak_256 = require('js-sha3').keccak256;
const CryptoJS = require('crypto-js');
const Base58 = require('bs58');
const axlsign = require('axlsign');

var waves = {};

// private version of getNetworkId byte in order to avoid circular dependency
// between cryptoService and utilityService
var getNetworkIdByte = function () {
    return constants.NETWORK_CODE.charCodeAt(0) & 0xFF;
};

var appendUint8Arrays = function (array1, array2) {
    var tmp = new Uint8Array(array1.length + array2.length);
    tmp.set(array1, 0);
    tmp.set(array2, array1.length);
    return tmp;
};

var appendNonce = function (originalSeed) {
    // change this is when nonce increment gets introduced
    var nonce = new Uint8Array(converters.int32ToBytes(constants.INITIAL_NONCE, true));

    return appendUint8Arrays(nonce, originalSeed);
};

// sha256 accepts messageBytes as Uint8Array or Array
var sha256 = function (message) {
    var bytes;
    if (typeof (message) == 'string')
        bytes = converters.stringToByteArray(message);
    else
        bytes = message;

    var wordArray = converters.byteArrayToWordArrayEx(new Uint8Array(bytes));
    var resultWordArray = CryptoJS.SHA256(wordArray);

    return converters.wordArrayToByteArrayEx(resultWordArray);
};

var prepareKey = function (key) {
    var rounds = 1000;
    var digest = key;
    for (var i = 0; i < rounds; i++) {
        digest = converters.byteArrayToHexString(sha256(digest));
    }

    return digest;
};



// blake2b 256 hash function
waves.blake2b = function (input) {
    return blake2b(input, null, 32);
};

// keccak 256 hash algorithm
waves.keccak = function (messageBytes) {
    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
    return keccak_256.array(messageBytes);
    // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
};

waves.sha256 = sha256;

waves.hashChain = function (noncedSecretPhraseBytes) {
    return waves.keccak(waves.blake2b(new Uint8Array(noncedSecretPhraseBytes)));
};

// Base68 encoding/decoding implementation
waves.base58 = {
    encode: function (buffer) {
        return Base58.encode(buffer);
    },
    decode: function (string) {
        return Base58.decode(string);
    }
};

waves.buildAccountSeedHash = function (seedBytes) {
    var data = appendNonce(seedBytes);
    var seedHash = waves.hashChain(data);

    return sha256(Array.prototype.slice.call(seedHash));
};

waves.buildKeyPair = function (seedBytes) {
    var accountSeedHash = waves.buildAccountSeedHash(seedBytes);
    var p = axlsign.generateKeyPair(accountSeedHash);

    return {
        public: waves.base58.encode(p.public),
        private: waves.base58.encode(p.private)
    };
};

waves.buildPublicKey = function (seedBytes) {
    return waves.buildKeyPair(seedBytes).public;
};

waves.buildPrivateKey = function (seedBytes) {
    return waves.buildKeyPair(seedBytes).private;
};

waves.buildRawAddress = function (encodedPublicKey) {
    var publicKey = waves.base58.decode(encodedPublicKey);
    var publicKeyHash = waves.hashChain(publicKey);

    var prefix = new Uint8Array(2);
    prefix[0] = constants.ADDRESS_VERSION;
    prefix[1] = getNetworkIdByte();

    var unhashedAddress = appendUint8Arrays(prefix, publicKeyHash.slice(0, 20));
    var addressHash = waves.hashChain(unhashedAddress).slice(0, 4);

    return waves.base58.encode(appendUint8Arrays(unhashedAddress, addressHash));
};

waves.buildRawAddressFromSeed = function (secretPhrase) {
    var publicKey = waves.getPublicKey(secretPhrase);

    return waves.buildRawAddress(publicKey);
};

//Returns publicKey built from string
waves.getPublicKey = function (secretPhrase) {
    return waves.buildPublicKey(converters.stringToByteArray(secretPhrase));
};

//Returns privateKey built from string
waves.getPrivateKey = function (secretPhrase) {
    return waves.buildPrivateKey(converters.stringToByteArray(secretPhrase));
};

//Returns key pair built from string
waves.getKeyPair = function (secretPhrase) {
    return waves.buildKeyPair(converters.stringToByteArray(secretPhrase));
};

// function accepts buffer with private key and an array with dataToSign
// returns buffer with signed data
// 64 randoms bytes are added to the signature
// method falls back to deterministic signatures if crypto object is not supported
waves.nonDeterministicSign = function (privateKey, dataToSign) {
    var crypto = window.crypto || window.msCrypto;
    var random;
    if (crypto) {
        random = new Uint8Array(64);
        crypto.getRandomValues(random);
    }

    var signature = axlsign.sign(privateKey, new Uint8Array(dataToSign), random);

    return waves.base58.encode(signature);
};

// function accepts buffer with private key and an array with dataToSign
// returns buffer with signed data
waves.deterministicSign = function (privateKey, dataToSign) {
    var signature = axlsign.sign(privateKey, new Uint8Array(dataToSign));

    return waves.base58.encode(signature);
};

waves.verify = function (senderPublicKey, dataToSign, signatureBytes) {
    return axlsign.verify(senderPublicKey, dataToSign, signatureBytes);
};

waves.encryptWalletSeed = function (seed, key) {
    var aesKey = prepareKey(key);

    return CryptoJS.AES.encrypt(seed, aesKey);
};

waves.decryptWalletSeed = function (cipher, key, checksum) {
    var aesKey = prepareKey(key);
    var data = CryptoJS.AES.decrypt(cipher, aesKey);

    var actualChecksum = waves.seedChecksum(converters.hexStringToByteArray(data.toString()));
    if (actualChecksum === checksum)
        return converters.hexStringToString(data.toString());
    else
        return false;
};

waves.seedChecksum = function (seed) {
    return converters.byteArrayToHexString(sha256(seed));
};

module.exports = waves;
