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
  const [ticks, setTicks] = useState(0);
  const [time, setTime] = useState(Tone.Time());
  const [key, setKey] = useState(null);
  const [bpm, setBpm] = useState(null);
  const loop = useRef();
  const timeSignature = 4;
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
    setBlockIdx(window.location.search.slice(-1));
  }, []);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => setBlockIdx((bi) => bi + 1), 10000);
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
    if (buffering || !isPlaying) return;

    const block = blocks[blockIdx];
    const nextBlock = blocks[blockIdx + 1];
    const seconds = secondsUntilNextBlock(block, nextBlock);

    if (seconds >= 10) {
      const nextBpm = getBlockBpm(block);
      const rampDuration = 3;

      setBpm(nextBpm);
      Tone.Transport.bpm.rampTo(nextBpm, rampDuration);
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

    Tone.loaded().then(() => {
      console.log("tones loaded");
    });
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
    if (buffering) return;

    const seed = rand(`${blocks[blockIdx].height}${ticks}`)();
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

  useEffect(instrumentSetup, []);
  useEffect(setupToneLoop, []);
  useEffect(bufferCheck, [blocks, blockIdx]);
  useEffect(keySignatureTransform, [blockIdx, blocks, buffering]);
  useEffect(tempoTransform, [blockIdx, buffering]);
  useEffect(ticksReset, [blockIdx]);
  useEffect(
    playTick,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [time]
  );

  const play = () => {
    Tone.start();

    const startingBpm = getBlockBpm(blocks[blockIdx]);
    Tone.Transport.bpm.value = startingBpm;
    setBpm(startingBpm);

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
