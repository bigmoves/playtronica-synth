import { useState } from "react";
import * as Tone from "tone";

// 36 - 51

const defaults = {
  36: "C0",
  37: "C#0",
  38: "D0",
  39: "D#0",
  40: "E0",
  41: "F0",
  42: "F#0",
  43: "G0",
  44: "G#0",
  45: "A0",
  46: "A#0",
  47: "B0",
  48: "C1",
  49: "C#1",
  50: "D1",
  51: "D#1",
};

export default function Index() {
  let audioCtx;
  let midi = undefined;
  let synths = {};
  const [noteDefaults, setNoteDefaults] = useState(defaults);

  // function listInputs(inputs) {
  //   var input = inputs.value;
  //   console.log("Input port : [ type:'" + input.type + "' id: '" + input.id + "' manufacturer: '" + input.manufacturer + "' name: '" + input.name + "' version: '" + input.version + "']");
  // }

  function noteOn(note) {
    synths[note] = new Tone.AMSynth().toDestination();
    synths[note].triggerAttack(noteDefaults[note], Tone.now());
  }

  function noteOff(note) {
    synths[note].triggerRelease();
  }

  function onMIDIMessage(event) {
    const data = event.data;
    const type = data[0];
    const note = data[1];
    const velocity = data[2];

    switch (type) {
      case 144:
        noteOn(note);
        break;
      case 128:
        noteOff(note);
        break;
    }
  }

  function onMIDISuccess(midiAccess) {
    midi = midiAccess;
    var inputs = midi.inputs.values();
    // loop through all inputs
    for (
      var input = inputs.next();
      input && !input.done;
      input = inputs.next()
    ) {
      // listen for midi messages
      input.value.onmidimessage = onMIDIMessage;
      // listInputs(input);
    }
    // listen for connect/disconnect message
    // midi.onstatechange = onStateChange;
  }

  function onMIDIFailure() {}

  if (typeof document !== "undefined") {
    AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
    audioCtx.resume().then(() => console.log('audio context running'));

    // request MIDI access
    if (navigator.requestMIDIAccess) {
      navigator
        .requestMIDIAccess({
          sysex: false,
        })
        .then(onMIDISuccess, onMIDIFailure);
    } else {
      alert("No MIDI support in your browser.");
    }
  }

  const inputs = Array.from({ length: 16 }, (_, i) => i + 36);

  function changeNote(input, value) {
    if (!value) {
      setNoteDefaults({ ...noteDefaults, ...{ [input]: defaults[input]}});
      return;
    }
    setNoteDefaults({ ...noteDefaults, ...{ [input]: value }});
  }

  return (
    <div className="container">
      <h1>Hello Kyle</h1>

      {inputs.map((input) => (
        <p key={`input-${input}`}>
          {input}: 
          <input type="text" onChange={(e) => changeNote(input, e.target.value)} placeholder={noteDefaults[input]}/>
          <button
            onMouseDown={() => noteOn(input)}
            onMouseUp={() => noteOff(input)}
          >
            {noteDefaults[input]}
          </button>
        </p>
      ))}
    </div>
  );
}
