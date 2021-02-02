const adjectives = [
  "real",
  "poised",
  "thankful",
  "witty",
  "silly",
  "mysterious",
  "foolish",
  "jolly",
  "innocent",
  "famous",
  "zany",
  "vast",
  "invisible",
  "french",
  "meandering",
  "zesty",
];

const nouns = [
  "glasses",
  "bouquet",
  "school",
  "orange",
  "beaver",
  "river",
  "boy",
  "girl",
  "cat",
  "mansion",
  "spooder",
  "turtle",
  "bicycle",
  "dissertation",
  "necktie",
  "porcupine",
  "concert",
  "barbeque",
  "lemon",
];

const makeCombo = (array1, array2) => {
  const getWord = (array) => {
    let min = 0;
    let max = array.length;
    let index = Math.floor(Math.random() * (max - min) + min);
    let word = array[index];
    return word;
  };
  return `${getWord(array1)}-${getWord(array2)}`;
};

console.log(makeCombo(adjectives, nouns));

module.exports = makeCombo;
