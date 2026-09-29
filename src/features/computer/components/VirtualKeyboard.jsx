import React from 'react';

const KEYBOARD_ROWS = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'BACKSPACE'],
  ['TAB', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
  ['CAPS', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'ENTER'],
  ['SHIFT', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'SHIFT_R'],
  ['CTRL', 'OPT', 'CMD', 'SPACE', 'CMD_R', 'OPT_R', 'CTRL_R']
];

export default function VirtualKeyboard({ expectedChar, activeKey, feedback, onKeyPress, highlightExpected = true }) {
  // Finger mapping for the top rows based on standard touch typing
  const getFingerForChar = (char) => {
    if (!char) return null;
    const upper = char.toUpperCase();
    const fingerMap = {
      '1':'Left Pinky', 'Q':'Left Pinky', 'A':'Left Pinky', 'Z':'Left Pinky',
      '2':'Left Ring', 'W':'Left Ring', 'S':'Left Ring', 'X':'Left Ring',
      '3':'Left Middle', 'E':'Left Middle', 'D':'Left Middle', 'C':'Left Middle',
      '4':'Left Index', 'R':'Left Index', 'F':'Left Index', 'V':'Left Index',
      '5':'Left Index', 'T':'Left Index', 'G':'Left Index', 'B':'Left Index',
      '6':'Right Index', 'Y':'Right Index', 'H':'Right Index', 'N':'Right Index',
      '7':'Right Index', 'U':'Right Index', 'J':'Right Index', 'M':'Right Index',
      '8':'Right Middle', 'I':'Right Middle', 'K':'Right Middle', ',':'Right Middle',
      '9':'Right Ring', 'O':'Right Ring', 'L':'Right Ring', '.':'Right Ring',
      '0':'Right Pinky', 'P':'Right Pinky', ';':'Right Pinky', '/':'Right Pinky',
      '-':'Right Pinky', '[':'Right Pinky', "'":'Right Pinky',
      '=':'Right Pinky', ']':'Right Pinky', '\\':'Right Pinky',
      'SPACE': 'Thumb'
    };
    return fingerMap[upper] || null;
  };

  const expectedFinger = expectedChar ? getFingerForChar(expectedChar) : null;

  return (
    <div className="mx-auto w-full max-w-5xl select-none flex flex-col items-center">
      {/* Finger Guidance */}
      <div className="h-8 mb-4 flex items-center justify-center">
        {highlightExpected && expectedFinger && (
          <div className="flex items-center gap-2 rounded-full bg-blue-100/90 px-5 py-1.5 text-[15px] font-black text-blue-800 shadow-sm border-2 border-blue-200">
            Use: {expectedFinger}
          </div>
        )}
      </div>

      <div className="w-full rounded-[24px] bg-[#cbd5e1]/50 p-3 sm:p-4 shadow-inner border-2 border-[#94a3b8]/30">
        <div className="flex flex-col gap-2">
          {KEYBOARD_ROWS.map((row, rowIdx) => (
            <div key={rowIdx} className="flex justify-center gap-2 w-full">
              {row.map((key) => {
                const isExpected = highlightExpected && key === (expectedChar === ' ' ? 'SPACE' : expectedChar?.toUpperCase());
                let isPressed = key === activeKey;
                // Treat right-side modifiers as pressed if activeKey matches base modifier
                if (key === 'SHIFT_R' && activeKey === 'SHIFT') isPressed = true;
                if (key === 'CMD_R' && activeKey === 'CMD') isPressed = true;
                if (key === 'OPT_R' && activeKey === 'OPT') isPressed = true;
                if (key === 'CTRL_R' && activeKey === 'CTRL') isPressed = true;
                
                let widthClass = 'flex-1 max-w-[50px] sm:max-w-[60px]';
                let displayKey = key;
                let textClass = 'text-[16px] sm:text-xl font-black font-heading';
                let alignClass = 'items-center justify-center';
                
                // Handle special widths and alignments
                if (key === 'BACKSPACE') { widthClass = 'flex-[1.5] max-w-[90px]'; textClass = 'text-[12px] sm:text-sm font-bold'; displayKey = 'delete'; alignClass = 'items-end pb-2 justify-end pr-3'; }
                else if (key === 'TAB') { widthClass = 'flex-[1.5] max-w-[90px]'; textClass = 'text-[12px] sm:text-sm font-bold'; displayKey = 'tab'; alignClass = 'items-end pb-2 justify-start pl-3'; }
                else if (key === 'CAPS') { widthClass = 'flex-[1.8] max-w-[105px]'; textClass = 'text-[12px] sm:text-sm font-bold'; displayKey = 'caps lock'; alignClass = 'items-end pb-2 justify-start pl-3'; }
                else if (key === 'ENTER') { widthClass = 'flex-[1.8] max-w-[105px]'; textClass = 'text-[12px] sm:text-sm font-bold'; displayKey = 'return'; alignClass = 'items-end pb-2 justify-end pr-3'; }
                else if (key === 'SHIFT' || key === 'SHIFT_R') { widthClass = 'flex-[2.3] max-w-[135px]'; textClass = 'text-[12px] sm:text-sm font-bold'; displayKey = 'shift'; alignClass = key === 'SHIFT' ? 'items-end pb-2 justify-start pl-3' : 'items-end pb-2 justify-end pr-3'; }
                else if (key === 'SPACE') { widthClass = 'flex-[6] max-w-[360px]'; displayKey = ''; }
                else if (['CTRL', 'CTRL_R', 'OPT', 'OPT_R', 'CMD', 'CMD_R'].includes(key)) {
                  widthClass = 'flex-[1.2] max-w-[70px]';
                  textClass = 'text-[11px] sm:text-xs font-bold';
                  const mapping = { 'CTRL':'control', 'CTRL_R':'control', 'OPT':'option', 'OPT_R':'option', 'CMD':'command', 'CMD_R':'command' };
                  displayKey = mapping[key];
                  alignClass = 'items-end pb-2 justify-center';
                }

                let stateClass = 'bg-[#f8fafc] text-slate-700 border-b-[4px] border-[#cbd5e1] hover:bg-white active:border-b-0 active:mt-[4px] active:translate-y-0';
                
                if (isExpected) {
                  stateClass = 'bg-emerald-400 text-white border-b-[4px] border-emerald-600 shadow-[0_0_15px_rgba(52,211,153,0.6)] z-10 animate-[pulse_2s_ease-in-out_infinite]';
                }
                
                if (isPressed) {
                  stateClass = 'bg-slate-300 text-slate-800 border-b-0 border-t-[4px] border-transparent mt-[4px] shadow-inner';
                  if (isExpected) {
                    stateClass = 'bg-emerald-500 text-white border-b-0 border-t-[4px] border-transparent mt-[4px] shadow-inner';
                  } else if (feedback?.type === 'error' || feedback === 'error') {
                    stateClass = 'bg-rose-500 text-white border-b-0 border-t-[4px] border-transparent mt-[4px] shadow-inner';
                  }
                }

                return (
                  <button
                    key={key}
                    onClick={() => onKeyPress(key.replace('_R', ''))}
                    className={`flex rounded-lg sm:rounded-xl h-12 sm:h-16 transition-all ${alignClass} ${widthClass} ${textClass} ${stateClass}`}
                  >
                    {displayKey}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
