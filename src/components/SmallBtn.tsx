type smallBtnType = {
  text: string;
  onClick?: () => void;
  icon?: any;
  selected: boolean;
};

function SmallBtn({ text, icon, onClick, selected }: smallBtnType) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-row justify-center items-center gap-2 bg-gray-800 hover:bg-gray-700 rounded-4xl py-1 px-4 transition-all ease-in-out ${
        selected ? 'outline outline-accent' : ''
      }`}
    >
      <div className='text-accent text-xl'>{icon && icon}</div>
      {text}
    </button>
  );
}

export default SmallBtn;