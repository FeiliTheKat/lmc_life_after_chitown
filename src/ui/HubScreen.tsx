import { useState } from 'preact/hooks';
import { balance } from '@/config/balance.config';
import { MONKEY_GIRLS } from '@/content/monkeyGirls.data';
import { canChallenge, sakeeReady, sakeeShowsUp } from '@/systems/progression';
import { MOVES } from '@/content/moves.data';
import { canUseMove } from '@/systems/battleEngine';
import { currentCerealCost } from '@/systems/actions';
import { pic } from '@/content/assets';
import { dateLabel } from '@/systems/calendar';
import type { GameController } from '@/engine/gameLoop';
import type { GameState, MonkeyGirlDef, MonkeyGirlRuntime } from '@/types';

function StatCell({
  label,
  value,
  tip,
  sub,
  tone,
}: {
  label: string;
  value: string | number;
  tip: string;
  sub?: string;
  tone?: string;
}) {
  return (
    <div class={`stat${tone ? ' ' + tone : ''}`}>
      <span class="stat-label">{label}</span>
      <span class="stat-val">
        {value}
        {sub && <em>{sub}</em>}
      </span>
      <span class="tip">{tip}</span>
    </div>
  );
}

/** 玩家状态集合：头像 + 全属性，每格 hover 提示获取/消耗方式。 */
function PlayerStatus({ s }: { s: GameState }) {
  const r = s.resources;
  const looks = s.stats.asenStyle ? balance.asenStyle.looksTo : s.stats.looksBase;
  const stressTone = r.stress >= 70 ? 'danger' : r.stress >= 40 ? 'warn' : undefined;
  // 剪了 ASEN 造型后换帅气头像
  const avatar = pic(s.stats.asenStyle ? 'lmc_jiahao.webp' : 'lmc_suprise1.webp');
  const day = s.calendar.currentDay;
  const total = s.calendar.totalDays;
  const today = dateLabel(s.calendar.startDate, day);
  const startD = dateLabel(s.calendar.startDate, 1);
  const endD = dateLabel(s.calendar.startDate, total);
  const remaining = total - day + 1; // 含今天
  return (
    <section class="panel status-panel">
      <figure class="avatar">
        {avatar && <img src={avatar} alt="小猴猫" />}
        <figcaption>小猴猫</figcaption>
      </figure>
      <div class="status-grid">
        {/* 第一行：日历 + 资源 */}
        <StatCell
          label="日期"
          value={today}
          sub={`Day ${day}`}
          tone="accent"
          tip={`今天是直播季第 ${day}/${total} 天。`}
        />
        <StatCell label="开播" value={startD} tip="赛季开始日（6/5）。" />
        <StatCell label="收官" value={endD} tip="赛季结束日（7/4），到点做总判定。" />
        <StatCell
          label="还剩"
          value={`${remaining}天`}
          tone={remaining <= 5 ? 'warn' : undefined}
          tip={`距收官还剩 ${remaining} 天（含今天）。7/4 总判定：需同时集齐 10 + 粉丝破 10 万。`}
        />
        {/* 第二行：资源 */}
        <span class="row-break" />
        <StatCell
          label="精力"
          value={r.energy}
          tip={
            '每天早上回满 100；买麦片吃 +50。\n消耗：看综艺 −25 / 听歌 −10 / 大秀出招 + 被反击。'
          }
        />
        <StatCell
          label="金钱"
          value={`¥${r.money}`}
          tip={
            `赚：看综艺 +${balance.actions.variety.money} / 听歌 +${balance.actions.listen.money} / 大秀打赏 + 已收服猴女郎被动产出。\n花：买麦片 −${Math.abs(balance.actions.cereal.moneyBase)} / 剪 ASEN 造型 −${balance.asenStyle.cost} / 金钱攻略刷礼物。`
          }
        />
        <StatCell
          label="粉丝"
          value={r.fans}
          sub={`/${balance.resources.fansGoal}`}
          tone="fans"
          tip={
            `涨：看综艺 +${balance.actions.variety.fans} / 听歌 +${balance.actions.listen.fans} / 大秀赢 +${balance.battle.winFans} + 被动产出。\n掉：大秀输或认输 ${balance.battle.loseFans} / 流失事件。目标 9 万→10 万。`
          }
        />
        <StatCell
          label="压力"
          value={r.stress}
          tone={stressTone}
          tip={'看综艺 +35 累积；每天衰减 −10。\n满 100 → 强制停播 2 天（重罚）。'}
        />
        <StatCell
          label="猴猫传媒"
          value={`${s.capture.signedCount}/${s.capture.requiredTotal}`}
          tone="media"
          tip={'收服进度。大秀收服一个 +1（流失仍计入）。通关需累计 10 个。'}
        />

        {/* 第二行：攻略属性 */}
        <span class="row-break" />
        <StatCell
          label="话术"
          value={s.stats.rhetoricLvl}
          tip={'大秀失败 +3、胜利 +1（越战越强）。决定话术攻略的强度。'}
        />
        <StatCell
          label="才艺"
          value={s.stats.talentLvl}
          tip={'听歌 +1。决定才艺攻略（唱《英雄》/ 跳抓钱舞）的强度。'}
        />
        <StatCell
          label="颜值"
          value={looks}
          tip={'基础 60；剪 ASEN 造型拉满 100。颜值反问攻略（对颜控女主播）靠它。'}
        />
      </div>
    </section>
  );
}

