// tuneables per instrument:
//   octave, // octave of instrument
//   arp: false, // spread the chord out
//   arpSteady: false, // add jitter
//   arp4: false, // play all four notes
//   shuffle: false, // shuffle the order of the notes
//   slice7: true, // slice off the 7th
//   silent: false // should the instrument play at all?

const rhythm1 = {
  pianoBass: {
    octave: 2,
    arp: true,
    arpSteady: true,
    shuffle: false,
    slice7: true,
    noteDuration: "4n",
  },
  pianoLead: {
    octave: 3,
    arp: false,
    arpSteady: false,
    shuffle: true,
    slice7: true,
    noteDuration: "4n",
  },
  cello: {
    octave: 2,
    arp: false,
    arpSteady: false,
    shuffle: false,
    slice7: true,
    noteDuration: "4n",
  },
  violin: {
    silent: true,
  },
};

const rhythm2 = {
  pianoBass: {
    octave: 2,
    arp: false,
    arpSteady: false,
    shuffle: false,
    slice7: true,
    noteDuration: "4n",
  },
  pianoLead: {
    octave: 4,
    arp: false,
    arpSteady: false,
    shuffle: true,
    slice7: true,
    noteDuration: "4n",
  },
  cello: {
    octave: 3,
    arp: false,
    arpSteady: false,
    shuffle: false,
    slice7: true,
    noteDuration: "4n",
  },
  violin: {
    silent: true,
  },
};

const rhythm3 = {
  pianoBass: {
    octave: 3,
    arp: false,
    arpSteady: false,
    shuffle: false,
    slice7: false,
    noteDuration: "4n",
  },
  pianoLead: {
    octave: 3,
    arp: true,
    arpSteady: true,
    shuffle: true,
    slice7: true,
    noteDuration: "4n",
  },
  cello: {
    octave: 3,
    arp: false,
    arpSteady: false,
    shuffle: false,
    slice7: true,
    noteDuration: "4n",
  },
  violin: {
    octave: 4,
    arp: false,
    arpSteady: false,
    shuffle: true,
    slice7: true,
    noteDuration: "32n",
  },
};

const rhythm4 = {
  pianoBass: {
    octave: 2,
    arp: true,
    arpSteady: true,
    shuffle: false,
    slice7: false,
    noteDuration: "4n",
  },
  pianoLead: {
    silent: true,
  },
  cello: {
    octave: 3,
    arp: false,
    arpSteady: false,
    shuffle: false,
    slice7: true,
    noteDuration: "4n",
  },
  violin: {
    octave: 4,
    arp: false,
    arpSteady: false,
    shuffle: true,
    slice7: true,
    noteDuration: "32n",
  },
};

const rhythm5 = {
  pianoBass: {
    octave: 2,
    arp: true,
    arpSteady: true,
    arp4: true,
    shuffle: false,
    slice7: true,
    noteDuration: "4n",
  },
  pianoLead: {
    octave: 4,
    arp: false,
    arpSteady: false,
    shuffle: true,
    slice7: true,
    noteDuration: "4n",
  },
  cello: {
    octave: 3,
    arp: false,
    arpSteady: false,
    shuffle: false,
    slice7: true,
    noteDuration: "4n",
  },
  violin: {
    silent: true,
  },
};

const rhythms = [rhythm1, rhythm2, rhythm3, rhythm4, rhythm5];

export { rhythms };
