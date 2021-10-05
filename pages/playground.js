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
import useWindowDimensions from "../helpers/window-dimensions";

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
  const [block, setBlock] = useState({
    height: 1,
    timestamp: new Date(),
    transactions: 50,
  });
  const [nextBlock, setNextBlock] = useState({
    height: 1,
    timestamp: new Date(new Date().getTime() + 30000),
    transactions: 200,
  });
  const [playingText, setPlayingText] = useState("");
  const [toneMeta, setToneMeta] = useState({ ticks: 0, time: Tone.Time() });
  const [keyLetter, setKeyLetter] = useState("C");

  const canvasHeight = 150;
  const [canvasWidth, setCanvasWidth] = useState(null);
  const { width } = useWindowDimensions();
  const rand = (seed) => mulberry32(xmur3(seed)());

  const keys = ["A", "B", "C", "D", "E", "F", "G"];

  const randomInt = (numOptions, randomNum) => {
    return Math.floor(randomNum * numOptions);
  };

  const secondsUntilNextBlock = (block1, block2) => {
    const diff = block2.timestamp.getTime() - block1.timestamp.getTime();
    return Math.abs(diff / 1000);
  };

  useEffect(() => {
    setTimeout(() => setBlock(nextBlock), 5000);
  }, [nextBlock]);

  useEffect(() => {
    setInterval(() => {
      setNextBlock((nb) => ({
        height: nb.height + 1,
        timestamp: new Date(new Date().getTime() + 30000),
        transactions: Math.floor(Math.random() * 100),
      }));
    }, 5000);
  }, []);

  useEffect(() => {
    // change key signature every 10,000 blocks
    // based on blockHeight

    const idx = Math.floor((block.height / 10000) % 7);
    setKeyLetter(keys[idx]);
  }, [block, keys]);

  useEffect(() => {
    // change tempo every block
    // based on # of transactions per block
    // assumes 500 transactions per block is "max"
    const maxTransactionsPerBlock = 500;

    const transactions = block.transactions;
    const scaleTransactions = Math.floor(
      (transactions / maxTransactionsPerBlock) * 100
    );
    const newBpm = 20 + scaleTransactions;

    // ramp to bpm, over X seconds
    const seconds = secondsUntilNextBlock(block, nextBlock);
    if (seconds > 10) Tone.Transport.bpm.rampTo(newBpm, 3);

    console.log(newBpm);
  }, [block]);

  useEffect(() => {
    // play music on every tick of the loop

    console.log(keyLetter, toneMeta);
  }, [toneMeta]);

  useEffect(() => {
    if (!isPlaying) return;

    const loop = new Tone.Loop((time) => {
      setToneMeta((tm) => ({ ticks: tm.ticks + 1, time: time }));
    }, "4n").start();

    return () => loop.stop();
  }, [isPlaying]);

  const startPlayback = () => {
    Tone.start();
    setIsPlaying(true);
    Tone.Transport.start();
    Tone.Transport.bpm.value = 60;
  };

  const pausePlayback = () => {
    Tone.Transport.stop();
    setIsPlaying(false);
  };

  return (
    <div className={{}}>
      <button
        onClick={pausePlayback}
        className={styles.button}
        style={{ opacity: isPlaying ? 1 : 0.2 }}
      >
        Stop
      </button>
      <button
        onClick={startPlayback}
        className={styles.button}
        style={{ opacity: isPlaying ? 0.2 : 1 }}
      >
        Play
      </button>
    </div>
  );
}
