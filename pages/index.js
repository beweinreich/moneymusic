// https://tonejs.github.io/

import react, { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import * as Tone from "tone";
import { Scale, Chord, Key } from "@tonaljs/tonal";

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [seed, setSeed] = useState("doggy");
  const [playingText, setPlayingText] = useState("");

  const seeder = xmur3(seed);
  const rand = sfc32(seeder(), seeder(), seeder(), seeder());

  const randomInt = (max) => {
    // max number of options
    // ex: if max == 2, then options are 0, 1
    const randomNum = rand();
    return Math.floor(randomNum * max);
  };

  const keys = ["A", "B", "C", "D", "E", "F", "G"];
  const keyLetter = keys[randomInt(keys.length)];
  const key = Key.majorKey(keyLetter);
  const durations = ["4n", "8n", "16n", "32n"];
  const scale = key.scale;
  const chords = key.chords;
  console.log(`We are in key:`, key);

  useEffect(() => {
    if (!isPlaying) return;
    Tone.Transport.cancel();

    const piano = new Tone.Sampler({
      urls: {
        C4: "C4.mp3",
        "D#4": "Ds4.mp3",
        "F#4": "Fs4.mp3",
        A4: "A4.mp3",
      },
      release: 1,
      baseUrl: "https://tonejs.github.io/audio/salamander/",
    }).toDestination();

    const cello = new Tone.Sampler({
      urls: {
        E2: "E2.wav",
        E3: "E3.wav",
        F2: "F2.wav",
        F3: "F3.wav",
        F4: "F4.wav",
        G2: "G2.wav",
        G3: "G3.wav",
        G4: "G4.wav",
        A2: "A2.wav",
        A3: "A3.wav",
        A4: "A4.wav",
        B2: "B2.wav",
        B3: "B3.wav",
        B4: "B4.wav",
        C2: "C2.wav",
        C3: "C3.wav",
        D2: "D2.wav",
        D3: "D3.wav",
        D4: "D4.wav",
      },
      release: 1,
      baseUrl: "/cello/",
    });

    piano.volume.value = -10;
    cello.volume.value = -20;
    const mixer = new Tone.Gain();
    const reverb = new Tone.Reverb({
      wet: 0.3,
      decay: 30,
    });

    // setup the audio chain:
    // synth(s) -> mixer -> reverb -> Tone.Master
    cello.connect(mixer);
    piano.connect(mixer);
    mixer.connect(reverb);
    reverb.toDestination();

    let noteLetter;
    let octave = 4;
    let arping = true;

    Tone.Transport.bpm.value = 18 + randomInt(20);

    let ticks = 0;
    Tone.loaded().then(() => {
      const loop = new Tone.Loop((time) => {
        ticks++;
        // console.log(ticks);

        noteLetter = getNextNote(noteLetter);
        let note = noteLetter + octave;

        const oneFour = [0, 3][randomInt(2)];
        let chord = Chord.get(scale[oneFour]);
        let chordNotes = chord.notes;
        let chordNotesCello = chord.notes.map(
          (note) => `${note}${octave - randomInt(2)}`
        );
        let chordNotesPianoBass = chord.notes.map(
          (note) => `${note}${octave - 1}`
        );
        let chordNotesPiano = chord.notes.map((note) => `${note}${octave}`);

        const playNote = randomInt(10) > 2;

        if (ticks % 40 === 0) {
          arping = !arping;
        }

        if (ticks % 8 === 0) {
          cello.triggerAttackRelease(chordNotesCello, "4n", time);
        }

        if (arping) {
          // some arping on the chords
          if (ticks % 4 === 0) {
            chordNotesPianoBass.map((note, idx) => {
              const timeOffset = idx === 0 ? 0 : Tone.Time(`${idx * 16}n`);
              piano.triggerAttackRelease(note, "8n", time + timeOffset);
            });
          }
        } else {
          // chords together
          if (ticks % 8 === 0) {
            if (randomInt(10) > 2) {
              piano.triggerAttackRelease(chordNotesPianoBass, "1n", time);
            }
          } else {
            if (playNote && randomInt(10) > 8) {
              piano.triggerAttackRelease(chordNotesPianoBass, "1n", time);
            }
          }
        }

        if (arping) {
          if (ticks % 4 && playNote) {
            // if we are "arpeggiating" pick one of the notes from the chord
            // to avoid dissonance
            note = chordNotesPiano[randomInt(chord.notes.length)];
            piano.triggerAttackRelease(note, "8n", time);
          }
        } else {
          if (playNote) {
            piano.triggerAttackRelease(
              chordNotesPiano[randomInt(chordNotesPiano.length)],
              durations[randomInt(durations.length)],
              time
            );
          }
        }
      }, "32n");

      loop.start();
    });
  }, [isPlaying]);

  const chordRules = {
    1: [1, 2, 3, 4, 5, 6, 7],
    2: [5, 7],
    3: [4, 6],
    4: [2, 5, 7],
    5: [6],
    6: [2, 3, 4, 5],
    7: [1],
  };

  // instruments
  // const synth = new Tone.PolySynth(Tone.Synth).toDestination();
  // use sampler below to use diff instruments
  // https://github.com/nbrosowsky/tonejs-instruments/tree/master/samples

  const getNextNote = (currentNote) => {
    if (!currentNote) return keyLetter;

    const currentIndex = scale.indexOf(currentNote);
    const isPositive = randomInt(2) === 1;

    let nextIndex = currentIndex + randomInt(3) * (isPositive ? 1 : -1);

    if (nextIndex >= scale.length || nextIndex < 0) nextIndex = currentIndex;
    return scale[nextIndex];
  };

  const startPlayback = () => {
    Tone.start();

    if (isPlaying) return;
    setIsPlaying(true);

    Tone.Transport.start();
  };

  const pausePlayback = () => {
    Tone.Transport.stop();
    setIsPlaying(false);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Money Music</title>
        <meta name="description" content="Making money with music" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <p>Lets make some money making music</p>
      <input
        type="text"
        value={seed}
        onChange={(val) => setSeed(val.target.value)}
      />
      <p />
      <button onClick={startPlayback}>Play</button>
      <button onClick={pausePlayback}>Stop</button>
      <p />
      <p>In the key of {keyLetter}</p>
      <div
        dangerouslySetInnerHTML={{ __html: playingText }}
        style={{
          overflow: "scroll",
          height: 200,
          width: 400,
          backgroundColor: "black",
          color: "white",
          borderRadius: 20,
          padding: 20,
        }}
      />
    </div>
  );
}

function xmur3(str) {
  for (var i = 0, h = 1779033703 ^ str.length; i < str.length; i++)
    (h = Math.imul(h ^ str.charCodeAt(i), 3432918353)),
      (h = (h << 13) | (h >>> 19));
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}
function sfc32(a, b, c, d) {
  return function () {
    a >>>= 0;
    b >>>= 0;
    c >>>= 0;
    d >>>= 0;
    var t = (a + b) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    d = (d + 1) | 0;
    t = (t + d) | 0;
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
}
