import React, { useState } from 'react';
import ReversalVisualizer from './components/ReversalVisualizer';
import { generateMemoryData } from './utils/memoryUtils';
import MemoryCell from './components/MemoryCell';
import { Info, Code, Layout, RotateCcw } from 'lucide-react';

function App() {
  const [inputStr, setInputStr] = useState("Hello World");
  const [activeTab, setActiveTab] = useState<'inspect' | 'algorithm'>('inspect');

  const memoryData = generateMemoryData(inputStr);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/20">
              <Code size={32} className="text-white" />
             </div>
             <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">C风格字符串可视化</h1>
                <p className="text-slate-400 mt-1">深入理解 <code className="bg-slate-800 px-1 py-0.5 rounded text-blue-300">char 数组</code>、<code className="bg-slate-800 px-1 py-0.5 rounded text-red-300">\0</code> 终止符以及指针。</p>
             </div>
          </div>
        </header>

        {/* Global Input */}
        <section className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl">
          <label className="block text-sm font-medium text-slate-400 mb-2">字符串输入</label>
          <div className="flex gap-4 flex-col sm:flex-row">
            <input 
              type="text" 
              maxLength={12}
              value={inputStr}
              onChange={(e) => setInputStr(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-lg placeholder-slate-600 transition-all"
              placeholder="请输入文本..."
            />
            <div className="flex items-center gap-4 px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl">
               <span className="text-slate-500 text-sm">strlen (长度): <span className="text-white font-mono font-bold">{inputStr.length}</span></span>
               <div className="w-px h-6 bg-slate-700"></div>
               <span className="text-slate-500 text-sm">sizeof (字节): <span className="text-white font-mono font-bold">{inputStr.length + 1}</span> bytes</span>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <Info size={12} />
            Sizeof 包含不可见的空终止符。最大可视化长度：12 个字符。
          </p>
        </section>

        {/* Tab Navigation */}
        <div className="border-b border-slate-800">
          <nav className="-mb-px flex gap-6">
            <button
              onClick={() => setActiveTab('inspect')}
              className={`pb-4 px-2 font-medium text-sm transition-colors relative ${
                activeTab === 'inspect' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="flex items-center gap-2"><Layout size={16}/> 内存检视</span>
              {activeTab === 'inspect' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full"></span>}
            </button>
            <button
              onClick={() => setActiveTab('algorithm')}
              className={`pb-4 px-2 font-medium text-sm transition-colors relative ${
                activeTab === 'algorithm' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="flex items-center gap-2"><RotateCcw size={16}/> 反转算法</span>
              {activeTab === 'algorithm' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full"></span>}
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <main className="min-h-[400px]">
          {activeTab === 'inspect' ? (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="bg-slate-900/50 p-6 md:p-12 rounded-xl border border-slate-700 overflow-x-auto flex flex-col items-center">
                  <div className="flex gap-1 min-w-max">
                    {memoryData.map((data) => (
                      <MemoryCell key={data.id} data={data} highlight={data.char === '\\0'} />
                    ))}
                  </div>
                  <div className="mt-8 text-center max-w-2xl text-slate-400">
                    <h3 className="text-white font-semibold mb-2">内存布局解析</h3>
                    <p className="text-sm leading-relaxed">
                      这展示了 <code>char str[] = "{inputStr}";</code> 在 RAM 中的存储方式。
                      每个方块代表 1 字节的内存单元。字符是连续存储的。
                      <span className="text-red-400 font-mono inline-block bg-slate-800 px-1 rounded">\0</span> (空终止符) 是由编译器自动添加到末尾的，用来标记字符串的结束。
                      像 <code>strlen</code> 这样的函数会从头开始计数，直到遇到这个终止符。
                    </p>
                  </div>
               </div>
            </div>
          ) : (
            <div className="animate-in fade-in duration-500 slide-in-from-bottom-4">
              <ReversalVisualizer initialString={inputStr} />
            </div>
          )}
        </main>

      </div>
    </div>
  );
}

export default App;