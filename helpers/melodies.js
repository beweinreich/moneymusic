import * as Tone from "tone";
import { noteSpace } from "../helpers/music-math";

const melody1 = (
  instrument,
  notes,
  time,
  randomInt,
  timeSignature,
  noteDuration = "4n"
) => {
  instrument.triggerAttackRelease(notes[0], noteDuration, time);
  const note2 = [notes[0], notes[1]][randomInt(2)];
  instrument.triggerAttackRelease(
    note2,
    noteDuration,
    time + Tone.Time(`${timeSignature * 4}n`)
  );
};

const melody2 = (
  instrument,
  notes,
  time,
  randomInt,
  timeSignature,
  noteDuration = "4n"
) => {
  instrument.triggerAttackRelease(notes[0], noteDuration, time);
  instrument.triggerAttackRelease(
    notes[1],
    noteDuration,
    time + Tone.Time(`${timeSignature * 8}n`)
  );
  instrument.triggerAttackRelease(
    notes[2],
    noteDuration,
    time + 2 * Tone.Time(`${timeSignature * 8}n`)
  );
};

const melody3 = (
  instrument,
  notes,
  time,
  randomInt,
  timeSignature,
  noteDuration = "4n"
) => {
  instrument.triggerAttackRelease(notes[0], noteDuration, time);
  instrument.triggerAttackRelease(
    notes[1],
    noteDuration,
    time + Tone.Time(`${timeSignature * 4}n`)
  );
  instrument.triggerAttackRelease(
    notes[2],
    noteDuration,
    time +
      Tone.Time(`${timeSignature * 4}n`) +
      Tone.Time(`${timeSignature * 8}n`)
  );
  instrument.triggerAttackRelease(
    notes[2],
    noteDuration,
    time +
      Tone.Time(`${timeSignature * 4}n`) +
      Tone.Time(`${timeSignature * 8}n`) +
      Tone.Time(`${timeSignature * 4}n`)
  );
};

const melody4 = (
  instrument,
  notes,
  time,
  randomInt,
  timeSignature,
  noteDuration = "4n"
) => {
  notes.slice(0, timeSignature).map((note, idx) => {
    const noteSpacing = "16n";
    const timeOffset = noteSpace(idx, noteSpacing);
    instrument.triggerAttackRelease(note, noteDuration, time + timeOffset);
  });
};

const melody5 = (
  instrument,
  notes,
  time,
  randomInt,
  timeSignature,
  noteDuration = "4n"
) => {
  instrument.triggerAttackRelease(notes, "2n", time);
};

const melody6 = (
  instrument,
  notes,
  time,
  randomInt,
  timeSignature,
  noteDuration = "4n"
) => {
  instrument.triggerAttackRelease(notes.slice(0, 3), "2n", time);
  instrument.triggerAttackRelease(
    notes.slice(0, 2),
    "2n",
    time + Tone.Time(`${timeSignature * 2}n`)
  );
};

const melody7 = (
  instrument,
  notes,
  time,
  randomInt,
  timeSignature,
  noteDuration = "4n"
) => {
  notes = notes
    .slice(0, 2)
    .concat(notes.slice(0, 2))
    .concat(notes.slice(2, 4))
    .concat(notes.slice(0, 2));
  notes.map((note, idx) => {
    const noteSpacing = "32n";
    const timeOffset = noteSpace(idx, noteSpacing);
    instrument.triggerAttackRelease(note, noteDuration, time + timeOffset);
  });
};

const melody8 = (
  instrument,
  notes,
  time,
  randomInt,
  timeSignature,
  noteDuration = "4n"
) => {
  instrument.triggerAttackRelease(
    notes[0],
    noteDuration,
    time + Tone.Time(`${timeSignature * 2}n`)
  );
  instrument.triggerAttackRelease(
    notes[1],
    noteDuration,
    time +
      Tone.Time(`${timeSignature * 2}n`) +
      Tone.Time(`${timeSignature * 8}n`)
  );
  instrument.triggerAttackRelease(
    notes[2],
    noteDuration,
    time +
      Tone.Time(`${timeSignature * 2}n`) +
      2 * Tone.Time(`${timeSignature * 8}n`)
  );
};

const melody9 = (
  instrument,
  notes,
  time,
  randomInt,
  timeSignature,
  noteDuration = "4n"
) => {
  instrument.triggerAttackRelease(notes[0], "1n", time);
};

const melody10 = (
  instrument,
  notes,
  time,
  randomInt,
  timeSignature,
  noteDuration = "4n"
) => {};

const melody11 = (
  instrument,
  notes,
  time,
  randomInt,
  timeSignature,
  noteDuration = "4n"
) => {
  notes = notes.slice(0, 2).concat(notes.slice(0, 2));
  notes.map((note, idx) => {
    const noteSpacing = "32n";
    const timeOffset = noteSpace(idx, noteSpacing);
    instrument.triggerAttackRelease(
      note,
      noteDuration,
      time + Tone.Time(`${timeSignature * 2}n`) + timeOffset
    );
  });
};

