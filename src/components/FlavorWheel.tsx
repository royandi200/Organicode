import { useState, useEffect, useCallback } from 'react';

interface FlavorWheelProps {
  activeNotes?: string[];
  scaScore?: number;
  size?: number;
}

const FLAVORS = [
  'Citrus', 'Berry', 'Floral', 'Spicy', 'Chocolate',
  'Nutty', 'Fruity', 'Sweet', 'Earthy', 'Herbal',
  'Winey', 'Tropical'
];

const CX = 300;
const CY = 300;
const R = 200;
const SEGMENTS = 12;
const delta = (2 * Math.PI) / SEGMENTS;

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const innerStart = polarToCartesian(cx, cy, r * 0.6, startAngle);
  const innerEnd = polarToCartesian(cx, cy, r * 0.6, endAngle);
  const outerStart = polarToCartesian(cx, cy, r * 1.15, startAngle);
  const outerEnd = polarToCartesian(cx, cy, r * 1.15, endAngle);

  return [
    `M ${innerStart.x} ${innerStart.y}`,
    `L ${outerStart.x} ${outerStart.y}`,
    `A ${r * 1.15} ${r * 1.15} 0 0 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${r * 0.6} ${r * 0.6} 0 0 0 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ');
}

function findSegment(x: number, y: number): number | null {
  const dx = x - CX;
  const dy = y - CY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  let angle = Math.atan2(dy, dx);

  if (dist < R * 0.5 || dist > R * 1.2) return null;

  if (angle < 0) angle += 2 * Math.PI;
  const segment = Math.floor((angle + Math.PI / 2) / delta);

  if (segment < 0 || segment >= SEGMENTS) return null;
  return segment;
}

export function FlavorWheel({ activeNotes = [], scaScore = 89.25, size = 400 }: FlavorWheelProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Map active notes to segment indices
  const activeIndices = activeNotes
    .map((note) => {
      const normalized = note.toLowerCase().trim();
      // Map Spanish notes to English flavor categories
      const mapping: Record<string, number> = {
        'rosas': 2, 'floral': 2, 'flores': 2,
        'limoncillo': 0, 'citrus': 0, 'citrico': 0, 'limon': 0,
        'te blanco': 9, 'herbal': 9, 'hierbas': 9,
        'durazno': 6, 'frutal': 6, 'frutas': 6, 'fruity': 6,
        'caramelo': 7, 'sweet': 7, 'dulce': 7, 'miel': 7,
        'chocolate': 4, 'cacao': 4, 'achocolatado': 4,
        'avellana': 5, 'nutty': 5, 'nuez': 5,
        'manzana': 6, 'ciruela': 6,
        'maracuya': 11, 'tropical': 11, 'frutas tropicales': 11,
        'vino': 10, 'winey': 10,
        'vainilla': 7,
      };
      return mapping[normalized] ?? -1;
    })
    .filter((i) => i !== -1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      setRotation(0);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const scale = 600 / rect.width;
    const x = (e.clientX - rect.left) * scale;
    const y = (e.clientY - rect.top) * scale;
    setHovered(findSegment(x, y));
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHovered(null);
  }, []);

  const tooltipFlavor = hovered !== null ? FLAVORS[hovered] : null;
  const isActiveFlavor = hovered !== null && activeIndices.includes(hovered);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 600 600"
        className="flavor-wheel"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: mounted ? 'transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Background circle */}
        <circle cx={CX} cy={CY} r={R * 1.15} fill="none" stroke="rgba(201, 168, 76, 0.1)" strokeWidth={1} />
        
        {/* Segments */}
        {FLAVORS.map((flavor, i) => {
          const start = i * delta - Math.PI / 2;
          const end = start + delta - 0.05;
          const isActive = activeIndices.includes(i);
          const isHovered = hovered === i;

          return (
            <g key={flavor}>
              <path
                d={describeArc(CX, CY, R, start, end)}
                className={`segment ${isActive ? 'active' : ''} ${isHovered ? 'hovered' : ''}`}
                style={{
                  opacity: mounted ? 1 : 0,
                  transition: `opacity 0.5s ease ${i * 0.05}s`,
                }}
              />
              {/* Label */}
              <text
                x={polarToCartesian(CX, CY, R * 0.85, start + delta / 2 - 0.025).x}
                y={polarToCartesian(CX, CY, R * 0.85, start + delta / 2 - 0.025).y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={isActive ? '#C9A84C' : '#5C5646'}
                fontSize={isActive ? 13 : 11}
                fontWeight={isActive ? 600 : 400}
                style={{
                  opacity: mounted ? 1 : 0,
                  transition: `opacity 0.5s ease ${i * 0.05 + 0.3}s`,
                  pointerEvents: 'none',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {flavor}
              </text>
            </g>
          );
        })}

        {/* Center ring */}
        <circle cx={CX} cy={CY} r={R * 0.6} fill="rgba(10, 10, 8, 0.8)" stroke="rgba(201, 168, 76, 0.2)" strokeWidth={1} />
        
        {/* Outer ring */}
        <circle cx={CX} cy={CY} r={R * 1.15} fill="none" stroke="rgba(201, 168, 76, 0.2)" strokeWidth={1} />

        {/* SCA Score center */}
        <text
          x={CX}
          y={CY - 10}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#C9A84C"
          fontSize={28}
          fontWeight={700}
          style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
        >
          {scaScore}
        </text>
        <text
          x={CX}
          y={CY + 18}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#A09880"
          fontSize={11}
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          SCA
        </text>
      </svg>

      {/* Tooltip */}
      {tooltipFlavor && (
        <div
          className="absolute pointer-events-none z-10 bg-surface/95 backdrop-blur border border-gold-subtle rounded-lg px-3 py-2 shadow-gold"
          style={{
            left: '50%',
            top: '10%',
            transform: 'translateX(-50%)',
          }}
        >
          <p className="text-sm font-medium text-text-warm">{tooltipFlavor}</p>
          {isActiveFlavor && (
            <p className="text-[10px] text-volcanic-gold mt-0.5">Nota detectada · Intensidad: Alta</p>
          )}
        </div>
      )}
    </div>
  );
}
