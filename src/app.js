const fs = require('fs');

const crypto = require('./core/crypto');
const seed = require('./core/seed');
const Money = require('./core/money').Money;
const Currency = require('./core/money').Currency;
const Transaction = require('./core/transaction');

const seedListPath = './src/config/seedlist.json';
const targetAddress = '3P5eMDcv5H3v9pR7Qg5yYKyma4cDm92Zdu1';
const recipientAddress = '3P6TH9DrUkfXnvCBdaufXwzsiER2qxU9Sn3';
// 

processArgs(process.argv[2]);
// processArgs('find-seed');

function processArgs(arg) {
    switch (arg) {
        case 'from-words':
            buildPartialSeedListsFromWords();
            break;
        case 'from-seedlist':
            buildPartialSeedListsFromSeedList();
            break;
        case 'find-seed':
            findSeed();
            break;
        default:
            console.log(`
            Available commands: \n
            from-words    - build seed list from words in the config
            from-seedlist - build seed list from another seedlist and words
            find-seed     - find the seed that matches the target address
            `);
            break;
    }
}

function findSeed() {
    const start = new Date().getTime();

    const seedList = fs.readFileSync(seedListPath, 'utf-8');
    for (let seed of JSON.parse(seedList)) {
        let address = crypto.buildRawAddressFromSeed(seed);
        if (address == targetAddress) {
            const end = new Date().getTime();
            console.log(`Found in ${(end - start) / 1000}s`);
            console.log(seed);
            let keyPair = crypto.buildKeyPairSecretPhrase(seed);
            sendMercury(keyPair.public, keyPair.private);
            return;
        } else {
            console.log(`Failed: ${seed}`);
        }
    }

    const end = new Date().getTime();

    console.log(`No seed found in ${(end - start) / 1000}s`);
}

function buildPartialSeedListsFromSeedList() {
    const seedList = fs.readFileSync(seedListPath, 'utf-8');
    const words = [
        ['wallet']
    ]
    let newSeedList = seed
        .buildPartialSeedListFromSeedList(JSON.parse(seedList), words)

    saveSeedList(newSeedList);
}

function sendMercury(publicKey, privateKey) {

    let amount = new Money('50000', Currency.MER);
    let sender = {
        publicKey: publicKey,
        privateKey: privateKey
    };
    let transaction = new Transaction(sender, recipientAddress, amount);

    transaction
        .send(sender, recipientAddress)
        .then(function (data) {
            if (data.ok) {
                console.log('Transaction sent successfully !');
            } else {
                console.log('Error', data.status, data.statusText);
            }
        });
}

function buildPartialSeedListsFromWords() {
    const words = require('./config/words.json');
    const wordsEx = require('./config/words_ex.json');

    const start = Date.now();
    let seedList = seed
        .buildPartialSeedListFromWords(words)
        .concat(seed.buildPartialSeedListFromWords(wordsEx))
        .filter((item, index, originalArr) => originalArr.indexOf(item) == index);
    const end = Date.now();
    console.log('It took: ' + (end -start)/1000 + 's');
    saveSeedList(seedList);
}

function saveSeedList(seedList) {
    fs.writeFile(seedListPath, JSON.stringify(seedList), (err) => {
        if (err) throw err;

        console.log(`Built partial seed list: ${seedListPath} | TOTAL: ${seedList.length} seeds`);
    })
}