import React from 'react';
import { Sparkles } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen" style={{ background: 'var(--bg)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center animate-pulse">
          <Sparkles size={24} className="text-white" />
        </div>
        <p className="text-sm text-[var(--muted)]">Loading JobFlow AI...</p>
      </div>
    </div>
  );
}
