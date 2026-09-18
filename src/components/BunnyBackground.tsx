import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Heart } from 'lucide-react';

interface BunnyProps {
  id: string;
  name: string;
  size: number; // width in px
  yPercent: number; // vertical position % from top
  speed: number; // seconds to cross screen
  direction: 'left-to-right' | 'right-to-left';
  initialDelay: number;
  accessory?: 'carrot' | 'flower' | 'clover' | 'ribbon';
  earColor?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  emoji: string;
}

export function BunnyBackground() {
  const [enabled, setEnabled] = useState(true);
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleIdRef = useRef(0);

  const triggerReaction = (e: React.MouseEvent<HTMLDivElement>, bunnyName: string) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const emojis = ['🥕', '💖', '✨', '🌸', '🐰', '🍀'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

    const newParticle = {
      id: ++particleIdRef.current,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
      emoji: randomEmoji,
    };

    setParticles((prev) => [...prev.slice(-15), newParticle]);

    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
    }, 1200);
  };

  if (!enabled) {
    return (
      <button
        type="button"
        onClick={() => setEnabled(true)}
        className="fixed bottom-4 left-4 z-40 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-stone-600 hover:text-pink-600 text-xs font-semibold shadow-md border border-pink-200/80 backdrop-blur-xs flex items-center gap-1.5 transition-all cursor-pointer"
        title="토끼 친구들 부르기"
      >
        <span>🐰</span>
        <span>토끼 친구들 부르기</span>
      </button>
    );
  }

  return (
    <>
      {/* Background bunny layer */}
      <div
        className="fixed inset-0 pointer-events-none z-10 overflow-hidden select-none"
        aria-hidden="true"
      >
        {/* Bunny 1: Cheerful big bunny crossing from left to right */}
        <AnimatedBunny
          id="bunny-1"
          name="쫑긋이"
          size={58}
          yPercent={86}
          speed={18}
          direction="left-to-right"
          initialDelay={0}
          accessory="carrot"
          onInteract={triggerReaction}
        />

        {/* Bunny 2: Tiny baby bunny following behind */}
        <AnimatedBunny
          id="bunny-2"
          name="아기토끼"
          size={42}
          yPercent={90}
          speed={15}
          direction="left-to-right"
          initialDelay={4}
          accessory="flower"
          onInteract={triggerReaction}
        />

        {/* Bunny 3: Playful bunny running from right to left */}
        <AnimatedBunny
          id="bunny-3"
          name="달콩이"
          size={52}
          yPercent={78}
          speed={22}
          direction="right-to-left"
          initialDelay={2}
          accessory="clover"
          onInteract={triggerReaction}
        />

        {/* Bunny 4: Upper-tier gentle hopper */}
        <AnimatedBunny
          id="bunny-4"
          name="몽실이"
          size={46}
          yPercent={38}
          speed={26}
          direction="left-to-right"
          initialDelay={8}
          accessory="ribbon"
          opacity={0.7}
          onInteract={triggerReaction}
        />

        {/* Interactive Click Particles (Hearts, Carrots) */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="fixed pointer-events-none text-xl font-bold animate-bunny-float"
            style={{
              left: `${p.x}px`,
              top: `${p.y}px`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {p.emoji}
          </div>
        ))}
      </div>

      {/* Floating Toggle Pill */}
      <div className="fixed bottom-4 left-4 z-40 flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => setEnabled(false)}
          className="px-2.5 py-1 rounded-full bg-white/85 hover:bg-white text-stone-500 hover:text-stone-800 text-[11px] font-medium shadow-xs border border-pink-200/70 backdrop-blur-xs flex items-center gap-1 transition-all cursor-pointer"
          title="배경 토끼 숨기기"
        >
          <span>🐰</span>
          <span>토끼 숨기기</span>
        </button>
      </div>
    </>
  );
}

interface AnimatedBunnyProps extends BunnyProps {
  opacity?: number;
  onInteract: (e: React.MouseEvent<HTMLDivElement>, name: string) => void;
}

