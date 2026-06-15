import { resetGame } from '@/engine/bootstrap';
import { stopBgm } from '@/engine/bgm';
import { balance } from '@/config/balance.config';
import { pic } from '@/content/assets';
import { Credit } from '@/ui/Credit';
import type { GameState } from '@/types';

const FANS_MILESTONE_TEXT = `十万粉丝的那个深夜，小猴猫关掉了直播。

没有庆祝，没有通知——
只是打开了那张搁在收藏夹里很久的专辑。

艾志恒《Life After Small Town》。

曾经太忙，顾不上听。
曾经太怕，怕听懂了更想逃。

歌词没有给答案，只是轻轻说：
离开小城之后，生活还是继续。

小猴猫第一次觉得，十万这个数字——
不是终点，是他终于有资格停下来听完一首歌。

“我晓得流量和名气都是转瞬即逝，只有音乐是永久” `;

const GOOD_END_TEXT = `十八天。十万粉丝，十位猴女郎，一首《英雄》唱到最后。
猴猫传媒——满编了。

谢谢每一个陪你走到最后的她。`;

function getLoseText(
  fansReached: boolean,
  capturedTen: boolean,
  fans: number,
  signed: number,
): string {
  const fanGap = (100000 - fans).toLocaleString();
  const girlGap = 10 - signed;

  if (!fansReached && !capturedTen) {
    return `赛季落幕。粉丝卡在 ${fans.toLocaleString()}，差 ${fanGap} 没到十万；猴女郎只签了 ${signed} 位，还差 ${girlGap} 位才算满编。\n\n两条线都没跑到——下次分清主次，别把精力全烧在刷综艺上。`;
  }
  if (!fansReached) {
    return `猴女郎们都签齐了，阵容不差。可粉丝数停在 ${fans.toLocaleString()}，差 ${fanGap} 没到十万。\n\n有人没有舞台，白搭。下次多开大秀，把涨粉节奏踩稳。`;
  }
  return `粉丝突破十万，数据亮眼。但猴女郎只签了 ${signed} 位，还差 ${girlGap} 位才够满编。\n\n没有她们，猴猫传媒撑不起来。下次别只盯数字，多主动出击连连线。`;
}

export function EndingScreen({ state }: { state: GameState }) {
  const result = state.win.result ?? 'LOSE_INCOMPLETE';
  const w = state.win.conditions;
  const isWin = result === 'WIN';

  return (
    <main class="screen ending">
      {/* 十万粉丝里程碑场景：仅通关（达成目标）时展示——没赢不冒这段"听完一首歌"的余味 */}
      {isWin && (
        <section class="milestone-scene">
          <div class="milestone-imgs">
            <img
              src={pic('album_cover.webp')}
              alt="艾志恒 Life After Small Town 专辑封面"
              class="milestone-album"
            />
            <img src={pic('aizhibing.webp')} alt="爱治冰" class="milestone-char" />
          </div>
          <p class="milestone-text">{FANS_MILESTONE_TEXT}</p>
          <hr class="milestone-divider" />
        </section>
      )}

      {isWin ? (
        <>
          <img class="ending-img" src={pic('good_end.webp')} alt="通关结局" />
          <h1 class="win">猴猫传媒 · 满编</h1>
          <p class="ending-text">{GOOD_END_TEXT}</p>
        </>
      ) : (
        <>
          <div class="ending-img-pair">
            <img src={pic('bad_end1.webp')} alt="结局图一" />
            <img src={pic('bad_end2.webp')} alt="结局图二" />
          </div>
          <h1 class="lose">未能扶大厦之将倾：派对被摧毁</h1>
          <p class="ending-text">
            {getLoseText(
              w.fansReached,
              w.capturedTen,
              state.resources.fans,
              state.capture.signedCount,
            )}
          </p>
        </>
      )}

      <ul class="cond">
        <li>
          {w.capturedTen ? '✅' : '❌'} 收服 {state.capture.signedCount}/
          {state.capture.requiredTotal}
        </li>
        <li>
          {w.fansReached ? '✅' : '❌'} 粉丝 {state.resources.fans.toLocaleString()}/
          {balance.resources.fansGoal.toLocaleString()}
        </li>
      </ul>
      <button class="primary" onClick={() => { stopBgm(); resetGame(); }}>
        再开一局
      </button>
      <Credit />
    </main>
  );
}
