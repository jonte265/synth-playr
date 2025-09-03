import { useEffect, useRef, useState } from 'react';
import Header from './components/Header';
import {
  PiWaveSawtoothDuotone,
  PiWaveSquareDuotone,
  PiWaveSineDuotone,
  PiWaveTriangleDuotone,
} from 'react-icons/pi';
import {
  LuVolume2,
  LuRepeat,
  LuAudioWaveform,
  LuSpline,
  LuAudioLines,
} from 'react-icons/lu';
import SmallBtn from './components/SmallBtn';

function App() {
  const whiteKeys = [
    { note: 'C', freq: 130.81 },
    { note: 'D', freq: 146.83 },
    { note: 'E', freq: 164.81 },
    { note: 'F', freq: 174.61 },
    { note: 'G', freq: 196.0 },
    { note: 'A', freq: 220.0 },
    { note: 'B', freq: 246.94 },

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
    { note: 'C#', freq: 138.59, left: 48 },
    { note: 'D#', freq: 155.56, left: 95 },
    { note: 'F#', freq: 185.0, left: 181 },
    { note: 'G#', freq: 207.65, left: 227 },
    { note: 'A#', freq: 233.08, left: 271 },

    { note: 'C#', freq: 277.18, left: 360 },
    { note: 'D#', freq: 311.13, left: 406 },
    { note: 'F#', freq: 369.99, left: 492 },
    { note: 'G#', freq: 415.3, left: 537 },
    { note: 'A#', freq: 466.16, left: 582 },
  ];

  const [activeNote, setActiveNote] = useState<number[]>([]);

  const audioCtxRef = useRef<AudioContext>(null);
  // const oscillatorRef = useRef<OscillatorNode>(null);
  const oscillatorRef = useRef<
    { id: number; osc: OscillatorNode; gain: GainNode }[]
  >([]);

  const masterGainRef = useRef<GainNode>(null);

  const [selWaveform, setSelWaveform] = useState<OscillatorType>('triangle');
  const selWaveformRef = useRef<OscillatorType>('triangle');

  const [selVolume, setSelVolume] = useState(0.1);
  const selVolumeRef = useRef(0.1);

  const [selCutoff, setSelCutoff] = useState(20000);
  const selCutoffRef = useRef(20000);

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

  const [selDelayTime, setSelDelayTime] = useState(0);
  const selDelayTimeRef = useRef(0.0);

  const [selDelayFeedback, setSelDelayFeedback] = useState(0.4);
  const selDelayFeedbackRef = useRef(0.4);

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

    // Delay effect
    const delay = audioCtxRef.current.createDelay();
    delay.delayTime.value = selDelayTimeRef.current;

    const feedback = audioCtxRef.current.createGain();
    feedback.gain.value = selDelayFeedbackRef.current;

    // Filter effect
    const filter = audioCtxRef.current.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.value = selQFilterRef.current;

    filter.frequency.value = selCutoffRef.current;

    // Connect all nodes
    // Koppla oscillator -> gain -> filter
    oscillator.connect(gain);
    gain.connect(filter);

    // Koppla filter -> delay -> master gain
    filter.connect(delay);
    delay.connect(masterGainRef.current);

    // Skapa feedback-loop delay -> feedback gain -> delay
    delay.connect(feedback);
    feedback.connect(delay);
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

      setTimeout(() => {
        osc.disconnect();
        gain.disconnect();
      }, release * 1000);

      oscillatorRef.current.splice(index, 1);
    }
  }

  function handleWaveformSelect(sel: any) {
    // console.log(sel);

    setSelWaveform(sel);
    selWaveformRef.current = sel;
  }

  function handleVolume(vol: string) {
    // console.log(vol);

    const newVol = Number(vol);

    if (masterGainRef.current) {
      masterGainRef.current.gain.value = newVol;
    }

    setSelVolume(newVol);
    selVolumeRef.current = newVol;
  }

  function handleCutoff(filterCutoff: string) {
    const newCutoff = Number(filterCutoff);

    setSelCutoff(newCutoff);
    selCutoffRef.current = newCutoff;
  }

  function handleQFilter(filterQ: string) {
    // console.log(filterQ);

    const newQFilter = Number(filterQ);

    setSelQFilter(newQFilter);
    selQFilterRef.current = newQFilter;
  }

  function handleADSR(value: string, envelope: string) {
    // console.log(value + envelope);

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

  function handleDelayTime(time: string) {
    // console.log(time);

    const newTime = Number(time);

    setSelDelayTime(newTime);
    selDelayTimeRef.current = newTime;
  }
  function handleDelayFeedback(fb: string) {
    // console.log(fb);

    const newFb = Number(fb);

    setSelDelayFeedback(newFb);
    selDelayFeedbackRef.current = newFb;
  }

  useEffect(() => {
    function handleKeydown(event: any) {
      if (event.repeat) return;

      switch (event.key.toLowerCase()) {
        // --- Octave 3 ---
        case 'z':
          playNote(130.81); // C3
          setActiveNote((prev) => [...prev, 130.81]);
          break;
        case 's':
          playNote(138.59); // C#3
          setActiveNote((prev) => [...prev, 138.59]);
          break;
        case 'x':
          playNote(146.83); // D3
          setActiveNote((prev) => [...prev, 146.83]);
          break;
        case 'd':
          playNote(155.56); // D#3
          setActiveNote((prev) => [...prev, 155.56]);
          break;
        case 'c':
          playNote(164.81); // E3
          setActiveNote((prev) => [...prev, 164.81]);
          break;
        case 'v':
          playNote(174.61); // F3
          setActiveNote((prev) => [...prev, 174.61]);
          break;
        case 'g':
          playNote(185.0); // F#3
          setActiveNote((prev) => [...prev, 185.0]);
          break;
        case 'b':
          playNote(196.0); // G3
          setActiveNote((prev) => [...prev, 196.0]);
          break;
        case 'h':
          playNote(207.65); // G#3
          setActiveNote((prev) => [...prev, 207.65]);
          break;
        case 'n':
          playNote(220.0); // A3
          setActiveNote((prev) => [...prev, 220.0]);
          break;
        case 'j':
          playNote(233.08); // A#3
          setActiveNote((prev) => [...prev, 233.08]);
          break;
        case 'm':
          playNote(246.94); // B3
          setActiveNote((prev) => [...prev, 246.94]);
          break;

        // --- Octave 4 ---
        case 'q':
          playNote(261.63); // C4
          setActiveNote((prev) => [...prev, 261.63]);
          break;
        case '2':
          playNote(277.18); // C#4
          setActiveNote((prev) => [...prev, 277.18]);
          break;
        case 'w':
          playNote(293.66); // D4
          setActiveNote((prev) => [...prev, 293.66]);
          break;
        case '3':
          playNote(311.13); // D#4
          setActiveNote((prev) => [...prev, 311.13]);
          break;
        case 'e':
          playNote(329.63); // E4
          setActiveNote((prev) => [...prev, 329.63]);
          break;
        case 'r':
          playNote(349.23); // F4
          setActiveNote((prev) => [...prev, 349.23]);
          break;
        case '5':
          playNote(369.99); // F#4
          setActiveNote((prev) => [...prev, 369.99]);
          break;
        case 't':
          playNote(392.0); // G4
          setActiveNote((prev) => [...prev, 392.0]);
          break;
        case '6':
          playNote(415.3); // G#4
          setActiveNote((prev) => [...prev, 415.3]);
          break;
        case 'y':
          playNote(440.0); // A4
          setActiveNote((prev) => [...prev, 440.0]);
          break;
        case '7':
          playNote(466.16); // A#4
          setActiveNote((prev) => [...prev, 466.16]);
          break;
        case 'u':
          playNote(493.88); // B4
          setActiveNote((prev) => [...prev, 493.88]);
          break;

        // --- Octave 5 ---
        case 'i':
          playNote(523.25); // C5
          setActiveNote((prev) => [...prev, 523.25]);
          break;
      }
    }

    function handleKeyup(event: any) {
      // console.log(`Key up: ${event.key}`);

      switch (event.key.toLowerCase()) {
        // --- Octave 3 ---
        case 'z':
          stopNote(130.81);
          setActiveNote((prev) => prev.filter((note) => note !== 130.81));
          break;
        case 's':
          stopNote(138.59);
          setActiveNote((prev) => prev.filter((note) => note !== 138.59));
          break;
        case 'x':
          stopNote(146.83);
          setActiveNote((prev) => prev.filter((note) => note !== 146.83));
          break;
        case 'd':
          stopNote(155.56);
          setActiveNote((prev) => prev.filter((note) => note !== 155.56));
          break;
        case 'c':
          stopNote(164.81);
          setActiveNote((prev) => prev.filter((note) => note !== 164.81));
          break;
        case 'v':
          stopNote(174.61);
          setActiveNote((prev) => prev.filter((note) => note !== 174.61));
          break;
        case 'g':
          stopNote(185.0);
          setActiveNote((prev) => prev.filter((note) => note !== 185.0));
          break;
        case 'b':
          stopNote(196.0);
          setActiveNote((prev) => prev.filter((note) => note !== 196.0));
          break;
        case 'h':
          stopNote(207.65);
          setActiveNote((prev) => prev.filter((note) => note !== 207.65));
          break;
        case 'n':
          stopNote(220.0);
          setActiveNote((prev) => prev.filter((note) => note !== 220.0));
          break;
        case 'j':
          stopNote(233.08);
          setActiveNote((prev) => prev.filter((note) => note !== 233.08));
          break;
        case 'm':
          stopNote(246.94);
          setActiveNote((prev) => prev.filter((note) => note !== 246.94));
          break;

        // --- Octave 4 ---
        case 'q':
          stopNote(261.63);
          setActiveNote((prev) => prev.filter((note) => note !== 261.63));
          break;
        case '2':
          stopNote(277.18);
          setActiveNote((prev) => prev.filter((note) => note !== 277.18));
          break;
        case 'w':
          stopNote(293.66);
          setActiveNote((prev) => prev.filter((note) => note !== 293.66));
          break;
        case '3':
          stopNote(311.13);
          setActiveNote((prev) => prev.filter((note) => note !== 311.13));
          break;
        case 'e':
          stopNote(329.63);
          setActiveNote((prev) => prev.filter((note) => note !== 329.63));
          break;
        case 'r':
          stopNote(349.23);
          setActiveNote((prev) => prev.filter((note) => note !== 349.23));
          break;
        case '5':
          stopNote(369.99);
          setActiveNote((prev) => prev.filter((note) => note !== 369.99));
          break;
        case 't':
          stopNote(392.0);
          setActiveNote((prev) => prev.filter((note) => note !== 392.0));
          break;
        case '6':
          stopNote(415.3);
          setActiveNote((prev) => prev.filter((note) => note !== 415.3));
          break;
        case 'y':
          stopNote(440.0);
          setActiveNote((prev) => prev.filter((note) => note !== 440.0));
          break;
        case '7':
          stopNote(466.16);
          setActiveNote((prev) => prev.filter((note) => note !== 466.16));
          break;
        case 'u':
          stopNote(493.88);
          setActiveNote((prev) => prev.filter((note) => note !== 493.88));
          break;

        // --- Octave 5 ---
        case 'i':
          stopNote(523.25);
          setActiveNote((prev) => prev.filter((note) => note !== 523.25));
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
          <p className='flex justify-center items-center gap-1'>
            Waveform
            <LuAudioLines />
          </p>
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
          <div className='flex flex-col justify-center items-center gap-2 outline outline-gray-700 rounded-4xl p-8 w-60'>
            <p className='flex justify-center items-center gap-1'>
              ADSR
              <LuAudioWaveform />
            </p>
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
          <div className='flex flex-col justify-center items-center gap-2 outline outline-gray-700 rounded-4xl p-8 w-60'>
            <p className='flex justify-center items-center gap-1'>
              Filter
              <LuSpline className='rotate-90' />
            </p>
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
          <div className='flex flex-col justify-center items-center gap-2 outline outline-gray-700 rounded-4xl p-8 w-60'>
            <p className='flex justify-center items-center gap-1'>
              Delay
              <LuRepeat />
            </p>
            <div className='flex flex-col justify-center items-center gap-2 w-48'>
              <label htmlFor='delayTime'>Delay Time {selDelayTime}s</label>
              <input
                type='range'
                name='delayTime'
                id='delayTime'
                min='0'
                max='1'
                step={0.01}
                value={selDelayTime}
                onChange={(e) => handleDelayTime(e.target.value)}
              />
            </div>
            <div className='flex flex-col justify-center items-center gap-2 w-48'>
              <label htmlFor='feedback'>Feedback {selDelayFeedback}</label>
              <input
                type='range'
                name='feedback'
                id='feedback'
                min='0'
                max='0.9'
                step={0.01}
                value={selDelayFeedback}
                onChange={(e) => handleDelayFeedback(e.target.value)}
              />
            </div>
          </div>
          <div className='flex flex-col justify-center items-center gap-2 outline outline-gray-700 rounded-4xl p-8 w-60'>
            <label
              className='flex justify-center items-center gap-1'
              htmlFor='volume'
            >
              Volume {(selVolume * 10).toFixed(1)}
              <LuVolume2 />
            </label>
            <input
              type='range'
              name='volume'
              id='volume'
              min='0'
              max='0.5'
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
              className={`flex justify-center items-end pb-4 min-h-45 
    bg-gray-300 hover:bg-gray-400 active:text-gray-300 active:bg-gray-500 
    rounded-xl px-4 py-20 border border-gray-400 relative z-0 
    text-gray-500 font-bold 
    ${activeNote.includes(key.freq) ? 'bg-green-500' : 'bg-gray-300'}`}
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
              className={`hover:bg-gray-700 active:bg-gray-600 rounded-md w-8 h-28 absolute top-0 z-10 text-gray-300 font-bold
    ${activeNote.includes(key.freq) ? 'bg-green-500' : 'bg-gray-800'}
  `}
              style={{ marginLeft: '-20px', left: `${key.left}px` }}
            >
              {key.note}
            </button>
          ))}
        </div>
        <div className='flex flex-col text-center mt-2'>
          <p className='font-bold'>How to play:</p>
          <p>
            Use computer keyboard keys Z–M and S, D, G, H, J for sharps for
            lower octave, Q–U and numbers 2,3,5,6,7 for middle octave.
          </p>
          <p>
            <em>Tip for mobile:</em> Rotate your phone to landscape mode for the
            best experience.
          </p>
        </div>
      </main>
    </>
  );
}

export default App;
