# MerTreasureHunt

## General Info
- There are 2 types of word list: 
  - `./src/config/words.json`     - this contains a list of words that are more likely to be valid
  - `./src/config/words_ex.json`  - this contains a more in depth list if the first one fails

## Commands

- `from-words` - This will build the seedlist from the words. The seedlist will consist of multiple combinations of words, first from `words.json` and then from `words_ex.json`
- `from-seedlist` - This will build the seedlist using another seedlist by combining it with an array (or multiple arrays) of words
- `find-seed` - This will try and find the correct seed (using the seedlist) that matches the target address specified in `app.js` in the variable `targetAddress`. If it does find a seed that matches the target address it will try to send `50 000 MER` to an address specified in `recipientAddress`

