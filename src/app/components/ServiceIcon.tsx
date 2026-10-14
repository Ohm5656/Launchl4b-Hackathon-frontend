import { Cloud, Music2, Play, Command, Layers3 } from 'lucide-react';
import type { Subscription } from '../services/subscriptions';

export function ServiceIcon({
  subscription: s,
  className = '',
}: {
  subscription: Subscription;
  className?: string;
}) {
  const name = s.name.toLowerCase();
  const icon = name.includes('spotify') ? (
    <Music2 size={23} />
  ) : name.includes('icloud') ? (
    <Cloud size={24} fill="currentColor" />
  ) : name.includes('youtube') ? (
    <Play size={23} fill="currentColor" />
  ) : name.includes('chatgpt') ? (
    <Command size={23} />
  ) : name.includes('adobe') ? (
    <span>Ad</span>
  ) : name.includes('notion') ? (
    <span>N</span>
  ) : name.includes('netflix') ? (
    <span>N</span>
  ) : (
    <Layers3 size={22} />
  );
  return (
    <span
      aria-hidden="true"
      className={`app-service-icon ${className}`}
      style={{ backgroundColor: s.color }}
    >
      {icon}
    </span>
  );
}
