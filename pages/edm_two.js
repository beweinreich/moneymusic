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

  let piano, drums, polySynth, fatOsc, autoWah, synthA, synthB, synthBass;

  useEffect(() => {
    if (!isPlaying) return;
    Tone.Transport.cancel();

    Tone.start();

    piano = new Tone.Sampler({
      urls: {
        C4: "C4.mp3",
        "D#4": "Ds4.mp3",
        "F#4": "Fs4.mp3",
        A4: "A4.mp3",
      },
      release: 1,
      baseUrl: "https://tonejs.github.io/audio/salamander/",
    }).toDestination();

    // drums = new Tone.Sampler({
    //   urls: {
    //     C4: "CYCdh_ElecK01-Snr02.wav",
    //     D4: "CYCdh_ElecK01-Kick02.wav",
    //     E4: "CYCdh_ElecK01-ClHat02.wav",
    //   },
    //   release: 1,
    //   baseUrl: "/drums/kit4_electro/",
    // }).toDestination();

    drums = new Tone.Sampler({
      urls: {
        C4: "CYCdh_ElecK04-Snr03.wav",
        D4: "Abletunes FBD Taster - Bassdrum 02.wav",
        E4: "CYCdh_ElecK07-ClHat01.wav",
        F4: "Abletunes FBD Taster - Snares & Claps 05.wav",
      },
      release: 1,
      baseUrl: "/drums/brian/",
    }).toDestination();

    fatOsc = new Tone.FatOscillator().toDestination();

    polySynth = new Tone.PolySynth().toDestination();

    synthBass = new Tone.DuoSynth().toDestination();
    synthBass.vibratoAmount.value = 0.1;
    synthBass.harmonicity.value = 1.5;
    synthBass.voice0.oscillator.type = "triangle";
    synthBass.voice0.envelope.attack = 0.05;
    synthBass.voice1.oscillator.type = "triangle";
    synthBass.voice1.envelope.attack = 0.05;

    synthA = new Tone.Synth({
      oscillator: {
        type: "fmsquare",
        modulationType: "sawtooth",
        modulationIndex: 14,
        harmonicity: 3.4,
      },
      envelope: {
        attack: 0.041,
        decay: 0.1,
        sustain: 0.1,
        release: 0.1,
      },
    }).toDestination();

    synthB = new Tone.Synth({
      oscillator: {
        type: "triangle8",
      },
      envelope: {
        attack: 2,
        decay: 1,
        sustain: 0.4,
        release: 4,
      },
    }).toDestination();

    synthA.volume.value = -14;
    fatOsc.volume.value = -10;
    polySynth.volume.value = -12;
    piano.volume.value = -10;
    drums.volume.value = -1;
    synthBass.volume.value = -15;
    const mixer = new Tone.Gain();
    const reverb = new Tone.Reverb({
      wet: 0.3,
      decay: 30,
    });

    autoWah = new Tone.AutoWah(50, 6, -30).toDestination();

    // setup the audio chain:
    // synth(s) -> mixer -> reverb -> Tone.Master
    polySynth.connect(autoWah);
    polySynth.connect(reverb);
    piano.connect(mixer);
    mixer.connect(reverb);
    reverb.toDestination();

    Tone.Transport.bpm.value = 120;

    /*****************************************************START*********************************************/
    Tone.loaded().then(() => {
      const synthC = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
          type: "fatsawtooth",
          count: 3,
          spread: 30,
        },
        envelope: {
          attack: 0.01,
          decay: 0.1,
          sustain: 0.5,
          release: 0.4,
          attackCurve: "exponential",
        },
      }).toDestination();

      synthC.triggerAttackRelease(["G4", "B5", "D4"], "4n");

      // startDrums();
      // startPiano();
      // startSynth();
    });
  }, [isPlaying]);

  // const startSynth = () => {
  //   let noteLetter;
  //   let octave = 4;

  //   new Tone.Loop((time) => {
  //     autoWah.Q.value = Math.random() * 10;

  //     noteLetter = getNextNoteLetter(noteLetter);
  //     const note = getNote(noteLetter, octave);
  //     // if (!(hihatTicks % 2)) {
  //     synth.triggerAttackRelease(note, "16n", time);
  //     // }
  //     // hihatTicks++;
  //   }, "16n").start();
  // };

  const startSynth = () => {
    let noteLetter;
    let octave = 2;

    let idx = 0;
    new Tone.Loop((time) => {
      noteLetter = getNextNoteLetter(idx);
      const note = getNote(noteLetter, octave);
      synthBass.triggerAttackRelease(note, "1n", time);

      // }
      // hihatTicks++;
      idx++;
    }, "1n").start();
  };

  const startDrums = () => {
    // triggered every quarter note.
    let kickTicks = 0;
    const kickLoop = new Tone.Loop((time) => {
      // if (!(kickTicks % 2)) {
      drums.triggerAttackRelease("D4", "8n", time);
      // }
      kickTicks++;
    }, "4n").start();

    let hihatTicks = 0;
    const hihatLoop = new Tone.Loop((time) => {
      // if (!(hihatTicks % 2)) {
      drums.triggerAttackRelease("E4", "8n", time);
      // }
      hihatTicks++;
      // }, "8n").start("8n");
    }, "8n").start();

    // triggered every quarter note.
    let snareTicks = 0;
    const snareLoop = new Tone.Loop((time) => {
      if (snareTicks % 2) {
        drums.triggerAttackRelease("F4", "8n", time);
      }
      snareTicks++;
    }, "4n").start();
  };

  const startPiano = () => {
    let noteLetter;
    let octave = 4;
    let rolling = false;
    let ticks = 0;

    const phaser = new Tone.Phaser({
      frequency: 15,
      octaves: 5,
      baseFrequency: 1000,
    }).toDestination();
    polySynth.connect(phaser);

    new Tone.Loop((time) => {
      ticks++;

      noteLetter = getNextRandomNoteLetter(noteLetter);
      const note = getNote(noteLetter, octave);

      const scaleNotes = Scale.get(`${noteLetter} major`).notes;

      const oneFour = [0, 3][randomInt(2)];
      let chord = Chord.get(scaleNotes[oneFour]);
      let chordNotes = chord.notes.map((note) => `${note}${octave - 1}`);

      const playNote = randomInt(10) > 2;

      if (ticks % 40 === 0) {
        rolling = !rolling;
      }

      // if (rolling) {
      //   // some rolling on the chords
      //   if (ticks % 4 === 0) {
      //     chordNotes.map((note, idx) => {
      //       const timeOffset = idx === 0 ? 0 : Tone.Time(`${idx * 16}n`);
      //       polySynth.triggerAttackRelease(note, "4n", time + timeOffset);
      //     });
      //   }
      // }
      // } else {
      //   // chords together
      //   if (ticks % 8 === 0) {
      //     if (randomInt(10) > 2) {
      //       polySynth.triggerAttackRelease(chordNotes, "1n", time);
      //     }
      //   } else {
      //     if (playNote && randomInt(10) > 8) {
      //       polySynth.triggerAttackRelease(chordNotes, "1n", time);
      //     }
      //   }
      // }

      // if (rolling) {

      if (ticks % 4 && playNote) {
        synthA.triggerAttackRelease(note, "8n", time);
        synthB.triggerAttackRelease(note, "8n", time);
      }
      // } else {
      //   if (playNote) {
      //     polySynth.triggerAttackRelease(
      //       note,
      //       durations[randomInt(durations.length)],
      //       time
      //     );
      //   }
      // }
    }, "8n").start();
  };

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

  const getNextRandomNoteLetter = (currentNote) => {
    if (!currentNote) return keyLetter;

    const currentIndex = scale.indexOf(currentNote);
    const isPositive = randomInt(2) === 1;

    let nextIndex = currentIndex + randomInt(3) * (isPositive ? 1 : -1);

    if (nextIndex >= scale.length || nextIndex < 0) nextIndex = currentIndex;
    const noteLetter = scale[nextIndex];

    return noteLetter;
  };

  const getNextNoteLetter = (
    currentIndex,
    progression = ["C", "G", "F", "G"]
  ) => {
    const nextIndex = currentIndex % 4;
    const noteLetter = progression[nextIndex];
    return noteLetter;
  };

  const getNote = (noteLetter, octave) => {
    return `${noteLetter}${octave}`;
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
      <p>EDM in the key of {keyLetter}</p>
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
