import react, { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import * as Tone from "tone";
import { Scale, Chord, Key } from "@tonaljs/tonal";
import { celloConfig, pianoConfig } from "../helpers/instruments";
import { xmur3, sfc32 } from "../helpers/random";

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [seed, setSeed] = useState("doggy");
  const [playingText, setPlayingText] = useState("");

  const canvasWidth = 800,
    canvasHeight = 300;

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

  useEffect(() => {
    if (!isPlaying) return;
    Tone.start();
    Tone.Transport.cancel();
    Tone.Transport.bpm.value = 48 + randomInt(20);

    playCello();
    playPiano();
    playDrums();
  }, [isPlaying]);

  useEffect(() => {
    var ctx = document.createElement("canvas").getContext("2d"),
      dpr = window.devicePixelRatio || 1,
      bsr =
        ctx.webkitBackingStorePixelRatio ||
        ctx.mozBackingStorePixelRatio ||
        ctx.msBackingStorePixelRatio ||
        ctx.oBackingStorePixelRatio ||
        ctx.backingStorePixelRatio ||
        1;
    const ratio = dpr / bsr;
    const can = document.getElementById("canvas");
    can.width = canvasWidth * ratio;
    can.height = canvasHeight * ratio;
    can.style.width = canvasWidth + "px";
    can.style.height = canvasHeight + "px";
    can.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
  }, []);

  const playDrums = async () => {
    const drums = new Tone.Sampler({
      urls: {
        C4: "CYCdh_ElecK04-Snr03.wav",
        D4: "Abletunes FBD Taster - Bassdrum 02.wav",
        E4: "CYCdh_ElecK07-ClHat01.wav",
        F4: "Abletunes FBD Taster - Snares & Claps 05.wav",
        G4: "CYCdh_ElecK01-OpHat02.wav",
      },
      release: 1,
      baseUrl: "/drums/brian/",
    }).toDestination();
    const reverb = new Tone.Reverb({
      wet: 0.3,
      decay: 30,
    }).toDestination();
    drums.connect(reverb);
    drums.volume.value = -7;

    await Tone.loaded();
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
        drums.triggerAttackRelease("G4", "8n", time);
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

  const playCello = async () => {
    const cello = new Tone.Sampler(celloConfig).toDestination();
    const autoPanner = new Tone.AutoPanner("1n").toDestination().start();

    const reverb = new Tone.Reverb({
      wet: 0.3,
      decay: 30,
    }).toDestination();

    cello.volume.value = -20;
    cello.chain(autoPanner, reverb);

    let noteLetter;
    let octave = 4;
    let arping = true;
    let ticks = 0;

    await Tone.loaded();
    const loop = new Tone.Loop((time) => {
      ticks++;

      noteLetter = getNextNote(noteLetter);
      let note = noteLetter + octave;

      const oneFour = [0, 3][randomInt(2)];
      let chord = Chord.get(scale[oneFour]);
      let chordNotes = chord.notes;
      let chordNotesCello = chord.notes.map(
        (note) => `${note}${octave - randomInt(2)}`
      );
      const playNote = randomInt(10) > 2;

      if (ticks % 8 === 0) {
        // if (randomInt(10) > 4) {
        cello.triggerAttackRelease(chordNotesCello, "4n", time);
        // } else {
        //   cello.triggerAttackRelease(chordNotesCello[0], "16n", time);
        //   cello.triggerAttackRelease(
        //     chordNotesCello[1],
        //     "8n",
        //     time + Tone.Time("16n")
        //   );
        // }
      }
    }, "16n").start();
  };

  const playPiano = async () => {
    const piano = new Tone.Sampler(pianoConfig).toDestination();
    const reverb = new Tone.Reverb({
      wet: 0.3,
      decay: 30,
    }).toDestination();

    piano.volume.value = -10;
    piano.connect(reverb);

    let noteLetter;
    let octave = 4;
    let arping = true;
    let ticks = 0;

    const wave = new Tone.Waveform();
    Tone.Master.connect(wave);

    await Tone.loaded();
    const loop = new Tone.Loop((time) => {
      ticks++;

      noteLetter = getNextNote(noteLetter);
      let note = noteLetter + octave;

      Tone.Draw.schedule(
        () => drawWaveform(wave, canvasWidth, canvasHeight),
        time
      );

      const oneFour = [0, 3][randomInt(2)];
      let chord = Chord.get(scale[oneFour]);
      let chordNotes = chord.notes;
      let chordNotesPianoBass = chord.notes.map(
        (note) => `${note}${octave - 1}`
      );
      let chordNotesPiano = chord.notes.map((note) => `${note}${octave}`);

      const playNote = randomInt(10) > 2;

      if (ticks % 40 === 0) {
        arping = !arping;
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
    }, "16n").start();
  };

  const getNextNote = (currentNote) => {
    if (!currentNote) return keyLetter;

    const currentIndex = scale.indexOf(currentNote);
    const isPositive = randomInt(2) === 1;

    let nextIndex = currentIndex + randomInt(3) * (isPositive ? 1 : -1);

    if (nextIndex >= scale.length || nextIndex < 0) nextIndex = currentIndex;
    return scale[nextIndex];
  };

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
      {/*<div
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
      />*/}
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
