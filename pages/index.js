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

  const playCello = () => {
    const cello = new Tone.Sampler(celloConfig).toDestination();
    const autoPanner = new Tone.AutoPanner("1n").toDestination().start();
    const mixer = new Tone.Gain();
    const reverb = new Tone.Reverb({
      wet: 0.3,
      decay: 30,
    });

    cello.volume.value = -20;
    cello.chain(autoPanner, mixer);
    mixer.connect(reverb);
    reverb.toDestination();

    let noteLetter;
    let octave = 4;
    let arping = true;
    let ticks = 0;

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
    }, "32n").start();
  };

  const playPiano = () => {
    const piano = new Tone.Sampler(pianoConfig).toDestination();
    const mixer = new Tone.Gain();
    const reverb = new Tone.Reverb({
      wet: 0.3,
      decay: 30,
    });

    piano.volume.value = -10;
    piano.connect(mixer);
    mixer.connect(reverb);
    reverb.toDestination();

    let noteLetter;
    let octave = 4;
    let arping = true;

    let ticks = 0;
    Tone.loaded().then(() => {
      const loop = new Tone.Loop((time) => {
        ticks++;

        noteLetter = getNextNote(noteLetter);
        let note = noteLetter + octave;

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
      }, "32n").start();
    });
  };

  useEffect(() => {
    if (!isPlaying) return;
    Tone.Transport.cancel();
    Tone.Transport.bpm.value = 18 + randomInt(20);

    Tone.loaded().then(() => {
      playCello();
      playPiano();
    });
  }, [isPlaying]);

  const getNextNote = (currentNote) => {
    if (!currentNote) return keyLetter;

    const currentIndex = scale.indexOf(currentNote);
    const isPositive = randomInt(2) === 1;

    let nextIndex = currentIndex + randomInt(3) * (isPositive ? 1 : -1);

    if (nextIndex >= scale.length || nextIndex < 0) nextIndex = currentIndex;
    return scale[nextIndex];
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
      <p>In the key of {keyLetter}</p>
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
