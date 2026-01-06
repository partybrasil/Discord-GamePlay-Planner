import { useState } from 'react';

// Generates a random 6-character code (uppercase letters + numbers)
const generateSessionCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No ambiguous chars like I, 1, O, 0
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

interface LandingScreenProps {
  onJoinSession: (roomId: string) => void;
}

export default function LandingScreen({ onJoinSession }: LandingScreenProps) {
  const [sessionCode, setSessionCode] = useState('');
  const [isJoinMode, setIsJoinMode] = useState(false);

  const handleCreate = () => {
    const newCode = generateSessionCode();
    onJoinSession(newCode);
  };

  const handleJoin = () => {
    if (sessionCode.length >= 4) {
      onJoinSession(sessionCode.toUpperCase());
    }
  };

  return (
    <div className="w-screen h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 text-center">
         
         <div className="mb-8">
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-2">
              GamePlay Planner
            </h1>
            <p className="text-gray-400">Tactical Whiteboard for Gamers</p>
         </div>

         {!isJoinMode ? (
           <div className="flex flex-col gap-4">
              <button 
                onClick={handleCreate}
                className="w-full py-4 text-xl font-bold bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all hover:scale-105 shadow-lg shadow-indigo-500/20"
              >
                Strategy Room (Create)
              </button>
              
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-600"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 bg-slate-800 text-slate-500">OR</span></div>
              </div>

              <button 
                onClick={() => setIsJoinMode(true)}
                className="w-full py-3 font-semibold bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors"
              >
                Join Existing Session
              </button>
           </div>
         ) : (
           <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <h2 className="text-lg font-bold">Enter Session Code</h2>
              <input 
                type="text"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                placeholder="Ex: X7K9P"
                maxLength={8}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-center text-2xl font-mono tracking-widest focus:outline-none focus:border-indigo-500 transition-colors uppercase"
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                autoFocus
              />
              <button 
                onClick={handleJoin}
                disabled={sessionCode.length < 3}
                className="w-full py-3 font-bold bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
              >
                Join Room 🚀
              </button>
              <button 
                onClick={() => setIsJoinMode(false)}
                className="text-sm text-gray-500 hover:text-gray-300 underline"
              >
                Back
              </button>
           </div>
         )}

         <div className="mt-8 text-xs text-gray-600">
            v1.0.0 • Secure End-to-End Formatting
         </div>
      </div>
    </div>
  );
}
