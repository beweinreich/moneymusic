import react, { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import * as Tone from "tone";
import { Scale, Chord, Key, note } from "@tonaljs/tonal";

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
  const scaleNum = [null].concat(key.scale);
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
    synthBass.harmonicity.value = 1;
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
    polySynth.volume.value = -26;
    piano.volume.value = -10;
    drums.volume.value = -10;
    synthBass.volume.value = -18;

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
      startLead();
      startDrums();
      startBass();
      startTwinkle();
      startSynth();
    });
  }, [isPlaying]);

  const startTwinkle = () => {
    const autoPanner = new Tone.AutoPanner("4n").toDestination().start();
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
    synthC.volume.value = -32;
    synthC.connect(autoPanner);

    let octave = 6;
    let idx = 0;
    let measure = 0;
    new Tone.Loop((time) => {
      let noteLetters = getNextNoteLetterAlt(measure);
      const note1 = getNote(noteLetters[0], octave);
      const note2 = getNote(noteLetters[1], octave);
      if (idx % 2 === 0) {
        synthC.triggerAttackRelease(note2, "8n", time);
      } else {
        synthC.triggerAttackRelease(note1, "8n", time);
      }
      idx++;
      if (idx % 8 === 0) measure++;
    }, "8n").start();
  };

  const startBass = () => {
    let noteLetter;
    let octave = 2;

    let idx = 0;
    let measure = 0;
    new Tone.Loop((time) => {
      noteLetter = getNextNoteLetter(measure);
      const note1 = getNote(noteLetter, octave);
      synthBass.triggerAttackRelease(note1, "10n", time);
      idx++;
      if (idx % 8 === 0) measure++;
    }, "8n").start();
  };

  const startSynth = () => {
    let noteLetter;
    let octave = 4;

    let idx = 0;
    let measure = 0;
    new Tone.Loop((time) => {
      noteLetter = getNextNoteLetter(measure);
      let harmonyNotes = getNextHarmonyNotes(measure).map(
        (note) => `${note}${octave}`
      );
      const note1 = getNote(noteLetter, octave - 1);

      const keyNote = getNote(keyLetter, 3);
      const notes = [note1].concat(harmonyNotes);

      polySynth.triggerAttackRelease(notes, "10n", time);
      idx++;
      if (idx % 8 === 0) measure++;
    }, "8n").start();
  };

  const getNextNoteLetter = (
    currentIndex,
    progression = ["C", "G", "F", "G"]
  ) => {
    const nextIndex = currentIndex % 4;
    const noteLetter = progression[nextIndex];
    return noteLetter;
  };

  const getNextNoteLetterAlt = (
    currentIndex,
    progression = [
      ["C", "E"],
      ["G", "B"],
      ["F", "A"],
      ["G", "B"],
    ]
  ) => {
    const nextIndex = currentIndex % 4;
    const noteLetter = progression[nextIndex];
    return noteLetter;
  };

  const getNextHarmonyNotes = (
    currentIndex,
    progression = ["Cmaj7", "Gmaj7", "Fmaj7", "Gmaj7"]
  ) => {
    const nextIndex = currentIndex % 4;
    const chord = Chord.get(progression[nextIndex]);
    return chord.notes;
  };

  const startLead = () => {
    // const chorus = new Tone.Chorus(4, 2.5, 0.5).toDestination().start();
    const synthC = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: "fatsawtooth",
        count: 3,
        spread: 30,
      },
      envelope: {
        attack: 0.31, // 0.01
        decay: 0.1,
        sustain: 0.5,
        release: 0.4,
        attackCurve: "exponential",
      },
    }).toDestination();
    synthC.volume.value = -15;
    // synthC.connect(chorus);

    let i = 0;
    let octave = 4;
    new Tone.Loop((time) => {
      const chordName = getNextChord(i);
      const chord = Chord.get(chordName);
      // const octaveAlt = octave + randomInt(2) * (randomInt(2) === 1 ? -1 : 1);
      const chordNotes = chord.notes.map((note, idx) => {
        const octaveAlt = idx < 3 ? octave : octave + 1;
        return `${note}${octaveAlt}`;
      });
      if (i % 4 && randomInt(10) > 2) {
        synthC.triggerAttackRelease(chordNotes, "16n", time);
      }
      i++;
    }, "16n").start();
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
      if (!(hihatTicks % 2 === 0)) {
        drums.triggerAttackRelease("E4", "8n", time);
      }
      hihatTicks++;
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

  const chordProgressions = [[chords[0], chords[4], chords[3], chords[4]]];

  const getNextChord = (currentIndex) => {
    const nextIndex = currentIndex % 4;
    const nextChord = chordProgressions[0][nextIndex];
    return nextChord;
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
