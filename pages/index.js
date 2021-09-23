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
  const durations = ["4n", "8n", "16n", "32n", "32n", "32n"];
  const scale = key.scale;
  const chords = key.chords;
  console.log(`We are in key:`, key);

  useEffect(() => {
    if (!isPlaying) return;
    Tone.Transport.cancel();

    const sampler = new Tone.Sampler({
      urls: {
        C4: "C4.mp3",
        "D#4": "Ds4.mp3",
        "F#4": "Fs4.mp3",
        A4: "A4.mp3",
      },
      release: 1,
      baseUrl: "https://tonejs.github.io/audio/salamander/",
    }).toDestination();

    const sampler2 = new Tone.Sampler({
      urls: {
        C4: "C4.mp3",
        "D#4": "Ds4.mp3",
        "F#4": "Fs4.mp3",
        A4: "A4.mp3",
      },
      release: 1,
      baseUrl: "https://tonejs.github.io/audio/salamander/",
    }).toDestination();

    sampler.volume.value = -10;
    sampler2.volume.value = -10;
    const mixer = new Tone.Gain();
    const reverb = new Tone.Reverb({
      wet: 0.3,
      decay: 30,
    });

    // setup the audio chain:
    // synth(s) -> mixer -> reverb -> Tone.Master
    sampler.connect(mixer);
    sampler2.connect(mixer);
    mixer.connect(reverb);
    reverb.toDestination();

    let noteLetter;
    let octave = 4;

    Tone.Transport.bpm.value = 28;

    let ticks = 0;
    Tone.loaded().then(() => {
      const loop = new Tone.Loop((time) => {
        ticks++;
        console.log(ticks);

        noteLetter = getNextNote(noteLetter);
        let note = noteLetter + octave;

        const scaleNotes = Scale.get(`${noteLetter} major`).notes;

        const oneFour = [0, 3][randomInt(2)];
        let chord = Chord.get(scaleNotes[oneFour]);
        let chordNotes = chord.notes.map((note) => `${note}${octave - 1}`);

        const playNote = randomInt(10) > 2;

        if (ticks % 8 === 0) {
          if (randomInt(10) > 2) {
            // sampler2.triggerAttackRelease(chordNotes, "1n", time);
            chordNotes.map((note, idx) =>
              sampler2.triggerAttackRelease(note, "1n", time + idx)
            );
          }
        } else {
          if (playNote && randomInt(10) > 8) {
            sampler2.triggerAttackRelease(chordNotes, "1n", time);
          }
        }

        if (playNote) {
          sampler.triggerAttackRelease(
            note,
            durations[randomInt(durations.length)],
            time
          );
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
    console.log(nextIndex, scale[nextIndex]);
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
