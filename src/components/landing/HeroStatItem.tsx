interface HeroStatProps {
  value: string;
  label: string;
  showDivider?: boolean;
}

const HeroStatItem = ({ value, label, showDivider = true }: HeroStatProps) => (
  <>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-[10px] uppercase font-black tracking-widest text-gray-500">{label}</p>
    </div>
    {showDivider && <div className="h-10 w-px bg-gray-200" />}
  </>
);

export default HeroStatItem;
