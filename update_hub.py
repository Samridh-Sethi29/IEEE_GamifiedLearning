with open('src/features/science/physics/components/PhysicsHub.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = '''<div className="absolute inset-0 bg-blue-500 rounded-3xl rotate-1 opacity-20 blur-md"></div>
          <div className="relative bg-white border-4 border-blue-100 rounded-3xl p-8 shadow-2xl flex flex-col items-center">
            <h1 className="text-4xl md:text-5xl font-black text-slate-800 drop-shadow-sm flex items-center justify-center gap-3 uppercase tracking-wider mb-2">
              <span className="text-5xl">??</span> PHYSICS
            </h1>
            <p className="text-lg md:text-xl text-blue-600 font-bold mb-6">
              Understand how the world moves, works, shines, and sounds.
            </p>

            <div className="flex flex-col gap-2 w-full max-w-md bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div className="flex justify-between items-end mb-2">
                <span className="text-slate-500 font-black uppercase tracking-wider text-sm">Journey Progress</span>
                <span className="text-2xl font-black text-blue-500 font-mono">{progressPercent}%</span>
              </div>
              <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: \\%\ }}></div>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500"/> {topicsCompletedCount} / 4 Topics
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500"/> {gamesCompletedCount} / 2 Games
                </div>
                <div className="flex items-center gap-2">
                  {isMissionCompleted ? <CheckCircle2 className="w-4 h-4 text-emerald-500"/> : isMissionUnlocked ? <span className="text-blue-500">??</span> : <Lock className="w-4 h-4 text-slate-400"/>} Final Mission
                </div>
              </div>
            </div>
          </div>'''

replacement = '''<div className={bsolute inset-0 rounded-3xl rotate-1 opacity-20 blur-md }></div>
          <div className={elative bg-white border-4 rounded-3xl p-8 shadow-2xl flex flex-col items-center }>
            {isMissionCompleted ? (
              <>
                <h1 className="text-4xl md:text-5xl font-black text-slate-800 drop-shadow-sm flex items-center justify-center gap-3 uppercase tracking-wider mb-2">
                  <span className="text-5xl">??</span> PHYSICS MASTERED
                </h1>
                <p className="text-lg md:text-xl text-amber-600 font-bold mb-6">
                  Progress: 100%
                </p>
                
                <div className="flex flex-col md:flex-row gap-6 text-left w-full max-w-2xl bg-amber-50 p-6 rounded-2xl border-2 border-amber-100 mb-6">
                  <div className="flex-1">
                    <div className="text-slate-500 font-black uppercase tracking-widest text-xs mb-2">Topics</div>
                    <div className="text-slate-700 font-bold space-y-1">
                      <div>? Force & Motion</div>
                      <div>? Energy</div>
                      <div>? Light</div>
                      <div>? Sound</div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-slate-500 font-black uppercase tracking-widest text-xs mb-2">Games & Mission</div>
                    <div className="text-slate-700 font-bold space-y-1">
                      <div>? Speed Racer</div>
                      <div>? Build the Circuit</div>
                      <div>? Final Mission</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white font-black text-xl px-8 py-4 rounded-xl flex items-center gap-3 shadow-lg border-2 border-amber-200 mb-4">
                  ?? Physics Master
                </div>
              </>
            ) : (
              <>
                <h1 className="text-4xl md:text-5xl font-black text-slate-800 drop-shadow-sm flex items-center justify-center gap-3 uppercase tracking-wider mb-2">
                  <span className="text-5xl">??</span> PHYSICS
                </h1>
                <p className="text-lg md:text-xl text-blue-600 font-bold mb-6">
                  Understand how the world moves, works, shines, and sounds.
                </p>

                <div className="flex flex-col gap-2 w-full max-w-md bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-slate-500 font-black uppercase tracking-wider text-sm">Journey Progress</span>
                    <span className="text-2xl font-black text-blue-500 font-mono">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: \\%\ }}></div>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-500">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500"/> {topicsCompletedCount} / 4 Topics
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500"/> {gamesCompletedCount} / 2 Games
                    </div>
                    <div className="flex items-center gap-2">
                      {isMissionCompleted ? <CheckCircle2 className="w-4 h-4 text-emerald-500"/> : isMissionUnlocked ? <span className="text-blue-500">??</span> : <Lock className="w-4 h-4 text-slate-400"/>} Final Mission
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>'''

content = content.replace(target, replacement)

with open('src/features/science/physics/components/PhysicsHub.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated PhysicsHub")
