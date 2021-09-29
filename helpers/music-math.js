import { Scale, Chord, Key } from "@tonaljs/tonal";
import { shuffle } from "./random";

const chordProgressions = {
  0: [1, 5, 6, 4],
  1: [6, 5, 4, 5],
  1: [1, 4, 6, 5],
  2: [1, 6, 2, 5],
};

const measuresPerProgression = 4;
const numberChordProgressions = Object.keys(chordProgressions).length;

const getCurrentChordProgressionIteration = (ticks, tickDuration) => {
  /* Gets the progression iteration we currently are on
  /* This is based on how many ticks have occurred, and the duration of a given tick
  */
  const ticksPerMeasure = parseInt(tickDuration.slice(0, -1)); // 16n -> 16
  const notesPerProgression = ticksPerMeasure * measuresPerProgression; // ex: 64 16n per progression
  const progressionIteration = Math.floor(ticks / notesPerProgression); // 7th iteration through progressions

  return progressionIteration;
};

const getCurrentChordProgression = (ticks, tickDuration, initialSeed) => {
  const currentIteration = getCurrentChordProgressionIteration(
    ticks,
    tickDuration
  );
  const coercedIteration = currentIteration % numberChordProgressions;
  console.log("Progression: ", coercedIteration);

  const shuffled = shuffledChordProgressions(initialSeed);
  return shuffled[coercedIteration];
};

const shuffledChordProgressions = (initialSeed) => {
  /* Coerce the progression iteration to one of the available chordProgressions
  /* This isn't really a good randomization... but for now, we'll deal with it
  /* TODO: make this more "random"
  /* Note: initialSeed should be static for a given "seed" of the application
  /* i.e. don't rotate the initialSeed unless you want to scramble the progressions
  */
  const seed = initialSeed < 1 ? initialSeed * 100 : initialSeed;
  const coercedInitialSeed = Math.floor(seed % numberChordProgressions);

  let shuffledProgressions = {};
  const shuffledProgressionValues = shuffle(
    Object.keys(chordProgressions),
    coercedInitialSeed
  ).map((key) => chordProgressions[key]);

  shuffledProgressionValues.forEach(
    (item, idx) => (shuffledProgressions[idx] = item)
  );

  return shuffledProgressions;
};

const getCurrentMeasure = (ticks, tickDuration) => {
  /* Gets the measure we currently are on
  /* This is based on how many ticks have occurred, and the duration of a given tick
  */
  const ticksPerMeasure = parseInt(tickDuration.slice(0, -1)); // 16n -> 16
  const currentMeasure = Math.floor(ticks / ticksPerMeasure);
  const currentMeasureCoerced = currentMeasure % measuresPerProgression;

  return currentMeasureCoerced;
};

const getAvailableNotes = (key, ticks, tickDuration, initialSeed) => {
  const currentChordProgression = getCurrentChordProgression(
    ticks,
    tickDuration,
    initialSeed
  );
  const currentMeasure = getCurrentMeasure(ticks, tickDuration);
  console.log("Measure: ", currentMeasure);

  // subtract 1 to convert from music progressions to computer sci
  // i.e. a 5 chord is really the 4th index on a scale array
  const chordNum = currentChordProgression[currentMeasure] - 1;
  const chordName = key.chords[chordNum];
  const notes = Chord.get(chordName).notes;
  console.log(notes);

  return notes;
};

const notesWithOctave = (notes, octave) => {
  return notes.map((note, idx) => {
    // TODO: the notes are not always ascending
    // ex: F4, A4, C4, E4 will start at F, go up to A, and then back down to C, and up to E

    return `${note}${octave}`;
  });
};

export { getCurrentChordProgression, getAvailableNotes, notesWithOctave };
