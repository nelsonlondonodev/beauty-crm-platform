const HeroBackground = () => (
  <>
    <div className="absolute top-0 right-0 -z-10 h-[800px] w-[800px] translate-x-1/3 -translate-y-1/3 rounded-full bg-purple-500/10 blur-[120px] mix-blend-multiply opacity-70 animate-pulse" style={{ animationDuration: '8s' }} />
    <div className="absolute top-1/2 left-0 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[100px] mix-blend-multiply opacity-50 animate-pulse" style={{ animationDuration: '12s' }} />
  </>
);

export default HeroBackground;
