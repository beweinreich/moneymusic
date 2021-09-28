// https://github.com/nbrosowsky/tonejs-instruments/tree/master/samples

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
    C4: "C4.mp3",
    "D#4": "Ds4.mp3",
    "F#4": "Fs4.mp3",
    A4: "A4.mp3",
  },
  release: 1,
  baseUrl: "https://tonejs.github.io/audio/salamander/",
};

export { celloConfig, pianoConfig };
