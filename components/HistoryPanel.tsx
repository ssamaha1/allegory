'use client';
import { Explanation } from '@/lib/types';

interface Props {
  history: Explanation[];
  onSelect: (e: Explanation) => void;
  onClose: () => void;
}

export default function HistoryPanel({ history, onSelect, onClose }: Props) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(26,24,20,0.4)',
        zIndex: 50,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="fade-in"
        style={{
          width: '100%',
          maxWidth: 380,
          height: '100vh',
          background: 'var(--parchment)',
          borderLeft: '1px solid var(--border)',
          overflow: 'auto',
          padding: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: '1.2rem', fontStyle: 'italic' }}>Your concepts</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--ink-muted)' }}>×</button>
        </div>

        {history.length === 0 ? (
          <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
            No concepts explored yet. Ask something you've always wondered about.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {history.map((exp, i) => (
              <button
                key={exp.id || i}
                onClick={() => { onSelect(exp); onClose(); }}
                style={{
                  background: 'white',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: '0.85rem 1rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                <div style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--ink)', marginBottom: '0.2rem' }}>
                  {exp.concept}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span>{exp.domainEmoji}</span>
                  <span>via {exp.domain}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