function AnimatedBunny({
  name,
  size,
  yPercent,
  speed,
  direction,
  initialDelay,
  accessory,
  opacity = 0.92,
  onInteract,
}: AnimatedBunnyProps) {
  const isRight = direction === 'left-to-right';

  return (
    <div
      className="absolute pointer-events-auto cursor-pointer group"
      style={{
        top: `${yPercent}%`,
        animation: `bunny-cross-${direction} ${speed}s linear infinite`,
        animationDelay: `${initialDelay}s`,
        opacity,
        willChange: 'transform',
      }}
      onClick={(e) => onInteract(e, name)}
      title={`${name} (클릭하면 껑충 뛰어요!)`}
    >
      <div
        className="relative group-hover:scale-115 transition-transform"
        style={{
          animation: 'bunny-hop 0.65s ease-in-out infinite alternate',
          transformOrigin: 'bottom center',
        }}
      >
        {/* Footprint / dust puff when landing */}
        <div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-2 rounded-full bg-pink-300/30 blur-[1px]"
          style={{
            animation: 'bunny-shadow 0.65s ease-in-out infinite alternate',
          }}
        />

        {/* Hover Speech Bubble */}
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-white/95 text-pink-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-pink-200 shadow-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {name} 🥕
        </div>

        {/* SVG Bunny Character */}
        <div
          style={{
            width: `${size}px`,
            height: `${size * 1.15}px`,
            transform: isRight ? 'scaleX(1)' : 'scaleX(-1)',
          }}
        >
          <BunnySVG accessory={accessory} />
        </div>
      </div>
    </div>
  );
}

