import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, RotateCcw, Monitor, SkipBack } from 'lucide-react';
import { AlgorithmStep, SimulationState, AlgorithmType } from '../types';
import { generateMemoryData } from '../utils/memoryUtils';
import MemoryCell from './MemoryCell';
import CodeBlock from './CodeBlock';

const CODE_WHOLE = `void reverseString(char* str) {
    int len = strlen(str);
    int left = 0;
    int right = len - 1;

    while (left < right) {
        // 交换字符
        swap(str[left], str[right]);
        
        // 移动指针
        left++;
        right--;
    }
}`;

const CODE_WORD = `void printReversedWords(char* c) {
    int len = strlen(c);
    int start = 0;

    for (int i = 0; i <= len; i++) {
        // 遇到空格或结束符
        if (c[i] == ' ' || c[i] == '\\0') {
            // 反向打印单词
            for (int j = i - 1; j >= start; j--) {
                cout << c[j];
            }
            // 如果是空格，打印空格
            if (c[i] == ' ') cout << ' ';
            
            start = i + 1;
        }
    }
}`;

const LINE_MAPPING_WHOLE = {
  [AlgorithmStep.IDLE]: -1,
  [AlgorithmStep.CHECK_LOOP]: 5,
  [AlgorithmStep.SWAP]: 7,
  [AlgorithmStep.MOVE_POINTERS]: 10, 
  [AlgorithmStep.FINISHED]: 12 
};

const LINE_MAPPING_WORD = {
  [AlgorithmStep.IDLE]: -1,
  [AlgorithmStep.SCAN_I]: 4, // for loop check
  [AlgorithmStep.CHECK_BOUNDARY]: 6, // if space or null
  [AlgorithmStep.PRINT_LOOP_INIT]: 8, // inner for loop init
  [AlgorithmStep.PRINT_LOOP_CHECK]: 8, // inner for loop check
  [AlgorithmStep.PRINT_CHAR]: 9, // cout << c[j]
  [AlgorithmStep.CHECK_SPACE]: 12, // if space cout space
  [AlgorithmStep.UPDATE_START]: 14, // start = i + 1
  [AlgorithmStep.FINISHED]: 17
};

// --- Pure Helper Functions for Logic ---

function createInitialState(str: string, type: AlgorithmType): SimulationState {
  const chars = generateMemoryData(str);
  const len = chars.length - 1; // Exclude \0

  return {
    chars: chars,
    leftIndex: 0,
    rightIndex: len > 0 ? len - 1 : 0,
    iIndex: 0,
    jIndex: -1,
    startIndex: 0,
    step: AlgorithmStep.IDLE,
    message: "准备就绪。",
    codeLineIndex: -1,
    outputBuffer: ""
  };
}

const processWholeReversal = (prev: SimulationState): SimulationState => {
  const { leftIndex, rightIndex, step, chars } = prev;

  switch (step) {
    case AlgorithmStep.IDLE:
      return {
        ...prev,
        step: AlgorithmStep.CHECK_LOOP,
        message: `检查循环条件: left(${leftIndex}) < right(${rightIndex})?`,
        codeLineIndex: LINE_MAPPING_WHOLE[AlgorithmStep.CHECK_LOOP]
      };

    case AlgorithmStep.CHECK_LOOP:
      if (leftIndex < rightIndex) {
        return {
          ...prev,
          step: AlgorithmStep.SWAP,
          message: `交换 str[${leftIndex}] ('${chars[leftIndex].char}') 和 str[${rightIndex}] ('${chars[rightIndex].char}')`,
          codeLineIndex: LINE_MAPPING_WHOLE[AlgorithmStep.SWAP]
        };
      } else {
        return {
          ...prev,
          step: AlgorithmStep.FINISHED,
          message: "循环结束。字符串已反转完成。",
          codeLineIndex: LINE_MAPPING_WHOLE[AlgorithmStep.FINISHED]
        };
      }

    case AlgorithmStep.SWAP:
      const newChars = [...chars];
      const temp = newChars[leftIndex];
      // Swap content and ID to animate movement if supported by keys
      newChars[leftIndex] = { ...newChars[leftIndex], char: newChars[rightIndex].char, id: newChars[rightIndex].id };
      newChars[rightIndex] = { ...newChars[rightIndex], char: temp.char, id: temp.id };
      
      return {
        ...prev,
        chars: newChars,
        step: AlgorithmStep.MOVE_POINTERS,
        message: "数值已交换。准备移动指针。",
        codeLineIndex: LINE_MAPPING_WHOLE[AlgorithmStep.MOVE_POINTERS]
      };

    case AlgorithmStep.MOVE_POINTERS:
      return {
        ...prev,
        leftIndex: leftIndex + 1,
        rightIndex: rightIndex - 1,
        step: AlgorithmStep.CHECK_LOOP,
        message: "执行 left++ 和 right--。",
        codeLineIndex: LINE_MAPPING_WHOLE[AlgorithmStep.CHECK_LOOP]
      };

    default:
      return prev;
  }
};

