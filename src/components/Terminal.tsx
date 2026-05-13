import { useEffect, useState } from 'react';

interface Command {
  prompt: string;
  cmd: string;
  output: string;
}

const MASCOT = `   _____
  |o   o|
  |  ^  |
  |  _  |
  '-----'`;

const COMMANDS: Command[] = [
  {
    prompt: '$ ',
    cmd: 'claude --version',
    output: 'Claude Code 2.5.1 (Opus 4.7, 1M context)',
  },
  {
    prompt: '$ ',
    cmd: '/insights',
    output: '30d active. $124 USD spent.\nopus-4-7 (62%) + sonnet-4-6 (35%) + haiku-4-5 (3%)',
  },
  {
    prompt: '$ ',
    cmd: 'npm run eval',
    output: 'Held-out: 4/5 PASS · reasoning 0.84\nThreshold: cleared',
  },
  {
    prompt: '$ ',
    cmd: '/agents list',
    output: 'Enricher · MessageWriter · Reviewer · Judge\n4 sub-agents online · all green',
  },
  {
    prompt: '$ ',
    cmd: '/mascot',
    output: MASCOT + '\n  "ready to ship."',
  },
];

const TYPE_SPEED = 50;
const PAUSE_AFTER_CMD = 260;
const PAUSE_AFTER_OUTPUT = 1100;
const RESTART_PAUSE = 4200;

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
      aria-label="Demo de comandos en terminal con respuestas del sistema"
      className="crt-scanlines font-mono text-[13px] leading-relaxed bg-black text-green-400 p-5 shadow-pixel-md border-2 border-fg min-h-[320px] overflow-hidden relative"
      style={{ textShadow: '0 0 6px rgba(74, 222, 128, 0.3)' }}
    >
      <div className="flex gap-1.5 mb-4 relative z-10 items-center">
        <span className="w-3 h-3 bg-red-500/80 border border-red-700" aria-hidden="true"></span>
        <span className="w-3 h-3 bg-yellow-500/80 border border-yellow-700" aria-hidden="true"></span>
        <span className="w-3 h-3 bg-green-500/80 border border-green-700" aria-hidden="true"></span>
        <span className="ml-2 text-xs text-neutral-500 font-mono">~/loggro-ai-challenge</span>
        <span className="ml-auto text-xs text-neutral-600 font-mono">·  P1</span>
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
