import React from 'react';

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ','],
  ['SPACE']
];

export default function VirtualKeyboard({ expectedChar, activeKey, feedback, onKeyPress, highlightExpected = true }) {
  // Finger mapping for the top rows based on standard touch typing
  const getFingerForChar = (char) => {
    const fingerMap = {
      'Q': 'Left Pinky', 'A': 'Left Pinky', 'Z': 'Left Pinky',
      'W': 'Left Ring', 'S': 'Left Ring', 'X': 'Left Ring',
      'E': 'Left Middle', 'D': 'Left Middle', 'C': 'Left Middle',
      'R': 'Left Index', 'F': 'Left Index', 'V': 'Left Index',
      'T': 'Left Index', 'G': 'Left Index', 'B': 'Left Index',
      'Y': 'Right Index', 'H': 'Right Index', 'N': 'Right Index',
      'U': 'Right Index', 'J': 'Right Index', 'M': 'Right Index',
      'I': 'Right Middle', 'K': 'Right Middle', ',': 'Right Middle',
      'O': 'Right Ring', 'L': 'Right Ring',
      'P': 'Right Pinky',
      'SPACE': 'Thumb'
    };
    return fingerMap[char] || null;
  };

  const expectedFinger = expectedChar ? getFingerForChar(expectedChar) : null;

  return (
    <div className="mx-auto w-full max-w-5xl select-none flex flex-col items-center">
      
      {/* Finger Guidance */}
      <div className="h-8 mb-6 flex items-center justify-center">
        {highlightExpected && expectedFinger && (
          <div className="flex items-center gap-2 rounded-full bg-blue-100/90 px-5 py-1.5 text-[15px] font-black text-blue-800 shadow-sm border-2 border-blue-200">
            Use: {expectedFinger}
          </div>
        )}
      </div>

      <div className="w-full rounded-[32px] bg-[#d9e6e6]/60 p-4 shadow-inner border-4 border-white sm:p-8 lg:p-10">
        {KEYBOARD_ROWS.map((row, rowIdx) => {
          let rowClass = "mb-3 lg:mb-4 flex justify-center gap-2 sm:gap-3 lg:gap-4";
          if (rowIdx === 1) rowClass += " ml-[4%] sm:ml-[5%] lg:ml-[6%]";
          if (rowIdx === 2) rowClass += " ml-[8%] sm:ml-[10%] lg:ml-[12%]";
          
          return (
            <div key={rowIdx} className={rowClass}>
              {row.map((key) => {
                const isExpected = highlightExpected && key === expectedChar;
                const isPressed = key === activeKey;
                
                let widthClass = 'w-10 sm:w-16 lg:w-20';
                let heightClass = 'h-14 sm:h-20 lg:h-24';
                let displayKey = key;
                let textClass = 'text-xl sm:text-3xl lg:text-4xl font-black font-heading';
                
                if (key === 'SPACE') {
                  widthClass = 'w-64 sm:w-[500px] lg:w-[600px]';
                  heightClass = 'h-14 sm:h-20 lg:h-24';
                  displayKey = '';
                } 

                let stateClass = 'bg-white text-slate-700 border-b-[6px] border-slate-300 hover:bg-slate-50 hover:-translate-y-0.5 active:translate-y-1 active:border-b-0 active:mt-[6px]';
                
                if (isExpected) {
                  stateClass = 'bg-emerald-400 text-white border-b-[6px] border-emerald-600 shadow-[0_0_20px_rgba(52,211,153,0.6)] z-10 animate-[pulse_2s_ease-in-out_infinite]';
                }
                
                if (isPressed) {
                  stateClass = 'bg-slate-200 text-slate-800 border-b-0 border-t-[6px] border-transparent translate-y-1 shadow-none mt-[6px]';
                  if (isExpected) {
                    stateClass = 'bg-emerald-500 text-white border-b-0 border-t-[6px] border-transparent translate-y-1 shadow-none mt-[6px]';
                  } else if (feedback?.type === 'error' || feedback === 'error') {
                    stateClass = 'bg-rose-500 text-white border-b-0 border-t-[6px] border-transparent translate-y-1 shadow-none mt-[6px]';
                  }
                }

                return (
                  <button
                    key={key}
                    onClick={() => onKeyPress(key)}
                    className={`flex items-center justify-center rounded-xl sm:rounded-2xl lg:rounded-3xl transition-all ${widthClass} ${heightClass} ${textClass} ${stateClass}`}
                  >
                    {displayKey}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
