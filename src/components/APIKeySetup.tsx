import { useState, useEffect } from 'react';

interface Props {
  onKeyConfigured: (hasKey: boolean) => void;
}

export default function APIKeySetup({ onKeyConfigured }: Props) {
  const [apiKey, setApiKey] = useState('');
  const [hasKey, setHasKey] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedKey = localStorage.getItem('claude_api_key');
    if (storedKey) {
      setHasKey(true);
      onKeyConfigured(true);
    } else if (import.meta.env.VITE_CLAUDE_API_KEY) {
      setHasKey(true);
      onKeyConfigured(true);
    }
  }, []);

  const handleSave = () => {
    if (!apiKey.trim()) {
      setError('API key cannot be empty');
      return;
    }

    if (!apiKey.startsWith('sk-')) {
      setError('Invalid API key format. Should start with sk-');
      return;
    }

    localStorage.setItem('claude_api_key', apiKey);
    setHasKey(true);
    setError('');
    onKeyConfigured(true);
  };

  const handleClear = () => {
    localStorage.removeItem('claude_api_key');
    setApiKey('');
    setHasKey(false);
    setError('');
    onKeyConfigured(false);
  };

  if (hasKey && !apiKey) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 text-center">
        <p className="text-sm font-semibold text-emerald-300 mb-2">Claude API Configured</p>
        <p className="text-xs text-emerald-200 mb-3">AI analytics and explanations are active.</p>
        <button
          onClick={handleClear}
          className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 transition-all"
        >
          Change Key
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-2xl border border-white/5 p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🔑</span>
        <h3 className="text-sm font-semibold text-white">Claude API Configuration</h3>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-slate-400 block mb-2">API Key (sk-...)</label>
          <div className="relative">
            <input
              type={isRevealed ? 'text' : 'password'}
              value={apiKey}
              onChange={e => {
                setApiKey(e.target.value);
                setError('');
              }}
              placeholder="sk-..."
              className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm placeholder-slate-600 focus:outline-none focus:border-sky-500/50 transition-all"
            />
            <button
              onClick={() => setIsRevealed(!isRevealed)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
            >
              {isRevealed ? 'Hide' : 'Show'}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Get your key from{' '}
            <a
              href="https://console.anthropic.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:text-sky-300"
            >
              console.anthropic.com
            </a>
          </p>
        </div>

        {error && (
          <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2.5 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/30 hover:bg-sky-500/30 font-medium text-sm transition-all"
          >
            Save & Activate
          </button>
          {hasKey && (
            <button
              onClick={handleClear}
              className="px-4 py-2.5 rounded-lg bg-slate-700/50 text-slate-300 border border-white/10 hover:bg-slate-700 font-medium text-sm transition-all"
            >
              Clear
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 p-3 bg-slate-800/30 rounded-lg">
          Using model: <span className="text-sky-400 font-mono">claude-3-5-sonnet-20241022</span>
        </div>
      </div>
    </div>
  );
}