/** 图鉴缩略图用直播态(idle)更干净，回退 reacting/首张。返回 scene entry（含 objectPosition）。 */
function girlIdleEntry(girl: MonkeyGirlDef) {
  return (
    girl.assets.scenes.find((x) => x.key === 'idle') ??
    girl.assets.scenes.find((x) => x.key === 'reacting') ??
    girl.assets.scenes[0]
  );
}

function Card({
  girl,
  rt,
  hiddenLocked,
}: {
  girl: MonkeyGirlDef;
  rt?: MonkeyGirlRuntime;
  hiddenLocked?: boolean;
}) {
  const signed = rt?.status === 'signed';
  const churned = rt?.status === 'churned';

  if (girl.isHidden && hiddenLocked && !signed) {
    return (
      <div class="card back mystery" title="神秘嘉宾（隐藏第 11 位，达成隐藏条件解锁）">
        <span class="qmark">?</span>
        <span class="card-name">神秘嘉宾</span>
      </div>
    );
  }
  if (signed) {
    const entry = girlIdleEntry(girl);
    const src = entry ? pic(entry.src) : undefined;
    return (
      <div class="card front" title={girl.name}>
        {src ? (
          <img
            src={src}
            alt={girl.name}
            style={entry?.objectPosition ? { objectPosition: entry.objectPosition } : undefined}
          />
        ) : (
          <span class="card-noimg">{girl.name}</span>
        )}
        <span class="card-name">{girl.name}</span>
      </div>
    );
  }
  return (
    <div class={`card back${churned ? ' churned' : ''}`} title={churned ? '已流失' : '未收服'}>
      <span class="qmark">{churned ? '✖' : '?'}</span>
      <span class="card-name">{churned ? '已流失' : `tier${girl.tier}`}</span>
    </div>
  );
}

function CodexCards({ s }: { s: GameState }) {
  const required = MONKEY_GIRLS.filter((g) => !g.isHidden);
  const hidden = MONKEY_GIRLS.find((g) => g.isHidden);
  return (
    <section class="panel">
      <h2>
        猴女郎图鉴 · {s.capture.signedCount}/{s.capture.requiredTotal}
      </h2>
      <div class="codex">
        {required.map((g) => (
          <Card key={g.id} girl={g} rt={s.girls[g.id]} />
        ))}
        {hidden && (
          <Card
            key={hidden.id}
            girl={hidden}
            rt={s.girls[hidden.id]}
            hiddenLocked={s.girls[hidden.id]?.status !== 'signed'}
          />
        )}
      </div>
    </section>
  );
}