const processWordReversal = (prev: SimulationState): SimulationState => {
  const { chars, iIndex, jIndex, startIndex, step, outputBuffer } = prev;

  switch (step) {
    case AlgorithmStep.IDLE:
      return {
        ...prev,
        step: AlgorithmStep.SCAN_I,
        iIndex: 0,
        startIndex: 0,
        outputBuffer: "",
        message: "开始扫描字符串...",
        codeLineIndex: LINE_MAPPING_WORD[AlgorithmStep.SCAN_I]
      };

    case AlgorithmStep.SCAN_I:
      if (iIndex < chars.length) {
         return {
           ...prev,
           step: AlgorithmStep.CHECK_BOUNDARY,
           message: `检查 str[${iIndex}] ('${chars[iIndex].char}') 是否为空格或 \\0`,
           codeLineIndex: LINE_MAPPING_WORD[AlgorithmStep.CHECK_BOUNDARY]
         };
      } else {
         return { ...prev, step: AlgorithmStep.FINISHED, message: "扫描完成。", codeLineIndex: LINE_MAPPING_WORD[AlgorithmStep.FINISHED] };
      }

    case AlgorithmStep.CHECK_BOUNDARY:
      const currentChar = chars[iIndex].char;
      if (currentChar === ' ' || currentChar === '\\0') {
        return {
          ...prev,
          step: AlgorithmStep.PRINT_LOOP_INIT,
          message: `发现单词边界。准备反向打印: j = ${iIndex - 1} 到 ${startIndex}`,
          codeLineIndex: LINE_MAPPING_WORD[AlgorithmStep.PRINT_LOOP_INIT]
        };
      } else {
        return {
          ...prev,
          iIndex: iIndex + 1,
          step: AlgorithmStep.SCAN_I,
          message: "继续扫描...",
          codeLineIndex: LINE_MAPPING_WORD[AlgorithmStep.SCAN_I]
        };
      }

    case AlgorithmStep.PRINT_LOOP_INIT:
      return {
        ...prev,
        jIndex: iIndex - 1,
        step: AlgorithmStep.PRINT_LOOP_CHECK,
        codeLineIndex: LINE_MAPPING_WORD[AlgorithmStep.PRINT_LOOP_CHECK]
      };

    case AlgorithmStep.PRINT_LOOP_CHECK:
      if (jIndex >= startIndex) {
         return {
           ...prev,
           step: AlgorithmStep.PRINT_CHAR,
           message: `输出字符: ${chars[jIndex].char}`,
           codeLineIndex: LINE_MAPPING_WORD[AlgorithmStep.PRINT_CHAR]
         };
      } else {
         return {
           ...prev,
           step: AlgorithmStep.CHECK_SPACE,
           message: "单词打印完毕。检查是否需要输出空格。",
           codeLineIndex: LINE_MAPPING_WORD[AlgorithmStep.CHECK_SPACE]
         };
      }

    case AlgorithmStep.PRINT_CHAR:
      return {
        ...prev,
        outputBuffer: outputBuffer + chars[jIndex].char,
        jIndex: jIndex - 1, 
        step: AlgorithmStep.PRINT_LOOP_CHECK,
        codeLineIndex: LINE_MAPPING_WORD[AlgorithmStep.PRINT_LOOP_CHECK]
      };

    case AlgorithmStep.CHECK_SPACE:
      let newBuffer = outputBuffer;
      let msg = "不需要输出空格。";
      if (chars[iIndex].char === ' ') {
        newBuffer += ' ';
        msg = "当前位置是空格，输出空格。";
      }
      
      return {
        ...prev,
        outputBuffer: newBuffer,
        step: AlgorithmStep.UPDATE_START,
        message: msg,
        codeLineIndex: LINE_MAPPING_WORD[AlgorithmStep.UPDATE_START]
      };

    case AlgorithmStep.UPDATE_START:
      const nextI = iIndex + 1;
      if (nextI >= chars.length) { 
         return {
           ...prev,
           step: AlgorithmStep.FINISHED,
           message: "处理完成。",
           codeLineIndex: LINE_MAPPING_WORD[AlgorithmStep.FINISHED]
         };
      }
      return {
        ...prev,
        startIndex: iIndex + 1,
        iIndex: nextI,
        step: AlgorithmStep.SCAN_I,
        message: `更新 start = ${iIndex + 1}. 继续循环 i++.`,
        codeLineIndex: LINE_MAPPING_WORD[AlgorithmStep.SCAN_I]
      };

    default:
      return prev;
  }
};

