import react, { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import * as Tone from "tone";
import { Scale, Chord, Key } from "@tonaljs/tonal";
import {
  celloConfig,
  pianoConfig,
  drumConfig,
  violinConfig,
} from "../helpers/instruments";
import { xmur3, sfc32, mulberry32, shuffle } from "../helpers/random";
import {
  getCurrentChordProgression,
  getAvailableNotes,
  notesWithOctave,
  noteSpace,
} from "../helpers/music-math";
import { melodies, arpeggio } from "../helpers/melodies";
import { drawWaveform, clearCanvas } from "../helpers/draw";
import { rhythms } from "../helpers/rhythms";

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
  */
  const [isPlaying, setIsPlaying] = useState(false);
  const [seed, setSeed] = useState("bcadewo");
  const [playingText, setPlayingText] = useState("");

  const canvasWidth = 800,
    canvasHeight = 300;

  const seeder = xmur3(seed);
  const rand = mulberry32(seeder());
  const initialSeed = rand();

  const randomInt = (numOptions) => {
    const randomNum = rand();
    return Math.floor(randomNum * numOptions);
  };

  const keys = ["A", "B", "C", "D", "E", "F", "G"];
  const keyLetter = keys[randomInt(keys.length)];
  const key = Key.majorKey(keyLetter);
  const timeSignature = 4; //[3, 4][randomInt(2)];

  useEffect(() => {
    if (!isPlaying) return;
    Tone.start();
    Tone.Transport.cancel();
    Tone.Transport.bpm.value = (timeSignature === 3 ? 10 : 30) + randomInt(40); // should be slower for 3/4 time

    const piano = setupInstrument(pianoConfig, -18, true, false);
    const violin = setupInstrument(violinConfig, -28, true, false);
    const cello = setupInstrument(celloConfig, -28, true, true);
    const drums = setupInstrument(drumConfig, -10, true, false);
    const wave = new Tone.Waveform();
    Tone.Master.connect(wave);

    Tone.loaded().then(() => {
      const duration = `${timeSignature}n`;
      let rhythm = rhythms[randomInt(rhythms.length)];
      let ticks = 0;
      new Tone.Loop((time) => {
        Tone.Draw.schedule(
          () => drawWaveform(wave, canvasWidth, canvasHeight),
          time
        );

        if (ticks % (timeSignature * 8) === 0)
          rhythm = rhythms[randomInt(rhythms.length)];

        const availableNotes = getAvailableNotes(
          key,
          ticks,
          duration,
          initialSeed
        );

        // playDrums(drums, time);
        playInstrument(cello, availableNotes, time, rhythm.cello);
        playInstrument(piano, availableNotes, time, rhythm.pianoBass);
        playInstrument(piano, availableNotes, time, rhythm.pianoLead);
        playInstrument(violin, availableNotes, time, rhythm.violin);
        ticks++;
      }, "4n").start();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  const setupInstrument = (
    config,
    volume,
    enableReverb = true,
    enablePanner = false
  ) => {
    const instrument = new Tone.Sampler(config).toDestination();
    instrument.volume.value = volume;

    if (enableReverb) {
      const reverb = new Tone.Reverb({
        wet: 0.3,
        decay: 30,
      }).toDestination();
      instrument.connect(reverb);
    }

    if (enablePanner) {
      const autoPanner = new Tone.AutoPanner("1n").toDestination().start();
      instrument.connect(autoPanner);
    }

    return instrument;
  };

  const playNotesWithRhythm = (
    instrument,
    notes,
    time,
    extra = {
      arp: false,
      arpSteady: false,
      arp4: false,
      shuffle: false,
      slice7: true,
      noteDuration: "4n",
    }
  ) => {
    if (extra.slice7) notes = notes.slice(0, 3);
    if (extra.shuffle) notes = shuffle(notes, randomInt(notes.length));

    if (extra.arp) {
      arpeggio(
        instrument,
        notes,
        time,
        randomInt,
        timeSignature,
        extra.noteDuration,
        extra.arp4,
        extra.arpSteady,
        key
      );
    } else {
      const melodyNum = randomInt(melodies.length);
      melodies[melodyNum](
        instrument,
        notes,
        time,
        randomInt,
        timeSignature,
        extra.noteDuration
      );
    }
  };

  const playInstrument = (instrument, availableNotes, time, rhythm) => {
    if (rhythm.silent) return;

    const octave = rhythm.octave;
    const notes = notesWithOctave(key, availableNotes, octave);
    playNotesWithRhythm(instrument, notes, time, rhythm);
  };

  const playDrums = (instrument, time) => {
    instrument.triggerAttackRelease("D4", "4n", time);
  };

  useEffect(() => {
    document.addEventListener("keyup", function (event) {
      if (event.keyCode === 13) isPlaying ? pausePlayback() : startPlayback();
    });
  }, [isPlaying]);

  const startPlayback = () => {
    if (isPlaying) {
      pausePlayback();
      clearCanvas(canvasWidth, canvasHeight);
      setTimeout(() => {
        setIsPlaying(true);
        Tone.Transport.start();
      }, 1000);
      return;
    }

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
      <p>
        In the key of {keyLetter}. Time signature: {timeSignature}/4
      </p>
      <canvas
        id="canvas"
        width={canvasWidth}
        height={canvasHeight}
        style={{ backgroundColor: "black", borderRadius: 20 }}
      ></canvas>
    </div>
  );
}
