const PRESETS = [
  {
    name: "synKICK",
    synth: "MembraneSynth",
    effects: [],
    sound: {
      volume: -1,
      envelope: {
        sustain: 0.1,
        attack: 0.005,
        decay: 0.8,
      },
      octaves: 5,
    },
  },
  {
    name: "KICK",
    synth: "Sampler",
    url:
      "https://raw.githubusercontent.com/d-subat/SynthSequencer/master/assets/jazz_kick.wav",
    effects: [],
    sound: {
      volume: -5,
      envelope: {
        attack: 0.0006,
        release: 0.02,
      },
    },
  },
  {
    name: "SNARE",
    synth: "Sampler",
    url:
      "https://raw.githubusercontent.com/d-subat/SynthSequencer/master/assets/jazz_snare.wav",
    effects: [],
    sound: {
      volume: -5,
      envelope: {
        attack: 0.0006,
        release: 0.02,
      },
    },
  },
  {
    name: "HIHAT",
    synth: "NoiseSynth",
    effects: [],
    sound: {
      volume: -8,
      noise: {
        type: "white",
        playbackRate: 5,
      },
      envelope: {
        attack: 0.001,
        decay: 0.3,
        sustain: 0,
        release: 0.3,
      },
    },
  },
  {
    name: "closedHiHat",
    synth: "NoiseSynth",
    effects: [],
    sound: {
      volume: -14,
      filter: {
        Q: 1,
      },
      envelope: {
        attack: 0.01,
        decay: 0.15,
      },
      filterEnvelope: {
        attack: 0.01,
        decay: 0.03,
        baseFrequency: 4000,
        octaves: -2.5,
        exponent: 4,
      },
    },
  },
  {
    name: "rideCymbal",
    synth: "MetalSynth",
    effects: [],
    sound: {
      volume: -8,
      frequency: 400,
      envelope: {
        attack: 0.001,
        decay: 1.4,
        release: 0.2,
      },
      harmonicity: 5.1,
      modulationIndex: 4,
      resonance: 4000,
      octaves: 1.5,
    },
  },

  {
    name: "Detuned",
    synth: "MembraneSynth",
    effects: [],
    sound: {
      volume: -9,
      pitchDecay: 0.8,
      octaves: 2,
      portamento: "25",
      oscillator: {
        type: "fatsquare",
      },
      envelope: {
        attack: 0.0006,
        decay: 2.5,
        sustain: 0,
        release: 0.02,
      },
    },
  },
  {
    name: "Marimba",
    synth: "Synth",
    effects: [],
    sound: {
      volume: -8,
      oscillator: {
        type: "fatsine",
      },
      envelope: {
        attack: 0.001,
        decay: 1.2,
        sustain: 0,
        release: 1.2,
      },
    },
  },
  {
    name: "BAH",
    synth: "MonoSynth",
    effects: [],
    sound: {
      volume: 10,
      oscillator: {
        type: "sawtooth",
      },
      filter: {
        Q: 2,
        type: "bandpass",
        rolloff: -24,
      },
      envelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.2,
        release: 0.6,
      },
      filterEnvelope: {
        attack: 0.02,
        decay: 0.4,
        sustain: 1,
        release: 0.7,
        releaseCurve: "linear",
        baseFrequency: 20,
        octaves: 5,
      },
    },
  },
  {
    name: "bassguitar",
    synth: "MonoSynth",
    effects: [],
    sound: {
      volume: -8,
      oscillator: {
        type: "fmsquare5",
        modulationType: "triangle",
        modulationIndex: 2,
        harmonicity: 0.501,
      },
      filter: {
        Q: 1,
        type: "lowpass",
        rolloff: -24,
      },
      envelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.4,
        release: 2,
      },
      filterEnvelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.8,
        release: 1.5,
        baseFrequency: 50,
        octaves: 4.4,
      },
    },
  },
  {
    name: "BRASS",
    synth: "MonoSynth",
    effects: [],
    sound: {
      volume: -8,
      portamento: 0.01,
      oscillator: {
        type: "sawtooth",
      },
      filter: {
        Q: 2,
        type: "lowpass",
        rolloff: -24,
      },
      envelope: {
        attack: 0.1,
        decay: 0.1,
        sustain: 0.6,
        release: 0.5,
      },
      filterEnvelope: {
        attack: 0.05,
        decay: 0.8,
        sustain: 0.4,
        release: 1.5,
        baseFrequency: 2000,
        octaves: 1.5,
      },
    },
  },
  {
    name: "whatever",
    synth: "MonoSynth",
    effects: [],
    sound: {
      volume: -8,
      oscillator: {
        type: "pwm",
        modulationFrequency: 1,
      },
      filter: {
        Q: 6,
        rolloff: -24,
      },
      envelope: {
        attack: 0.025,
        decay: 0.3,
        sustain: 0.9,
        release: 2,
      },
      filterEnvelope: {
        attack: 0.245,
        decay: 0.131,
        sustain: 0.5,
        release: 2,
        baseFrequency: 20,
        octaves: 7.2,
        exponent: 2,
      },
    },
  },
  {
    name: "fatpad",
    synth: "Synth",
    effects: [],
    sound: {
      volume: -8,
      oscillator: {
        type: "fatsawtooth",
        count: 3,
        spread: 30,
      },
      envelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.5,
        release: 0.4,
        attackCurve: "exponential",
      },
    },
  },
  {
    name: "PIANO",
    synth: "PolySynth",
    effects: [],
    sound: {
      volume: -8,
      oscillator: {
        partials: [1, 2, 5],
      },
      portamento: 0.005,
    },
  },
  {
    name: "Voice",
    synth: "Sampler",
    url:
      "https://raw.githubusercontent.com/d-subat/SynthSequencer/master/assets/vocal.mp3",
    effects: [],
    sound: {
      volume: -5,
      envelope: {
        attack: 0.0006,
        release: 0.02,
      },
    },
  },
];
