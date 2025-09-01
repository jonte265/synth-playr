import { useEffect, useRef } from 'react';
import Header from './components/Header';

// const oscillator = audioCtx.createOscillator();
// oscillator.frequency.value = 220;
// oscillator.type = 'sine';
// const gain = audioCtx.createGain();
// oscillator.connect(gain);
// gain.connect(audioCtx.destination); // Connect to speaker
// gain.gain.value = 1
// oscillator.start();

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

  // const audioCtx = new AudioContext();
  const audioCtxRef = useRef<AudioContext>(null);
  // const oscillatorRef = useRef<OscillatorNode>(null);
  const oscillatorRef = useRef<{ id: number; osc: OscillatorNode }[]>([]);

  function playNote(freq: number) {
    // Skapar ljudmotorn om det inte redan finns
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }

    const oscillator = audioCtxRef.current.createOscillator();
    oscillator.frequency.value = freq;
    oscillator.type = 'sawtooth';

    const gain = audioCtxRef.current.createGain();
    gain.gain.value = 0.1;
    // gain.gain.exponentialRampToValueAtTime(
    //   0.000001,
    //   audioCtxRef.current.currentTime + 1
    // );

    oscillator.connect(gain);
    gain.connect(audioCtxRef.current.destination); // connect to "speaker"

    oscillator.start();

    oscillatorRef.current.push({
      id: freq,
      osc: oscillator,
    });

    // console.log(oscillatorRef.current);
  }

  function stopNote(freq: number) {
    const index = oscillatorRef.current.findIndex((o) => o.id === freq);
    // console.log(index);

    if (index !== -1) {
      oscillatorRef.current[index].osc.stop();
      oscillatorRef.current[index].osc.disconnect();
      oscillatorRef.current.splice(index, 1);
    }
  }

  useEffect(() => {
    function handleKeydown(event: any) {
      if (event.repeat) {
        return;
      }

      switch (event.key) {
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
      switch (event.key) {
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
      <main className='flex flex-col gap-2 justify-center items-center p-4'>
        <div className='relative flex'>
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