const generateTimeline = (initialString: string, type: AlgorithmType): SimulationState[] => {
    const timeline: SimulationState[] = [];
    let currentState = createInitialState(initialString, type);
    timeline.push(currentState);

    let safety = 0;
    while (currentState.step !== AlgorithmStep.FINISHED && safety < 5000) {
        if (type === AlgorithmType.WHOLE_REVERSE) {
            currentState = processWholeReversal(currentState);
        } else {
            currentState = processWordReversal(currentState);
        }
        timeline.push(currentState);
        safety++;
    }
    // Add one final frame to ensure FINISHED state is captured cleanly if logic didn't push it
    if (timeline[timeline.length - 1].step !== AlgorithmStep.FINISHED) {
      timeline.push({
        ...timeline[timeline.length - 1],
        step: AlgorithmStep.FINISHED,
        message: "已完成"
      })
    }
    return timeline;
};


interface ReversalVisualizerProps {
  initialString: string;
}

const ReversalVisualizer: React.FC<ReversalVisualizerProps> = ({ initialString }) => {
  const [algoType, setAlgoType] = useState<AlgorithmType>(AlgorithmType.WHOLE_REVERSE);
  const [timeline, setTimeline] = useState<SimulationState[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Generate timeline when input or algo changes
  useEffect(() => {
    const newTimeline = generateTimeline(initialString, algoType);
    setTimeline(newTimeline);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [initialString, algoType]);

  // Handle Playback
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < timeline.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, speed);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, speed, timeline.length]);

  const togglePlay = () => {
    if (currentStep >= timeline.length - 1) {
      setCurrentStep(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const stepForward = () => {
    if (currentStep < timeline.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const stepBackward = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setIsPlaying(false); // Pause if manual stepping
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setCurrentStep(val);
    setIsPlaying(false); // Pause on manual scrub
  };

  if (timeline.length === 0) return <div>Generating...</div>;

  const simState = timeline[currentStep];

  return (
    <div className="flex flex-col gap-6">
      
      {/* Algorithm Selector */}
      <div className="flex justify-center">
        <div className="bg-slate-800 p-1 rounded-lg inline-flex shadow-lg border border-slate-700">
           <button
             onClick={() => setAlgoType(AlgorithmType.WORD_REVERSE)}
             className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
               algoType === AlgorithmType.WORD_REVERSE 
                 ? 'bg-blue-600 text-white shadow-md' 
                 : 'text-slate-400 hover:text-white'
             }`}
           >
             反转算法 1 (单词反转)
           </button>
           <button
             onClick={() => setAlgoType(AlgorithmType.WHOLE_REVERSE)}
             className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
               algoType === AlgorithmType.WHOLE_REVERSE 
                 ? 'bg-blue-600 text-white shadow-md' 
                 : 'text-slate-400 hover:text-white'
             }`}
           >
             反转算法进阶 (整体反转)
           </button>
        </div>
      </div>

      {/* Visual Memory Area */}
      <div className="bg-slate-900/50 p-6 md:p-10 rounded-xl border border-slate-700 overflow-x-auto relative">
        <div className="flex justify-center min-w-max gap-1">
          {simState.chars.map((charData, idx) => (
            <MemoryCell 
              key={charData.id} 
              data={charData}
              isLeft={
                 algoType === AlgorithmType.WHOLE_REVERSE 
                   ? (idx === simState.leftIndex && simState.step !== AlgorithmStep.FINISHED)
                   : (idx === simState.startIndex && simState.step !== AlgorithmStep.FINISHED)
              }
              isRight={
                 algoType === AlgorithmType.WHOLE_REVERSE 
                   ? (idx === simState.rightIndex && simState.step !== AlgorithmStep.FINISHED)
                   : (idx === simState.iIndex && simState.step !== AlgorithmStep.FINISHED)
              }
              isSwapping={
                algoType === AlgorithmType.WHOLE_REVERSE
                  ? (simState.step === AlgorithmStep.SWAP && (idx === simState.leftIndex || idx === simState.rightIndex))
                  : (idx === simState.jIndex && simState.step.toString().startsWith('PRINT'))
              }
            />
          ))}
        </div>
        
        {/* Legend */}
        {algoType === AlgorithmType.WORD_REVERSE && (
          <div className="absolute top-2 right-2 text-xs text-slate-500 bg-slate-950/80 p-2 rounded border border-slate-800">
            <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-cyan-400"></span> <span>Left = start</span></div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> <span>Right = i (scan)</span></div>
          </div>
        )}
      </div>

      {/* Output Console for Algorithm 1 */}
      {algoType === AlgorithmType.WORD_REVERSE && (
        <div className="bg-black rounded-lg border border-slate-700 p-4 font-mono shadow-inner relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-50"></div>
           <div className="flex items-center gap-2 text-slate-500 mb-2 text-xs uppercase tracking-wider">
             <Monitor size={14} />
             <span>Console Output (标准输出)</span>
           </div>
           <div className="text-xl text-green-400 min-h-[1.5em] whitespace-pre">
             {simState.outputBuffer}<span className="animate-pulse inline-block w-2 h-5 bg-green-400 ml-1 align-middle"></span>
           </div>
        </div>
      )}

      {/* Control Panel & Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Controls */}
        <div className="flex flex-col gap-4">
          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">算法控制</h3>
              <button 
                onClick={() => { setCurrentStep(0); setIsPlaying(false); }}
                className="p-2 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                title="重置"
              >
                <RotateCcw size={20} />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-3">
               <span className="text-xs font-mono text-slate-500 min-w-[3ch] text-right">{currentStep}</span>
               <div className="relative flex-1 h-6 flex items-center">
                  <input 
                    type="range"
                    min="0"
                    max={Math.max(0, timeline.length - 1)}
                    value={currentStep}
                    onChange={handleSliderChange}
                    className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-500 z-10"
                  />
                  {/* Progress track fill (visual) */}
                  <div 
                    className="absolute h-2 bg-blue-500/50 rounded-l-lg pointer-events-none top-1/2 -translate-y-1/2"
                    style={{ width: `${(currentStep / (timeline.length - 1 || 1)) * 100}%` }}
                  ></div>
               </div>
               <span className="text-xs font-mono text-slate-500 min-w-[3ch]">{timeline.length - 1}</span>
            </div>

            {/* Playback Buttons */}
            <div className="flex gap-2">
              <button 
                onClick={stepBackward}
                disabled={currentStep === 0}
                className="px-4 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-colors"
              >
                <SkipBack size={20} />
              </button>

              <button 
                onClick={togglePlay}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all
                  ${isPlaying 
                    ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-900/20' 
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20'}
                `}
              >
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                {isPlaying ? "暂停" : "开始 / 继续"}
              </button>

              <button 
                onClick={stepForward}
                disabled={currentStep >= timeline.length - 1}
                className="px-4 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-colors"
              >
                <SkipForward size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>慢</span>
                <span>速度</span>
                <span>快</span>
              </div>
              <input 
                type="range" 
                min="100" 
                max="2000" 
                step="100"
                value={2100 - speed} 
                onChange={(e) => setSpeed(2100 - parseInt(e.target.value))}
                className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>

          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 min-h-[100px] flex flex-col justify-center">
             <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">当前状态</span>
             <p className="text-lg text-blue-300 font-medium">
               {simState.message}
             </p>
          </div>
        </div>

        {/* Code Visualization */}
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-white">C++ 实现代码</h3>
          </div>
          <CodeBlock 
            code={algoType === AlgorithmType.WHOLE_REVERSE ? CODE_WHOLE : CODE_WORD} 
            activeLine={simState.codeLineIndex} 
          />
        </div>

      </div>
    </div>
  );
};

export default ReversalVisualizer;