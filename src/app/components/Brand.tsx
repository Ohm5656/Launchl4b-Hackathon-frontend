import { Layers3 } from 'lucide-react';
export function Brand() {
  return (
    <div className="brand">
      <span className="brand-mark">
        <Layers3 size={22} strokeWidth={2} />
      </span>
      <span>
        subtrack<span className="brand-period">.</span>
      </span>
    </div>
  );
}
