import Header from './components/Header';

const audioCtx = new AudioContext();
const oscillator = audioCtx.createOscillator();

oscillator.frequency.value = 220;
oscillator.type = 'triangle';

oscillator.connect(audioCtx.destination); // Connect to speaker
oscillator.start();
oscillator.stop(audioCtx.currentTime + 1);

function App() {
  return (
    <>
      <Header />
      <main className='flex flex-col gap-2 justify-center items-center p-4'>
        <h1>yo</h1>
        <button className='bg-gray-800 hover:bg-gray-900 rounded-4xl px-4 py-2'>
          Play tone
        </button>
      </main>
    </>
  );
}

export default App;
