import { useEffect, useState } from 'react';

interface Command {
  prompt: string;
  cmd: string;
  output: string;
}

const COMMANDS: Command[] = [
  {
    prompt: '$ ',
    cmd: 'claude --version',
    output: 'Claude Code 2.5.1 (Opus 4.7, 1M context)',
  },
  {
    prompt: '$ ',
    cmd: '/insights',
    output: '30d active. $124 USD spent. opus-4-7 (62%) + sonnet-4-6 (35%) + haiku-4-5 (3%)',
  },
  {
    prompt: '$ ',
    cmd: 'npm run eval',
    output: 'Held-out cases: 4/5 PASS\nReasoning quality: 0.84\nThreshold: cumplido',
  },
];

const TYPE_SPEED = 55;
const PAUSE_AFTER_CMD = 280;
const PAUSE_AFTER_OUTPUT = 950;
const RESTART_PAUSE = 3500;

type Phase = 'typing' | 'pause-cmd' | 'output' | 'pause-output';

export default function Terminal() {
  const [history, setHistory] = useState<string[]>([]);
  const [currentCmd, setCurrentCmd] = useState('');
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<Phase>('typing');

  useEffect(() => {
    if (step >= COMMANDS.length) {
      const t = setTimeout(() => {
        setHistory([]);
        setCurrentCmd('');
        setStep(0);
        setPhase('typing');
      }, RESTART_PAUSE);
      return () => clearTimeout(t);
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
      setHistory((h) => [...h, `${cmd.prompt}${cmd.cmd}`, cmd.output]);
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
  }, [phase, currentCmd, step]);

  return (
    <div
      role="img"
      aria-label="Demo de comandos en terminal: claude --version, slash insights, npm run eval"
      className="crt-scanlines font-mono text-[13px] leading-relaxed rounded-xl bg-black text-green-400 p-5 shadow-2xl border border-neutral-800 min-h-[280px] overflow-hidden relative"
      style={{ textShadow: '0 0 6px rgba(74, 222, 128, 0.3)' }}
    >
      <div className="flex gap-1.5 mb-4 relative z-10">
        <span className="w-3 h-3 rounded-full bg-red-500/80" aria-hidden="true"></span>
        <span className="w-3 h-3 rounded-full bg-yellow-500/80" aria-hidden="true"></span>
        <span className="w-3 h-3 rounded-full bg-green-500/80" aria-hidden="true"></span>
        <span className="ml-2 text-xs text-neutral-500">~/loggro-ai-challenge</span>
      </div>
      <pre className="whitespace-pre-wrap break-words relative z-10">
        {history.length > 0 && (
          <>
            {history.join('\n')}
            {'\n'}
          </>
        )}
        {step < COMMANDS.length && (
          <>
            {COMMANDS[step].prompt}
            {currentCmd}
            <span className="animate-blink">_</span>
          </>
        )}
      </pre>
    </div>
  );
}
