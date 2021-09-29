import * as Tone from "tone";
import { noteSpace } from "../helpers/music-math";

const melodyOne = (instrument, notes, time, randomInt) => {
  instrument.triggerAttackRelease(notes[0], "4n", time);
  const note2 = [notes[0], notes[1]][randomInt(2)]; // double play first note
  instrument.triggerAttackRelease(note2, "4n", time + Tone.Time("16n"));
};

const melodyTwo = (instrument, notes, time, randomInt) => {
  instrument.triggerAttackRelease(notes[0], "4n", time);
  instrument.triggerAttackRelease(notes[1], "4n", time + Tone.Time("32n"));
  instrument.triggerAttackRelease(notes[2], "4n", time + 2 * Tone.Time("32n"));
};

const melodyThree = (instrument, notes, time, randomInt) => {
  instrument.triggerAttackRelease(notes[0], "4n", time);
  instrument.triggerAttackRelease(notes[1], "4n", time + Tone.Time("16n"));
  instrument.triggerAttackRelease(
    notes[2],
    "4n",
    time + Tone.Time("16n") + Tone.Time("32n")
  );
};

const melodyFour = (instrument, notes, time, randomInt) => {
  notes.map((note, idx) => {
    const noteSpacing = "16n";
    const timeOffset = noteSpace(idx, noteSpacing);
    instrument.triggerAttackRelease(note, "4n", time + timeOffset);
  });
};

const melodyFive = (instrument, notes, time, randomInt) => {
  instrument.triggerAttackRelease(notes.slice(0, 3), "2n", time);
};

const melodySix = (instrument, notes, time, randomInt) => {
  instrument.triggerAttackRelease(notes.slice(0, 3), "2n", time);
  instrument.triggerAttackRelease(
    notes.slice(0, 2),
    "2n",
    time + Tone.Time("8n")
  );
};

const melodies = [
  melodyOne,
  melodyTwo,
  melodyThree,
  melodyFour,
  melodyFive,
  melodySix,
];

export { melodies };
