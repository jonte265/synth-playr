import { useEffect, useRef, useState } from 'react';
import Header from './components/Header';
import {
  PiWaveSawtoothDuotone,
  PiWaveSquareDuotone,
  PiWaveSineDuotone,
  PiWaveTriangleDuotone,
} from 'react-icons/pi';
import SmallBtn from './components/SmallBtn';

function App() {
  const whiteKeys = [
    { note: 'C', freq: 261.63 },
    { note: 'D', freq: 293.66 },
    { note: 'E', freq: 329.63 },
    { note: 'F', freq: 349.23 },
    { note: 'G', freq: 392.0 },
    { note: 'A', freq: 440.0 },
    { note: 'B', freq: 493.88 },
    { note: 'C', freq: 523.25 },
  ];

  const blackKeys = [
    { note: 'C#', freq: 277.18, left: 48 },
    { note: 'D#', freq: 311.13, left: 98 },
    { note: 'F#', freq: 369.99, left: 195 },
    { note: 'G#', freq: 415.3, left: 245 },
    { note: 'A#', freq: 466.16, left: 295 },
  ];

  const audioCtxRef = useRef<AudioContext>(null);
  // const oscillatorRef = useRef<OscillatorNode>(null);
  const oscillatorRef = useRef<
    { id: number; osc: OscillatorNode; gain: GainNode }[]
  >([]);

  const masterGainRef = useRef<GainNode>(null);

  const [selWaveform, setSelWaveform] = useState<OscillatorType>('sine');
  const selWaveformRef = useRef<OscillatorType>('sine');

  const [selVolume, setSelVolume] = useState(0.2);
  const selVolumeRef = useRef(0.2);

  const [selCutoff, setSelCutoff] = useState(2000);
  const selCutoffRef = useRef(2000);

  const [selQFilter, setSelQFilter] = useState(1);
  const selQFilterRef = useRef(1);

  const [selAttack, setSelAttack] = useState(0.05);
  const selAttackRef = useRef(0.05);

  const [selDecay, setSelDecay] = useState(0.2);
  const selDecayRef = useRef(0.2);

  const [selSustain, setSelSustain] = useState(0.7);
  const selSustainRef = useRef(0.7);

  const [selRelease, setSelRelease] = useState(0.3);
  const selReleaseRef = useRef(0.3);

  function playNote(freq: number) {
    stopNote(freq);

    // Skapar ljudmotorn om det inte redan finns
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    // Create master gain node
    if (!masterGainRef.current) {
      masterGainRef.current = audioCtxRef.current.createGain();
      masterGainRef.current.gain.value = selVolumeRef.current;
      masterGainRef.current.connect(audioCtxRef.current.destination); // Master gain connect to "speaker"
    }

    const oscillator = audioCtxRef.current.createOscillator();
    oscillator.frequency.value = freq;

    oscillator.type = selWaveformRef.current;

    const gain = audioCtxRef.current.createGain();

    // ADSR in seconds
    const now = audioCtxRef.current.currentTime;
    const attack = selAttackRef.current;
    const decay = selDecayRef.current;
    const sustain = selSustainRef.current;

    gain.gain.cancelScheduledValues(now);

    gain.gain.setValueAtTime(0, now); // Start silent
    gain.gain.linearRampToValueAtTime(1, now + attack); // Attack
    gain.gain.setTargetAtTime(sustain, now + attack, decay); // Decay

    const filter = audioCtxRef.current.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.value = selQFilterRef.current;

    filter.frequency.value = selCutoffRef.current;

    oscillator.connect(gain);
    gain.connect(filter);
    filter.connect(masterGainRef.current); // connect to master gain

    oscillator.start();

    oscillatorRef.current.push({
      id: freq,
      osc: oscillator,
      gain: gain,
    });

    // console.log(oscillatorRef.current);
  }

  function stopNote(freq: number) {
    if (!audioCtxRef.current) return;
    const index = oscillatorRef.current.findIndex((o) => o.id === freq);

    if (index !== -1) {
      const now = audioCtxRef.current.currentTime;
      const release = selReleaseRef.current;

      const { osc, gain } = oscillatorRef.current[index];

      // apply release
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0, now + release);

      osc.stop(now + release);
      // osc.disconnect();
      // gain.disconnect();

      setTimeout(() => {
        osc.disconnect();
        gain.disconnect();
      }, release * 1000);

      oscillatorRef.current.splice(index, 1);
    }
  }

  function handleWaveformSelect(sel: any) {
    console.log(sel);

    setSelWaveform(sel);
    selWaveformRef.current = sel;
  }

  function handleVolume(vol: string) {
    console.log(vol);

    const newVol = Number(vol);

    if (masterGainRef.current) {
      masterGainRef.current.gain.value = newVol;
    }

    setSelVolume(newVol);
    selVolumeRef.current = newVol;
  }

  function handleCutoff(filterCutoff: string) {
    console.log(filterCutoff);

    const newCutoff = Number(filterCutoff);

    setSelCutoff(newCutoff);
    selCutoffRef.current = newCutoff;
  }

  function handleQFilter(filterQ: string) {
    console.log(filterQ);

    const newQFilter = Number(filterQ);

    setSelQFilter(newQFilter);
    selQFilterRef.current = newQFilter;
  }

  function handleADSR(value: string, envelope: string) {
    console.log(value + envelope);

    const newADSR = Number(value);

    switch (envelope) {
      case 'attack':
        setSelAttack(newADSR);
        selAttackRef.current = newADSR;
        break;
      case 'decay':
        setSelDecay(newADSR);
        selDecayRef.current = newADSR;
        break;
      case 'sustain':
        setSelSustain(newADSR);
        selSustainRef.current = newADSR;
        break;
      case 'release':
        setSelRelease(newADSR);
        selReleaseRef.current = newADSR;
        break;
    }
  }

  useEffect(() => {
    function handleKeydown(event: any) {
      if (event.repeat) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case 'a':
          playNote(261.63); // C4
          break;
        case 'w':
          playNote(277.18); // C#4
          break;
        case 's':
          playNote(293.66); // D4
          break;
        case 'e':
          playNote(311.13); // D#4
          break;
        case 'd':
          playNote(329.63); // E4
          break;
        case 'f':
          playNote(349.23); // F4
          break;
        case 't':
          playNote(369.99); // F#4
          break;
        case 'g':
          playNote(392.0); // G4
          break;
        case 'y':
          playNote(415.3); // G#4
          break;
        case 'h':
          playNote(440.0); // A4
          break;
        case 'u':
          playNote(466.16); // A#4
          break;
        case 'j':
          playNote(493.88); // B4
          break;
        case 'k':
          playNote(523.25); // C5
          break;
        case 'o':
          playNote(554.37); // C#5
          break;
        case 'l':
          playNote(587.33); // D5
          break;
      }
    }
    function handleKeyup(event: any) {
      console.log(`Key up: ${event.key}`);
      switch (event.key.toLowerCase()) {
        case 'a':
          stopNote(261.63); // C4
          break;
        case 'w':
          stopNote(277.18); // C#4
          break;
        case 's':
          stopNote(293.66); // D4
          break;
        case 'e':
          stopNote(311.13); // D#4
          break;
        case 'd':
          stopNote(329.63); // E4
          break;
        case 'f':
          stopNote(349.23); // F4
          break;
        case 't':
          stopNote(369.99); // F#4
          break;
        case 'g':
          stopNote(392.0); // G4
          break;
        case 'y':
          stopNote(415.3); // G#4
          break;
        case 'h':
          stopNote(440.0); // A4
          break;
        case 'u':
          stopNote(466.16); // A#4
          break;
        case 'j':
          stopNote(493.88); // B4
          break;
        case 'k':
          stopNote(523.25); // C5
          break;
        case 'o':
          stopNote(554.37); // C#5
          break;
        case 'l':
          stopNote(587.33); // D5
          break;
      }
    }

    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('keyup', handleKeyup);

    return () => {
      window.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('keyup', handleKeyup);
    };
  }, []);

  return (
    <>
      <Header />
      <main className='flex flex-col gap-8 justify-center items-center p-4'>
        <div className='flex flex-wrap justify-center items-center flex-col gap-2 outline outline-gray-700 rounded-4xl p-8'>
          <p>Waveform:</p>
          <div className='flex flex-wrap justify-center items-center gap-1'>
            <SmallBtn
              text='Sawtooth'
              icon={<PiWaveSawtoothDuotone />}
              selected={selWaveform === 'sawtooth' ? true : false}
              onClick={() => handleWaveformSelect('sawtooth')}
            />
            <SmallBtn
              text='Sine'
              icon={<PiWaveSineDuotone />}
              selected={selWaveform === 'sine' ? true : false}
              onClick={() => handleWaveformSelect('sine')}
            />
            <SmallBtn
              text='Square'
              icon={<PiWaveSquareDuotone />}
              selected={selWaveform === 'square' ? true : false}
              onClick={() => handleWaveformSelect('square')}
            />
            <SmallBtn
              text='Triangle'
              icon={<PiWaveTriangleDuotone />}
              selected={selWaveform === 'triangle' ? true : false}
              onClick={() => handleWaveformSelect('triangle')}
            />
          </div>
        </div>
        <div className='flex flex-wrap justify-center items-center gap-4 '>
          <div className='flex flex-col justify-center items-center gap-2 outline outline-gray-700 rounded-4xl p-8'>
            <p>ADSR</p>
            <div className='flex flex-col justify-center items-center gap-2 w-48'>
              <label htmlFor='attack'>Attack {selAttack} s</label>
              <input
                type='range'
                name='attack'
                id='attack'
                min='0'
                max='2'
                step={0.01}
                value={selAttack}
                onChange={(e) => handleADSR(e.target.value, 'attack')}
              />
            </div>
            <div className='flex flex-col justify-center items-center gap-2 w-48'>
              <label htmlFor='decay'>Decay {selDecay} s</label>
              <input
                type='range'
                name='decay'
                id='decay'
                min='0'
                max='2'
                step={0.01}
                value={selDecay}
                onChange={(e) => handleADSR(e.target.value, 'decay')}
              />
            </div>
            <div className='flex flex-col justify-center items-center gap-2 w-48'>
              <label htmlFor='sustain'>Sustain {selSustain} s</label>
              <input
                type='range'
                name='sustain'
                id='sustain'
                min='0'
                max='1'
                step={0.01}
                value={selSustain}
                onChange={(e) => handleADSR(e.target.value, 'sustain')}
              />
            </div>
            <div className='flex flex-col justify-center items-center gap-2 w-48'>
              <label htmlFor='release'>Release {selRelease} s</label>
              <input
                type='range'
                name='release'
                id='release'
                min='0'
                max='2'
                step={0.01}
                value={selRelease}
                onChange={(e) => handleADSR(e.target.value, 'release')}
              />
            </div>
          </div>
          <div className='flex flex-col justify-center items-center gap-2 outline outline-gray-700 rounded-4xl p-8'>
            <p>Filter</p>
            <div className='flex flex-col justify-center items-center gap-2 w-48'>
              <label htmlFor='filter'>Frequency {selCutoff} Hz</label>
              <input
                type='range'
                name='filter'
                id='filter'
                min='0'
                max='20000'
                value={selCutoff}
                onChange={(e) => handleCutoff(e.target.value)}
              />
            </div>
            <div className='flex flex-col justify-center items-center gap-2 w-48'>
              <label htmlFor='filterQ'>Q {selQFilter}</label>
              <input
                type='range'
                name='filterQ'
                id='filterQ'
                min='0'
                max='20'
                value={selQFilter}
                onChange={(e) => handleQFilter(e.target.value)}
              />
            </div>
          </div>
          <div className='flex flex-col justify-center items-center gap-2 outline outline-gray-700 rounded-4xl p-8 w-48'>
            <label htmlFor='volume'>Volume {(selVolume * 10).toFixed(1)}</label>
            <input
              type='range'
              name='volume'
              id='volume'
              min='0'
              max='1'
              step='0.01'
              value={selVolume}
              onChange={(e) => handleVolume(e.target.value)}
            />
          </div>
        </div>
        <div className='relative flex '>
          {whiteKeys.map((key, index) => (
            <button
              key={`white-${key.note}-${index}`}
              onMouseDown={() => playNote(key.freq)}
              onMouseUp={() => stopNote(key.freq)}
              onTouchStart={() => playNote(key.freq)}
              onTouchEnd={() => stopNote(key.freq)}
              className='flex justify-center items-end pb-4 min-h-45 bg-gray-300 hover:bg-gray-400  active:text-gray-300  active:bg-gray-500 rounded-xl px-4 py-20 border border-gray-400 relative z-0 text-gray-500 font-bold'
            >
              {key.note}
            </button>
          ))}

          {blackKeys.map((key, index) => (
            <button
              key={`black-${key.note}-${index}`}
              onMouseDown={() => playNote(key.freq)}
              onMouseUp={() => stopNote(key.freq)}
              onTouchStart={() => playNote(key.freq)}
              onTouchEnd={() => stopNote(key.freq)}
              className='bg-gray-800 hover:bg-gray-700 active:bg-gray-600 rounded-md w-8 h-28 absolute top-0 z-10 text-gray-300 font-bold'
              style={{ marginLeft: '-16px', left: `${key.left}px` }}
            >
              {key.note}
            </button>
          ))}
        </div>
        <p>How to play:</p>
      </main>
    </>
  );
}

export default App;
