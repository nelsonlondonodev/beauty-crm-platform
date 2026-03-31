interface LTVSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  displayValue: string;
  onChange: (value: number) => void;
}

const LTVSlider = ({ label, value, min, max, step, displayValue, onChange }: LTVSliderProps) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center text-sm font-bold text-gray-300">
      <span>{label}</span>
      <span className="text-purple-400">{displayValue}</span>
    </div>
    <input 
      type="range" min={min} max={max} step={step} 
      value={value} onChange={(e) => onChange(Number(e.target.value))}
      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-purple-500"
    />
  </div>
);

export default LTVSlider;
