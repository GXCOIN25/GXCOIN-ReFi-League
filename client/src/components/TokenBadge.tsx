import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Crown, Link } from "lucide-react";

// Token-specific image mappings to the uploaded NFT card images
const TOKEN_IMAGES = {
  GCCT: "/gcct-warrior-badge.jpg", // Carbon Credits warrior badge (CORRECT)
  WTR: "/wtr-badge.jpg", // AGUA ($WTR) - Water warrior badge (FIXED)
  GPWR: "/gpwr-badge.jpg", // VOLTRA ($GPWR) - Green Power energy warrior badge (CORRECT)
  BATT: "/batt-badge.jpg", // GRAPHENE ($BATT) - Battery/tech warrior badge (FIXED)
  HEMP: "/hemp-badge.jpg", // HEMP ($HEMP) - Hemp nature warrior badge (FIXED)
  GXCOIN: "/heroes-group.jpg" // GXCOIN Anchor badge (using heroes group as anchor image)
} as const;

// Token-specific color themes for progress rings and accents
const TOKEN_THEMES = {
  GCCT: {
    primary: "#22c55e", // emerald
    gradient: ["#22c55e", "#16a34a", "#15803d"],
    name: "Carbon Credits"
  },
  WTR: {
    primary: "#3b82f6", // blue
    gradient: ["#3b82f6", "#2563eb", "#1d4ed8"],
    name: "Water"
  },
  GPWR: {
    primary: "#f59e0b", // amber
    gradient: ["#f59e0b", "#d97706", "#b45309"],
    name: "Green Power"
  },
  BATT: {
    primary: "#fb923c", // orange
    gradient: ["#fb923c", "#f97316", "#ea580c"],
    name: "Battery"
  },
  HEMP: {
    primary: "#84cc16", // lime
    gradient: ["#84cc16", "#65a30d", "#4d7c0f"],
    name: "Hemp"
  },
  GXCOIN: {
    primary: "#ffd700", // gold
    gradient: ["#ffd700", "#ffb300", "#ff8f00"],
    name: "GXCOIN Anchor"
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

// Circular progress arc component for attributes overlay
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
  const normalizedValue = Math.min(Math.max(value, 0), max);
  const percentage = (normalizedValue / max) * 100;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg
        className="absolute inset-0 -rotate-90"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-label={`${label}: ${normalizedValue}/${max}`}
        role="img"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      {/* Center label */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-white drop-shadow-lg">
          {normalizedValue}
        </span>
      </div>
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
    <motion.div className="relative overflow-hidden rounded-lg">
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
  const imageSrc = TOKEN_IMAGES[tokenSymbol];
  const isLegendary = rarity === 'Legendary';
  
  // Image loading state management
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentImageSrc, setCurrentImageSrc] = useState<string>(imageSrc);
  const [allImagesFailed, setAllImagesFailed] = useState(false);
  
  // Reset image state when tokenSymbol changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
    setAllImagesFailed(false);
    // Force fresh image load with aggressive cache-busting
    const cacheBustingUrl = `${TOKEN_IMAGES[tokenSymbol]}?bust=${Date.now()}&rnd=${Math.random()}&token=${tokenSymbol}`;
    setCurrentImageSrc(cacheBustingUrl);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🎯 TokenBadge ${tokenSymbol} loading image:`, cacheBustingUrl);
    }
  }, [tokenSymbol]);
  
  // Size configurations
  const sizeConfig = useMemo(() => {
    switch (size) {
      case 'sm':
        return {
          container: 120,
          progress: 24,
          progressStroke: 2,
          image: 100,
          padding: 8
        };
      case 'lg':
        return {
          container: 200,
          progress: 40,
          progressStroke: 3,
          image: 180,
          padding: 16
        };
      default: // 'md'
        return {
          container: 160,
          progress: 32,
          progressStroke: 2.5,
          image: 140,
          padding: 12
        };
    }
  }, [size]);

  // Check for reduced motion preference with runtime guard
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const shouldAnimate = animated && !prefersReducedMotion;

  // Rarity border styles
  const rarityStyles = useMemo(() => {
    switch (rarity) {
      case 'Legendary':
        return {
          border: `3px solid ${theme.primary}`,
          boxShadow: `0 0 20px ${theme.primary}50, inset 0 0 20px ${theme.primary}20`,
          background: `linear-gradient(135deg, ${theme.gradient[0]}10, ${theme.gradient[1]}20, ${theme.gradient[2]}10)`
        };
      case 'Rare':
        return {
          border: `2px solid ${theme.primary}80`,
          boxShadow: `0 0 10px ${theme.primary}30`,
          background: `linear-gradient(135deg, ${theme.gradient[0]}05, ${theme.gradient[1]}10)`
        };
      default: // Common
        return {
          border: `1px solid ${theme.primary}40`,
          boxShadow: `0 0 5px ${theme.primary}20`,
          background: `linear-gradient(135deg, ${theme.gradient[0]}02, ${theme.gradient[1]}05)`
        };
    }
  }, [rarity, theme]);

  return (
    <ShimmerEffect enabled={isLegendary && shouldAnimate}>
      <motion.div
        className={`relative rounded-xl overflow-hidden ${className}`}
        style={{ 
          width: sizeConfig.container, 
          height: sizeConfig.container,
          ...rarityStyles
        }}
        initial={shouldAnimate ? { scale: 0.8, opacity: 0 } : undefined}
        animate={shouldAnimate ? { scale: 1, opacity: 1 } : undefined}
        transition={{ duration: 0.5, ease: "easeOut" }}
        whileHover={shouldAnimate ? { scale: 1.05 } : undefined}
      >
        {/* Main NFT card image */}
        <div className="absolute inset-0">
          {!imageLoaded && !imageError && (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <div className="text-white text-xs animate-pulse">Loading...</div>
            </div>
          )}
          <img
            src={currentImageSrc}
            alt={`${theme.name} NFT Badge`}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              filter: `brightness(1.1) contrast(1.1) saturate(1.2)`
            }}
            onLoad={() => {
              if (process.env.NODE_ENV !== 'production') {
                console.log(`Image loaded successfully for ${tokenSymbol}:`, currentImageSrc);
              }
              setImageLoaded(true);
              setImageError(false);
              setAllImagesFailed(false);
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (process.env.NODE_ENV !== 'production') {
                console.error(`Image failed to load for ${tokenSymbol}:`, target.src);
              }
              setAllImagesFailed(true);
              setImageLoaded(false); // Show placeholder instead of fallback image
            }}
          />
          {allImagesFailed && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-lg font-bold">{tokenSymbol}</div>
                <div className="text-xs opacity-75">{theme.name}</div>
              </div>
            </div>
          )}
        </div>

        {/* Overlay gradient for better text visibility - Token-specific */}
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(45deg, ${theme.primary}30 0%, transparent 50%, ${theme.primary}15 100%)`,
            border: `3px solid ${theme.primary}60`
          }}
        />
        
        {/* Token-specific corner indicator */}
        <div className="absolute bottom-2 right-2">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold shadow-xl"
            style={{ 
              background: tokenSymbol === 'GXCOIN' 
                ? `radial-gradient(circle, #ffd700, #ffb300)` 
                : `radial-gradient(circle, ${theme.primary}, ${theme.gradient[2]})`,
              border: `2px solid ${tokenSymbol === 'GXCOIN' ? '#ffd700' : 'white'}`,
              color: 'white'
            }}
          >
            {tokenSymbol === 'WTR' && '💧'}
            {tokenSymbol === 'HEMP' && '🌿'}
            {tokenSymbol === 'GPWR' && '⚡'}
            {tokenSymbol === 'BATT' && '🔋'}
            {tokenSymbol === 'GCCT' && '📈'}
            {tokenSymbol === 'GXCOIN' && <Crown className="h-5 w-5" />}
          </div>
        </div>

        {/* GXCOIN Anchor vs Powered-by States */}
        {tokenSymbol === 'GXCOIN' ? (
          /* ANCHOR STATE - Special styling for GXCOIN */
          <>
            {/* Anchor Crown Symbol */}
            <div className="absolute top-2 left-2">
              <div 
                className="px-3 py-2 rounded-lg text-sm font-bold text-white shadow-xl flex items-center gap-1"
                style={{ 
                  background: `linear-gradient(135deg, #ffd700, #ffb300)`,
                  border: `2px solid #ffd700`,
                  backdropFilter: 'blur(4px)'
                }}
              >
                <Crown className="h-4 w-4" />
                ${tokenSymbol}
              </div>
            </div>
            
            {/* ANCHOR Chip */}
            <div className="absolute top-2 right-12">
              <div 
                className="px-2 py-1 rounded-md text-xs font-bold text-white shadow-xl"
                style={{ 
                  background: `linear-gradient(135deg, #ffb300, #ff8f00)`,
                  border: `1px solid #ffd700`
                }}
              >
                ANCHOR
              </div>
            </div>
          </>
        ) : (
          /* POWERED-BY STATE - For all other heroes */
          <>
            {/* Token symbol overlay */}
            <div className="absolute top-2 left-2">
              <div 
                className="px-3 py-2 rounded-lg text-sm font-bold text-white shadow-xl"
                style={{ 
                  background: `linear-gradient(135deg, ${theme.gradient[0]}, ${theme.gradient[1]})`,
                  border: `2px solid ${theme.primary}`,
                  backdropFilter: 'blur(4px)'
                }}
              >
                ${tokenSymbol}
              </div>
            </div>
            
            {/* Powered by GXCOIN Ribbon */}
            <div className="absolute top-2 right-12">
              <div 
                className="px-2 py-1 rounded-md text-xs font-medium text-yellow-300 shadow-lg flex items-center gap-1"
                style={{ 
                  background: `linear-gradient(135deg, #ffb30080, #ff8f0080)`,
                  border: `1px solid #ffd70060`,
                  backdropFilter: 'blur(2px)'
                }}
                title="This hero is powered by GXCOIN Anchor"
              >
                <Crown className="h-2 w-2" />
                <span>Powered by GXCOIN</span>
                <Link className="h-2 w-2 opacity-70" />
              </div>
            </div>
          </>
        )}

        {/* Level indicator */}
        <div className="absolute top-2 right-2">
          <div 
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg"
            style={{ 
              background: `linear-gradient(135deg, ${theme.gradient[1]}, ${theme.gradient[2]})`,
              border: `1px solid ${theme.primary}`
            }}
          >
            {level}
          </div>
        </div>

        {/* Rarity indicator */}
        <div className="absolute bottom-2 left-2">
          <div 
            className="px-2 py-1 rounded text-xs font-semibold text-white shadow-lg backdrop-blur-sm"
            style={{ 
              background: `${theme.primary}80`,
              border: `1px solid ${theme.primary}`
            }}
          >
            {rarity}
          </div>
        </div>

        {/* Attributes progress rings in bottom-right corner */}
        <div className="absolute bottom-2 right-2 flex gap-1">
          <CircularProgress
            value={attributes.power}
            max={100}
            size={sizeConfig.progress}
            strokeWidth={sizeConfig.progressStroke}
            color={theme.gradient[0]}
            label="Power"
            className="opacity-90"
          />
          <CircularProgress
            value={attributes.impact}
            max={100}
            size={sizeConfig.progress}
            strokeWidth={sizeConfig.progressStroke}
            color={theme.gradient[1]}
            label="Impact"
            className="opacity-90"
          />
          <CircularProgress
            value={attributes.rarity}
            max={100}
            size={sizeConfig.progress}
            strokeWidth={sizeConfig.progressStroke}
            color={theme.gradient[2]}
            label="Rarity Score"
            className="opacity-90"
          />
        </div>
      </motion.div>
    </ShimmerEffect>
  );
};

export default TokenBadge;