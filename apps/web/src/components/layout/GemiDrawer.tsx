import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { NpcAvatar } from '../art/NpcAvatar';
import { api } from '../../api/client';
import { soundManager } from '../../services/sound';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, AlertCircle, HelpCircle } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'gemi';
  text: string;
  isOffline?: boolean;
  simulationData?: any;
}

export const GemiDrawer: React.FC = () => {
  const { isGemiOpen, setGemiOpen, scores, cityState } = useGameStore();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'gemi',
      text: "Hoo! Greetings Mayor! I'm Gemi the Owl, your AI City Advisor. Ask me anything about your city metrics, trade-offs, or ask what-if scenarios (e.g., 'What if I build solar twice?')!",
      isOffline: false,
    },
  ]);

  const quickChips = [
    'Why is Downtown red?',
    'What should I prioritize first?',
    'Explain Equity score',
    'What if I build solar twice?',
    'How do I survive heatwaves?',
  ];

  if (!isGemiOpen) return null;

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isLoading) return;

    soundManager.playClick();
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const lower = textToSend.toLowerCase();
      // Check if this is a what-if query
      if (lower.includes('what if') || lower.includes('what happens if') || lower.includes('simulate')) {
        const res = await api.aiWhatIf(textToSend);
        setMessages((prev) => [
          ...prev,
          {
            id: `g-${Date.now()}`,
            sender: 'gemi',
            text: res.reply,
            isOffline: res.isOfflineAdvisor,
            simulationData: res.simulationData,
          },
        ]);
      } else {
        const res = await api.aiChat(textToSend);
        setMessages((prev) => [
          ...prev,
          {
            id: `g-${Date.now()}`,
            sender: 'gemi',
            text: res.reply,
            isOffline: res.isOfflineAdvisor,
          },
        ]);
      }
      soundManager.playCoin();
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `g-${Date.now()}`,
          sender: 'gemi',
          text: `Hoo! I couldn't reach the advisor core: ${err.message}. Your city data is safe and running locally!`,
          isOffline: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in select-none">
      <motion.div
        initial={{ x: 450 }}
        animate={{ x: 0 }}
        exit={{ x: 450 }}
        transition={{ type: 'spring', damping: 20 }}
        className="w-full max-w-lg h-full bg-slate-900 border-l-3 border-purple-600 flex flex-col shadow-2xl"
      >
        {/* Drawer Header with Prominent Typography */}
        <div className="p-5 bg-purple-950 border-b-2 border-purple-800 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <NpcAvatar id="gemi" size="md" animate={true} />
            <div>
              <div className="font-display font-black text-white text-lg sm:text-xl flex items-center gap-2">
                <span>Gemi the Owl</span>
                <span className="text-xs bg-purple-500/30 text-purple-200 border border-purple-400/50 px-2.5 py-0.5 rounded-full font-black">
                  AI Advisor
                </span>
              </div>
              <div className="text-xs sm:text-sm text-purple-200 font-bold">
                Google Gemini Free Tier & Simulation Engine
              </div>
            </div>
          </div>
          <button
            onClick={() => setGemiOpen(false)}
            className="p-2.5 text-slate-400 hover:text-white rounded-2xl hover:bg-purple-900 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Real numbers guarantee banner */}
        <div className="bg-slate-800 px-5 py-2.5 text-xs sm:text-sm text-slate-200 border-b border-slate-700 flex items-center justify-between font-bold">
          <span className="flex items-center gap-2 text-emerald-400 font-black">
            <Sparkles className="w-4 h-4" /> Grounded in Simulation Math
          </span>
          <span className="text-slate-300">
            Index: <strong className="text-white text-base font-black">{scores ? Math.round(scores.sustainabilityIndex) : 65}</strong>
          </span>
        </div>

        {/* Chat Message List with Large Readable Bubbles */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'gemi' && <NpcAvatar id="gemi" size="sm" animate={false} className="shrink-0 mt-1" />}
              <div
                className={`max-w-[85%] rounded-3xl p-4 text-sm sm:text-base font-bold leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-emerald-500 text-slate-950 rounded-tr-none shadow-md'
                    : 'bg-slate-800 border-2 border-slate-700 text-slate-100 rounded-tl-none shadow-md'
                }`}
              >
                {m.sender === 'gemi' && m.isOffline && (
                  <div className="inline-flex items-center gap-1.5 text-xs bg-amber-500/20 text-amber-300 border border-amber-500/50 px-2.5 py-1 rounded-lg mb-2 font-black uppercase">
                    <AlertCircle className="w-3.5 h-3.5" /> Offline Advisor
                  </div>
                )}
                <p className="whitespace-pre-line">{m.text}</p>

                {/* If What-If simulation metrics returned */}
                {m.simulationData && m.simulationData.canExecute && (
                  <div className="mt-3 p-3 bg-slate-950 rounded-2xl border border-slate-700 text-xs sm:text-sm text-slate-300 space-y-1">
                    <div className="font-black text-emerald-400 mb-1 flex items-center gap-1">
                      <span>⚡</span>
                      <span>Simulated Preview Outcome:</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs font-black">
                      <div className="bg-slate-900 p-2 rounded-xl">
                        Index: {m.simulationData.previousScores.sustainabilityIndex} ➔{' '}
                        <strong className="text-white text-sm">{m.simulationData.simulatedScores.sustainabilityIndex}</strong>
                      </div>
                      <div className="bg-slate-900 p-2 rounded-xl">
                        Budget: ${cityState?.budget} ➔{' '}
                        <strong className="text-white text-sm">${m.simulationData.simulatedBudget}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading typing indicator */}
          {isLoading && (
            <div className="flex gap-3.5 items-center">
              <NpcAvatar id="gemi" size="sm" animate={true} />
              <div className="bg-slate-800 border-2 border-slate-700 rounded-3xl p-4 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce" />
                <span className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs sm:text-sm text-purple-300 font-bold ml-2">Gemi is pondering...</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggested Quick Question Chips */}
        <div className="px-4 py-2.5 bg-slate-900 border-t border-slate-800 flex gap-2 overflow-x-auto text-xs">
          {quickChips.map((chip, idx) => (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              key={idx}
              onClick={() => handleSend(chip)}
              className="whitespace-nowrap px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-purple-400 rounded-xl text-slate-200 text-xs sm:text-sm font-black transition-all"
            >
              {chip}
            </motion.button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 bg-slate-950 border-t-2 border-slate-800 flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Gemi or type 'what if I build solar twice?'..."
            className="flex-1 bg-slate-800 border-2 border-slate-700 rounded-2xl px-4 py-3 text-sm sm:text-base text-white font-bold focus:outline-none focus:border-purple-500 placeholder-slate-400"
          />
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="p-3.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-2xl font-black shadow-cartoon-sm transition-all"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
