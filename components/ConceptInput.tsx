'use client';
import { useState, useRef } from 'react';
import { UserProfile } from '@/lib/types';
import { INTEREST_DOMAINS } from '@/lib/types';

interface Props {
  profile: UserProfile;
  onSubmit: (concept: string) => void;
  loading: boolean;
}

const EXAMPLES = [
  'What is a Fourier transform?',
  'How does compound interest work?',
  'Explain entropy',
  'What is a neural network?',
  'How do vaccines work?',
  'What is recursion?',
  'Explain the Dunning-Kruger effect',
  'What is quantum entanglement?',
];

export default function ConceptInput({ profile, onSubmit, loading }: Props) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const topDomains = profile.domains.slice(0, 3).map(id => {
    const d = INTEREST_DOMAINS.find(x => x.id === id);
    return d ? `${d.emoji} ${d.label}` : id;
  });

  const handleSubmit = () => {
    if (value.trim() && !loading) onSubmit(value.trim());
  };

  const randomExample = EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)];

  return (
    <div style={{ width: '100%' }}>
      {topDomains.length > 0 && (
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem', justifyContent: 'center' }}>
          {topDomains.map(d => (
            <span key={d} style={{
              fontSize: '0.72rem',
              color: 'var(--ink-muted)',
              background: 'white',
              border: '1px solid var(--border)',
              borderRadius: 100,
              padding: '3px 10px',
              letterSpacing: '0.02em',
            }}>
              {d}
            </span>
          ))}
        </div>
      )}
      <div style={{
        position: 'relative',
        border: '1px solid var(--border-strong)',
        borderRadius: 14,
        background: 'white',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        overflow: 'hidden',
      }}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder={`What don't you understand yet?\n\ne.g. "${randomExample}"`}
          rows={3}
          disabled={loading}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          style={{
            width: '100%',
            padding: '1.25rem 1.25rem 0.75rem',
            border: 'none',
            background: 'transparent',
            fontFamily: 'var(--sans)',
            fontSize: '1rem',
            color: 'var(--ink)',
            resize: 'none',
            lineHeight: 1.6,
            outline: 'none',
          }}
        />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.5rem 0.75rem 0.75rem 1.25rem',
        }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--ink-faint)' }}>
            Press Enter to explain
          </span>
          <button
            onClick={handleSubmit}
            disabled={!value.trim() || loading}
            style={{
              padding: '0.5rem 1.25rem',
              background: value.trim() && !loading ? 'var(--terra)' : 'var(--border)',
              color: value.trim() && !loading ? 'white' : 'var(--ink-faint)',
              border: 'none',
              borderRadius: 8,
              fontFamily: 'var(--sans)',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: value.trim() && !loading ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            {loading ? (
              <>
                <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                Thinking...
              </>
            ) : 'Explain →'}
          </button>
        </div>
      </div>
    </div>
  );
}
