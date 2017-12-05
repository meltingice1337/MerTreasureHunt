var combinations = (arr) => {
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
    getSeedListFromWords: (words) => {
        return combinations(words);
    }
}