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
  const [isPlaying, setIsPlaying] = useState(false);
  const [seed, setSeed] = useState("apples");
  const [chordProgression, setChordProgression] = useState("");

  const seeder = xmur3(seed);
  const rand = sfc32(seeder(), seeder(), seeder(), seeder());

  useEffect(() => {
    // startPlayback();
  }, []);

  const durations = ["4n", "8n", "16n"];
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
        // let n = noise(frameCount * 0.1);
        // let i = floor(map(n, 0, 1, 0, scale.length)); // floor rounds down

        chordIdx = getNextChord(chordIdx);
        const nextChord = chords[chordIdx];

        let note = notes[randomInt(notes.length)];
        let note2 = nextChord;

        if (randomInt(10) > 6) {
          sampler2.triggerAttackRelease(note2, "4n", time);
        }

        if (randomInt(10) > 2) {
          sampler.triggerAttackRelease(
            note,
            durations[randomInt(durations.length)],
            time
          );
        }
        prevNote = note;
      }, "16n"); // '16n' here sets the speed of our loop -- every 16th note
      // Start the loop
      loop.start();

      const wave = new Tone.Waveform();
      // Tone.Master.connect(wave);

      // Tone.Master.volume.value = 0.1;
      Tone.Transport.start();

      // const distortion = new Tone.Distortion(0.4).toDestination();
      // sampler.connect(distortion);

      // for (let i = 0; i < 10; i++) {
      //   const noteIdx = randomInt(noteArpeggios.length);
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

      // const now = Tone.now();
      // let when = now;
      // let duration = durations[randomInt(durations.length)];
      let chordIdx = 2;

      // let chordText = "";
      // for (let i = 0; i < 100; i++) {
      chordIdx = getNextChord(chordIdx);
      //   duration = durations[randomInt(durations.length)];
      //   const nextChord = chords[chordIdx];
      //   sampler.triggerAttackRelease(nextChord, duration, when);
      //   console.log(chords[chordIdx], duration, when);
      //   when = when + duration;

      //   chordText += `<p>${nextChord.join(",")}</p>`;
      // }

      // setChordProgression(chordText);
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
    const randomNum = randomInt(notes.length);
    return notes[randomNum];
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
