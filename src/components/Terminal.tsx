import { useEffect, useState } from 'react';
import candidatos from '../data/candidatos.json';

interface Command {
  cmd: string;
  output: string;
}

interface Candidato {
  code: string;
  firstName: string;
}

// Resuelve el slug del candidato para el saludo del motd. El whoami queda fijo.
const resolveCandidateSlug = (): string | null => {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const code = params.get('n');
  if (!code) return null;
  const c = (candidatos as Candidato[]).find((x) => x.code.toLowerCase() === code.toLowerCase());
  if (!c) return null;
  return c.firstName
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/\s+/g, '-')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
};

const MOTD_BASE = ` ██╗      ██████╗   ██████╗   ██████╗  ██████╗   ██████╗
 ██║     ██╔═══██╗ ██╔════╝  ██╔════╝  ██╔══██╗ ██╔═══██╗
 ██║     ██║   ██║ ██║  ███╗ ██║  ███╗ ██████╔╝ ██║   ██║
 ██║     ██║   ██║ ██║   ██║ ██║   ██║ ██╔══██╗ ██║   ██║
 ███████╗╚██████╔╝ ╚██████╔╝ ╚██████╔╝ ██║  ██║ ╚██████╔╝
 ╚══════╝ ╚═════╝   ╚═════╝   ╚═════╝  ╚═╝  ╚═╝  ╚═════╝
                                          challenge_VE-1770`;

const COMMANDS: Command[] = [
  {
    cmd: 'whoami',
    output: 'growth-engineer',
  },
  {
    cmd: 'docker ps --filter name=n8n',
    output: 'CONTAINER   IMAGE            STATUS\n7b3f1a2c   n8nio/n8n:1.74   Up 23 days',
  },
  {
    cmd: 'curl -s $LLM_BROKER_URL/health | jq .',
    output: '{\n  "status": "ok",\n  "models": ["claude-opus-4-7", "gpt-5", "gemini-2.5-pro"],\n  "budget_remaining": "$47.20"\n}',
  },
  {
    cmd: 'claude --version && claude /insights',
    output: 'Claude Code 2.5.1 (Opus 4.7, 1M context)\n30d active · $124 spent · opus (62%) sonnet (35%) haiku (3%)',
  },
];

const TYPE_SPEED = 50;
const PAUSE_AFTER_CMD = 280;
const PAUSE_AFTER_OUTPUT = 1100;
const INITIAL_MOTD_DELAY = 700;

type Phase = 'motd' | 'typing' | 'pause-cmd' | 'pause-output' | 'done';

export default function Terminal() {
  const [history, setHistory] = useState<string[]>([]);
  const [currentCmd, setCurrentCmd] = useState('');
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<Phase>('motd');
  const [motdShown, setMotdShown] = useState(false);
  const [motd] = useState<string>(() => {
    const slug = resolveCandidateSlug();
    const welcomeName = slug || 'player_one';
    return `${MOTD_BASE}\n\nLast login: today.  Welcome, ${welcomeName}.`;
  });

  useEffect(() => {
    if (phase === 'done') return;

    if (phase === 'motd') {
      if (!motdShown) {
        const t = setTimeout(() => {
          setMotdShown(true);
          setPhase('typing');
        }, INITIAL_MOTD_DELAY);
        return () => clearTimeout(t);
      }
      return;
    }

    if (step >= COMMANDS.length) {
      setPhase('done');
      return;
    }

    const cmd = COMMANDS[step];

    if (phase === 'typing') {
      if (currentCmd.length < cmd.cmd.length) {
        const t = setTimeout(
          () => setCurrentCmd(cmd.cmd.slice(0, currentCmd.length + 1)),
          TYPE_SPEED + Math.random() * 30,
        );
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setPhase('pause-cmd'), PAUSE_AFTER_CMD);
      return () => clearTimeout(t);
    }

    if (phase === 'pause-cmd') {
      setHistory((h) => [...h, `$ ${cmd.cmd}`, cmd.output]);
      setCurrentCmd('');
      setPhase('pause-output');
      return;
    }

    if (phase === 'pause-output') {
      const t = setTimeout(() => {
        setPhase('typing');
        setStep((s) => s + 1);
      }, PAUSE_AFTER_OUTPUT);
      return () => clearTimeout(t);
    }
  }, [phase, currentCmd, step, motdShown]);

  return (
    <div
      role="img"
      aria-label="Terminal demo: motd LOGGRO seguido de comandos en vivo"
      className="crt-scanlines font-mono text-[13px] leading-relaxed bg-black text-green-400 shadow-pixel-md border-2 border-fg overflow-hidden relative"
      style={{ textShadow: '0 0 6px rgba(74, 222, 128, 0.3)' }}
    >
      {/* Title bar */}
      <div className="flex gap-1.5 px-5 py-3 relative z-10 items-center border-b border-neutral-800 bg-black">
        <span className="w-3 h-3 bg-red-500/80 border border-red-700" aria-hidden="true" />
        <span className="w-3 h-3 bg-yellow-500/80 border border-yellow-700" aria-hidden="true" />
        <span className="w-3 h-3 bg-green-500/80 border border-green-700" aria-hidden="true" />
        <span className="ml-2 text-xs text-neutral-500 font-mono">
          ~/loggro-ai-challenge — zsh
        </span>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-green-400 animate-pulse rounded-none" aria-hidden="true" />
          <span className="text-[9px] text-neutral-500 uppercase tracking-widest">live</span>
        </span>
      </div>

      <pre className="whitespace-pre-wrap break-words relative z-10 leading-[1.55] px-5 py-4 min-h-[260px]">
        {motdShown && (
          <>
            {motd}
            {'\n\n'}
          </>
        )}
        {history.length > 0 && (
          <>
            {history.join('\n')}
            {'\n'}
          </>
        )}
        {phase === 'motd' && !motdShown && (
          <span className="animate-blink text-green-400">█</span>
        )}
        {(phase === 'typing' || phase === 'pause-cmd' || phase === 'pause-output') && (
          <>
            {'$ '}
            {currentCmd}
            <span className="animate-blink text-green-400">█</span>
          </>
        )}
        {phase === 'done' && (
          <>
            {'$ '}
            <span className="animate-blink text-green-400">█</span>
          </>
        )}
      </pre>

      {/* Status bar */}
      <div className="flex items-center justify-between gap-3 px-5 py-2 border-t border-neutral-800 bg-neutral-950 text-[9px] uppercase tracking-widest text-neutral-500 font-mono">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-400 animate-pulse" aria-hidden="true" />
            connected
          </span>
          <span>lat 24ms</span>
          <span className="hidden md:inline">mem 312M</span>
        </div>
        <span>opus 4.7 · 1M</span>
      </div>
    </div>
  );
}
