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
import BlockEmpty from "../components/BlockEmpty";
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

  /* block stuff */
  const [fetchingBlocks, setFetchingBlocks] = useState(false);
  const [blockIdx, setBlockIdx] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [blockTime, setBlockTime] = useState(null);

  /* music stuff */
  const [instrumentsLoaded, setInstrumentsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [ticks, setTicks] = useState(0);
  const [time, setTime] = useState(Tone.Time());

  const [key, setKey] = useState(null);
  const [bpm, setBpm] = useState(null);
  const timeSignature = 4;

  const loop = useRef();
  const piano = useRef();
  const violin = useRef();
  const cello = useRef();
  const drums = useRef();

  /* drawing stuff */
  const canvasHeight = 150;
  const [canvasWidth, setCanvasWidth] = useState(null);
  const { width } = useWindowDimensions();

  /* random stuff */
  const rand = (seed) => mulberry32(xmur3(seed)());
  const getRandomInt = (numOptions, seed) => {
    return Math.floor(seed * numOptions);
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
    const queryParam = parseInt(window.location.search.slice(-1)) || 1;
    setBlockIdx(queryParam);
  }, []);

  /*                   Used for simulation                       */
  /***************************************************************/

  const updateBlockTime = () => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setBlockTime((bt) => new Date(bt.getTime() + 1000));
    }, 1000);

    return () => clearInterval(interval);
  };

  const scheduleBlockChange = () => {
    if (!isPlaying) return;

    const nextBlock = blocks[blockIdx + 1];
    const seconds = secondsUntilNextBlock(nextBlock, blockTime);
    if (seconds <= 0) setBlockIdx((bi) => parseInt(bi) + 1);
  };

  const bufferCheck = () => {
    // as the blockIdx moves, this checks to see if we are
    // > 50% along, so it can queue up the next few blocks
    // and handle the buffering state
    const blocksLength = blocks.length;
    const percentComplete = (blockIdx / blocksLength) * 100;

    const shouldBuffer =
      blocksLength === 0 || percentComplete > 100 || !blockIdx;
    const shouldPrefetch = percentComplete > 20;

    setFetchingBlocks(shouldBuffer);
    if (shouldBuffer || shouldPrefetch) fetchBlocks(blocks);
  };

  const keySignatureTransform = () => {
    // change key signature every 10,000 blocks
    // based on blockHeight
    if (!instrumentsLoaded) return;

    const block = blocks[blockIdx];
    if (!block) return;

    const idx = Math.floor((block.height / 10000) % 7);
    const keys = ["A", "B", "C", "D", "E", "F", "G"];
    const keyLetter = keys[idx];

    setKey(Key.majorKey(keyLetter));
  };

  const tempoTransform = () => {
    // change tempo every block
    // based on # of transactions per block
    if (!instrumentsLoaded || !isPlaying) return;

    const nextBlock = blocks[blockIdx + 1];
    if (!nextBlock) return;

    const seconds = secondsUntilNextBlock(nextBlock, blockTime);
    if (seconds >= 10) {
      // if the next block is > 10s away
      // we have time to ramp to the current blocks BPM
      const block = blocks[blockIdx];
      const newBpm = getBlockBpm(block);
      const rampDuration = 3;

      setBpm(newBpm);
      Tone.Transport.bpm.rampTo(newBpm, rampDuration);
    }
  };

  const ticksReset = () => {
    // reset the ticks every time a new block is introduced
    setTicks(0);
  };

  const instrumentSetup = () => {
    Tone.start();

    piano.current = setupInstrument(pianoConfig, -18, true, false);
    violin.current = setupInstrument(violinConfig, -28, true, false);
    cello.current = setupInstrument(celloConfig, -28, true, true);
    drums.current = setupInstrument(drumConfig, -10, true, false);
    const wave = new Tone.Waveform();
    Tone.Master.connect(wave);

    Tone.loaded().then(() => setInstrumentsLoaded(true));
  };

  const setupToneLoop = () => {
    loop.current = new Tone.Loop((time) => {
      setTicks((t) => t + 1);
      setTime(time);
    }, "4n");
  };

  const playNotesWithRhythm = (
    instrument,
    notes,
    time,
    seed,
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
    if (extra.shuffle) notes = shuffle(notes, getRandomInt(notes.length, seed));

    if (extra.arp) {
      arpeggio(
        instrument,
        notes,
        time,
        getRandomInt,
        seed,
        timeSignature,
        extra.noteDuration,
        extra.arp4,
        extra.arpSteady,
        key
      );
    } else {
      const melodyNum = getRandomInt(melodies.length, seed);
      melodies[melodyNum](
        instrument,
        notes,
        time,
        getRandomInt,
        seed,
        timeSignature,
        extra.noteDuration
      );
    }
  };

  const playInstrument = (instrument, availableNotes, time, seed, rhythm) => {
    if (rhythm.silent) return;

    const octave = rhythm.octave;
    const notes = notesWithOctave(key, availableNotes, octave);
    playNotesWithRhythm(instrument, notes, time, seed, rhythm);
  };

  const playTick = () => {
    // play music on every tick of the loop
    if (!instrumentsLoaded) return;

    const block = blocks[blockIdx];
    if (!block) return;

    const seed = rand(`${block.height}${ticks}`)();
    const duration = `${timeSignature}n`;
    let rhythm = rhythms[getRandomInt(rhythms.length, seed)];

    if (ticks % (timeSignature * 8) === 0)
      rhythm = rhythms[getRandomInt(rhythms.length, seed)];

    const availableNotes = getAvailableNotes(key, ticks, duration, seed);

    //     // playDrums(drums, time);
    playInstrument(cello.current, availableNotes, time, seed, rhythm.cello);
    playInstrument(piano.current, availableNotes, time, seed, rhythm.pianoBass);
    playInstrument(piano.current, availableNotes, time, seed, rhythm.pianoLead);
    playInstrument(violin.current, availableNotes, time, seed, rhythm.violin);
  };

  useEffect(updateBlockTime, [isPlaying]);
  useEffect(scheduleBlockChange, [blockTime]);
  useEffect(instrumentSetup, []);
  useEffect(setupToneLoop, []);
  useEffect(bufferCheck, [blocks, blockIdx]);
  useEffect(keySignatureTransform, [blockIdx, blocks, instrumentsLoaded]);
  useEffect(tempoTransform, [blockIdx, instrumentsLoaded]);
  useEffect(ticksReset, [blockIdx]);
  useEffect(
    playTick,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [time, instrumentsLoaded]
  );

  const play = () => {
    Tone.start();

    const block = blocks[blockIdx];

    const startingBpm = getBlockBpm(block);
    Tone.Transport.bpm.value = startingBpm;
    setBpm(startingBpm);

    const blockTime = block.timestamp;
    setBlockTime(blockTime);

    Tone.Transport.start();
    loop.current.start();

    setIsPlaying(true);
  };

  const pause = () => {
    Tone.Transport.stop();
    loop.current.stop();

    setIsPlaying(false);
  };

  if (!instrumentsLoaded)
    return (
      <div className={styles.container}>
        <p>Loading instruments...</p>
      </div>
    );

  const blocksReady = blocks.length > 0 && blocks[blockIdx];

  return (
    <div className={styles.container}>
      {blocksReady ? (
        <Block
          block={blocks[blockIdx]}
          key={blocks[blockIdx]?.height}
          nextBlock={blocks[blockIdx + 1]}
          blockTime={blockTime}
        />
      ) : (
        <BlockEmpty />
      )}
      <p>{blockTime && `Time: ${blockTime.toLocaleString()}`}</p>
      <p>{bpm && `${bpm}bpm`}</p>
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
