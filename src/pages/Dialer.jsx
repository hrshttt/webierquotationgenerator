import { useState, useEffect, useRef } from "react";
import { Device, Call } from "@twilio/voice-sdk";
import { Phone, PhoneOff, Mic, MicOff, Delete, Volume2, Settings } from "lucide-react";

export default function Dialer() {
  const [device, setDevice] = useState(null);
  const [call, setCall] = useState(null);
  const [status, setStatus] = useState("initializing");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  
  const [inputDevices, setInputDevices] = useState([]);
  const [outputDevices, setOutputDevices] = useState([]);
  const [selectedInput, setSelectedInput] = useState("");
  const [selectedOutput, setSelectedOutput] = useState("");

  const initStarted = useRef(false);

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
    <div className="min-h-[calc(100vh-64px)] bg-navy-900 flex items-center justify-center p-4">
      <div className="relative z-10 w-full max-w-sm">
        <div className="bg-surface backdrop-blur-2xl border border-white/5 rounded-3xl shadow-2xl p-8 flex flex-col items-center ring-1 ring-white/5 relative">
          
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <Settings size={20} />
          </button>

          {/* Settings Dropdown */}
          {showSettings && (
            <div className="absolute top-12 right-4 bg-navy-800 border border-white/10 rounded-xl p-4 shadow-xl z-20 w-64 text-sm text-gray-200">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><Mic size={16}/> Audio Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Microphone</label>
                  <select 
                    value={selectedInput} 
                    onChange={(e) => setSelectedInput(e.target.value)}
                    className="w-full bg-navy-900 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-electric"
                  >
                    {inputDevices.map(d => (
                      <option key={d.deviceId} value={d.deviceId}>{d.label || 'Default Microphone'}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1 flex items-center gap-1"><Volume2 size={12}/> Speaker</label>
                  <select 
                    value={selectedOutput} 
                    onChange={(e) => setSelectedOutput(e.target.value)}
                    className="w-full bg-navy-900 border border-white/10 rounded-lg p-2 text-white outline-none focus:border-electric"
                  >
                    {outputDevices.map(d => (
                      <option key={d.deviceId} value={d.deviceId}>{d.label || 'Default Speaker'}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Status Indicator */}
          <div className="flex items-center gap-2 mb-8 bg-black/20 px-4 py-2 rounded-full border border-white/5">
            <div className={`w-2 h-2 rounded-full ${
              status === "ready" ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : 
              status === "calling" ? "bg-yellow-500 animate-pulse" :
              status === "in-call" ? "bg-electric shadow-[0_0_10px_rgba(59,130,246,0.5)] animate-pulse" :
              status === "error" ? "bg-red-500" :
              "bg-gray-500"
            }`} />
            <span className="text-xs font-medium tracking-wide uppercase text-gray-300">
              {status === "initializing" ? "Connecting..." : status}
            </span>
          </div>

          {/* Number Input Display */}
          <div className="w-full relative mb-8 group">
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter number..."
              className="w-full bg-transparent text-center text-4xl font-light tracking-wider outline-none placeholder:text-gray-600 text-white truncate pr-10"
            />
            {phoneNumber && (
              <button 
                onClick={handleBackspace}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                <Delete size={24} />
              </button>
            )}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-700 to-transparent mt-4 opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Dialpad */}
          <div className="grid grid-cols-3 gap-4 w-full mb-8">
            {dialpadKeys.map((key) => (
              <button
                key={key.label}
                onClick={() => handleKeyPress(key.label)}
                className="aspect-square flex flex-col items-center justify-center rounded-full bg-white/5 hover:bg-white/10 active:bg-white/5 transition-all border border-transparent hover:border-white/10 group"
              >
                <span className="text-2xl font-normal text-gray-300 group-hover:text-white transition-colors">{key.label}</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest h-3 font-medium">{key.sub}</span>
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6 w-full mt-2">
            <button
              onClick={toggleMute}
              disabled={status !== "in-call"}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                status === "in-call" 
                  ? isMuted 
                    ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 hover:bg-yellow-500/30" 
                    : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-white"
                  : "bg-black/20 text-gray-600 cursor-not-allowed border border-transparent"
              }`}
            >
              {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
            </button>

            {status === "calling" || status === "in-call" ? (
               <button
                onClick={handleHangUp}
                className="w-20 h-20 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white border border-red-500/30 transition-all shadow-[0_0_30px_rgba(239,68,68,0.2)] hover:shadow-[0_0_40px_rgba(239,68,68,0.4)] hover:scale-105 active:scale-95"
              >
                <PhoneOff size={32} />
              </button>
            ) : (
              <button
                onClick={handleCall}
                disabled={status === "initializing" || status === "error" || !phoneNumber}
                className="w-20 h-20 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center hover:bg-green-500 hover:text-white border border-green-500/30 transition-all shadow-[0_0_30px_rgba(34,197,94,0.2)] hover:shadow-[0_0_40px_rgba(34,197,94,0.4)] hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                <Phone size={32} className="ml-1" />
              </button>
            )}
            
            <div className="w-14 h-14" />
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mt-6 text-sm text-red-400/90 text-center bg-red-500/10 py-2 px-4 rounded-lg border border-red-500/20 w-full">
              {errorMsg}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
