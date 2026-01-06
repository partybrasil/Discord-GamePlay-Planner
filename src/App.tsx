import { useEffect, useState } from 'react';
import { DiscordSDK } from '@discord/embedded-app-sdk';
import Whiteboard from './components/Whiteboard';
import LandingScreen from './components/LandingScreen';
import { useYjsStore } from './hooks/useYjsStore';
import { useRoomState } from './hooks/useRoomState';

const discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID || "mock_client_id");

// Generate a random ID for dev if not in discord
const MOCK_USER_ID = `user-${Math.floor(Math.random() * 10000)}`;

function App() {
  const [auth, setAuth] = useState<{ code: string } | null>(null);
  const [userId] = useState<string>(MOCK_USER_ID);
  const [status, setStatus] = useState<string>("Initializing...");
  
  // Phase 6: Session Management
  // If null, show Landing Screen. If string, join that room.
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Prevent unused var warnings
  useEffect(() => {
    if (auth) console.log("Auth Code:", auth.code);
  }, [auth]);

  // 1. Initialize Discord SDK
  useEffect(() => {
    async function setup() {
      try {
        await discordSdk.ready();
        setStatus("Discord SDK Ready");

        const { code } = await discordSdk.commands.authorize({
          client_id: import.meta.env.VITE_DISCORD_CLIENT_ID || "mock_client_id",
          response_type: 'code',
          state: '',
          prompt: 'none',
          scope: [],
        });
        setAuth({ code });
        setStatus("Connected as " + MOCK_USER_ID);

      } catch (e) {
        console.error(e);
        setStatus("Error initializing SDK (Dev Mode)");
      }
    }
    setup();
  }, []);

  // 2. Initialize Yjs (Only if sessionId is present)
  // We use a key to force re-initialization if roomId changes
  const { store, yDoc, provider } = useYjsStore({
    roomId: sessionId ? `discord-planner-${sessionId}` : undefined,
  });

  // 3. Initialize Shared Room State
  const roomState = useRoomState({
     yDoc,
     userId: userId
  });

  const { isHost, isLocked, canDraw, handRaiseQueue, raiseHand, lowerHand, toggleLock, grantAccess, revokeAccess, temporaryAccessList } = roomState;
  
  // Compute pending hands count
  const pendingHands = handRaiseQueue.length;
  // Am I in queue?
  const amIInQueue = handRaiseQueue.includes(userId);

  // 4. Participants List (Awareness)
  const [participants, setParticipants] = useState<{ clientId: number, user: any }[]>([]);
  
  useEffect(() => {
     if (!provider) return; // Wait for provider

     const updateParticipants = () => {
        const states = Array.from(provider.awareness.getStates().entries()) as [number, any][];
        setParticipants(states.map(([clientId, state]) => ({ clientId, user: state.user || { name: `User ${clientId}`, id: `user-${clientId}` } })));
     };
     
     provider.awareness.on('change', updateParticipants);
     updateParticipants();
     
     // Set local user info (Default Name for now)
     // In real app we get this from Discord Auth
     provider.awareness.setLocalStateField('user', { name: "Player " + userId.slice(-4), id: userId, color: '#' + Math.floor(Math.random()*16777215).toString(16) });

     return () => {
        provider.awareness.off('change', updateParticipants);
     }
  }, [provider, userId]);

  // RENDER: Landing Screen if no Session ID
  if (!sessionId) {
     return <LandingScreen onJoinSession={(code) => setSessionId(code)} />;
  }
  
  // RENDER: Whiteboard (Wait for store)
  if (!store) {
     return <div className="w-screen h-screen bg-slate-900 text-white flex items-center justify-center">Loading Room: {sessionId}...</div>
  }

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-slate-900 text-white">
      
      {/* --- HEADER --- */}
      <div className="absolute top-0 left-0 w-full z-50 p-4 pointer-events-none flex justify-between items-start">
          {/* Status / Title */}
          <div className="bg-slate-800/90 backdrop-blur px-4 py-2 rounded-xl shadow-xl pointer-events-auto border border-slate-700 flex flex-col items-start gap-1">
             <div className="flex items-center gap-2">
               <h1 className="font-bold text-indigo-400">GamePlay Planner</h1>
               <div className="text-[10px] bg-slate-700 px-1 rounded cursor-pointer hover:bg-slate-600" onClick={() => navigator.clipboard.writeText(sessionId)} title="Copy Code">📋 {sessionId}</div>
             </div>
             
             <div className="text-xs text-gray-400 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${provider && provider.wsconnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                {status}
             </div>
             <div className="text-xs text-gray-500">
               {isHost ? "👑 You are Host" : "👀 Viewer"}
             </div>
          </div>

          {/* Right Side: Host Controls & Participants */}
          <div className="flex flex-col gap-2 items-end pointer-events-auto">
             
             {/* Participants Toggle / List */}
             <div className="bg-slate-800/90 backdrop-blur p-2 rounded-xl shadow-xl border border-slate-700 w-64 max-h-[50vh] overflow-y-auto">
                <div className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Participants ({participants.length})</div>
                <div className="flex flex-col gap-1">
                   {participants.map(p => {
                      const pId = p.user.id;
                      const isMe = pId === userId;
                      const isPHost = roomState.hostId === pId;
                      
                      return (
                        <div key={p.clientId} className="flex items-center justify-between text-sm bg-slate-900/50 p-1 rounded hover:bg-slate-700 group">
                           <div className="flex items-center gap-2 overflow-hidden">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.user.color || 'gray' }}></span>
                              <span className="truncate max-w-[100px]" title={p.user.name}>{p.user.name} {isMe && "(You)"}</span>
                              {isPHost && <span title="Host">👑</span>}
                           </div>
                           
                           {/* Host Actions on others */}
                           {isHost && !isMe && (
                              <div className="hidden group-hover:flex gap-1">
                                 <button 
                                   onClick={() => {
                                      if (confirm(`Make ${p.user.name} the Host? You will lose control.`)) {
                                         roomState.transferHost(pId);
                                      }
                                   }}
                                   className="text-[10px] bg-indigo-600 hover:bg-indigo-500 px-1 rounded"
                                   title="Make Host"
                                 >
                                    👑
                                 </button>
                                 <button 
                                     onClick={() => isLocked ? (temporaryAccessList.includes(pId) ? revokeAccess(pId) : grantAccess(pId)) : null}
                                     className={`text-[10px] px-1 rounded ${temporaryAccessList.includes(pId) ? 'bg-red-600' : 'bg-green-600'}`}
                                     disabled={!isLocked}
                                     title={temporaryAccessList.includes(pId) ? "Revoke Draw" : "Allow Draw"}
                                  >
                                     {temporaryAccessList.includes(pId) ? "✏️🚫" : "✏️✅"}
                                  </button>
                              </div>
                           )}
                        </div>
                      )
                   })}
                </div>
             </div>

             {/* Host Panel */}
             {isHost && (
                <div className="bg-slate-800/90 backdrop-blur p-2 rounded-xl shadow-xl border border-red-900/50 flex flex-col gap-2 w-64">
                    <button 
                      onClick={toggleLock}
                      className={`w-full px-4 py-2 rounded font-bold transition-colors ${isLocked ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                    >
                      {isLocked ? "🔒 LOCKED" : "🔓 UNLOCKED"}
                    </button>
                    
                    {pendingHands > 0 && (
                      <div className="bg-slate-900 p-2 rounded border border-slate-700">
                          <div className="text-xs font-bold text-yellow-400 mb-1">Hands Raised ({pendingHands})</div>
                          {handRaiseQueue.map(uid => (
                            <div key={uid} className="flex items-center justify-between text-xs gap-2 mb-1">
                                <span>{uid.slice(0,6)}...</span>
                                <div className="flex gap-1">
                                  <button onClick={() => grantAccess(uid)} className="bg-green-600 px-1 rounded text-[10px]">Allow</button>
                                  <button onClick={() => lowerHand(uid)} className="bg-gray-600 px-1 rounded text-[10px]">Dismiss</button>
                                </div>
                            </div>
                          ))}
                      </div>
                    )}
                </div>
             )}
          </div>
      </div>

      {/* --- VIEWER HUD --- */}
      {!isHost && isLocked && !canDraw && (
         <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
             <div className="bg-black/50 backdrop-blur px-6 py-3 rounded-full border border-yellow-500/50 text-yellow-200 flex items-center gap-4">
                <span className="text-2xl">🔒</span> 
                <div className="text-sm">
                   <div className="font-bold">Session Locked</div>
                   <div>Only Host can draw</div>
                </div>
                
                <button 
                   onClick={raiseHand}
                   disabled={amIInQueue}
                   className={`ml-4 px-4 py-2 rounded-full font-bold text-sm ${amIInQueue ? 'bg-yellow-600 opacity-50' : 'bg-yellow-500 text-black hover:bg-yellow-400'}`}
                >
                   {amIInQueue ? "✋ Waiting..." : "✋ Raise Hand"}
                </button>
             </div>
         </div>
      )}

      {/* --- WHITEBOARD --- */}
      {/* We pass a custom style or class to disable interaction if !canDraw */}
      <div className={`w-full h-full ${!canDraw ? 'pointer-events-none grayscale-[0.5]' : ''}`}>
         <Whiteboard store={store} />
      </div>

    </div>
  );
}

export default App;
