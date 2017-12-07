const Money = require('./money').Money;
const Currency = require('./money').Currency;
const assetService = require('./asset');
const fetch = require('node-fetch');

let Transaction = function (sender, recipient, amount) {
    const fee = new Money('0.001', Currency.WAVES);

    const transactionData = assetService.createAssetTransferTransaction(
        {
            recipient: recipient,
            amount: amount,
            fee: fee
        },
        {
            publicKey: sender.publicKey,
            privateKey: sender.privateKey
        }
    )

    this.send = function () {
        return fetch('https://nodes.wavesnodes.com/assets/broadcast/transfer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transactionData)
        });
    }
    return this;
};

module.exports = Transaction;