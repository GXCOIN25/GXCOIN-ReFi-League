import React, { useMemo } from "react";
import { motion } from "framer-motion";

// Token-specific color themes as specified in the task
const TOKEN_THEMES = {
  GCCT: {
    primary: "#22c55e", // emerald
    gradient: ["#22c55e", "#16a34a", "#15803d"],
    glyph: "₵",
    name: "Carbon Credits"
  },
  WTR: {
    primary: "#3b82f6", // blue
    gradient: ["#3b82f6", "#2563eb", "#1d4ed8"],
    glyph: "≋",
    name: "Water"
  },
  GPWR: {
    primary: "#f59e0b", // amber
    gradient: ["#f59e0b", "#d97706", "#b45309"],
    glyph: "⚡",
    name: "Green Power"
  },
  BATT: {
    primary: "#fb923c", // orange
    gradient: ["#fb923c", "#f97316", "#ea580c"],
    glyph: "🔋",
    name: "Battery"
  },
  HEMP: {
    primary: "#84cc16", // lime
    gradient: ["#84cc16", "#65a30d", "#4d7c0f"],
    glyph: "🌿",
    name: "Hemp"
  }
} as const;

export type TokenSymbol = keyof typeof TOKEN_THEMES;

interface TokenBadgeProps {
  tokenSymbol: TokenSymbol;
  attributes: {
    power: number;
    impact: number;
    rarity: number;
  };
  rarity: 'Common' | 'Rare' | 'Legendary';
  level: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animated?: boolean;
}

interface CircularProgressProps {
  value: number;
  max: number;
  size: number;
  strokeWidth: number;
  color: string;
  trackColor?: string;
  className?: string;
  label: string;
}

