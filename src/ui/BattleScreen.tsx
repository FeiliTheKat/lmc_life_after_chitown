import { useState, useEffect, useRef } from 'preact/hooks';
import { playBgm } from '@/engine/bgm';
import { MOVES, MOVE_KEYS } from '@/content/moves.data';
import { canUseMove, talentUnlocked, chatBeatsRemaining } from '@/systems/battleEngine';
import { girlDef } from '@/content/monkeyGirls.data';
import { MONKEY_PORTRAITS } from '@/content/monkey.data';
import { pic } from '@/content/assets';
import { balance } from '@/config/balance.config';
import type { GameController } from '@/engine/gameLoop';
import type { DialogueLine, GameState, MonkeyGirlDef, MoveCategory, SceneKey } from '@/types';

const CATS: MoveCategory[] = ['金钱', '话术', '才艺', '颜值'];

/** 单行对白：说话人前缀即时显示，文本部分可截断（打字机用）。 */
function DialogueLineP({
  line,
  girlName,
  text,
  caret,
}: {
  line: DialogueLine;
  girlName: string;
  text: string;
  caret?: boolean;
}) {
  return (
    <p class={`line ${line.who}`}>
      {line.who === 'girl' && <b>{girlName}：</b>}
      {line.who === 'monkey' && <b>小猴猫：</b>}
      {text}
      {caret && <span class="caret">▋</span>}
    </p>
  );
}

/**
 * 战斗实时对话：逐行顺序播放——已揭示的行全文常驻，当前行逐字蹦字，蹦完稍顿自动揭下一行。
 * lines 增长（出招追加新 beat）时游标继续往后吐字。点击=瞬显当前行。自动滚到底。
 */
