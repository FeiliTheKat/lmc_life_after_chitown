import { pic } from '@/content/assets';
import type { GameController } from '@/engine/gameLoop';
import type { GameEvent } from '@/types';

/**
 * 鲸鱼意外事件专用大弹窗（whale_dandan 等）：
 * 比标准 EventModal 宽得多，侧边人像 + 可滚动长文，
 * 单一"确认/行动"按钮固定在底部，玩家读完再按才消失。
 */
export function WhaleEventModal({
  event,
  controller,
}: {
  event: GameEvent;
  controller: GameController;
}) {
  const img = event.image ? pic(event.image) : undefined;
  const choices = event.choices ?? [];

  return (
    <div class="modal-backdrop whale-backdrop">
      <div class="whale-modal">
        <span class="whale-kind-tag">意外</span>

        <div class="whale-body">
          {img && (
            <figure class="whale-portrait">
              <img src={img} alt="" />
            </figure>
          )}
          <p class="whale-text">{event.text}</p>
        </div>

        <div class="btn-col whale-actions">
          {choices.length === 0 ? (
            <button class="primary whale-confirm" onClick={() => controller.resolveEvent(0)}>
              我知道了
            </button>
          ) : (
            choices.map((c, i) => (
              <button
                key={i}
                class="primary whale-confirm"
                onClick={() => controller.resolveEvent(i)}
              >
                {c.text}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/** 鲸鱼事件结算结果弹窗（挽回单单留存/流失结局）：同 whale modal 风格，仅一个"我知道了"按钮。 */
export function WhaleResultModal({
  result,
  onClose,
}: {
  result: { text: string; img?: string };
  onClose: () => void;
}) {
  const img = result.img ? pic(result.img) : undefined;
  return (
    <div class="modal-backdrop whale-backdrop">
      <div class="whale-modal">
        <span class="whale-kind-tag">结果</span>
        <div class="whale-body">
          {img && (
            <figure class="whale-portrait">
              <img src={img} alt="" />
            </figure>
          )}
          <p class="whale-text">{result.text}</p>
        </div>
        <div class="btn-col whale-actions">
          <button class="primary whale-confirm" onClick={onClose}>
            女孩回来吧。。。
          </button>
        </div>
      </div>
    </div>
  );
}
