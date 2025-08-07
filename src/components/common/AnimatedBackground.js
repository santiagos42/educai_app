import { useMemo } from 'react';
const AnimatedBackground = () => {
  const createShapes = (count) => Array.from({ length: count }).map((_, i) => ({
    id: i,
    style: { top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, width: `${Math.random() * 150 + 50}px`, height: `${Math.random() * 150 + 50}px`, animationDuration: `${Math.random() * 30 + 25}s`, animationDelay: `${Math.random() * 10}s` },
    type: Math.random() > 0.5 ? 'rounded-full' : 'rounded-2xl',
    color: Math.random() > 0.5 ? 'bg-sky-200/40' : 'bg-yellow-200/30'
  }));
  const shapes = useMemo(() => createShapes(15), []);
  return <div className="absolute inset-0 w-full h-full overflow-hidden z-0">{shapes.map(shape => (<div key={shape.id} className={`absolute animate-slow-drift ${shape.type} ${shape.color}`} style={shape.style}></div>))}</div>;
};
export default AnimatedBackground;