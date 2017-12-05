const signService = require('./sign');
const crypto = require('./crypto');

function buildCreateAssetTransferSignatureData(transfer, senderPublicKey) {
    return [].concat(
        signService.getAssetTransferTxTypeBytes(),
        signService.getPublicKeyBytes(senderPublicKey),
        signService.getAssetIdBytes(transfer.amount.currency.id),
        signService.getFeeAssetIdBytes(transfer.fee.currency.id),
        signService.getTimestampBytes(transfer.time),
        signService.getAmountBytes(transfer.amount.toCoins()),
        signService.getFeeBytes(transfer.fee.toCoins()),
        signService.getRecipientBytes(transfer.recipient),
        signService.getAttachmentBytes(transfer.attachment)
    );
}

function buildId(transactionBytes) {
    var hash = crypto.blake2b(new Uint8Array(transactionBytes));
    return crypto.base58.encode(hash);
}

module.exports = {
    createAssetTransferTransaction: function (transfer, sender) {

        transfer.time = transfer.time || Date.now();
        transfer.attachment = transfer.attachment || [];

        var signatureData = buildCreateAssetTransferSignatureData(transfer, sender.publicKey);
        var signature = signService.buildSignature(signatureData, sender.privateKey);

        return {
            id: buildId(signatureData),
            recipient: transfer.recipient,
            timestamp: transfer.time,
            assetId: transfer.amount.currency.id,
            amount: transfer.amount.toCoins(),
            fee: transfer.fee.toCoins(),
            feeAssetId: transfer.fee.currency.id,
            senderPublicKey: sender.publicKey,
            signature: signature,
            attachment: crypto.base58.encode(transfer.attachment)
        };
    }
}