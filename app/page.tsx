'use client';
import { useState, useEffect, useCallback } from 'react';
import Onboarding from '@/components/Onboarding';
import ConceptInput from '@/components/ConceptInput';
import ExplanationView from '@/components/ExplanationView';
import HistoryPanel from '@/components/HistoryPanel';
import { UserProfile, Explanation } from '@/lib/types';
import { saveProfile, loadProfile, saveExplanation, loadHistory, updateDomainWeight } from '@/lib/store';

type AppState = 'idle' | 'loading' | 'streaming' | 'done';

function parseFullResponse(text: string): Omit<Explanation, 'id' | 'timestamp' | 'concept'> {
  const domainMatch = text.match(/DOMAIN:\s*(.+)/);
  const emojiMatch = text.match(/EMOJI:\s*(.+)/);
  const domain = domainMatch ? domainMatch[1].trim() : 'everyday life';
  const emoji = emojiMatch ? emojiMatch[1].trim() : '✦';

  const parts = text.split('---LEVEL---').slice(1);
  const levels = parts.map((part, i) => {
    const labelMatch = part.match(/\*\*(.+?)\*\*/);
    const label = labelMatch ? labelMatch[1] : ['The Analogy', 'The Bridge', 'The Real Thing'][i] ?? `Level ${i+1}`;
    const content = part.replace(/\*\*[^*]+\*\*/g, '').trim();
    return { level: (i + 1) as 1 | 2 | 3, label, content };
  }).filter(l => l.content.length > 10);

  return { domain, domainEmoji: emoji, levels };
}

