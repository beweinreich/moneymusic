// https://tonejs.github.io/

import react, { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import * as Tone from "tone";

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

export default function Home() {
  const [seed, setSeed] = useState("apples");
  const [chordProgression, setChordProgression] = useState("");

  const seeder = xmur3(seed);
  const rand = sfc32(seeder(), seeder(), seeder(), seeder());

  useEffect(() => {
    // startPlayback();
  }, []);

  const durations = [0.25, 0.5, 1];
  const notes = ["A4", "B4", "C4", "D4", "E4", "F4", "G4"];
  const chords = [
    [],
    ["C4", "E4", "G4"],
    ["D4", "F4", "A4"],
    ["E4", "G4", "B4"],
    ["F4", "A4", "C4"],
    ["G4", "B4", "D4"],
    ["A4", "C4", "E4"],
    ["B4", "D4", "F4"],
  ];
  const chordRules = {
    1: [1, 2, 3, 4, 5, 6, 7],
    2: [5, 7],
    3: [4, 6],
    4: [2, 5, 7],
    5: [6],
    6: [2, 3, 4, 5],
    7: [1],
  };

  const startPlayback = () => {
    Tone.start();

    const now = Tone.now();
    const synth = new Tone.PolySynth(Tone.Synth).toDestination();

    let when = now;
    let duration = durations[getDeterminedInt(durations.length)];
    let chordIdx = 2;

    let chordText = "";
    for (let i = 0; i < 50; i++) {
      chordIdx = getNextChord(chordIdx);
      duration = durations[getDeterminedInt(durations.length)];
      const nextChord = chords[chordIdx];
      synth.triggerAttackRelease(nextChord, duration, when);
      console.log(chords[chordIdx], duration, when);
      when = when + duration;

      chordText += `<p>${nextChord.join(",")}</p>`;
    }

    setChordProgression(chordText);
  };

  const getDeterminedInt = (max) => {
    const randomNum = rand();
    return Math.floor(randomNum * max);
  };

  const getNextChord = (currChordIdx) => {
    const chordOptions = chordRules[currChordIdx];
    const nextChordIdx = chordOptions[getDeterminedInt(chordOptions.length)];
    return nextChordIdx;
  };

  const getNote = () => {
    const randomNum = getDeterminedInt(notes.length);
    return notes[randomNum];
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
      <p />
      <p>Chords</p>
      <div
        dangerouslySetInnerHTML={{ __html: chordProgression }}
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
