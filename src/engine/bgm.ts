let current: HTMLAudioElement | null = null;

export function playBgm(src: string) {
  if (current) {
    current.pause();
    current = null;
  }
  const audio = new Audio(src);
  audio.loop = true;
  audio.volume = 0;
  current = audio;
  audio.play().catch(() => {});

  // 1 秒淡入
  const FADE_MS = 1000;
  const STEPS = 25;
  const interval = FADE_MS / STEPS;
  let step = 0;
  const fadeId = setInterval(() => {
    step++;
    if (!current || current !== audio) {
      clearInterval(fadeId);
      return;
    }
    audio.volume = Math.min(1, step / STEPS);
    if (step >= STEPS) clearInterval(fadeId);
  }, interval);
}

export function stopBgm() {
  if (current) {
    current.pause();
    current = null;
  }
}