export default function Home() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [state, setState] = useState<AppState>('idle');
  const [currentConcept, setCurrentConcept] = useState('');
  const [streamText, setStreamText] = useState('');
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [excludeDomain, setExcludeDomain] = useState<string | undefined>();
  const [history, setHistory] = useState<Explanation[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [quizContent, setQuizContent] = useState('');
  const [quizLoading, setQuizLoading] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  useEffect(() => {
    const p = loadProfile();
    setProfile(p);
    setHistory(loadHistory());
  }, []);

  const handleProfileComplete = (p: UserProfile) => {
    saveProfile(p);
    setProfile(p);
  };

  const fetchExplanation = useCallback(async (concept: string, exclude?: string) => {
    setState('loading');
    setStreamText('');
    setExplanation(null);
    setQuizContent('');
    setExcludeDomain(exclude);

    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept, profile, excludeDomain: exclude }),
      });

      if (!res.ok) throw new Error('API error');

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No reader');

      setState('streaming');
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setStreamText(fullText);

        if (fullText.includes('Error generating explanation') || fullText.includes('check your API key')) {
          setApiKeyMissing(true);
        }
      }

      const parsed = parseFullResponse(fullText);
      const exp: Explanation = {
        id: crypto.randomUUID(),
        concept,
        ...parsed,
        timestamp: new Date(),
      };
      setExplanation(exp);
      saveExplanation(exp);
      setHistory(loadHistory());
      setState('done');

    } catch (err) {
      console.error(err);
      setState('idle');
    }
  }, [profile]);

  const handleSubmit = (concept: string) => {
    setCurrentConcept(concept);
    setExcludeDomain(undefined);
    fetchExplanation(concept);
  };

  const handleRetry = () => {
    const failedDomain = explanation?.domain;
    if (failedDomain) updateDomainWeight(failedDomain, -0.15);
    fetchExplanation(currentConcept, failedDomain);
  };

  const handleFeedback = (positive: boolean) => {
    if (explanation?.domain) {
      updateDomainWeight(explanation.domain, positive ? 0.15 : -0.1);
    }
    if (!positive) {
      setTimeout(handleRetry, 800);
    }
  };

  const handleNewConcept = () => {
    setState('idle');
    setCurrentConcept('');
    setStreamText('');
    setExplanation(null);
    setExcludeDomain(undefined);
    setQuizContent('');
  };

  const handleQuiz = async () => {
    if (!explanation) return;
    setQuizLoading(true);
    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concept: explanation.concept,
          domain: explanation.domain,
          analogy: explanation.levels[0]?.content ?? '',
        }),
      });
      const reader = res.body?.getReader();
      if (!reader) return;
      const decoder = new TextDecoder();
      let full = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setQuizContent(full);
      }
    } finally {
      setQuizLoading(false);
    }
  };

  if (!profile) {
    return <Onboarding onComplete={handleProfileComplete} />;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--parchment)' }}>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: state !== 'idle' ? '1px solid var(--border)' : 'none',
        background: 'rgba(250,248,244,0.92)',
        backdropFilter: 'blur(8px)',
      }}>
        <button
          onClick={handleNewConcept}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--serif)', fontSize: '1.1rem', fontStyle: 'italic', color: 'var(--terra)', letterSpacing: '-0.01em' }}
        >
          Allegory
        </button>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {profile.name && (
            <span style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>{profile.name}</span>
          )}
          <button
            onClick={() => setShowHistory(true)}
            style={{ padding: '0.4rem 0.85rem', background: 'transparent', border: '1px solid var(--border-strong)', borderRadius: 7, fontFamily: 'var(--sans)', fontSize: '0.78rem', color: 'var(--ink-muted)', cursor: 'pointer' }}
          >
            History {history.length > 0 && `(${history.length})`}
          </button>
          <button
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            style={{ padding: '0.4rem 0.85rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: 7, fontFamily: 'var(--sans)', fontSize: '0.78rem', color: 'var(--ink-faint)', cursor: 'pointer' }}
            title="Reset profile"
          >
            ↺
          </button>
        </div>
      </header>

      {apiKeyMissing && (
        <div style={{ background: '#fff3cd', borderBottom: '1px solid #ffc107', padding: '0.75rem 1.5rem', fontSize: '0.85rem', color: '#856404', textAlign: 'center' }}>
          ⚠️ Set ANTHROPIC_API_KEY in your Vercel environment variables.
        </div>
      )}

      <main style={{ maxWidth: 660, margin: '0 auto', padding: '3rem 1.5rem 4rem' }}>
        {state === 'idle' && (
          <div className="fade-up">
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2rem, 5vw, 2.8rem)', fontWeight: 400, lineHeight: 1.2, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
                What don't you<br/>
                <em style={{ color: 'var(--terra)' }}>understand yet?</em>
              </h1>
              <p style={{ color: 'var(--ink-muted)', fontSize: '1rem', lineHeight: 1.7 }}>
                Ask anything. Allegory will explain it through the things you love.
              </p>
            </div>
            <ConceptInput profile={profile} onSubmit={handleSubmit} loading={false} />
          </div>
        )}

        {state === 'loading' && (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', fontStyle: 'italic', color: 'var(--ink-muted)', marginBottom: '0.5rem' }}>
              Finding the right analogy...
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--ink-faint)' }}>
              Using your interest in {profile.domains.slice(0,2).join(', ')}
            </div>
          </div>
        )}

        {(state === 'streaming' || state === 'done') && (
          <>
            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--ink-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                Explaining
              </div>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.75rem', fontWeight: 400, lineHeight: 1.25, letterSpacing: '-0.02em' }}>
                {currentConcept}
              </h2>
            </div>

            <ExplanationView
              explanation={state === 'done' ? explanation : null}
              streaming={state === 'streaming'}
              streamText={streamText}
              onRetry={handleRetry}
              onQuiz={handleQuiz}
              onFeedback={handleFeedback}
              quizContent={quizContent}
              quizLoading={quizLoading}
            />

            {state === 'done' && (
              <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginBottom: '0.75rem' }}>
                  Ask something else
                </div>
                <ConceptInput profile={profile} onSubmit={handleSubmit} loading={false} />
              </div>
            )}
          </>
        )}
      </main>

      {showHistory && (
        <HistoryPanel
          history={history}
          onSelect={(exp) => {
            setCurrentConcept(exp.concept);
            setExplanation(exp);
            setState('done');
            setStreamText('');
          }}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}
