'use client';
import { useState } from 'react';
import { INTEREST_DOMAINS, BACKGROUNDS, UserProfile } from '@/lib/types';

interface Props {
  onComplete: (profile: UserProfile) => void;
}

export default function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [tone, setTone] = useState<'playful' | 'balanced' | 'rigorous'>('balanced');
  const [background, setBackground] = useState('');

  const toggleDomain = (id: string) => {
    setSelectedDomains(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : prev.length < 5 ? [...prev, id] : prev
    );
  };

  const handleFinish = () => {
    const profile: UserProfile = {
      name: name.trim() || undefined,
      domains: selectedDomains.length > 0 ? selectedDomains : ['cooking', 'music', 'cinema'],
      tone,
      background: background || 'professional',
    };
    onComplete(profile);
  };

  const steps = [
    <div key="welcome" className="text-center">
      <div style={{ fontFamily: 'var(--serif)', fontSize: '2.2rem', fontWeight: 400, lineHeight: 1.2, marginBottom: '1.5rem', color: 'var(--ink)' }}>
        Finally.<br/>
        <em style={{ color: 'var(--terra)' }}>An explanation that clicks.</em>
      </div>
      <p style={{ color: 'var(--ink-muted)', fontSize: '1rem', lineHeight: 1.7, maxWidth: 420, margin: '0 auto 2rem' }}>
        Allegory translates any concept through the things you already love. It takes two minutes to set up your profile.
      </p>
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-muted)', marginBottom: '0.5rem' }}>
          What should we call you? (optional)
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your name"
          style={{
            width: '100%', maxWidth: 320, padding: '0.75rem 1rem',
            border: '1px solid var(--border-strong)', borderRadius: 8,
            background: 'white', fontFamily: 'var(--sans)', fontSize: '1rem',
            color: 'var(--ink)', outline: 'none'
          }}
          onKeyDown={e => e.key === 'Enter' && setStep(1)}
        />
      </div>
      <button onClick={() => setStep(1)} style={btnStyle}>
        Let's begin →
      </button>
    </div>,

    <div key="domains">
      <div style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', fontWeight: 400, marginBottom: '0.5rem' }}>
        What do you love?
      </div>
      <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        Pick up to 5 domains. Allegory will explain everything through these worlds.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {INTEREST_DOMAINS.map(d => {
          const selected = selectedDomains.includes(d.id);
          return (
            <button
              key={d.id}
              onClick={() => toggleDomain(d.id)}
              style={{
                padding: '0.6rem 0.75rem',
                border: `1px solid ${selected ? 'var(--terra)' : 'var(--border-strong)'}`,
                borderRadius: 8,
                background: selected ? 'var(--terra-light)' : 'white',
                color: selected ? 'var(--terra-dark)' : 'var(--ink)',
                fontFamily: 'var(--sans)',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                textAlign: 'left',
                fontWeight: selected ? 500 : 400,
              }}
            >
              <span>{d.emoji}</span> {d.label}
            </button>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
        <button onClick={() => setStep(0)} style={backBtnStyle}>← Back</button>
        <button onClick={() => setStep(2)} style={btnStyle}>Continue →</button>
      </div>
    </div>,

    <div key="tone">
      <div style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', fontWeight: 400, marginBottom: '0.5rem' }}>
        How do you like to learn?
      </div>
      <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        This sets the tone of every explanation.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
        {([
          { id: 'playful', label: 'Playful & vivid', desc: 'Analogies with personality. Like a great podcast.' },
          { id: 'balanced', label: 'Clear & engaging', desc: 'Smart but accessible. Like a great book.' },
          { id: 'rigorous', label: 'Precise & sharp', desc: 'Intellectually demanding. Like a great professor.' },
        ] as const).map(t => (
          <button
            key={t.id}
            onClick={() => setTone(t.id)}
            style={{
              padding: '1rem 1.25rem',
              border: `1px solid ${tone === t.id ? 'var(--terra)' : 'var(--border-strong)'}`,
              borderRadius: 10,
              background: tone === t.id ? 'var(--terra-light)' : 'white',
              textAlign: 'left',
              cursor: 'pointer',
              fontFamily: 'var(--sans)',
            }}
          >
            <div style={{ fontWeight: 500, color: tone === t.id ? 'var(--terra-dark)' : 'var(--ink)', fontSize: '0.95rem' }}>
              {t.label}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginTop: 2 }}>{t.desc}</div>
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
        <button onClick={() => setStep(1)} style={backBtnStyle}>← Back</button>
        <button onClick={() => setStep(3)} style={btnStyle}>Continue →</button>
      </div>
    </div>,

    <div key="background">
      <div style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', fontWeight: 400, marginBottom: '0.5rem' }}>
        What's your background?
      </div>
      <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        This calibrates how technical or foundational to get.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '2rem' }}>
        {BACKGROUNDS.map(b => (
          <button
            key={b.id}
            onClick={() => setBackground(b.id)}
            style={{
              padding: '0.85rem 1.25rem',
              border: `1px solid ${background === b.id ? 'var(--terra)' : 'var(--border-strong)'}`,
              borderRadius: 10,
              background: background === b.id ? 'var(--terra-light)' : 'white',
              textAlign: 'left',
              cursor: 'pointer',
              fontFamily: 'var(--sans)',
              fontSize: '0.9rem',
              fontWeight: background === b.id ? 500 : 400,
              color: background === b.id ? 'var(--terra-dark)' : 'var(--ink)',
            }}
          >
            {b.label}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
        <button onClick={() => setStep(2)} style={backBtnStyle}>← Back</button>
        <button onClick={handleFinish} style={{ ...btnStyle, background: 'var(--terra)', color: 'white', border: 'none' }}>
          Start learning →
        </button>
      </div>
    </div>,
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'var(--parchment)',
    }}>
      <div style={{ width: '100%', maxWidth: 540 }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: '1.4rem', fontStyle: 'italic', color: 'var(--terra)', letterSpacing: '-0.01em' }}>
            Allegory
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '2.5rem' }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              width: i === step ? 20 : 6,
              height: 6,
              borderRadius: 3,
              background: i === step ? 'var(--terra)' : i < step ? 'var(--border-strong)' : 'var(--border)',
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>
        <div key={step} className="fade-up">
          {steps[step]}
        </div>
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '0.75rem 1.75rem',
  background: 'var(--ink)',
  color: 'white',
  border: 'none',
  borderRadius: 8,
  fontFamily: 'var(--sans)',
  fontSize: '0.9rem',
  fontWeight: 500,
  cursor: 'pointer',
  letterSpacing: '0.01em',
};

const backBtnStyle: React.CSSProperties = {
  padding: '0.75rem 1.25rem',
  background: 'transparent',
  color: 'var(--ink-muted)',
  border: '1px solid var(--border-strong)',
  borderRadius: 8,
  fontFamily: 'var(--sans)',
  fontSize: '0.9rem',
  cursor: 'pointer',
};
