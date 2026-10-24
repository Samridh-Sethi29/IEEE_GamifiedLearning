import React, { useState, useEffect } from "react";
import {
  Factory,
  Megaphone,
  Truck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Star,
} from "lucide-react";

export default function CEOSimulationRunning({ quarterResult, onFinished }) {
  const [progress, setProgress] = useState(15);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setProgress(40);
      setCurrentStep(1);
    }, 800);

    const t2 = setTimeout(() => {
      setProgress(75);
      setCurrentStep(2);
    }, 1700);

    const t3 = setTimeout(() => {
      setProgress(100);
      setCurrentStep(3);
    }, 2600);

    const t4 = setTimeout(() => {
      onFinished();
    }, 3600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onFinished]);

  const steps = [
    { label: "EV Assembly & Quality Checks", icon: Factory },
    { label: "Marketing Campaigns Airing", icon: Megaphone },
    { label: "Logistics Hub Dispatches", icon: Truck },
    { label: "Customer Delivery & Feedback", icon: CheckCircle2 },
  ];

  return (
    <div className="ceo-sim-screen">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-black uppercase tracking-wider mb-2">
        <Sparkles className="w-3.5 h-3.5" />
        Quarter {quarterResult.quarter} Market Execution in Progress
      </div>

      <h2 className="font-heading text-2xl sm:text-3xl font-black text-white mt-2">
        Simulating 90 Business Days Across India
      </h2>
      <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto mt-2">
        Your capital allocations are moving real metal: factories are pressing panels, transport trucks are rolling, and drivers are test-driving your vehicles.
      </p>

      {/* Progress Track */}
      <div className="ceo-sim-progress-track">
        <div
          className="ceo-sim-progress-bar"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 4 Steps */}
      <div className="ceo-sim-steps">
        {steps.map((st, i) => {
          const Icon = st.icon;
          const isDone = currentStep > i || progress === 100;
          const isActive = currentStep === i && progress < 100;

          return (
            <div
              key={st.label}
              className={`ceo-sim-step ${isDone ? "done" : isActive ? "active" : ""}`}
            >
              <Icon className="w-4 h-4" />
              <span>{st.label}</span>
            </div>
          );
        })}
      </div>

      {/* Live Incoming Customer Reviews Stream */}
      <div className="mt-8 pt-6 border-t border-slate-800">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
          Live Inbound Customer Sentiment & Reviews:
        </span>

        <div className="ceo-reviews-list">
          {quarterResult.reviews?.slice(0, 3).map((rev, idx) => (
            <div key={idx} className={`ceo-review-card ${rev.sentiment}`}>
              <div className="ceo-review-top">
                <b>{rev.author}</b>
                <span className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: rev.stars }).map((_, si) => (
                    <Star key={si} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-xs text-slate-400 ml-1">({rev.tag})</span>
                </span>
              </div>
              <p className="ceo-review-text">{rev.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Manual skip button if user doesn't want to wait */}
      <div className="mt-8">
        <button onClick={onFinished} className="ceo-btn-execute" style={{ padding: "12px 24px" }}>
          <span>View Audited Quarter Analytics</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
