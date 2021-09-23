// https://tonejs.github.io/

import react, { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import * as Tone from "tone";
import { Scale, Chord, Key } from "@tonaljs/tonal";

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [seed, setSeed] = useState("apples");
  const [playingText, setPlayingText] = useState("");

  const seeder = xmur3(seed);
  const rand = sfc32(seeder(), seeder(), seeder(), seeder());

  const keyLetter = "D";
  const key = Key.majorKey(keyLetter);
  const octave = 4;
  const durations = ["4n", "8n", "16n"];
  const scale = key.scale;
  const chords = key.chords;
  console.log(key);

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

  const startPlayback = () => {
    Tone.start();

    if (isPlaying) return;
    setIsPlaying(true);

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
      wet: 0.3, // half dry, half wet mix
      decay: 30, // decay time in seconds
    });

    // setup the audio chain:
    // synth(s) -> mixer -> reverb -> Tone.Master
    sampler.connect(mixer);
    sampler2.connect(mixer);
    mixer.connect(reverb);
    reverb.toDestination();

    let prevNote;
    let chordIdx = 2;
    Tone.Transport.bpm.value = 60;

    Tone.loaded().then(() => {
      const loop = new Tone.Loop((time) => {
        const chord = Chord.get(chords[randomInt(chords.length)]);
        let chordNotes = chord.notes.map((note) => `${note}${octave - 1}`);

        let chordScales = Chord.chordScales(chord.name);
        // let chordScaleNotes = Scale.get(`${keyLetter} ${chordScales[0]}`)
        //     .notes;
        let chordScaleNotes = Scale.get(`${keyLetter} bebop major`).notes;
        let note;
        if (chordScaleNotes.length > 0) {
          note = chordScaleNotes[randomInt(chordScaleNotes.length)] + octave;
          console.log(note);
        }

        if (randomInt(10) > 6) {
          sampler2.triggerAttackRelease(chordNotes, "4n", time);
        }

        if (randomInt(10) > 2 && note) {
          sampler.triggerAttackRelease(
            note,
            durations[randomInt(durations.length)],
            time
          );
        }
        prevNote = note;
      }, "16n");

      loop.start();

      const wave = new Tone.Waveform();
      Tone.Transport.start();
    });
  };

  const randomInt = (max) => {
    const randomNum = rand();
    return Math.floor(randomNum * max);
  };

  const getNextChord = (currChordIdx) => {
    const chordOptions = chordRules[currChordIdx];
    const nextChordIdx = chordOptions[randomInt(chordOptions.length)];
    return nextChordIdx;
  };

  const getNote = () => {
    const randomNum = randomInt(scale.length);
    return scale[randomNum];
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
      <button onClick={pausePlayback}>Pause</button>
      <p />
      <p>Chords</p>
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
