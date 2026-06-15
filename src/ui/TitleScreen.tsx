import { COVER } from '@/content/assets';
import { Credit } from '@/ui/Credit';
import { playBgm } from '@/engine/bgm';

/** 封面/标题屏：正式游戏那样的开场。点"开始游戏"进入赛季。 */
export function TitleScreen({ onStart }: { onStart: () => void }) {
  return (
    <main class="screen title">
      {COVER && <img class="cover-img" src={COVER} alt="猴猫直播模拟器" />}
      <Credit />
      <div class="title-overlay">
        <h1>小猴猫：Life After Chi-Town</h1>
        <p class="tagline">收服十位猴女郎 · 拯救蛋仔派对</p>
        <button
          class="primary start"
          onClick={() => {
            playBgm('/music/intro-theme.mp4');
            onStart();
          }}
        >
          开始游戏
        </button>
      </div>
    </main>
  );
}
