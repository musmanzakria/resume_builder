"use client";

import React from "react";
import { Plus, Minus } from "lucide-react";

interface NumberStepperProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  presets?: number[];
  className?: string;
}

export const NumberStepper: React.FC<NumberStepperProps> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = "",
  presets = [],
  className = "",
}) => {
  const handleIncrement = () => {
    const next = Math.min(max, parseFloat((value + step).toFixed(2)));
    onChange(next);
  };

  const handleDecrement = () => {
    const prev = Math.max(min, parseFloat((value - step).toFixed(2)));
    onChange(prev);
  };

  const handleDirectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseFloat(e.target.value);
    if (!isNaN(parsed)) {
      onChange(Math.max(min, Math.min(max, parsed)));
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs text-slate-700 font-medium">{label}</label>
        <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 font-semibold">
          {value}
          {unit}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Stepper with +/- buttons (Light Mode) */}
        <div className="flex-1 flex items-center bg-white border border-slate-300 rounded-lg overflow-hidden focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/20 shadow-sm">
          <button
            type="button"
            onClick={handleDecrement}
            className="px-2.5 py-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Decrease"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <input
            type="number"
            value={value}
            step={step}
            min={min}
            max={max}
            onChange={handleDirectChange}
            className="w-full text-center bg-transparent text-xs text-slate-900 font-mono font-medium focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />

          <button
            type="button"
            onClick={handleIncrement}
            className="px-2.5 py-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Increase"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Preset Chips (Light Mode) */}
      {presets.length > 0 && (
        <div className="flex items-center gap-1.5 pt-0.5">
          <span className="text-[10px] text-slate-500">Presets:</span>
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onChange(preset)}
              className={`text-[10px] px-1.5 py-0.5 rounded border transition-all font-mono font-medium ${
                value === preset
                  ? "bg-indigo-50 text-indigo-700 border-indigo-300 shadow-xs"
                  : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {preset}
              {unit}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
