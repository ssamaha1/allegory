import { UserProfile, Explanation } from './types';

const PROFILE_KEY = 'allegory_profile';
const HISTORY_KEY = 'allegory_history';
const DOMAIN_WEIGHTS_KEY = 'allegory_domain_weights';

export function saveProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function loadProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveExplanation(explanation: Explanation): void {
  if (typeof window === 'undefined') return;
  const history = loadHistory();
  history.unshift(explanation);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
}

export function loadHistory(): Explanation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function updateDomainWeight(domain: string, delta: number): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(DOMAIN_WEIGHTS_KEY);
    const weights: Record<string, number> = raw ? JSON.parse(raw) : {};
    weights[domain] = Math.max(0, Math.min(2, (weights[domain] ?? 1) + delta));
    localStorage.setItem(DOMAIN_WEIGHTS_KEY, JSON.stringify(weights));
  } catch {}
}

export function loadDomainWeights(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(DOMAIN_WEIGHTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}
