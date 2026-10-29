import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { NpcAvatar } from '../components/art/NpcAvatar';
import { api } from '../api/client';
import { soundManager } from '../services/sound';
import {
  Send,
  Sparkles,
  HelpCircle,
  AlertCircle,
  ShieldCheck,
  CheckCircle,
  ArrowLeft,
  FileQuestion,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'gemi';
  text: string;
  isOffline?: boolean;
  simulationData?: any;
}

export const AiAdvisorPage: React.FC = () => {
  const navigate = useNavigate();
  const { scores, cityState } = useGameStore();

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'gemi',
      text: "Hoo! Welcome to my treehouse observatory, Mayor! I am Gemi the Owl, powered by Google Gemini and your city's live simulation engine. How can I assist your municipal planning today?",
      isOffline: false,
    },
  ]);

  const quickQuestions = [
    'Why is Downtown gridlocked?',
    'What should I prioritize first?',
    'Explain Equity Score',
    'What if I build solar twice?',
    'How do I protect against heatwaves?',
    'What happens if a transport strike occurs?',
  ];

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
          text: `Hoo! Could not reach advisor network: ${err.message}. Operating with local simulation facts.`,
          isOffline: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-60px)] bg-slate-900 text-white p-3 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-800/90 border-2 border-purple-500/40 rounded-3xl p-5 shadow-cartoon flex items-center justify-between">
        <div className="flex items-center gap-4">
          <NpcAvatar id="gemi" size="lg" animate={true} />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-display font-black text-purple-300">
                Gemi the Owl's AI Treehouse
              </h1>
              <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-400/40 px-2.5 py-0.5 rounded-full font-bold">
                Google Gemini Free Tier
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Deterministic, grounded municipal advice. Gemi never invents numbers and uses only verified simulation metrics!
            </p>
          </div>
        </div>

        <button onClick={() => navigate('/map')} className="btn-cartoon-slate text-xs">
          <ArrowLeft className="w-4 h-4" /> <span>Back to Map</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Facts Given to LLM */}
        <div className="bg-slate-800/80 border-2 border-slate-700 rounded-3xl p-5 shadow-cartoon space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" /> Verified Data Core Sent to Gemini
          </div>
          <p className="text-xs text-slate-400">
            To prevent hallucinations, Gemini is strictly supplied with these live numbers:
          </p>

          <div className="space-y-2 text-xs font-semibold">
            <div className="flex justify-between bg-slate-900/60 p-2 rounded-xl">
              <span className="text-slate-400">Sustainability Index:</span>
              <strong className="text-white">{scores ? Math.round(scores.sustainabilityIndex) : 65} / 100</strong>
            </div>
            <div className="flex justify-between bg-slate-900/60 p-2 rounded-xl">
              <span className="text-slate-400">Emissions Score:</span>
              <strong className="text-white">{scores ? Math.round(scores.emissionsScore) : 45} / 100</strong>
            </div>
            <div className="flex justify-between bg-slate-900/60 p-2 rounded-xl">
              <span className="text-slate-400">Citizen Happiness:</span>
              <strong className="text-white">{scores ? Math.round(scores.happinessScore) : 58} / 100</strong>
            </div>
            <div className="flex justify-between bg-slate-900/60 p-2 rounded-xl">
              <span className="text-slate-400">Grid Reliability:</span>
              <strong className="text-white">{scores ? Math.round(scores.reliabilityScore) : 40} / 100</strong>
            </div>
            <div className="flex justify-between bg-slate-900/60 p-2 rounded-xl">
              <span className="text-slate-400">Equity Parity:</span>
              <strong className="text-white">{scores ? Math.round(scores.equityScore) : 70} / 100</strong>
            </div>
            <div className="flex justify-between bg-slate-900/60 p-2 rounded-xl">
              <span className="text-slate-400">Treasury Budget:</span>
              <strong className="text-amber-400">${cityState?.budget || 100}</strong>
            </div>
            <div className="flex justify-between bg-slate-900/60 p-2 rounded-xl">
              <span className="text-slate-400">Current Month:</span>
              <strong className="text-sky-400">Month {cityState?.month || 1}</strong>
            </div>
          </div>
        </div>

        {/* Center & Right Column: Interactive Chat Room */}
        <div className="lg:col-span-2 bg-slate-800/90 border-2 border-slate-700 rounded-3xl p-5 shadow-cartoon flex flex-col h-[520px]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'gemi' && (
                  <NpcAvatar id="gemi" size="sm" animate={false} className="shrink-0" />
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-sm ${
                    m.sender === 'user'
                      ? 'bg-purple-600 text-white rounded-tr-none'
                      : 'bg-slate-900 border border-slate-700 text-slate-100 rounded-tl-none shadow'
                  }`}
                >
                  {m.sender === 'gemi' && m.isOffline && (
                    <div className="inline-flex items-center gap-1 text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded mb-1 font-bold">
                      <AlertCircle className="w-3 h-3" /> Offline Advisor
                    </div>
                  )}
                  <p className="leading-relaxed">{m.text}</p>

                  {m.simulationData && m.simulationData.canExecute && (
                    <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
                      <div className="font-bold text-emerald-400 mb-1">
                        Deterministic Simulation Prediction:
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          Index: {m.simulationData.previousScores.sustainabilityIndex} ➔{' '}
                          <strong className="text-white">
                            {m.simulationData.simulatedScores.sustainabilityIndex}
                          </strong>
                        </div>
                        <div>
                          Budget: ${cityState?.budget} ➔{' '}
                          <strong className="text-white">
                            ${m.simulationData.simulatedBudget}
                          </strong>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 items-center">
                <NpcAvatar id="gemi" size="sm" animate={true} />
                <div className="bg-slate-900 border border-slate-700 rounded-2xl p-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  <span className="text-xs text-purple-300 ml-2">Consulting municipal model...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick chips */}
          <div className="py-2 flex gap-1.5 overflow-x-auto text-xs">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="whitespace-nowrap px-3 py-1 bg-slate-900 hover:bg-slate-700 border border-slate-700 hover:border-purple-500 rounded-xl text-slate-300 text-[11px] font-semibold transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input field */}
          <div className="pt-2 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask Gemi a question or 'what if I buy buses twice?'..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="p-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl font-bold transition-transform active:translate-y-0.5"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
