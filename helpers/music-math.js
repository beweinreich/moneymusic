const chordProgressions = {
  0: [1, 5, 4, 5],
  1: [1, 4, 2, 5],
  2: [5, 4, 5, 4],
  3: [1, 2, 5, 4],
};

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
  const numberChordProgressions = Object.keys(chordProgressions).length;

  // keeps the number coerced to available chord progressions
  const coercedIteration = currentIteration % numberChordProgressions;
  console.log("Iteration: ", coercedIteration);

  /* Now we need to coerce the progression iteration to one of the available chordProgressions
  /* This isn't really a good randomization... but for now, we'll deal with it
  /* TODO: make this more "random"
  */
  const seed = seedNum < 1 ? seedNum * 100 : seedNum;
  const coercedSeedNum = seed % numberChordProgressions;

  let shuffledProgressions = {};
  const shuffledProgressionValues = shuffle(
    Object.keys(chordProgressions),
    coercedSeedNum
  ).map((key) => chordProgressions[key]);

  shuffledProgressionValues.forEach(
    (item, idx) => (shuffledProgressions[idx] = item)
  );

  return shuffledProgressions[coercedIteration];
};

function shuffle(array, randomInt) {
  let currentIndex = array.length;

  while (currentIndex != 0) {
    currentIndex--;

    [array[currentIndex], array[randomInt]] = [
      array[randomInt],
      array[currentIndex],
    ];
  }

  return array.filter((n) => n);
}

export { getCurrentChordProgression };
