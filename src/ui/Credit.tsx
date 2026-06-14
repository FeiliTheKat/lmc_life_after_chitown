import { pic } from '@/content/assets';

/** 作者署名（仅标题页 / 结局页角落展示，不参与对局 UI）。 */
export function Credit() {
  return (
    <div class="credit" aria-label="Made by FelixTheKat">
      <img class="credit-avatar" src={pic('felixthekat.webp')} alt="FelixTheKat" />
      <span class="credit-text">
        <span class="credit-by">Made by</span>
        <span class="credit-name">FelixTheKat</span>
      </span>
    </div>
  );
}
