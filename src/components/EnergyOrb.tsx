/** 悬浮五行能量球 · the floating five-element energy orb on the landing page */
export default function EnergyOrb({ size = 180, className = "" }: { size?: number; className?: string }) {
  return (
    <div className={`relative mx-auto ${className}`} style={{ width: size, height: size }} aria-hidden>
      <div className="absolute inset-0 overflow-hidden rounded-full border-2 border-white/80 shadow-[inset_0_0_46px_rgba(255,255,255,0.75),0_14px_36px_rgba(180,140,255,0.4)]">
        <span className="orb-a absolute top-[12%] left-[8%] h-[58%] w-[58%] rounded-full bg-[#ff5c93] opacity-90 blur-lg" />
        <span className="orb-b absolute top-[6%] right-[4%] h-[56%] w-[56%] rounded-full bg-[#a06bff] opacity-90 blur-lg" />
        <span className="orb-c absolute bottom-[2%] left-[20%] h-[58%] w-[58%] rounded-full bg-[#3fa7ff] opacity-85 blur-lg" />
        <span className="orb-a absolute right-[10%] bottom-[8%] h-[42%] w-[42%] rounded-full bg-[#ffc93c] opacity-90 blur-lg" />
        <span className="orb-b absolute top-[30%] left-[30%] h-[38%] w-[38%] rounded-full bg-[#2fd48a] opacity-80 blur-lg" />
        <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_34%_28%,rgba(255,255,255,0.7),rgba(255,255,255,0)_48%)]" />
      </div>
    </div>
  );
}