// Circular progress arc component
const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max,
  size,
  strokeWidth,
  color,
  trackColor = "rgba(255,255,255,0.1)",
  className = "",
  label
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / max, 1);
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference * (1 - progress);
  
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="rotate-[-90deg]"
        aria-label={`${label}: ${value}/${max}`}
        role="img"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={{
            strokeDasharray,
            strokeDashoffset
          }}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      {/* Value text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-white" aria-hidden="true">
          {value}
        </span>
      </div>
    </div>
  );
};

// Token glyph component
const TokenGlyph: React.FC<{ symbol: TokenSymbol; size: number; color: string }> = ({
  symbol,
  size,
  color
}) => {
  const theme = TOKEN_THEMES[symbol];
  
  return (
    <div 
      className="flex items-center justify-center font-bold"
      style={{ 
        fontSize: size * 0.6,
        color,
        textShadow: '0 0 8px rgba(0,0,0,0.5)'
      }}
      aria-label={`${theme.name} token`}
    >
      {theme.glyph}
    </div>
  );
};

// Shimmer effect for legendary badges
const ShimmerEffect: React.FC<{ children: React.ReactNode; enabled: boolean }> = ({
  children,
  enabled
}) => {
  if (!enabled) return <>{children}</>;
  
  return (
    <motion.div
      className="relative overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
    >
      {children}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
        animate={{
          translateX: ['100%', '100%', '-100%', '-100%']
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        style={{
          backdropFilter: 'brightness(1.2)'
        }}
      />
    </motion.div>
  );
};

export const TokenBadge: React.FC<TokenBadgeProps> = ({
  tokenSymbol,
  attributes,
  rarity,
  level,
  size = 'md',
  className = '',
  animated = true
}) => {
  const theme = TOKEN_THEMES[tokenSymbol];
  const isLegendary = rarity === 'Legendary';
  
  // Size configurations
  const sizeConfig = useMemo(() => {
    switch (size) {
      case 'sm':
        return {
          container: 120,
          progress: 24,
          progressStroke: 2,
          glyph: 32,
          padding: 8
        };
      case 'lg':
        return {
          container: 200,
          progress: 40,
          progressStroke: 3,
          glyph: 80,
          padding: 16
        };
      default: // 'md'
        return {
          container: 160,
          progress: 32,
          progressStroke: 2.5,
          glyph: 60,
          padding: 12
        };
    }
  }, [size]);

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const shouldAnimate = animated && !prefersReducedMotion;

  return (
    <ShimmerEffect enabled={isLegendary && shouldAnimate}>
      <motion.div
        className={`relative ${className}`}
        style={{ width: sizeConfig.container, height: sizeConfig.container }}
        initial={shouldAnimate ? { scale: 0.8, opacity: 0 } : undefined}
        animate={shouldAnimate ? { scale: 1, opacity: 1 } : undefined}
        transition={{ duration: 0.5, ease: "easeOut" }}
        whileHover={shouldAnimate ? { scale: 1.05 } : undefined}
      >
        {/* Main badge background */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <svg
            width={sizeConfig.container}
            height={sizeConfig.container}
            className="absolute inset-0"
            aria-hidden="true"
          >
            <defs>
              <radialGradient
                id={`badge-gradient-${tokenSymbol}-${level}`}
                cx="50%"
                cy="30%"
                r="70%"
              >
                <stop offset="0%" stopColor={theme.gradient[0]} stopOpacity="0.9" />
                <stop offset="50%" stopColor={theme.gradient[1]} stopOpacity="0.8" />
                <stop offset="100%" stopColor={theme.gradient[2]} stopOpacity="0.9" />
              </radialGradient>
              <radialGradient
                id={`badge-overlay-${tokenSymbol}-${level}`}
                cx="50%"
                cy="50%"
                r="50%"
              >
                <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </radialGradient>
            </defs>
            
            {/* Main circle */}
            <circle
              cx={sizeConfig.container / 2}
              cy={sizeConfig.container / 2}
              r={sizeConfig.container / 2 - 2}
              fill={`url(#badge-gradient-${tokenSymbol}-${level})`}
              stroke={theme.primary}
              strokeWidth="2"
            />
            
            {/* Highlight overlay */}
            <circle
              cx={sizeConfig.container / 2}
              cy={sizeConfig.container / 2}
              r={sizeConfig.container / 4}
              fill={`url(#badge-overlay-${tokenSymbol}-${level})`}
            />
            
            {/* Ring details for higher levels */}
            {level > 2 && (
              <circle
                cx={sizeConfig.container / 2}
                cy={sizeConfig.container / 2}
                r={sizeConfig.container / 2 - 8}
                fill="none"
                stroke={theme.primary}
                strokeWidth="1"
                strokeOpacity="0.6"
              />
            )}
          </svg>
        </div>

        {/* Token glyph/monogram */}
        <div 
          className="absolute inset-0 flex items-center justify-center z-10"
          style={{ marginTop: -sizeConfig.padding }}
        >
          <TokenGlyph
            symbol={tokenSymbol}
            size={sizeConfig.glyph}
            color="#ffffff"
          />
        </div>

        {/* Progress arcs for attributes */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Power arc (top-right) */}
          <div 
            className="absolute"
            style={{ 
              top: sizeConfig.padding,
              right: sizeConfig.padding
            }}
          >
            <CircularProgress
              value={attributes.power}
              max={100}
              size={sizeConfig.progress}
              strokeWidth={sizeConfig.progressStroke}
              color="#ef4444"
              label="Power"
            />
          </div>

          {/* Impact arc (bottom-right) */}
          <div 
            className="absolute"
            style={{ 
              bottom: sizeConfig.padding,
              right: sizeConfig.padding
            }}
          >
            <CircularProgress
              value={attributes.impact}
              max={100}
              size={sizeConfig.progress}
              strokeWidth={sizeConfig.progressStroke}
              color="#3b82f6"
              label="Impact"
            />
          </div>

          {/* Rarity arc (bottom-left) */}
          <div 
            className="absolute"
            style={{ 
              bottom: sizeConfig.padding,
              left: sizeConfig.padding
            }}
          >
            <CircularProgress
              value={attributes.rarity}
              max={100}
              size={sizeConfig.progress}
              strokeWidth={sizeConfig.progressStroke}
              color="#8b5cf6"
              label="Rarity"
            />
          </div>
        </div>

        {/* Level indicator */}
        <div 
          className="absolute top-1 left-1 bg-black/60 text-white text-xs font-bold px-1.5 py-0.5 rounded-full"
          aria-label={`Level ${level}`}
        >
          L{level}
        </div>

        {/* Rarity indicator */}
        <div 
          className={`absolute top-1 right-1 text-xs font-bold px-1.5 py-0.5 rounded-full ${
            rarity === 'Legendary' ? 'bg-yellow-500/80 text-yellow-900' :
            rarity === 'Rare' ? 'bg-purple-500/80 text-white' :
            'bg-gray-500/80 text-white'
          }`}
          aria-label={`${rarity} rarity`}
        >
          {rarity === 'Legendary' ? '★' : rarity === 'Rare' ? '◆' : '○'}
        </div>
      </motion.div>
    </ShimmerEffect>
  );
};

export default TokenBadge;