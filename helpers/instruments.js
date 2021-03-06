import * as Tone from "tone";
// https://github.com/nbrosowsky/tonejs-instruments/tree/master/samples

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

const celloConfig = {
  urls: {
    E2: "E2.wav",
    E3: "E3.wav",
    F2: "F2.wav",
    F3: "F3.wav",
    F4: "F4.wav",
    G2: "G2.wav",
    G3: "G3.wav",
    G4: "G4.wav",
    A2: "A2.wav",
    A3: "A3.wav",
    A4: "A4.wav",
    B2: "B2.wav",
    B3: "B3.wav",
    B4: "B4.wav",
    C2: "C2.wav",
    C3: "C3.wav",
    D2: "D2.wav",
    D3: "D3.wav",
    D4: "D4.wav",
  },
  release: 1,
  baseUrl: "/cello/",
};

const pianoConfig = {
  urls: {
    A0: "A0.wav",
    A1: "A1.wav",
    A2: "A2.wav",
    A3: "A3.wav",
    A4: "A4.wav",
    A5: "A5.wav",
    A6: "A6.wav",
    "A#0": "As0.wav",
    "A#1": "As1.wav",
    "A#2": "As2.wav",
    "A#3": "As3.wav",
    "A#4": "As4.wav",
    "A#5": "As5.wav",
    "A#6": "As6.wav",
    B0: "B0.wav",
    B1: "B1.wav",
    B2: "B2.wav",
    B3: "B3.wav",
    B4: "B4.wav",
    B5: "B5.wav",
    B6: "B6.wav",
    C0: "C0.wav",
    C1: "C1.wav",
    C2: "C2.wav",
    C3: "C3.wav",
    C4: "C4.wav",
    C5: "C5.wav",
    C6: "C6.wav",
    C7: "C7.wav",
    "C#0": "Cs0.wav",
    "C#1": "Cs1.wav",
    "C#2": "Cs2.wav",
    "C#3": "Cs3.wav",
    "C#4": "Cs4.wav",
    "C#5": "Cs5.wav",
    "C#6": "Cs6.wav",
    D0: "D0.wav",
    D1: "D1.wav",
    D2: "D2.wav",
    D3: "D3.wav",
    D4: "D4.wav",
    D5: "D5.wav",
    D6: "D6.wav",
    "D#0": "Ds0.wav",
    "D#1": "Ds1.wav",
    "D#2": "Ds2.wav",
    "D#3": "Ds3.wav",
    "D#4": "Ds4.wav",
    "D#5": "Ds5.wav",
    "D#6": "Ds6.wav",
    E0: "E0.wav",
    E1: "E1.wav",
    E2: "E2.wav",
    E3: "E3.wav",
    E4: "E4.wav",
    E5: "E5.wav",
    E6: "E6.wav",
    F0: "F0.wav",
    F1: "F1.wav",
    F2: "F2.wav",
    F3: "F3.wav",
    F4: "F4.wav",
    F5: "F5.wav",
    F6: "F6.wav",
    "F#0": "Fs0.wav",
    "F#1": "Fs1.wav",
    "F#2": "Fs2.wav",
    "F#3": "Fs3.wav",
    "F#4": "Fs4.wav",
    "F#5": "Fs5.wav",
    "F#6": "Fs6.wav",
    G0: "G0.wav",
    G1: "G1.wav",
    G2: "G2.wav",
    G3: "G3.wav",
    G4: "G4.wav",
    G5: "G5.wav",
    G6: "G6.wav",
    "G#0": "Gs0.wav",
    "G#1": "Gs1.wav",
    "G#2": "Gs2.wav",
    "G#3": "Gs3.wav",
    "G#4": "Gs4.wav",
    "G#5": "Gs5.wav",
    "G#6": "Gs6.wav",
  },
  release: 1,
  baseUrl: "/piano/",
};

const violinConfig = {
  urls: {
    A3: "A3.wav",
    A4: "A4.wav",
    A5: "A5.wav",
    A6: "A6.wav",
    C4: "C4.wav",
    C5: "C5.wav",
    C6: "C6.wav",
    C7: "C7.wav",
    E4: "E4.wav",
    E5: "E5.wav",
    E6: "E6.wav",
    G4: "G4.wav",
    G5: "G5.wav",
    G6: "G6.wav",
  },
  release: 1,
  baseUrl: "/violin/",
};

const drumConfig = {
  urls: {
    C4: "CYCdh_ElecK04-Snr03.wav",
    D4: "Abletunes FBD Taster - Bassdrum 02.wav",
    E4: "CYCdh_ElecK07-ClHat01.wav",
    F4: "Abletunes FBD Taster - Snares & Claps 05.wav",
    G4: "CYCdh_ElecK01-OpHat02.wav",
  },
  release: 1,
  baseUrl: "/drums/brian/",
};

export { setupInstrument, celloConfig, pianoConfig, drumConfig, violinConfig };
