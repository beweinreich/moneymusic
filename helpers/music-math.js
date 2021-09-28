const chordProgressions = [
  [1, 5, 4, 5],
  [1, 4, 2, 5],
  [5, 4, 5, 4],
  [1, 2, 5, 4],
];

const measuresPerProgression = 4;

const getCurrentChordProgressionIteration = (ticks, duration) => {
  /* Based on the number of ticks so far, what progression # should we be on? */
  const durationNum = parseInt(duration.slice(0, -1)); // 16n -> 16
  const notesPerProgression = durationNum * measuresPerProgression; // ex: 64 16n per progression
  const progressionIteration = Math.floor(ticks / notesPerProgression); // 7th iteration through progressions

  return progressionIteration;
};

const getCurrentChordProgression = (ticks, duration, seedNum) => {
  // seedNum should always be the same number for a given seed
  // the seedNum scrambles the order of the chordProgressions

  // First get the progression iteration we currently are on
  const currentIteration = getCurrentChordProgressionIteration(ticks, duration);
  const numberChordProgressions = chordProgressions.length;

  // keeps the number coerced to available chord progressions
  const coercedIteration = currentIteration % numberChordProgressions;

  /* Now we need to coerce the progression iteration to one of the available chordProgressions
  /* This isn't really a good distribution... but for now, we'll deal with it
  /* TODO: max this better distributed in "randomness"
  */

  const shuffledProgressions = shuffle(chordProgressions, coercedIteration);
  console.log(coercedIteration);
  return shuffledProgressions[coercedIteration];
};

function shuffle(array, randomInt) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomInt]] = [
      array[randomInt],
      array[currentIndex],
    ];
  }

  return array.filter((n) => n);
}

export { getCurrentChordProgression };
