import react, { useEffect, useState, useRef } from "react";
import Head from "next/head";
import Image from "next/image";
import * as Tone from "tone";
import { Scale, Chord, Key } from "@tonaljs/tonal";

import {
  setupInstrument,
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
import Block from "../components/Block";
import styles from "../styles/Home.module.css";

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

  /* music stuff */
  const [buffering, setBuffering] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [blockIdx, setBlockIdx] = useState(0);
  const [blocks, setBlocks] = useState([]);
  const [playingText, setPlayingText] = useState("");
  const [toneMeta, setToneMeta] = useState({ ticks: 0, time: Tone.Time() });
  const [key, setKey] = useState(null);
  const loop = useRef();
  const timeSignature = 4;

  /* drawing stuff */
  const canvasHeight = 150;
  const [canvasWidth, setCanvasWidth] = useState(null);
  const { width } = useWindowDimensions();

  /* random stuff */
  const rand = (seed) => mulberry32(xmur3(seed)());
  const randomInt = (numOptions, randomNum) => {
    return Math.floor(randomNum * numOptions);
  };

  /*                   Used for simulation                       */
  /***************************************************************/
  const fetchBlocks = async (bs) => {
    setTimeout(() => {
      const lastBlock = bs.slice(-1);
      const startNum = lastBlock.length > 0 ? lastBlock[0].height + 1 : 0;

      let newBlocks = [];
      for (var i = startNum; i < startNum + 8; i++) {
        newBlocks.push(getExampleBlock(i));
      }

      setBlocks((bss) => bss.concat(newBlocks));
    }, 1000);
  };

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => setBlockIdx((bi) => bi + 1), 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);
  /*                   Used for simulation                       */
  /***************************************************************/

  const bufferCheck = () => {
    // as the blockIdx moves, this checks to see if we are
    // > 50% along, so it can queue up the next few blocks
    // and handle the buffering state
    const blocksLength = blocks.length;
    const percentComplete = (blockIdx / blocksLength) * 100;

    const shouldBuffer = blocksLength === 0 || percentComplete > 100;
    const shouldPrefetch = percentComplete > 20;

    setBuffering(shouldBuffer);
    if (shouldBuffer || shouldPrefetch) fetchBlocks(blocks);
  };

  const keySignatureTransform = () => {
    // change key signature every 10,000 blocks
    // based on blockHeight
    if (buffering) return;

    const block = blocks[blockIdx];
    const idx = Math.floor((block.height / 10000) % 7);

    const keys = ["A", "B", "C", "D", "E", "F", "G"];
    const keyLetter = keys[idx];

    setKey(Key.majorKey(keyLetter));
  };

  const tempoTransform = () => {
    // change tempo every block
    // based on # of transactions per block
    if (buffering) return;

    const block = blocks[blockIdx];
    const nextBlock = blocks[blockIdx + 1];
    const seconds = secondsUntilNextBlock(block, nextBlock);

    if (seconds >= 10) {
      const newBpm = getBlockBpm(block, nextBlock);
      Tone.Transport.bpm.rampTo(newBpm, 3);
      console.log("changing BPM to", newBpm);
    }
  };

  const instrumentSetup = () => {
    Tone.start();

    const piano = setupInstrument(pianoConfig, -18, true, false);
    const violin = setupInstrument(violinConfig, -28, true, false);
    const cello = setupInstrument(celloConfig, -28, true, true);
    const drums = setupInstrument(drumConfig, -10, true, false);
    const wave = new Tone.Waveform();
    Tone.Master.connect(wave);

    Tone.loaded().then(() => {
      console.log("tones loaded");
    });
  };

  const setupToneLoop = () => {
    loop.current = new Tone.Loop((time) => {
      setToneMeta((tm) => ({ ticks: tm.ticks + 1, time: time }));
    }, "4n");
  };

  const playTick = () => {
    // play music on every tick of the loop
    console.log(key, toneMeta);
  };

  useEffect(instrumentSetup, []);
  useEffect(setupToneLoop, []);
  useEffect(bufferCheck, [blocks, blockIdx]);
  useEffect(keySignatureTransform, [blockIdx, blocks, buffering]);
  useEffect(tempoTransform, [blockIdx, blocks, buffering]);
  useEffect(
    playTick,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [toneMeta]
  );

  const play = () => {
    Tone.start();
    Tone.Transport.start();
    loop.current.start();

    setIsPlaying(true);
  };

  const pause = () => {
    Tone.Transport.stop();
    loop.current.stop();

    setIsPlaying(false);
  };

  if (buffering) return <div>Buffering...</div>;

  return (
    <div
      style={{
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
        paddingTop: 100,
      }}
    >
      <Block block={blocks[blockIdx]} key={blocks[blockIdx].height} />

      <div style={{ marginTop: 40 }}>
        <button
          onClick={pause}
          className={styles.button}
          style={{ opacity: isPlaying ? 1 : 0.2 }}
        >
          Stop
        </button>
        <button
          onClick={play}
          className={styles.button}
          style={{ opacity: isPlaying ? 0.2 : 1 }}
        >
          Play
        </button>
      </div>
    </div>
  );
}