const melody12 = (
  instrument,
  notes,
  time,
  randomInt,
  timeSignature,
  noteDuration = "4n"
) => {
  instrument.triggerAttackRelease(
    notes.slice(0, 3),
    "2n",
    time +
      Tone.Time(`${timeSignature * 2}n`) +
      Tone.Time(`${timeSignature * 4}n`)
  );
};

const melody13 = (
  instrument,
  notes,
  time,
  randomInt,
  timeSignature,
  noteDuration = "4n"
) => {
  instrument.triggerAttackRelease(
    notes[0],
    "2n",
    time +
      Tone.Time(`${timeSignature * 4}n`) +
      4 * Tone.Time(`${timeSignature * 8}n`)
  );
  instrument.triggerAttackRelease(
    notes[0],
    "2n",
    time +
      Tone.Time(`${timeSignature * 4}n`) +
      5 * Tone.Time(`${timeSignature * 8}n`)
  );
};

const melody14 = (
  instrument,
  notes,
  time,
  randomInt,
  timeSignature,
  noteDuration = "4n"
) => {
  instrument.triggerAttackRelease(
    notes[1],
    "2n",
    time +
      Tone.Time(`${timeSignature * 4}n`) +
      2 * Tone.Time(`${timeSignature * 8}n`)
  );
  instrument.triggerAttackRelease(
    notes[0],
    "2n",
    time +
      Tone.Time(`${timeSignature * 4}n`) +
      3 * Tone.Time(`${timeSignature * 8}n`)
  );
  instrument.triggerAttackRelease(
    notes[1],
    "2n",
    time +
      Tone.Time(`${timeSignature * 4}n`) +
      4 * Tone.Time(`${timeSignature * 8}n`)
  );
  instrument.triggerAttackRelease(
    notes[0],
    "2n",
    time +
      Tone.Time(`${timeSignature * 4}n`) +
      5 * Tone.Time(`${timeSignature * 8}n`)
  );
  instrument.triggerAttackRelease(
    notes[0],
    "2n",
    time +
      Tone.Time(`${timeSignature * 4}n`) +
      7 * Tone.Time(`${timeSignature * 8}n`)
  );
};

const melody15 = (
  instrument,
  notes,
  time,
  randomInt,
  timeSignature,
  noteDuration = "4n"
) => {
  notes.slice(0, timeSignature).map((note, idx) => {
    const noteSpacing = `${timeSignature * 4}n`;
    const timeOffset = noteSpace(idx, noteSpacing);
    instrument.triggerAttackRelease(note, noteDuration, time + timeOffset);
  });
};

const melody16 = (
  instrument,
  notes,
  time,
  randomInt,
  timeSignature,
  noteDuration = "4n"
) => {
  instrument.triggerAttackRelease(notes[0], noteDuration, time);
  instrument.triggerAttackRelease(
    notes[1],
    noteDuration,
    time + Tone.Time(`${timeSignature * 2}n`)
  );
};

const melody17 = (
  instrument,
  notes,
  time,
  randomInt,
  timeSignature,
  noteDuration = "4n"
) => {
  instrument.triggerAttackRelease(notes[1], noteDuration, time);
  instrument.triggerAttackRelease(
    notes[0],
    noteDuration,
    time + Tone.Time(`${timeSignature * 2}n`)
  );
};

const melody18 = (
  instrument,
  notes,
  time,
  randomInt,
  timeSignature,
  noteDuration = "4n"
) => {
  instrument.triggerAttackRelease(
    notes,
    "2n",
    time + Tone.Time(`${timeSignature * 2}n`)
  );
};

const arpeggio = (
  instrument,
  notes,
  time,
  randomInt,
  timeSignature,
  noteDuration,
  arp4,
  arpSteady,
  key
) => {
  if (arp4) notes = notes.concat(notes[1]);
  if (timeSignature === 3) notes.slice(0, 3); // if we're in 3/4 timesignature, only roll 3 notes

  notes.map((note, idx) => {
    const noteSpacing = `${timeSignature * timeSignature}n`;
    const timeOffset = noteSpace(idx, noteSpacing);

    if (idx === 1 && randomInt(10) > 5) {
      // play an extra fun note
      const currentNoteIdx = key.scale.indexOf(note.slice(0, note.length - 1));
      const currentOctave = note.slice(-1);
      instrument.triggerAttackRelease(
        `${key.scale[currentNoteIdx + 1]}${currentOctave}`,
        noteDuration,
        time + timeOffset + Tone.Time("32n")
      );
    }

    const playNote = arpSteady ? true : randomInt(10) > 3;
    if (playNote)
      instrument.triggerAttackRelease(note, noteDuration, time + timeOffset);
  });
};

const melodies = [
  melody1,
  melody2,
  melody3,
  melody4,
  melody5,
  melody6,
  melody7,
  melody8,
  melody9,
  melody10,
  melody11,
  melody12,
  melody13,
  melody14,
  melody15,
  melody16,
  melody17,
  melody18,
];

export { melodies, arpeggio };
