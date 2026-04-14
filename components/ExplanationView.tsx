'use client';
import { useState } from 'react';
import { Explanation } from '@/lib/types';

interface Props {
  explanation: Explanation | null;
  streaming: boolean;
  streamText: string;
  onRetry: () => void;
  onQuiz: () => void;
  onFeedback: (positive: boolean) => void;
  quizContent: string;
  quizLoading: boolean;
}

function parseStreamText(text: string): {
  domain: string;
  emoji: string;
  levels: { label: string; content: string }[];
} {
  const domainMatch = text.match(/DOMAIN:\s*(.+)/);
  const emojiMatch = text.match(/EMOJI:\s*(.+)/);
  const domain = domainMatch ? domainMatch[1].trim() : '';
  const emoji = emojiMatch ? emojiMatch[1].trim() : '✦';

  const parts = text.split('---LEVEL---').slice(1);
  const levels = parts.map(part => {
    const labelMatch = part.match(/\*\*(.+?)\*\*/);
    const label = labelMatch ? labelMatch[1] : '';
    const content = part.replace(/\*\*(.+?)\*\*/, '').trim();
    return { label, content };
  });

  return { domain, emoji, levels };
}

function renderContent(text: string, isStreaming: boolean) {
  const lines = text.split('\n').filter(Boolean);
  return lines.map((line, i) => (
    <p key={i} style={{ marginBottom: i < lines.length - 1 ? '0.75rem' : 0 }}>
      {line}
      {isStreaming && i === lines.length - 1 && (
        <span className="streaming-cursor" />
      )}
    </p>
  ));
}

