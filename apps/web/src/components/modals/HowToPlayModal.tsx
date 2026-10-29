import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { soundManager } from '../../services/sound';
import { NpcAvatar } from '../art/NpcAvatar';
import { X, ArrowRight, CheckCircle2 } from 'lucide-react';

export const HowToPlayModal: React.FC = () => {
  const { isHowToPlayOpen, setHowToPlayOpen } = useGameStore();
  const [step, setStep] = useState(1);

  if (!isHowToPlayOpen) return null;

  const totalSteps = 4;

  const handleNext = () => {
    soundManager.playClick();
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      setHowToPlayOpen(false);
      setStep(1);
    }
  };

  const handleClose = () => {
    soundManager.playClick();
    setHowToPlayOpen(false);
    setStep(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border-3 border-emerald-500 rounded-3xl p-6 shadow-2xl relative text-white">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <NpcAvatar id="mira" size="sm" animate={true} />
          <div>
            <h3 className="font-display font-black text-lg text-emerald-400">
              Mayor Mira's Field Guide ({step}/{totalSteps})
            </h3>
            <p className="text-xs text-slate-400">Master the basics of sustainable city governance</p>
          </div>
        </div>

        {/* Step Content */}
        <div className="my-5 min-h-[160px] bg-slate-800/80 border border-slate-700 rounded-2xl p-4">
          {step === 1 && (
            <div className="space-y-2">
              <div className="text-2xl">🗺️ Visit Buildings on the Map</div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Your city is divided into 4 unique zones: <strong>Industrial, Residential, Downtown, and Outskirts</strong>.
                Visit each building on the map to tackle specialized challenges in Energy, Transit, Waste, Budget, and Crisis Resilience!
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2">
              <div className="text-2xl flex items-center gap-2">
                <span className="p-1 bg-sky-500/20 text-sky-400 rounded-lg text-lg font-bold">SIMULATE</span>
                <span>vs</span>
                <span className="p-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-lg font-bold">IMPLEMENT</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Never gamble blindly with public funds!
                Press <strong className="text-sky-400">SIMULATE</strong> to safely test how an action affects traffic, emissions, and happiness <em>without spending a penny</em>.
                When you're confident in the outcome, press <strong className="text-emerald-400">IMPLEMENT</strong> to commit!
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-2">
              <div className="text-2xl">⚡ Trade-offs & Diminishing Returns</div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Every action has real trade-offs! For example, <em>Building New Roads</em> cuts Downtown gridlock but increases tailpipe emissions.
                Also, each policy can only be implemented <strong>twice</strong>, and the 2nd purchase yields <strong>50% weaker effects</strong>. Diversify your policies!
              </p>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-2">
              <div className="text-2xl">🦉 Gemi the AI Advisor & Resilience</div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Whenever you have doubts, tap <strong className="text-purple-400">Gemi AI</strong> to ask doubts or simulate natural language what-ifs!
                Watch out for surprise crises (heatwaves, strikes)—earlier green investments will shield your citizens from harm!
              </p>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className={`w-2.5 h-2.5 rounded-full ${
                  step === i ? 'bg-emerald-400' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black rounded-xl text-sm flex items-center gap-1.5 transition-transform active:translate-y-0.5"
          >
            {step === totalSteps ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Got it, Let's Govern!
              </>
            ) : (
              <>
                Next Tip <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
