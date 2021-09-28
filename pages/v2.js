import react, { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import * as Tone from "tone";
import { Scale, Chord, Key } from "@tonaljs/tonal";
import { celloConfig, pianoConfig } from "../helpers/instruments";
import { xmur3, sfc32, mulberry32 } from "../helpers/random";
import { getCurrentChordProgression } from "../helpers/music-math";

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [seed, setSeed] = useState("apples");
  const [seedNum, setSeedNum] = useState(0);
  const [playingText, setPlayingText] = useState("");

  document.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) isPlaying ? pausePlayback() : startPlayback();
  });

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
    Tone.Transport.bpm.value = 20 + randomInt(20);

    let i = 0;
    new Tone.Loop((time) => {
      const res = getCurrentChordProgression(i, "16n", initialSeed);
      i++;
      console.log(res);
    }, "16n").start();
    // playCello();
    // playPiano();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
