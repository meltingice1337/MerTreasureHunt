const utility = require('./utlility');
const crypto = require('./crypto');

const txConstants = {
    PAYMENT_TRANSACTION_TYPE: 2,
    ASSET_ISSUE_TRANSACTION_TYPE: 3,
    ASSET_TRANSFER_TRANSACTION_TYPE: 4,
    ASSET_REISSUE_TRANSACTION_TYPE: 5,
    EXCHANGE_TRANSACTION_TYPE: 7,
    START_LEASING_TRANSACTION_TYPE: 8,
    CANCEL_LEASING_TRANSACTION_TYPE: 9,
    CREATE_ALIAS_TRANSACTION_TYPE: 10,
    MAKE_ASSET_NAME_UNIQUE_TRANSACTION_TYPE: 11
};


let SignService = {
    // Transaction types

    getAssetIssueTxTypeBytes: function () {
        return [txConstants.ASSET_ISSUE_TRANSACTION_TYPE];
    },

    getAssetReissueTxTypeBytes: function () {
        return [txConstants.ASSET_REISSUE_TRANSACTION_TYPE];
    },

    getAssetTransferTxTypeBytes: function () {
        return [txConstants.ASSET_TRANSFER_TRANSACTION_TYPE];
    },

    getStartLeasingTxTypeBytes: function () {
        return [txConstants.START_LEASING_TRANSACTION_TYPE];
    },

    getCancelLeasingTxTypeBytes: function () {
        return [txConstants.CANCEL_LEASING_TRANSACTION_TYPE];
    },

    getCreateAliasTxTypeBytes: function () {
        return [txConstants.CREATE_ALIAS_TRANSACTION_TYPE];
    },

    // Keys

    getPublicKeyBytes: function (publicKey) {
        return utility.base58StringToByteArray(publicKey);
    },

    getPrivateKeyBytes: function (privateKey) {
        return crypto.base58.decode(privateKey);
    },

    // Data fields

    getNetworkBytes: function () {
        return [utility.getNetworkIdByte()];
    },

    getTransactionIdBytes: function (tx) {
        return utility.base58StringToByteArray(tx);
    },

    getRecipientBytes: function (recipient) {
        if (recipient.slice(0, 6) === 'alias:') {
            return [].concat(
                [featureConstants.ALIAS_VERSION],
                [utility.getNetworkIdByte()],
                utility.stringToByteArrayWithSize(recipient.slice(8)) // Remove leading 'asset:W:'
            );
        } else {
            return utility.base58StringToByteArray(recipient);
        }
    },

    getAssetIdBytes: function (assetId, mandatory) {
        if (mandatory) {
            return utility.base58StringToByteArray(assetId);
        } else {
            return assetId ? [1].concat(utility.base58StringToByteArray(assetId)) : [0];
        }
    },

    getAssetNameBytes: function (assetName) {
        return utility.stringToByteArrayWithSize(assetName);
    },

    getAssetDescriptionBytes: function (assetDescription) {
        return utility.stringToByteArrayWithSize(assetDescription);
    },

    getAssetQuantityBytes: function (assetQuantity) {
        return utility.longToByteArray(assetQuantity);
    },

    getAssetDecimalPlacesBytes: function (assetDecimalPlaces) {
        return [assetDecimalPlaces];
    },

    getAssetIsReissuableBytes: function (assetIsReissuable) {
        return utility.booleanToBytes(assetIsReissuable);
    },

    getAmountBytes: function (amount) {
        return utility.longToByteArray(amount);
    },

    getFeeAssetIdBytes: function (feeAssetId) {
        return SignService.getAssetIdBytes(feeAssetId);
    },

    getFeeBytes: function (fee) {
        return utility.longToByteArray(fee);
    },

    getTimestampBytes: function (timestamp) {
        return utility.longToByteArray(timestamp);
    },

    getAttachmentBytes: function (attachment) {
        return utility.byteArrayWithSize(attachment);
    },

    getAliasBytes: function (alias) {
        return utility.byteArrayWithSize([].concat(
            [featureConstants.ALIAS_VERSION],
            [utility.getNetworkIdByte()],
            utility.stringToByteArrayWithSize(alias)
        ));
    },

    getOrderTypeBytes: function (orderType) {
        return utility.booleanToBytes(orderType);
    },

    getOrderIdBytes: function (orderId) {
        return base58StringToByteArray(orderId);
    },

    // Signatures

    buildSignature: function (bytes, privateKey) {
        var privateKeyBytes = SignService.getPrivateKeyBytes(privateKey);
        return crypto.nonDeterministicSign(privateKeyBytes, bytes);
    }
}

module.exports = SignService;