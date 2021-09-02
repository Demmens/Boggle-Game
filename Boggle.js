const fs = require('fs');

//To see a working multiplayer version of this game using discord.js, visit my GitHub: https://github.com/Demmens/Tabletop-Discord-Bot/tree/master/commands/Games/Boggle

let data = fs.readFileSync(__dirname + '/words.txt', { encoding: 'utf8' }); //https://drive.google.com/file/d/1oGDf1wjWp5RF_X9C7HoedhIWMh5uJs8s/view
let words = data.replace(/\r/gi, '').split('\n');
let dice = [
    "RIFOBX", //credit to https://boardgames.stackexchange.com/questions/29264/boggle-what-is-the-dice-configuration-for-boggle-in-various-languages for dice values
    "IFEHEY",
    "DENOWS",
    "UTOKND",
    "HMSRAO",
    "LUPETS",
    "ACITOA",
    "YLGKUE",
    "QBMJOA",
    "EHISPN",
    "VETIGN",
    "BALIYT",
    "EZAVND",
    "RALESC",
    "UWILRG",
    "PACEMD"
];

let diceOrder = [];
while (dice.length > 0) { //Randomise the order of the dice
    let index = Math.floor(Math.random() * dice.length);
    diceOrder.push(dice[index]);
    dice.splice(index, 1);
}

let msg = "";
let boggleArray = []; //Array of all letters
for (let i = 0; i < diceOrder.length; i++) {
    let ranLetter = diceOrder[i].charAt(Math.floor(Math.random() * diceOrder[i].length)).toLowerCase();
    msg += ranLetter + " ";
    boggleArray.push(ranLetter);
    if (i % 4 == 3) msg += "\n"; //Every fourth letter we move to a new line
}

function FindWordsWithStart(section, loop, checkIndex) //Run through the words list and find any words starting with a particular string.
{
    let arr = [];
    let word = words[checkIndex].toLowerCase();
    if (word.startsWith(section)) //Found words that start with the current letters
    {
        let i = checkIndex;
        while (word.startsWith(section)) //Find all words before that also start with those letters
        {
            arr.push(word);
            i--;
            word = words[i].toLowerCase();
        }
        i = checkIndex + 1;
        word = words[i];
        while (word.startsWith(section)) //Find all words after that also start with those letters
        {
            arr.push(word);
            i++;
            word = words[i].toLowerCase();
        }
        return arr; //Return the array of all words that start with the given letters
    }
    else {
        if (loop == 22) //Should only need 19 loops, but put 22 to be safe.
        {
            return arr;
        }
        loop++;
        let nextIndex;
        if (word > section) {
            nextIndex = checkIndex - Math.floor(words.length / Math.pow(2, loop));
            if (nextIndex == checkIndex) nextIndex == checkIndex - 1
        }
        else {
            nextIndex = checkIndex + Math.floor(words.length / Math.pow(2, loop));
            if (nextIndex == checkIndex) nextIndex == checkIndex + 1
        }
        return FindWordsWithStart(section, loop, nextIndex);
    }
}

function AddLetter(index, unused, word) {
    let i = 0;
    let unusedindex = -1;
    for (let letter of unused) {
        unusedindex++;
        if (letter == boggleArray[index] && unusedindex == index) // Make sure we don't use the same letter twice
        {
            word += letter;
            if (letter == "q") word += "u";
            if (word.length > 1) {
                let potentialWords = FindWordsWithStart(word, 1, Math.floor(words.length / 2)); //Find all words that begin with the given letters
                if (potentialWords.length == 0) break; //If there are no words that start with those letters, we can stop our search of this tree here.
                if (potentialWords.includes(word)) //If the given letters are actually a full word...
                {
                    let alreadyFound = false;
                    for (let wrd of possibleWordsArr) //Check if we've already found the word
                    {
                        if (wrd == word) {
                            alreadyFound = true;
                        }
                    }
                    if (!alreadyFound) //If we haven't found this word yet
                    {
                        possibleWordsArr.push(word); //Save it so we don't get duplicates later.
                    }
                    if (potentialWords.length == 1) break; //If there is only one possible word beginning with these letters, we need look no further.
                }
            }
            unused[i] = "used";
            let topRow = true;
            let bottomRow = true;
            let leftCol = true;
            let rightCol = true;
            let connectedTo = [];
            if (index % 4 != 0) // Has letters to the left
            {
                connectedTo.push(index - 1);
                leftCol = false;
            }
            if (index % 4 != 3) // Has letters to the right
            {
                connectedTo.push(index + 1);
                rightCol = false;
            }
            if (index > 3) // Has letters above
            {
                connectedTo.push(index - 4);
                topRow = false;
            }
            if (index < 12)// Has letters below
            {
                connectedTo.push(index + 4);
                bottomRow = false
            }
            if (!topRow && !leftCol)// Has letter up/left
            {
                connectedTo.push(index - 5);
            }
            if (!topRow && !rightCol)// Has letter up/right
            {
                connectedTo.push(index - 3);
            }
            if (!bottomRow && !leftCol)// Has letter down/left
            {
                connectedTo.push(index + 3);
            }
            if (!bottomRow && !rightCol)// Has letter down/right
            {
                connectedTo.push(index + 5);
            }

            for (let con of connectedTo) // For all connecting letters
            {
                AddLetter(con, JSON.parse(JSON.stringify(unused)), word); // Test the add the letter to the current string, test for matches
            }
            break;
        }
        i++;
    }
}

var possibleWordsMsg = "";
var possibleWordsArr = [];
for (let j = 0; j < 16; j++) {
    AddLetter(j, JSON.parse(JSON.stringify(boggleArray)), ""); //have to JSON.parse/JSON.stringify to not remove indexes from the array.
}
possibleWordsArr.sort((a, b) => {
    if (a.length > b.length) return -1;
    if (a.length < b.length) return 1;
    if (a.length == b.length) {
        if (a > b) return 1;
        if (a < b) return -1;
    }
});
for (let i = 0; i < possibleWordsArr.length; i++) {
    let posWord = possibleWordsArr[i];
    if (posWord.length > 2) {
        if (i == 0 || posWord.length < possibleWordsArr[i - 1].length) {
            possibleWordsMsg += `**${posWord.length} LETTER WORDS**\n`;
        }
        possibleWordsMsg += `${posWord}\n`;
    }
}
console.log(`\n${msg.toUpperCase()}\nYou may treat 'Q' as 'Qu'.\n`);

const timeLimit = 60000;

fs.writeFile(__dirname + "/answers.txt", possibleWordsMsg, function () { });

let timeUp = false;

setTimeout(function () {
    console.log(`**TIME'S UP!**`);
    timeUp = true;
    setTimeout(function () {
        console.log(possibleWordsMsg);
    }, 2000);
}, timeLimit);