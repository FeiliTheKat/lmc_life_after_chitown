import { Typewriter } from './Typewriter';
import { pic } from '@/content/assets';
import type { GameController } from '@/engine/gameLoop';
import type { GameEvent } from '@/types';

const KIND_LABEL: Record<GameEvent['kind'], string> = {
  flavor: '直播间',
  churn: '猴女郎私信',
  whale: '意外',
  hidden: '空降',
  rival: '连线挑战',
};

/**
 * 事件弹窗（design §9.1 EventModal）：pendingEvent 非空时叠加在 Hub 上。
 * 选项事件 → 按钮列（gatedByRhetoricLvl 达标标"更安全"）；无选项叙事 → 单个「继续」。
 */
export function EventModal({
  event,
  rhetoricLvl,
  controller,
}: {
  event: GameEvent;
  rhetoricLvl: number;
  controller: GameController;
}) {
  const choices = event.choices ?? [];
  const img = event.image ? pic(event.image) : undefined;
  return (
    <div class="modal-backdrop">
      <div class={`modal event-modal kind-${event.kind}`}>
        <span class="event-kind">{KIND_LABEL[event.kind]}</span>
        {img && <img class="event-img" src={img} alt="" />}
        <Typewriter text={event.text} />
        <div class="btn-col">
          {choices.length === 0 ? (
            <button class="primary" onClick={() => controller.resolveEvent(0)}>
              继续
            </button>
          ) : (
            choices.map((c, i) => {
              // 安全选项显形：达话术等级 → 标记"更稳"（§7.4 公平性提示）
              const safer =
                c.gatedByRhetoricLvl !== undefined && rhetoricLvl >= c.gatedByRhetoricLvl;
              return (
                <button
                  key={i}
                  class={safer ? 'safe' : undefined}
                  onClick={() => controller.resolveEvent(i)}
                >
                  {c.text}
                  {safer && <small>话术够了 · 更稳</small>}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
