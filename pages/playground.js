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
import {
  getExampleBlock,
  secondsUntilNextBlock,
  getBlockBpm,
} from "../helpers/blocks";
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
  const [blockIdx, setBlockIdx] = useState(0);
  const [blocks, setBlocks] = useState([]);
  const [playingText, setPlayingText] = useState("");
  const [toneMeta, setToneMeta] = useState({ ticks: 0, time: Tone.Time() });
  const [key, setKey] = useState(null);

  const canvasHeight = 150;
  const [canvasWidth, setCanvasWidth] = useState(null);
  const { width } = useWindowDimensions();
  const rand = (seed) => mulberry32(xmur3(seed)());

  const randomInt = (numOptions, randomNum) => {
    return Math.floor(randomNum * numOptions);
  };

  /*                   Used for simulation                       */
  /***************************************************************/
  const fetchBlocks = async () => {
    const newBlocks = Array(10).fill(getExampleBlock());
    setBlocks((blocks) => blocks.concat(newBlocks));
    console.log("fetching blocks");
  };

  useEffect(() => {
    setInterval(() => setBlockIdx((bi) => bi + 1), 5000);
  }, []);
  /*                   Used for simulation                       */
  /***************************************************************/

  useEffect(() => {
    const blocksLength = blocks.length;
    const percentComplete = (blockIdx / blocksLength) * 100;

    if (percentComplete > 50) fetchBlocks();
    console.log("block idx", blockIdx, blocks);
  }, [blocks, blockIdx]);

  useEffect(() => {
    // change key signature every 10,000 blocks
    // based on blockHeight
    if (blocks.length === 0) return;

    const block = blocks[blockIdx];

    const idx = Math.floor((block.height / 10000) % 7);

    const keys = ["A", "B", "C", "D", "E", "F", "G"];
    const keyLetter = keys[idx];

    setKey(Key.majorKey(keyLetter));
  }, [blockIdx]);

  useEffect(() => {
    // change tempo every block
    // based on # of transactions per block
    if (blocks.length === 0) return;

    const block = blocks[blockIdx];
    const nextBlock = blocks[blockIdx + 1];
    const seconds = secondsUntilNextBlock(block, nextBlock);

    if (seconds >= 10) {
      const newBpm = getBlockBpm(block, nextBlock);
      console.log("changing BPM to", newBpm);
      Tone.Transport.bpm.rampTo(newBpm, 3);
    }
  }, [blockIdx]);

  useEffect(() => {
    // play music on every tick of the loop
    console.log(key, toneMeta);
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
    // Tone.Transport.bpm.value = getBlockBpm(blockId, nextBlock);
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
