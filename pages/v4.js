import react, { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import * as Tone from "tone";
import { Scale, Chord, Key } from "@tonaljs/tonal";
import { celloConfig, pianoConfig } from "../helpers/instruments";
import { xmur3, sfc32, mulberry32, shuffle } from "../helpers/random";
import {
  getCurrentChordProgression,
  getAvailableNotes,
  notesWithOctave,
} from "../helpers/music-math";

export default function Music() {
  /* Rules for creating music
    - Each song has a set of chord progressions
    - A given measure is defined by its chord progression
    - A single chord in a progression can be a whole or half note duration
    - For the duration of that chord, there are a set of playable notes
    - Each instrument can play any of those notes with a select rhythm
    - We should limit the number of arpeggios played simultaneously, to avoid dissonance
    - Some measures could be silent for certain instruments
    - Certain rhythms can be favored by certain instruments / BPM

    ... turns out this sounded too mechanical
  */
  const [isPlaying, setIsPlaying] = useState(false);
  const [seed, setSeed] = useState("apples");
  const [playingText, setPlayingText] = useState("");

  const canvasWidth = 800,
    canvasHeight = 300;

  const seeder = xmur3(seed);
  const rand = mulberry32(seeder());
  const initialSeed = rand();

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

  useEffect(() => {
    if (!isPlaying) return;
    Tone.start();
    Tone.Transport.cancel();
    Tone.Transport.bpm.value = 80 + randomInt(20);

    const piano = setupInstrument(pianoConfig, -10, true);
    const wave = new Tone.Waveform();
    Tone.Master.connect(wave);

    Tone.loaded().then(() => {
      const duration = "4n";
      let ticks = 0;
      new Tone.Loop((time) => {
        Tone.Draw.schedule(
          () => drawWaveform(wave, canvasWidth, canvasHeight),
          time
        );

        const availableNotes = getAvailableNotes(
          key,
          ticks,
          duration,
          initialSeed
        );
        // playCello();
        playPianoBass(piano, availableNotes, time);
        playPianoLead(piano, availableNotes, time);
        ticks++;
      }, duration).start();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  const setupInstrument = (config, volume, enableReverb = true) => {
    const instrument = new Tone.Sampler(config).toDestination();
    instrument.volume.value = volume;

    if (enableReverb) {
      const reverb = new Tone.Reverb({
        wet: 0.3,
        decay: 30,
      }).toDestination();
      instrument.connect(reverb);
    }

    return instrument;
  };

  const playNotesWithRhythm = (instrument, notes, time, arp = false) => {
    if (arp) {
      const notesShuffled = shuffle(notes.slice(0, 3), randomInt(notes.length));

      notesShuffled.map((note, idx) => {
        const noteDuration = "16n";
        const timeOffset = idx === 0 ? 0 : idx * Tone.Time(noteDuration);
        // const playNote = randomInt(10) > 3;
        // if (playNote)
        instrument.triggerAttackRelease(note, "8n", time + timeOffset);
      });
    } else {
      // const playNote = randomInt(10) > 2;
      // if (playNote)
      instrument.triggerAttackRelease(notes.slice(0, 3), "1n", time); // slicing it, since the 7th can be dissonant
    }
  };

  const playPianoBass = (instrument, availableNotes, time) => {
    const octave = 3;
    const notes = notesWithOctave(availableNotes, octave);
    playNotesWithRhythm(instrument, notes, time, true);
  };

  const playPianoLead = (instrument, availableNotes, time) => {
    const octave = 4;
    const notes = notesWithOctave(availableNotes, octave);
    playNotesWithRhythm(instrument, notes, time, false);
  };

  useEffect(() => {
    document.addEventListener("keyup", function (event) {
      if (event.keyCode === 13) isPlaying ? pausePlayback() : startPlayback();
    });
  }, [isPlaying]);

  const startPlayback = () => {
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
      <canvas
        id="canvas"
        width={canvasWidth}
        height={canvasHeight}
        style={{ backgroundColor: "black", borderRadius: 20 }}
      ></canvas>
    </div>
  );
}

function drawWaveform(wave, w, h) {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  let buffer = wave.getValue(0);

  let start = 0;
  for (let i = 1; i < buffer.length; i++) {
    if (buffer[i - 1] < 0 && buffer[i] >= 0) {
      start = i;
      break;
    }
  }

  let end = start + buffer.length / 2;

  const color = randomColor();
  for (let i = start; i < end; i++) {
    let x1 = map(i - 1, start, end, 0, w);
    let y1 = map(buffer[i - 1], -1, 1, 0, h);
    let x2 = map(i, start, end, 0, w);
    let y2 = map(buffer[i], -1, 1, 0, h);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = color;
    ctx.stroke();
  }
}

function map(n, start1, stop1, start2, stop2, withinBounds) {
  const newval = ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
  if (!withinBounds) {
    return newval;
  }
  if (start2 < stop2) {
    return constrain(newval, start2, stop2);
  } else {
    return constrain(newval, stop2, start2);
  }
}

function constrain(n, low, high) {
  return Math.max(Math.min(n, high), low);
}

const randomColor = () =>
  `#${Math.floor(Math.random() * 16777215).toString(16)}`;
