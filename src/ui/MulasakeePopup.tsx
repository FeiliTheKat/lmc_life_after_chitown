import { useEffect } from 'preact/hooks';
import type { GameController } from '@/engine/gameLoop';
import type { GameState } from '@/types';

const CONTEXT_LABEL = { hub: '旁观', battle: '对局评' } as const;

/**
 * Mulasakee 旁观弹窗：右上角固定，Hub 行动 / PK 出招各触发一条台词。
 * 4 秒后自动消失，点击也可关闭。
 */
export function MulasakeePopup({
  comment,
  controller,
}: {
  comment: NonNullable<GameState['mulasakeeComment']>;
  controller: GameController;
}) {
  useEffect(() => {
    const t = setTimeout(() => controller.clearMulasakeeComment(), 4000);
    return () => clearTimeout(t);
  }, [comment.uid]);

  return (
    <div
      key={comment.uid}
      class={`sakee-popup context-${comment.context}`}
      onClick={() => controller.clearMulasakeeComment()}
      title="点击关闭"
    >
      <span class="sakee-tag">? · {CONTEXT_LABEL[comment.context]}</span>
      <p class="sakee-text">{comment.text}</p>
    </div>
  );
}
