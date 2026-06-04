import { useState, useEffect, useRef } from "react";
import { Device, Call } from "@twilio/voice-sdk";
import { Phone, PhoneOff, Mic, MicOff, Delete, Volume2, Settings, ClipboardCopy, CheckCircle2 } from "lucide-react";

export default function Dialer() {
  const [device, setDevice] = useState(null);
  const [call, setCall] = useState(null);
  const [status, setStatus] = useState("initializing");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  
  const [callDuration, setCallDuration] = useState(0);
  const [recentCalls, setRecentCalls] = useState([]);
  const [activeTab, setActiveTab] = useState("dialpad");
  const [notes, setNotes] = useState("");
  const [copied, setCopied] = useState(false);
  const [incomingConnection, setIncomingConnection] = useState(null);
  const timerRef = useRef(null);
  
  const [inputDevices, setInputDevices] = useState([]);
  const [outputDevices, setOutputDevices] = useState([]);
  const [selectedInput, setSelectedInput] = useState("");
  const [selectedOutput, setSelectedOutput] = useState("");

  const initStarted = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem("recentCalls");
    if (saved) {
      try {
        setRecentCalls(JSON.parse(saved));
      } catch (e) {
        console.error("Could not parse recent calls");
      }
    }
  }, []);

  const addRecentCall = (num, type = "outbound") => {
    setRecentCalls(prev => {
      const newCall = { num, type, time: new Date().toISOString() };
      const updated = [newCall, ...prev.filter(c => c.num !== num)].slice(0, 10);
      localStorage.setItem("recentCalls", JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    if (initStarted.current) return;
    initStarted.current = true;

    let newDevice = null;
    async function initDevice() {
      try {
        const res = await fetch("/api/twilio/token");
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch token");
        }

        newDevice = new Device(data.token, {
          codecPreferences: [Call.Codec.Opus, Call.Codec.PCMU],
        });

        newDevice.on("ready", () => {
          console.log("Device is ready");
          setStatus("ready");
          setErrorMsg("");
          updateDevices(newDevice);
        });

        newDevice.on("registered", () => {
          console.log("Device is registered");
          setStatus("ready");
          setErrorMsg("");
        });

        newDevice.on("incoming", (connection) => {
          console.log("Incoming connection from", connection.parameters.From);
          setIncomingConnection(connection);
          setStatus("incoming");
          setPhoneNumber(connection.parameters.From || "Unknown Caller");
          setActiveTab("dialpad");
          
          connection.on("accept", () => {
             setStatus("in-call");
             setIncomingConnection(null);
             addRecentCall(connection.parameters.From || "Unknown Caller", "inbound");
          });
          
          connection.on("disconnect", () => {
             setStatus("ready");
             setIncomingConnection(null);
          });
          
          connection.on("cancel", () => {
             setStatus("ready");
             setIncomingConnection(null);
          });
          
          connection.on("reject", () => {
             setStatus("ready");
             setIncomingConnection(null);
          });
        });

        newDevice.on("error", (error) => {
          console.error("Twilio Device Error:", error);
          setStatus("error");
          setErrorMsg(error.message);
        });

        await newDevice.register();
        setDevice(newDevice);
      } catch (err) {
        console.error("Failed to initialize device", err);
        setStatus("error");
        setErrorMsg(err.message || "Failed to initialize");
      }
    }

    initDevice();

    return () => {
      if (newDevice) {
        newDevice.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (status === "in-call") {
      setCallDuration(0);
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (status !== "calling" && status !== "incoming") setCallDuration(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  async function updateDevices(dev) {
    try {
      // Request permissions if needed to get device labels
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const availableInput = Array.from(dev.audio.availableInputDevices.values());
      const availableOutput = Array.from(dev.audio.availableOutputDevices.values());
      
      setInputDevices(availableInput);
      setOutputDevices(availableOutput);

      if (availableInput.length > 0) {
        setSelectedInput(availableInput[0].deviceId);
      }
      if (availableOutput.length > 0) {
        setSelectedOutput(availableOutput[0].deviceId);
      }
    } catch (err) {
      console.warn("Could not get audio devices:", err);
    }
  };

  useEffect(() => {
    if (device && selectedInput) {
      device.audio.setInputDevice(selectedInput).catch(console.error);
    }
  }, [selectedInput, device]);

  useEffect(() => {
    if (device && selectedOutput) {
      device.audio.speakerDevices.set(selectedOutput).catch(console.error);
    }
  }, [selectedOutput, device]);

  const handleCall = async () => {
    if (!device || !phoneNumber) return;
    setStatus("calling");
    
    try {
      const newCall = await device.connect({
        params: {
          To: phoneNumber,
        },
      });
      addRecentCall(phoneNumber, "outbound");

      newCall.on("accept", () => {
        setStatus("in-call");
      });

      newCall.on("disconnect", () => {
        setStatus("ready");
        setCall(null);
        setIsMuted(false);
      });

      newCall.on("error", (error) => {
        console.error("Call error:", error);
        setStatus("error");
        setErrorMsg(error.message);
        setCall(null);
      });

      setCall(newCall);
    } catch (err) {
      console.error("Call failed", err);
      setStatus("error");
      setErrorMsg(err.message || "Call failed");
      setCall(null);
    }
  };

  const handleHangUp = () => {
    if (call) {
      call.disconnect();
    } else if (device) {
      device.disconnectAll();
    }
    setStatus("ready");
    setCall(null);
    setIsMuted(false);
  };

  const handleAnswer = () => {
    if (incomingConnection) incomingConnection.accept();
  };

  const handleReject = () => {
    if (incomingConnection) incomingConnection.reject();
  };

  const toggleMute = () => {
    if (call) {
      const newMuted = !isMuted;
      call.mute(newMuted);
      setIsMuted(newMuted);
    }
  };

  const handleKeyPress = (key) => {
    setPhoneNumber((prev) => prev + key);
    if (call && status === "in-call") {
      call.sendDigits(key);
    }
  };

  const handleBackspace = () => {
    setPhoneNumber((prev) => prev.slice(0, -1));
  };

  const dialpadKeys = [
    { label: "1", sub: "" },
    { label: "2", sub: "ABC" },
    { label: "3", sub: "DEF" },
    { label: "4", sub: "GHI" },
    { label: "5", sub: "JKL" },
    { label: "6", sub: "MNO" },
    { label: "7", sub: "PQRS" },
    { label: "8", sub: "TUV" },
    { label: "9", sub: "WXYZ" },
    { label: "*", sub: "" },
    { label: "0", sub: "+" },
    { label: "#", sub: "" },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#0A0F1E] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-electric/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row gap-8 items-stretch justify-center">
        
        {/* Left Side: Dialer Container */}
        <div className="bg-[#151B2E]/70 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl p-8 flex flex-col items-center relative overflow-hidden w-full max-w-sm">
          
          {/* Top Subtle Gradient */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-electric/50 to-transparent" />

          {/* Incoming Call Overlay */}
          {status === "incoming" && (
            <div className="absolute inset-0 z-40 bg-[#0A0F1E]/95 backdrop-blur-2xl flex flex-col items-center justify-center rounded-[2.5rem] p-6 animate-fadeIn">
              <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none" />
              
              <div className="w-24 h-24 bg-purple-500/20 rounded-full flex items-center justify-center mb-8 relative">
                <div className="absolute inset-0 rounded-full border border-purple-500/30 animate-[ping_2s_ease-in-out_infinite]" />
                <Phone size={40} className="text-purple-400 animate-shake" />
              </div>
              
              <h2 className="text-3xl font-light text-white mb-2">Incoming Call</h2>
              <p className="text-lg text-gray-400 font-mono tracking-wider mb-16">{phoneNumber}</p>
              
              <div className="flex gap-8 w-full justify-center">
                <button onClick={handleReject} className="flex flex-col items-center gap-3 group">
                  <div className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center group-hover:bg-red-600 transition-all shadow-[0_0_30px_rgba(239,68,68,0.4)] group-hover:shadow-[0_0_40px_rgba(239,68,68,0.6)] group-hover:scale-105 active:scale-95">
                    <PhoneOff size={26} />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-red-400/80 group-hover:text-red-400 transition-colors">Decline</span>
                </button>

                <button onClick={handleAnswer} className="flex flex-col items-center gap-3 group">
                  <div className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center group-hover:bg-green-600 transition-all shadow-[0_0_30px_rgba(34,197,94,0.4)] group-hover:shadow-[0_0_40px_rgba(34,197,94,0.6)] group-hover:scale-105 active:scale-95 animate-pulse">
                    <Phone size={26} />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-green-400/80 group-hover:text-green-400 transition-colors">Answer</span>
                </button>
              </div>
            </div>
          )}

          {/* Normal Dialer View */}
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-all z-20"
          >
            <Settings size={20} className={showSettings ? "rotate-90 transition-transform" : "transition-transform"} />
          </button>

          {/* Settings Dropdown */}
          {showSettings && (
            <div className="absolute top-16 right-6 bg-[#1A2138] border border-white/10 rounded-2xl p-5 shadow-2xl z-30 w-72 text-sm text-gray-200 animate-fadeIn backdrop-blur-xl">
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-white"><Mic size={16} className="text-electric"/> Audio Devices</h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Microphone</label>
                  <select 
                    value={selectedInput} 
                    onChange={(e) => setSelectedInput(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-electric transition-colors appearance-none"
                  >
                    {inputDevices.map(d => (
                      <option key={d.deviceId} value={d.deviceId}>{d.label || 'System Default'}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2 flex items-center gap-1 uppercase tracking-wider"><Volume2 size={12}/> Speaker</label>
                  <select 
                    value={selectedOutput} 
                    onChange={(e) => setSelectedOutput(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-electric transition-colors appearance-none"
                  >
                    {outputDevices.map(d => (
                      <option key={d.deviceId} value={d.deviceId}>{d.label || 'System Default'}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Status Indicator */}
          <div className="flex items-center gap-2.5 mb-8 bg-black/30 px-5 py-2.5 rounded-full border border-white/5 backdrop-blur-md">
            <div className={`w-2.5 h-2.5 rounded-full ${
              status === "ready" ? "bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]" : 
              status === "calling" ? "bg-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.6)] animate-pulse" :
              status === "in-call" ? "bg-electric shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-pulse" :
              status === "incoming" ? "bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.8)] animate-pulse" :
              status === "error" ? "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]" :
              "bg-gray-500"
            }`} />
            <span className="text-xs font-bold tracking-widest uppercase text-gray-300">
              {status === "initializing" ? "Connecting" : status}
              {status === "in-call" && <span className="text-white ml-2 tabular-nums">{formatTime(callDuration)}</span>}
            </span>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 bg-black/20 p-1 rounded-full w-full max-w-[240px]">
            <button onClick={() => setActiveTab("dialpad")} className={`flex-1 py-2 px-4 rounded-full text-xs font-semibold tracking-wide transition-all ${activeTab === 'dialpad' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}>Dialpad</button>
            <button onClick={() => setActiveTab("recent")} className={`flex-1 py-2 px-4 rounded-full text-xs font-semibold tracking-wide transition-all ${activeTab === 'recent' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}>Recent</button>
          </div>

          {activeTab === "recent" ? (
             <div className="w-full h-[380px] overflow-y-auto mb-2 space-y-2 pr-2 custom-scrollbar">
               {recentCalls.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
                   <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                     <Phone size={24} className="opacity-50" />
                   </div>
                   <span className="text-sm font-medium">No recent calls</span>
                 </div>
               ) : (
                 recentCalls.map((c, i) => (
                   <button 
                     key={i} 
                     onClick={() => { setPhoneNumber(c.num); setActiveTab("dialpad"); }}
                     className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-transparent hover:border-white/10 group active:scale-[0.98]"
                   >
                     <div className="flex items-center gap-4">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center ${c.type === 'inbound' ? 'bg-blue-500/10 text-electric' : 'bg-white/5 text-gray-400'}`}>
                         {c.type === 'inbound' ? <Phone size={16} className="rotate-[135deg]" /> : <Phone size={16} className="-rotate-45" />}
                       </div>
                       <div className="text-left">
                         <div className="text-white font-medium tracking-wide text-sm">{c.num}</div>
                         <div className="text-[11px] text-gray-500 mt-0.5">{new Date(c.time).toLocaleDateString()} • {new Date(c.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                       </div>
                     </div>
                   </button>
                 ))
               )}
             </div>
          ) : (
            <div className="w-full flex flex-col items-center">
              {/* Number Input Display */}
              <div className="w-full relative mb-10 group h-16 flex items-center justify-center">
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter number"
                  className={`w-full bg-transparent text-center font-light tracking-widest outline-none placeholder:text-gray-700 text-white truncate px-10 transition-all focus:scale-105 ${
                    phoneNumber.length > 14 ? 'text-xl' :
                    phoneNumber.length > 10 ? 'text-2xl' :
                    'text-3xl'
                  }`}
                />
                {phoneNumber && (
                  <button 
                    onClick={handleBackspace}
                    className="absolute right-2 p-2 text-gray-500 hover:text-white transition-colors bg-white/0 hover:bg-white/10 rounded-full"
                  >
                    <Delete size={22} />
                  </button>
                )}
              </div>

              {/* Dialpad */}
              <div className="grid grid-cols-3 gap-x-6 gap-y-4 w-full px-4 mb-4">
                {dialpadKeys.map((key) => (
                  <button
                    key={key.label}
                    onClick={() => handleKeyPress(key.label)}
                    className="aspect-square flex flex-col items-center justify-center rounded-full bg-black/20 hover:bg-white/10 active:bg-white/20 active:scale-90 transition-all border border-white/5 hover:border-white/20 group shadow-lg"
                  >
                    <span className="text-3xl font-light text-white transition-colors">{key.label}</span>
                    <span className="text-[9px] text-gray-500 uppercase tracking-widest h-3 font-semibold mt-1 group-hover:text-gray-400">{key.sub}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-6 w-full mt-auto pt-6 border-t border-white/5">
            <button
              onClick={toggleMute}
              disabled={status !== "in-call"}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                status === "in-call" 
                  ? isMuted 
                    ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 hover:bg-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.2)]" 
                    : "bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 hover:text-white"
                  : "bg-black/40 text-gray-700 cursor-not-allowed border border-transparent opacity-50"
              }`}
            >
              {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
            </button>

            {status === "calling" || status === "in-call" ? (
               <button
                onClick={handleHangUp}
                className="w-20 h-20 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all shadow-[0_0_30px_rgba(239,68,68,0.4)] hover:shadow-[0_0_40px_rgba(239,68,68,0.6)] hover:scale-105 active:scale-95"
              >
                <PhoneOff size={30} />
              </button>
            ) : (
              <button
                onClick={handleCall}
                disabled={status === "initializing" || status === "error" || !phoneNumber}
                className="w-20 h-20 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-all shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:shadow-[0_0_40px_rgba(34,197,94,0.6)] hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none disabled:bg-green-500/50"
              >
                <Phone size={30} className="ml-1" />
              </button>
            )}
            
            <div className="w-14 h-14" /> {/* Spacer for balance */}
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[90%] z-50 text-xs font-medium text-red-100 text-center bg-red-500/80 backdrop-blur-md py-2.5 px-4 rounded-xl border border-red-500 shadow-xl animate-fadeIn">
              {errorMsg}
            </div>
          )}

        </div>

        {/* Right Side: Persistent Notes Panel */}
        <div className="bg-[#151B2E]/70 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl p-8 flex flex-col relative overflow-hidden w-full max-w-sm md:max-w-md">
          {/* Subtle Gradient */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
          
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <ClipboardCopy size={18} className="text-gray-400" />
            </div>
            <div>
              <h2 className="text-xl font-light text-white">Call Notes</h2>
              <p className="text-xs text-gray-500 mt-1">Capture details while on the line</p>
            </div>
          </div>
          
          <div className="flex-1 w-full relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-2xl pointer-events-none" />
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Type your call notes here..."
              className="w-full h-full min-h-[300px] bg-black/40 border border-white/10 rounded-2xl p-5 text-sm text-gray-200 outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 resize-none transition-all placeholder:text-gray-600 custom-scrollbar"
            />
          </div>
          
          <div className="mt-6 flex justify-end">
            <button 
              onClick={() => {
                navigator.clipboard.writeText(notes);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/5 rounded-xl hover:bg-white/10 text-gray-300 hover:text-white transition-all backdrop-blur-md border border-white/10 text-sm font-medium"
            >
              {copied ? (
                <>
                  <CheckCircle2 size={16} className="text-green-400"/>
                  <span className="text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <ClipboardCopy size={16} />
                  <span>Copy to Clipboard</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
