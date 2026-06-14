import { useState, useEffect } from 'preact/hooks';
import { balance } from '@/config/balance.config';

/** ADR 风逐字打字机：按 cps 吐字，点击瞬显全部（design §11 / §15.2）。 */
export function Typewriter({
  text,
  cps = balance.text.cps,
  class: className = 'typewriter',
}: {
  text: string;
  cps?: number;
  class?: string;
}) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    setShown(0);
    if (!text) return;
    const interval = 1000 / cps;
    const timer = setInterval(() => {
      setShown((n) => {
        if (n >= text.length) {
          clearInterval(timer);
          return n;
        }
        return n + 1;
      });
    }, interval);
    return () => clearInterval(timer);
  }, [text, cps]);

  const done = shown >= text.length;
  return (
    <p class={className} onClick={() => setShown(text.length)}>
      {text.slice(0, shown)}
      {!done && <span class="caret">▋</span>}
    </p>
  );
}