function BunnySVG({ accessory }: { accessory?: 'carrot' | 'flower' | 'clover' | 'ribbon' }) {
  return (
    <svg
      viewBox="0 0 100 115"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full drop-shadow-xs"
    >
      {/* Fluffy Round Tail */}
      <circle cx="18" cy="85" r="10" fill="#FFFFFF" stroke="#FCE7F3" strokeWidth="2" />
      <circle cx="16" cy="83" r="5" fill="#FFF1F2" />

      {/* Back foot */}
      <ellipse cx="28" cy="100" rx="14" ry="7" fill="#FFFFFF" stroke="#FCE7F3" strokeWidth="2" />
      <ellipse cx="28" cy="100" rx="6" ry="3" fill="#FDF2F8" />

      {/* Front foot */}
      <ellipse cx="68" cy="102" rx="12" ry="6" fill="#FFFFFF" stroke="#FCE7F3" strokeWidth="2" />
      <ellipse cx="68" cy="102" rx="5" ry="2.5" fill="#FDF2F8" />

      {/* Chubby Body */}
      <ellipse cx="46" cy="80" rx="30" ry="24" fill="#FFFFFF" stroke="#FCE7F3" strokeWidth="2" />
      {/* Soft tummy shade */}
      <ellipse cx="48" cy="82" rx="20" ry="16" fill="#FFF5F7" />

      {/* Ears (Hop with gentle animation) */}
      {/* Left Ear */}
      <g style={{ transformOrigin: '42px 42px', animation: 'bunny-ear-wiggle 1.8s ease-in-out infinite' }}>
        <path
          d="M 42 42 C 34 25, 30 5, 42 2 C 54 5, 50 25, 46 42 Z"
          fill="#FFFFFF"
          stroke="#FCE7F3"
          strokeWidth="2"
        />
        {/* Inner Pink Ear */}
        <path
          d="M 42 38 C 37 25, 34 10, 42 7 C 49 10, 47 25, 45 38 Z"
          fill="#FBCFE8"
        />
      </g>

      {/* Right Ear */}
      <g style={{ transformOrigin: '58px 42px', animation: 'bunny-ear-wiggle 2.1s ease-in-out infinite reverse' }}>
        <path
          d="M 54 42 C 50 25, 54 5, 66 2 C 78 5, 72 25, 60 42 Z"
          fill="#FFFFFF"
          stroke="#FCE7F3"
          strokeWidth="2"
        />
        {/* Inner Pink Ear */}
        <path
          d="M 56 38 C 53 25, 56 10, 64 7 C 72 10, 68 25, 60 38 Z"
          fill="#FBCFE8"
        />
      </g>

      {/* Head */}
      <ellipse cx="54" cy="50" rx="26" ry="23" fill="#FFFFFF" stroke="#FCE7F3" strokeWidth="2" />

      {/* Rosy Cheeks */}
      <circle cx="36" cy="58" r="5.5" fill="#F472B6" fillOpacity="0.35" />
      <circle cx="70" cy="58" r="5.5" fill="#F472B6" fillOpacity="0.35" />

      {/* Left Eye */}
      <circle cx="43" cy="49" r="3.2" fill="#374151" />
      <circle cx="42" cy="47.5" r="1.1" fill="#FFFFFF" />

      {/* Right Eye */}
      <circle cx="63" cy="49" r="3.2" fill="#374151" />
      <circle cx="62" cy="47.5" r="1.1" fill="#FFFFFF" />

      {/* Tiny Nose */}
      <polygon points="51.5,54 54.5,54 53,56.5" fill="#EC4899" />

      {/* Cute Bunny Mouth */}
      <path
        d="M 50 58 Q 53 60 53 57 Q 53 60 56 58"
        stroke="#4B5563"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Whiskers */}
      <line x1="26" y1="55" x2="35" y2="56" stroke="#D1D5DB" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="27" y1="60" x2="35" y2="59" stroke="#D1D5DB" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="71" y1="56" x2="80" y2="55" stroke="#D1D5DB" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="71" y1="59" x2="79" y2="60" stroke="#D1D5DB" strokeWidth="1.2" strokeLinecap="round" />

      {/* Front Little Paw */}
      <ellipse cx="64" cy="74" rx="7" ry="5" fill="#FFFFFF" stroke="#FCE7F3" strokeWidth="1.5" />

      {/* Accessories */}
      {accessory === 'carrot' && (
        <g transform="translate(62, 66) rotate(22)">
          {/* Carrot leaf */}
          <path d="M 12 2 Q 15 -4 18 0 Q 15 4 12 2 Z" fill="#4ADE80" />
          <path d="M 12 2 Q 12 -6 10 -4 Q 10 2 12 2 Z" fill="#22C55E" />
          {/* Carrot body */}
          <polygon points="12,0 14,5 2,-2" fill="#FB923C" />
          <path d="M 0 0 C 4 -2, 10 0, 14 3 C 12 6, 8 8, 0 1 Z" fill="#F97316" />
          <line x1="5" y1="1" x2="8" y2="4" stroke="#EA580C" strokeWidth="0.8" />
        </g>
      )}

      {accessory === 'flower' && (
        <g transform="translate(60, 24)">
          <circle cx="0" cy="-3" r="3" fill="#F472B6" />
          <circle cx="3" cy="0" r="3" fill="#F472B6" />
          <circle cx="0" cy="3" r="3" fill="#F472B6" />
          <circle cx="-3" cy="0" r="3" fill="#F472B6" />
          <circle cx="0" cy="0" r="2.2" fill="#FDE047" />
        </g>
      )}

      {accessory === 'clover' && (
        <g transform="translate(68, 70)">
          <circle cx="-2" cy="-2" r="2.5" fill="#4ADE80" />
          <circle cx="2" cy="-2" r="2.5" fill="#4ADE80" />
          <circle cx="0" cy="2" r="2.5" fill="#4ADE80" />
          <path d="M 0 2 Q 2 7 4 9" stroke="#16A34A" strokeWidth="1" fill="none" />
        </g>
      )}

      {accessory === 'ribbon' && (
        <g transform="translate(38, 30)">
          <polygon points="0,0 -5,-4 -4,4" fill="#FB7185" />
          <polygon points="0,0 5,-4 4,4" fill="#FB7185" />
          <circle cx="0" cy="0" r="2" fill="#F43F5E" />
        </g>
      )}
    </svg>
  );
}
