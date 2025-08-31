import { useRef } from 'react';
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
  // const audioCtx = new AudioContext();
  const audioCtxRef = useRef<AudioContext>(null);
  const oscillatorRef = useRef<OscillatorNode>(null);

  function playNote(note: number) {
    // Skapar ljudmotorn om det inte redan finns
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }

    const oscillator = audioCtxRef.current.createOscillator();
    oscillator.frequency.value = note;

    oscillator.connect(audioCtxRef.current.destination);
    oscillator.start();

    oscillatorRef.current = oscillator;
  }

  function stopNote() {
    oscillatorRef.current?.stop();
    oscillatorRef.current?.disconnect(); // disconnect prevent memory leaks
    oscillatorRef.current = null;
  }

  return (
    <>
      <Header />
      <main className='flex flex-col gap-2 justify-center items-center p-4'>
        <div>
          <button
            onMouseDown={() => playNote(440)}
            onMouseUp={stopNote}
            className='bg-gray-800 hover:bg-gray-900 rounded-4xl px-4 py-2'
          >
            Note C
          </button>
          <button
            onMouseDown={() => playNote(220)}
            onMouseUp={stopNote}
            className='bg-gray-800 hover:bg-gray-900 rounded-4xl px-4 py-2'
          >
            Note C 220
          </button>
        </div>
        <div className='relative flex'>
          {/* White keys */}
          <button
            onMouseDown={() => playNote(261.63)} // C4
            onMouseUp={stopNote}
            className=' flex justify-center items-end pb-4 bg-gray-300 hover:bg-gray-400 active:bg-gray-500 rounded-xl px-4 py-20 border border-gray-400 relative z-0 text-gray-500 font-bold'
          >
            C
          </button>
          <button
            onMouseDown={() => playNote(293.66)} // D4
            onMouseUp={stopNote}
            className='flex justify-center items-end pb-4
 bg-gray-300 hover:bg-gray-400 active:bg-gray-500 rounded-xl px-4 py-20 border border-gray-400 relative z-0 text-gray-500 font-bold'
          >
            D
          </button>
          <button
            onMouseDown={() => playNote(329.63)} // E4
            onMouseUp={stopNote}
            className='flex justify-center items-end pb-4 bg-gray-300 hover:bg-gray-400 active:bg-gray-500 rounded-xl px-4 py-20 border border-gray-400 relative z-0 text-gray-500 font-bold'
          >
            E
          </button>
          <button
            onMouseDown={() => playNote(349.23)} // F4
            onMouseUp={stopNote}
            className='flex justify-center items-end pb-4 bg-gray-300 hover:bg-gray-400 active:bg-gray-500 rounded-xl px-4 py-20 border border-gray-400 relative z-0 text-gray-500 font-bold'
          >
            F
          </button>
          <button
            onMouseDown={() => playNote(392.0)} // G4
            onMouseUp={stopNote}
            className='flex justify-center items-end pb-4 bg-gray-300 hover:bg-gray-400 active:bg-gray-500 rounded-xl px-4 py-20 border border-gray-400 relative z-0 text-gray-500 font-bold'
          >
            G
          </button>
          <button
            onMouseDown={() => playNote(440.0)} // A4
            onMouseUp={stopNote}
            className='flex justify-center items-end pb-4 bg-gray-300 hover:bg-gray-400 active:bg-gray-500 rounded-xl px-4 py-20 border border-gray-400 relative z-0 text-gray-500 font-bold'
          >
            A
          </button>
          <button
            onMouseDown={() => playNote(493.88)} // B4
            onMouseUp={stopNote}
            className='flex justify-center items-end pb-4 bg-gray-300 hover:bg-gray-400 active:bg-gray-500 rounded-xl px-4 py-20 border border-gray-400 relative z-0 text-gray-500 font-bold'
          >
            B
          </button>
          <button
            onMouseDown={() => playNote(523.25)} // C5
            onMouseUp={stopNote}
            className=' bg-gray-300 hover:bg-gray-400 active:bg-gray-500 rounded-xl px-4 py-20 border border-gray-400 relative z-0 text-gray-500 font-bold'
          >
            C
          </button>

          {/* Black keys */}
          <button
            onMouseDown={() => playNote(277.18)} // C#4/Db4
            onMouseUp={stopNote}
            className='bg-gray-800 hover:bg-gray-700 active:bg-gray-600 rounded-md w-8 h-28 absolute left-[48px] top-0 z-10 text-gray-300 font-bold'
            style={{ marginLeft: '-16px' }}
          >
            C#
          </button>
          <button
            onMouseDown={() => playNote(311.13)} // D#4/Eb4
            onMouseUp={stopNote}
            className='bg-gray-800 hover:bg-gray-700 active:bg-gray-600 rounded-md w-8 h-28 absolute left-[98px] top-0 z-10 text-gray-300 font-bold'
            style={{ marginLeft: '-16px' }}
          >
            D#
          </button>
          {/* No black key between E and F */}
          <button
            onMouseDown={() => playNote(369.99)} // F#4/Gb4
            onMouseUp={stopNote}
            className='bg-gray-800 hover:bg-gray-700 active:bg-gray-600 rounded-md w-8 h-28 absolute left-[195px] top-0 z-10 text-gray-300 font-bold'
            style={{ marginLeft: '-16px' }}
          >
            F#
          </button>
          <button
            onMouseDown={() => playNote(415.3)} // G#4/Ab4
            onMouseUp={stopNote}
            className='bg-gray-800 hover:bg-gray-700 active:bg-gray-600 rounded-md w-8 h-28 absolute left-[245px] top-0 z-10 text-gray-300 font-bold'
            style={{ marginLeft: '-16px' }}
          >
            G#
          </button>
          <button
            onMouseDown={() => playNote(466.16)} // A#4/Bb4
            onMouseUp={stopNote}
            className='bg-gray-800 hover:bg-gray-700 active:bg-gray-600 rounded-md w-8 h-28 absolute left-[295px] top-0 z-10 text-gray-300 font-bold'
            style={{ marginLeft: '-16px' }}
          >
            A#
          </button>
        </div>
      </main>
    </>
  );
}

export default App;
