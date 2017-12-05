var getSeedListFromWords = (arr) => {
    return arr.reduce(function (a, b) {
        return a.map(function (x) {
            return b.map(function (y) {
                return x.concat(y);
            })
        }).reduce(function (a, b) { return a.concat(b) }, [])
    }, [[]])
        .map((arr) => arr.reduce((acc, el) => acc += ' ' + el));
}

module.exports = {
    buildPartialSeedListFromWords: (words) => {
        const seedList = getSeedListFromWords(words);
        return seedList;
    },
    buildPartialSeedListFromSeedList: (seedList, words) => {
        let newSeedList = [];
        for (let seed of seedList) {
            newSeedList = newSeedList.concat(getSeedListFromWords([[seed]].concat(words)));
        }
        return newSeedList;
    }
}