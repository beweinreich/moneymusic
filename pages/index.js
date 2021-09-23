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

  const durations = [0.25, 0.5, 0.5, 1, 1, 2];
  const notes = ["A4", "B4", "C4", "D4", "E4", "F4", "G4"];
  const noteArpeggios = [
    ["C2", "D#2", "G2", "C3", "G2", "D#2"],
    ["B1", "D2", "G2", "B2", "G2", "D2"],
    ["A#1", "D2", "F2", "A#2", "F2", "D2"],
    ["A1", "C2", "F2", "A2", "F2", "C2"],
    ["G#1", "C2", "D#2", "G#2", "D#2", "C2"],
    ["G1", "C2", "D#2", "G2", "D#2", "C2"],
    ["F#1", "C2", "D#2", "F#2", "D#2", "C2"],
    ["G1", "C2", "D2", "G2", "D2", "B1"],
  ];

  const chords = [
    [],
    ["C3", "E3", "G3"],
    ["D3", "F3", "A3"],
    ["E3", "G3", "B3"],
    ["F3", "A3", "C3"],
    ["G3", "B3", "D3"],
    ["A3", "C3", "E3"],
    ["B3", "D3", "F3"],
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

  // instruments
  // const synth = new Tone.PolySynth(Tone.Synth).toDestination();
  // use sampler below to use diff instruments
  // https://github.com/nbrosowsky/tonejs-instruments/tree/master/samples

  const startPlayback = () => {
    Tone.start();
    Tone.reverb(10);

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

    Tone.loaded().then(() => {
      const now = Tone.now();
      // const distortion = new Tone.Distortion(0.4).toDestination();
      // sampler.connect(distortion);

      // for (let i = 0; i < 10; i++) {
      //   const noteIdx = getDeterminedInt(noteArpeggios.length);
      //   const randomArpeggio = noteArpeggios[noteIdx];
      //   for (let z = 0; z < randomArpeggio.length; z++) {
      //     console.log(randomArpeggio[z], now + (i * 10 + z) * 0.25);
      //     sampler.triggerAttackRelease(
      //       randomArpeggio[z],
      //       0.5,
      //       now + (i * 10 + z) * 0.25
      //     );
      //   }
      // }

      let when = now;
      let duration = durations[getDeterminedInt(durations.length)];
      let chordIdx = 2;

      let chordText = "";
      for (let i = 0; i < 10; i++) {
        chordIdx = getNextChord(chordIdx);
        duration = durations[getDeterminedInt(durations.length)];
        const nextChord = chords[chordIdx];
        sampler.triggerAttackRelease(nextChord, duration, when);
        console.log(chords[chordIdx], duration, when);
        when = when + duration;

        chordText += `<p>${nextChord.join(",")}</p>`;
      }

      setChordProgression(chordText);
    });
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
