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
        <h1>yo</h1>
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
      </main>
    </>
  );
}

export default App;