function BattleDialogue({ lines, girlName }: { lines: DialogueLine[]; girlName: string }) {
  const cps = balance.text.cps;
  const [cursor, setCursor] = useState(0); // 正在吐字的行号
  const [shown, setShown] = useState(0); // 当前行已显字数
  const boxRef = useRef<HTMLDivElement>(null);
  const cur: DialogueLine | undefined = lines[cursor];

  // 吐当前行
  useEffect(() => {
    setShown(0);
    if (!cur) return;
    const id = setInterval(() => {
      setShown((n) => {
        if (n >= cur.text.length) {
          clearInterval(id);
          return n;
        }
        return n + 1;
      });
    }, 1000 / cps);
    return () => clearInterval(id);
  }, [cursor, cur?.text, cps]);

  // 当前行吐完 → 稍顿，自动揭下一行
  useEffect(() => {
    if (cur && shown >= cur.text.length) {
      const t = setTimeout(() => setCursor((c) => c + 1), 360);
      return () => clearTimeout(t);
    }
  }, [shown, cursor, cur]);

  // 自动滚到底
  useEffect(() => {
    const el = boxRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [shown, cursor, lines.length]);

  const skip = () => {
    if (cur) setShown(cur.text.length);
  };

  return (
    <div class="dialogue compact" ref={boxRef} onClick={skip} title="点击跳过本行">
      {lines.slice(0, cursor).map((l, i) => (
        <DialogueLineP key={i} line={l} girlName={girlName} text={l.text} />
      ))}
      {cur && (
        <DialogueLineP
          key={cursor}
          line={cur}
          girlName={girlName}
          text={cur.text.slice(0, shown)}
          caret={shown < cur.text.length}
        />
      )}
    </div>
  );
}

const SAKEE_WIN_IMG = 'beat sakee.webp';

/** Sakee 败后第一幕：whale-modal 样式，显示旁白 + 「永玄，Yield」按钮。 */
function SakeeWinModal({ text, onConfirm }: { text: string; onConfirm: () => void }) {
  const img = SAKEE_WIN_IMG ? pic(SAKEE_WIN_IMG) : undefined;
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
          <p class="whale-text">{text}</p>
        </div>
        <div class="btn-col whale-actions">
          <button class="primary whale-confirm" onClick={onConfirm}>
            永玄，Yield
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Mulasakee「21 问」大弹窗（mulasakee.md 定稿）：赢下后全屏覆盖，一次只放一句——
 * 淡入 → 停留约 3 秒 → 淡出，自动接下一句；点击可立即跳到下一句。
 * 旁白与问句样式区分；小猴猫全程沉默（winDialogue 里没有他的行）。
 * 全部播完 → 显示「结束连麦」收尾（确认即落库赢下结果）。
 */
function SakeeQuestions({
  lines,
  girlName,
  onConfirm,
}: {
  lines: DialogueLine[];
  girlName: string;
  onConfirm: () => void;
}) {
  const HOLD = 5000; // 每句停留时长（作者指定 5 秒）
  const FADE = 600; // 淡入/淡出时长
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(false);
  const done = i >= lines.length;

  useEffect(() => {
    playBgm(`${import.meta.env.BASE_URL}music/21-questions.mp4`);
  }, []);

  useEffect(() => {
    if (done) return;
    setShown(false);
    const tIn = setTimeout(() => setShown(true), 40); // 淡入
    const tOut = setTimeout(() => setShown(false), 40 + FADE + HOLD); // 淡出
    const tNext = setTimeout(() => setI((n) => n + 1), 40 + FADE + HOLD + FADE); // 下一句
    return () => {
      clearTimeout(tIn);
      clearTimeout(tOut);
      clearTimeout(tNext);
    };
  }, [i, done]);

  const cur = lines[i];
  return (
    <div
      class="sakee-q-screen"
      onClick={done ? undefined : () => setI((n) => Math.min(n + 1, lines.length))}
    >
      {!done && cur && (
        <div key={i} class={`sakee-q-card who-${cur.who}${shown ? ' show' : ''}`}>
          {cur.who === 'girl' && <span class="sakee-q-who">{girlName}</span>}
          <p class="sakee-q-text">{cur.text}</p>
        </div>
      )}
      {!done && <span class="sakee-q-hint">点击跳过本句</span>}
      {done && (
        <button class="primary sakee-q-end" onClick={onConfirm}>
          结束连麦
        </button>
      )}
    </div>
  );
}

/** 取某场景的女主播 scene entry（含 objectPosition）；占位猴女郎无图返回 undefined。 */
function girlSceneEntry(girl: MonkeyGirlDef, scene: SceneKey) {
  const scenes = girl.assets.scenes;
  return scenes.find((x) => x.key === scene) ?? scenes.find((x) => x.key === 'idle') ?? scenes[0];
}

function DualPortrait({ state }: { state: GameState }) {
  const b = state.battle!;
  const girl = girlDef(b.girlId);
  const portraits = MONKEY_PORTRAITS[b.display.monkeyScene];
  const [pickedIdx, setPickedIdx] = useState(() => Math.floor(Math.random() * portraits.length));

  useEffect(() => {
    setPickedIdx(Math.floor(Math.random() * portraits.length));
  }, [b.display.monkeyScene, portraits.length]);

  const monkeySrc = pic(portraits[pickedIdx]);
  const girlEntry = girlSceneEntry(girl, b.display.girlScene);
  const girlSrc = girlEntry ? pic(girlEntry.src) : undefined;
  return (
    <div class="portraits">
      <figure class={`portrait monkey scene-${b.display.monkeyScene}`}>
        {monkeySrc && <img src={monkeySrc} alt="小猴猫" />}
        <figcaption>小猴猫 · {b.display.monkeyScene}</figcaption>
      </figure>
      <figure class={`portrait girl scene-${b.display.girlScene}`}>
        {girlSrc && (
          <img
            src={girlSrc}
            alt={girl.name}
            style={girlEntry?.objectPosition ? { objectPosition: girlEntry.objectPosition } : undefined}
          />
        )}
        <figcaption>
          {girl.name} · {b.display.girlScene}
        </figcaption>
      </figure>
    </div>
  );
}

export function BattleScreen({
  state,
  controller,
}: {
  state: GameState;
  controller: GameController;
}) {
  const b = state.battle!;
  const girl = girlDef(b.girlId);
  const rt = state.girls[b.girlId];
  const revealed = new Set<MoveCategory>([...b.revealedThisBattle, ...rt.revealedWeakness]);
  const pct = Math.min(100, Math.round((b.captureProgress / b.threshold) * 100));
  const energyMax = balance.resources.energyMax;
  const energyPct = Math.min(100, Math.round((state.resources.energy / energyMax) * 100));
  const [sakeeIntroSeen, setSakeeIntroSeen] = useState(false);

  return (
    <main class="screen battle">
      <DualPortrait state={state} />

      <div class="progress">
        <div class="progress-fill" style={{ width: `${pct}%` }} />
        <span class="progress-label">
          攻陷 {b.captureProgress}/{b.threshold}
        </span>
      </div>

      <div class="progress energy-bar">
        <div class="progress-fill energy-fill" style={{ width: `${energyPct}%` }} />
        <span class="progress-label">
          精力 {state.resources.energy}/{energyMax}
        </span>
      </div>

      <div class="reveal-row">
        {CATS.map((c) => (
          <span key={c} class={revealed.has(c) ? 'reveal hit' : 'reveal'}>
            {revealed.has(c) ? c : '???'}
          </span>
        ))}
      </div>

      {/* 对话区：条件改为 !== 'lose'，Preact 在 win 时保留同一实例（cursor 不重置），
          winDialogue 追加到 lines 末尾，打字机无缝衔接最后一招反应台词 → 收服台词 */}
      {b.result !== 'lose' && (
        <BattleDialogue
          lines={
            b.result === 'win' && state.pendingCaptureDialogue && !girl.isHidden
              ? [...(b.dialogue ?? []), ...state.pendingCaptureDialogue.dialogue]
              : (b.dialogue ?? girl.introDialogue ?? (girl.introHook ? [{ who: 'narration', text: girl.introHook }] : []))
          }
          girlName={girl.name}
        />
      )}

      {/* 才艺前置门提示（2026-06-15）：没聊完话术，唱歌/跳舞按钮锁着 */}
      {!b.result && !talentUnlocked(girl, b) && (
        <p class="chat-gate-hint">
          先用「话术」把话聊完，才能唱歌/跳舞/颜值反问（还差 {chatBeatsRemaining(girl, b)} 句）
        </p>
      )}

      <div class="btn-row wrap moves">
        {MOVE_KEYS.map((k) => {
          const m = MOVES[k];
          const chatLocked = (m.category === '才艺' || m.category === '颜值') && !talentUnlocked(girl, b);
          return (
            <button
              key={k}
              class={chatLocked ? 'chat-locked' : undefined}
              disabled={!!b.result || !canUseMove(m, state) || chatLocked}
              onClick={() => controller.battleTurn(k)}
            >
              {m.label}
              <small>
                {chatLocked ? '需先聊完话术' : `精力-${m.costEnergy}${m.costMoneyPerUse ? `·¥${m.costMoneyPerUse}` : ''}`}
              </small>
            </button>
          );
        })}
      </div>

      {!b.result && (
        <button class="flee" onClick={() => controller.fleeBattle()}>
          认输
          <small>
            {state.resources.energy > 10
              ? '判负掉粉 · 话术不涨'
              : '判负掉粉 · 话术照拿'}
          </small>
        </button>
      )}

      {b.result === 'win' &&
        state.pendingCaptureDialogue &&
        (girl.isHidden ? (
          // 神秘嘉宾（Mulasakee）：先展示败后旁白 modal，确认后进「21 问」全屏大弹窗
          !sakeeIntroSeen ? (
            <SakeeWinModal
              text={state.pendingCaptureDialogue.dialogue[0]?.text ?? ''}
              onConfirm={() => setSakeeIntroSeen(true)}
            />
          ) : (
            <SakeeQuestions
              lines={state.pendingCaptureDialogue.dialogue.slice(1)}
              girlName={girl.name}
              onConfirm={() => controller.confirmCapture()}
            />
          )
        ) : (
          <div class="overlay">
            <h2 class="win">拿下了！</h2>
            <button class="primary" onClick={() => controller.confirmCapture()}>
              收服！加入猴猫传媒
            </button>
          </div>
        ))}

      {b.result === 'lose' && (
        <div class="overlay">
          <h2 class="lose">这把没拿下</h2>
          {girl.loseDialogue ? (
            <BattleDialogue lines={girl.loseDialogue} girlName={girl.name} />
          ) : b.fled ? (
            <p>小猴猫突然感觉一阵胸闷。不行，得休息了，话术经验涨了，下次再来（试出的喜好已记下）。</p>
          ) : (
            <p>她溜了——话术经验涨了，下次再来（试出的喜好已记下）。</p>
          )}
          <button class="primary" onClick={() => controller.clearBattle()}>
            继续
          </button>
        </div>
      )}
    </main>
  );
}
