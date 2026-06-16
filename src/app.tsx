import { useEffect, useState } from 'preact/hooks';
import { store, controller, resetGame } from '@/engine/bootstrap';
import { useStore } from '@/engine/useStore';
import { pic } from '@/content/assets';
import { TitleScreen } from './ui/TitleScreen';
import { IntroScreen } from './ui/IntroScreen';
import { HubScreen } from './ui/HubScreen';
import { BattleScreen } from './ui/BattleScreen';
import { EndingScreen } from './ui/EndingScreen';
import { EventModal } from './ui/EventModal';
import { WhaleEventModal, WhaleResultModal } from './ui/WhaleEventModal';
import { Typewriter } from './ui/Typewriter';
import { AIDE_RESCUE_CONTENT } from '@/content/events.data';
import type { GameState } from '@/types';

/** 吉奥雷送跑车救场弹窗（艾德对战中精力快耗尽时叠加在 BattleScreen 上）。确认 → 强判 WIN。 */
function RivalRescueModal() {
  const c = AIDE_RESCUE_CONTENT;
  const img = c.img ? pic(c.img) : undefined;
  return (
    <div class="modal-backdrop whale-backdrop">
      <div class="whale-modal">
        <span class="whale-kind-tag">救场</span>
        <div class="whale-body">
          {img && (
            <figure class="whale-portrait">
              <img src={img} alt="" />
            </figure>
          )}
          <p class="whale-text">{c.text}</p>
        </div>
        <div class="btn-col whale-actions">
          <button class="primary whale-confirm" onClick={() => controller.acceptRivalRescue()}>
            {c.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/** 行动反馈对话框：逐字蹦出（打字机），自动消失，可带图（如 ASEN 造型）。 */
function Toast({ flash }: { flash: GameState['flash'] }) {
  useEffect(() => {
    if (!flash) return;
    // 给打字机留足吐字时间：按字数估算（cps≈40）+ 阅读余量，再自动收起。
    const typeMs = flash.text.length * 28;
    const t = setTimeout(() => controller.clearFlash(), Math.max(flash.img ? 4500 : 4200, typeMs + 1600));
    return () => clearTimeout(t);
  }, [flash]);

  if (!flash) return null;
  const img = flash.img ? pic(flash.img) : undefined;
  return (
    <div class="toast" onClick={() => controller.clearFlash()}>
      {img && <img class="toast-img" src={img} alt="" />}
      <div class="toast-body">
        <span class="toast-tag">直播间</span>
        <Typewriter key={img ? `${flash.text}#i` : flash.text} text={flash.text} class="toast-text" />
      </div>
    </div>
  );
}

/** 按相位路由（design §3.1）：封面 → 故事背景 → 战斗（含结果浮层）→ 季末结局 → 否则 Hub。 */
export function App() {
  const state = useStore(store);
  const [showIntro, setShowIntro] = useState(false);

  let screen;
  if (state.phase === 'TITLE' && !showIntro)
    screen = <TitleScreen onStart={() => setShowIntro(true)} />;
  else if (showIntro)
    screen = <IntroScreen onDone={() => { setShowIntro(false); controller.startGame(); }} />;
  else if (state.battle) screen = <BattleScreen state={state} controller={controller} />;
  else if (state.phase === 'ENDING') screen = <EndingScreen state={state} />;
  else screen = <HubScreen state={state} controller={controller} onReturnToTitle={resetGame} />;

  return (
    <>
      {screen}
      {state.pendingEvent && (
        state.pendingEvent.kind === 'whale' ? (
          <WhaleEventModal event={state.pendingEvent} controller={controller} />
        ) : (
          <EventModal
            event={state.pendingEvent}
            rhetoricLvl={state.stats.rhetoricLvl}
            controller={controller}
          />
        )
      )}
      {state.pendingWhaleResult && (
        <WhaleResultModal
          result={state.pendingWhaleResult}
          onClose={() => controller.clearWhaleResult()}
        />
      )}
      {state.pendingRivalRescue && <RivalRescueModal />}
      <Toast flash={state.flash} />
    </>
  );
}