export default function ExplanationView({
  explanation, streaming, streamText, onRetry, onQuiz, onFeedback, quizContent, quizLoading
}: Props) {
  const [activeLevel, setActiveLevel] = useState(0);
  const [feedbackGiven, setFeedbackGiven] = useState<boolean | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [revealAnswer, setRevealAnswer] = useState(false);

  const parsed = streaming ? parseStreamText(streamText) : null;
  const data = explanation ?? (parsed ? {
    concept: '',
    domain: parsed.domain,
    domainEmoji: parsed.emoji,
    levels: parsed.levels.map((l, i) => ({
      level: (i + 1) as 1 | 2 | 3,
      label: l.label,
      content: l.content,
    })),
  } : null);

  if (!data) return null;

  const levels = data.levels ?? [];
  const displayLevels = levels.slice(0, streaming ? undefined : 3);
  const currentLevel = displayLevels[activeLevel];

  const levelColors = [
    { bg: '#fdf6f0', border: '#f0d9c8', label: 'var(--terra-dark)', badge: 'var(--terra-light)' },
    { bg: '#f5f5f0', border: '#ddd', label: '#4a5240', badge: '#e8eae4' },
    { bg: '#f0f4f8', border: '#c8d5e0', label: '#2a3a4a', badge: '#dde8f0' },
  ];
  const lc = levelColors[activeLevel] ?? levelColors[0];

  const quizLines = quizContent.split('\n');
  const questionLine = quizLines.find(l => l.startsWith('QUESTION:'))?.replace('QUESTION:', '').trim() ?? '';
  const answerLine = quizLines.find(l => l.startsWith('ANSWER:'))?.replace('ANSWER:', '').trim() ?? '';

  return (
    <div className="fade-up">
      {data.domain && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '1.2rem' }}>{data.domainEmoji}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>
            Explained through {data.domain}
          </span>
        </div>
      )}

      {displayLevels.length > 1 && !streaming && (
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          {displayLevels.map((l, i) => (
            <button
              key={i}
              onClick={() => { setActiveLevel(i); setShowQuiz(false); setRevealAnswer(false); }}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: 100,
                border: `1px solid ${activeLevel === i ? levelColors[i].border : 'var(--border)'}`,
                background: activeLevel === i ? levelColors[i].badge : 'transparent',
                color: activeLevel === i ? levelColors[i].label : 'var(--ink-muted)',
                fontFamily: 'var(--sans)',
                fontSize: '0.78rem',
                fontWeight: activeLevel === i ? 500 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {l.label || `Level ${i + 1}`}
            </button>
          ))}
        </div>
      )}

      <div style={{
        background: streaming ? 'white' : lc.bg,
        border: `1px solid ${streaming ? 'var(--border)' : lc.border}`,
        borderRadius: 14,
        padding: '1.75rem',
        marginBottom: '1.25rem',
        minHeight: 120,
        transition: 'all 0.3s ease',
      }}>
        {streaming ? (
          <div style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', lineHeight: 1.85, color: 'var(--ink)' }}>
            {streamText ? renderContent(
              streamText.replace(/DOMAIN:.*\n?/, '').replace(/EMOJI:.*\n?/, '').replace(/---LEVEL---/g, '\n\n').replace(/\*\*[^*]+\*\*/g, ''),
              true
            ) : (
              <span className="streaming-cursor" style={{ color: 'var(--ink-faint)' }} />
            )}
          </div>
        ) : currentLevel ? (
          <div style={{
            fontFamily: activeLevel === 0 ? 'var(--serif)' : 'var(--sans)',
            fontSize: activeLevel === 0 ? '1.15rem' : '1rem',
            lineHeight: 1.85,
            color: 'var(--ink)',
          }}>
            {renderContent(currentLevel.content, false)}
          </div>
        ) : null}
      </div>

      {!streaming && levels.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {activeLevel > 0 && (
              <button onClick={() => setActiveLevel(activeLevel - 1)} style={ghostBtn}>← Simpler</button>
            )}
            {activeLevel < levels.length - 1 && (
              <button onClick={() => setActiveLevel(activeLevel + 1)} style={ghostBtn}>Go deeper →</button>
            )}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ink-faint)' }}>
            {activeLevel + 1} / {levels.length}
          </div>
        </div>
      )}

      {!streaming && showQuiz && (
        <div className="fade-up" style={{
          background: 'white',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '1.25rem',
          marginBottom: '1.25rem',
        }}>
          {quizLoading ? (
            <p style={{ color: 'var(--ink-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>Crafting your quiz question...</p>
          ) : questionLine ? (
            <>
              <p style={{ fontFamily: 'var(--serif)', fontSize: '1rem', marginBottom: '1rem', lineHeight: 1.7 }}>
                {questionLine}
              </p>
              {!revealAnswer ? (
                <button onClick={() => setRevealAnswer(true)} style={ghostBtn}>Reveal answer</button>
              ) : (
                <div style={{
                  background: 'var(--terra-light)',
                  borderRadius: 8,
                  padding: '0.85rem 1rem',
                  fontSize: '0.9rem',
                  color: 'var(--terra-dark)',
                  lineHeight: 1.6,
                }}>
                  {answerLine}
                </div>
              )}
            </>
          ) : null}
        </div>
      )}

      {!streaming && levels.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          {feedbackGiven === null ? (
            <>
              <span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', marginRight: '0.25rem' }}>Did this click?</span>
              <button onClick={() => { setFeedbackGiven(true); onFeedback(true); }} style={actionBtn}>✓ Yes</button>
              <button onClick={() => { setFeedbackGiven(false); onFeedback(false); }} style={actionBtn}>↻ Try another</button>
            </>
          ) : feedbackGiven ? (
            <span style={{ fontSize: '0.8rem', color: 'var(--terra)', fontWeight: 500 }}>✓ Saved to your history</span>
          ) : (
            <span style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', fontStyle: 'italic' }}>Finding a better angle...</span>
          )}
          {!showQuiz && feedbackGiven !== false && (
            <button onClick={() => { setShowQuiz(true); onQuiz(); }} style={{ ...actionBtn, marginLeft: 'auto' }}>Quiz me →</button>
          )}
          {feedbackGiven !== null && (
            <button onClick={onRetry} style={actionBtn}>New concept</button>
          )}
        </div>
      )}
    </div>
  );
}

const ghostBtn: React.CSSProperties = {
  padding: '0.4rem 0.85rem',
  background: 'transparent',
  border: '1px solid var(--border-strong)',
  borderRadius: 7,
  fontFamily: 'var(--sans)',
  fontSize: '0.82rem',
  color: 'var(--ink-muted)',
  cursor: 'pointer',
};

const actionBtn: React.CSSProperties = {
  padding: '0.4rem 0.9rem',
  background: 'transparent',
  border: '1px solid var(--border)',
  borderRadius: 7,
  fontFamily: 'var(--sans)',
  fontSize: '0.8rem',
  color: 'var(--ink-muted)',
  cursor: 'pointer',
};