export function HubScreen({
  state,
  controller,
  onReturnToTitle,
}: {
  state: GameState;
  controller: GameController;
  onReturnToTitle: () => void;
}) {
  const [confirmReturn, setConfirmReturn] = useState(false);
  const lowEnergy = (cost: number) => state.resources.energy < cost;
  // 常规猴女郎按粉丝门控；Mulasakee（隐藏）单独处理"婉拒/接受"两态
  const challengeable = MONKEY_GIRLS.filter((g) => !g.isHidden && canChallenge(g, state));
  const anyAffordable = Object.values(MOVES).some((m) => canUseMove(m, state));
  const sakee = MONKEY_GIRLS.find((g) => g.isHidden);
  // Mulasakee 够格出现在名单（且未赢下）；最后一天才真正接受连麦，否则点了被婉拒
  const sakeeListed = !!sakee && sakeeReady(state) && state.girls[sakee.id]?.status === 'unmet';
  const sakeeAccepts = sakeeShowsUp(state);
  const cerealPrice = currentCerealCost(state.resources.cerealBought ?? 0);
  const a = balance.actions;
  // 连线完 Mulasakee 之后，锁住除睡觉/返回标题外的所有操作
  const sakeeDefeated = !!sakee && state.girls[sakee.id]?.status === 'signed';

  return (
    <main class="screen hub">
      <PlayerStatus s={state} />

      <div class="hub-body">
        <div class="hub-actions">
          <section class="panel">
            <h2>今天干点啥</h2>
            <div class="btn-row">
              <button
                disabled={sakeeDefeated || lowEnergy(-a.variety.energy)}
                onClick={() => controller.performDailyAction('variety')}
              >
                看综艺<small>涨粉快·压力+</small>
                <span class="btn-tip">{`精力 ${a.variety.energy} / 粉丝 +${a.variety.fans} / 金钱 +${a.variety.money} / 压力 +${a.variety.stress}`}</span>
              </button>
              <button
                disabled={sakeeDefeated || lowEnergy(-a.listen.energy)}
                onClick={() => controller.performDailyAction('listen')}
              >
                听歌<small>安全·才艺+</small>
                <span class="btn-tip">{`精力 ${a.listen.energy} / 粉丝 +${a.listen.fans} / 金钱 +${a.listen.money} / 才艺 +${a.listen.talent}`}</span>
              </button>
              <button
                disabled={sakeeDefeated || state.resources.money < cerealPrice}
                onClick={() => controller.performDailyAction('cereal')}
              >
                买麦片吃
                <small>
                  ¥{cerealPrice} · 精力+{a.cereal.energy}
                </small>
              </button>
            </div>
          </section>

          <section class="panel">
            <h2>大秀 · 可挑战的女主播</h2>
            {challengeable.length === 0 && !sakeeListed ? (
              <p class="dim">当前粉丝段没有可挑战对象（涨粉解锁更高 tier）。</p>
            ) : (
              <div class="btn-row wrap">
                {challengeable.map((g) => (
                  <button
                    key={g.id}
                    disabled={sakeeDefeated || !anyAffordable}
                    onClick={() => controller.startBattle(g.id)}
                  >
                    {g.name}
                    <small>tier{g.tier}</small>
                  </button>
                ))}
                {sakeeListed && sakee && (
                  <button
                    key={sakee.id}
                    class="sakee-challenge"
                    disabled={sakeeDefeated || (sakeeAccepts && !anyAffordable)}
                    onClick={() =>
                      sakeeAccepts ? controller.startBattle(sakee.id) : controller.rejectSakee()
                    }
                  >
                    {sakeeAccepts ? `⚡ ${sakee.name} 空降连麦` : '???'}
                    <small>{sakeeAccepts ? '神秘嘉宾 · 最后一天' : '神秘嘉宾 · 连麦邀请'}</small>
                  </button>
                )}
              </div>
            )}
          </section>

          <section class="panel">
            <h2>形象</h2>
            <div class="btn-row">
              <button
                disabled={
                  sakeeDefeated ||
                  state.stats.asenStyle ||
                  state.resources.money < balance.asenStyle.cost
                }
                onClick={() => controller.buyAsenStyle()}
              >
                {state.stats.asenStyle ? '已剪 ASEN 造型 ✓' : '剪一个 ASEN 的造型'}
                <small>
                  {state.stats.asenStyle
                    ? `颜值已拉满 ${balance.asenStyle.looksTo}`
                    : `¥${balance.asenStyle.cost} · 颜值→${balance.asenStyle.looksTo}`}
                </small>
              </button>
            </div>
          </section>
        </div>

        <CodexCards s={state} />
      </div>

      <section class="panel">
        <div class="btn-row sleep-row">
          <button
            class="secondary restart-day"
            disabled={!state.dayStartSnapshot}
            onClick={() => controller.restartDay()}
          >
            重来这一天
            <small>回滚今天所有行动</small>
          </button>
          <button class="primary sleep" onClick={() => controller.endDay()}>
            {sakeeDefeated
              ? '结束直播，准备明天的蛋仔派对'
              : `下播睡觉 · 结束第 ${state.calendar.currentDay} 天`}
            <small>{sakeeDefeated ? '' : '精力回满，进入下一天'}</small>
          </button>
        </div>
      </section>

      <section class="panel return-panel">
        {confirmReturn ? (
          <div class="btn-row">
            <span class="confirm-text">放弃当前进度吗？</span>
            <button
              class="danger"
              onClick={() => {
                onReturnToTitle();
                setConfirmReturn(false);
              }}
            >
              放弃
            </button>
            <button onClick={() => setConfirmReturn(false)}>取消</button>
          </div>
        ) : (
          <button class="ghost" onClick={() => setConfirmReturn(true)}>
            返回标题画面
          </button>
        )}
      </section>
    </main>
  );
}
