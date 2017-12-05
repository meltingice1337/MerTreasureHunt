const crypto = require('./crypto');
const converters = require('../utils/converters');
const constants = require('../utils/constants');

let utility = {
    getNetworkIdByte : function () {
        return constants.NETWORK_CODE.charCodeAt(0) & 0xFF;
    },

    // long to big-endian bytes
    longToByteArray : function (value) {
        var bytes = new Array(7);
        for (var k = 7; k >= 0; k--) {
            bytes[k] = value & (255);
            value = value / 256;
        }

        return bytes;
    },

    // short to big-endian bytes
    shortToByteArray : function (value) {
        return converters.int16ToBytes(value, true);
    },

    base58StringToByteArray : function (base58String) {
        var decoded = crypto.base58.decode(base58String);
        var result = [];
        for (var i = 0; i < decoded.length; ++i) {
            result.push(decoded[i] & 0xff);
        }

        return result;
    },

    stringToByteArrayWithSize : function (string) {
        var bytes = converters.stringToByteArray(string);
        return utility.byteArrayWithSize(bytes);
    },

    byteArrayWithSize : function (byteArray) {
        var result = utility.shortToByteArray(byteArray.length);
        return result.concat(byteArray);
    },

    booleanToBytes : function (flag) {
        return flag ? [1] : [0];
    },

    endsWithWhitespace : function (value) {
        return /\s+$/g.test(value);
    },

    getTime : function () {
        return Date.now();
    },

    isValidBase58String : function (input) {
        return BASE58_REGEX.test(input);
    },

    // Add a prefix in case of alias
    resolveAddressOrAlias : function (string) {
        if (string.length <= 30) {
            return 'alias:' + constants.NETWORK_CODE + ':' + string;
        } else {
            return string;
        }
    },
}

module.exports = utility;