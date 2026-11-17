import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Volume2, Sparkles } from 'lucide-react';
import { MinionCore3D } from '../mascot/MinionCore3D';
import { useChat } from '../../contexts/ChatContext';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceModal: React.FC<VoiceModalProps> = ({ isOpen, onClose }) => {
  const { sendMessage, mascotState, setMascotState } = useChat();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [waveformBars, setWaveformBars] = useState<number[]>([15, 25, 45, 70, 90, 60, 30, 20]);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setMascotState('listening');
      };

      recognition.onresult = (event: any) => {
        let currentText = '';
        for (let i = 0; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        setTranscript(currentText);

        // Randomize waveform height to simulate audio energy
        setWaveformBars(Array.from({ length: 16 }, () => 20 + Math.random() * 80));
      };

      recognition.onerror = () => {
        setIsListening(false);
        setMascotState('idle');
      };

      recognition.onend = () => {
        setIsListening(false);
        setMascotState('idle');
      };

      recognitionRef.current = recognition;
      try {
        recognition.start();
      } catch (e) {}
    }

    // Audio waveform animation loop
    const interval = setInterval(() => {
      if (isListening) {
        setWaveformBars(Array.from({ length: 16 }, () => 15 + Math.random() * 85));
      } else {
        setWaveformBars(Array.from({ length: 16 }, () => 12));
      }
    }, 120);

    return () => {
      clearInterval(interval);
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [isOpen, setMascotState]);

  if (!isOpen) return null;

  const handleSendVoiceQuery = () => {
    if (transcript.trim()) {
      sendMessage(transcript);
      setTranscript('');
      onClose();
    }
  };

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setMascotState('idle');
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
      setMascotState('listening');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#111318] border border-white/10 p-6 flex flex-col items-center text-center shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#9297A2] hover:text-white rounded-full bg-white/5"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Mascot Centerpiece */}
        <div className="mb-2">
          <MinionCore3D state={isListening ? 'listening' : mascotState} size="md" />
        </div>

        <h3 className="font-heading text-xl font-bold text-white flex items-center gap-2">
          <span>Minion Voice Assistant</span>
        </h3>
        <p className="text-xs text-[#9297A2] mt-1">
          {isListening ? 'Listening to your voice...' : 'Tap the microphone to speak'}
        </p>

        {/* Live Audio Waveform Visualizer */}
        <div className="flex items-center justify-center gap-1.5 h-16 my-6 w-full max-w-xs px-4">
          {waveformBars.map((height, i) => (
            <div
              key={i}
              className={`w-2 rounded-full transition-all duration-100 ${
                isListening
                  ? 'bg-gradient-to-t from-[#00D8FF] to-[#FFD600] shadow-[0_0_8px_rgba(0,216,255,0.4)]'
                  : 'bg-white/10'
              }`}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>

        {/* Live Transcript Preview */}
        <div className="w-full min-h-[56px] p-3 rounded-2xl bg-[#08090B] border border-white/5 text-xs text-[#F5F5F5] italic flex items-center justify-center">
          {transcript || 'Say something like: "Write a React component" or "What is quantum computing?"'}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={toggleListen}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
              isListening
                ? 'bg-red-500 text-white shadow-red-500/40 animate-pulse'
                : 'bg-[#FFD600] text-[#08090B] hover:scale-105 shadow-[0_0_20px_rgba(255,214,0,0.4)]'
            }`}
          >
            {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          {transcript && (
            <button
              onClick={handleSendVoiceQuery}
              className="px-5 py-3 rounded-2xl bg-[#00D8FF] text-[#08090B] font-semibold text-xs shadow-lg hover:scale-105 transition-all"
            >
              Send to Minion
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
