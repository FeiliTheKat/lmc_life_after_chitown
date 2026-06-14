import { useState } from 'preact/hooks';
import { pic } from '@/content/assets';

interface ImgEntry {
  src: string | undefined;
  caption?: string;
  portrait?: boolean;
}

interface Beat {
  tag: string;
  title: string;
  body: string;
  imgs?: ImgEntry[];
}

const BEATS: Beat[] = [
  {
    tag: '世界观',
    title: '被土鸡蛋围绕的世界',
    body: `最开始，小猴猫也在国内活动。那时候，说唱圈还没彻底被"土鸡蛋病毒"占领。小猴猫每天在网上锐评、整活、搞节目，过得倒也自在。\n\n直到后来，他和一位叫做道士的人发生了一场持续数月的大战。没人知道两个人究竟在争什么。后来，道士完成了最后一击。\n\n那一天，小猴猫败了。败得很彻底。\n没有人知道那段时间的小猴猫去了哪里。有人说他在出租屋里哭了三天。有人说他被老头包走了。还有人说，他其实已经被感染。\n\n但事实是——\n\n小猴猫带着一顶雷锋帽，一张飞往美国的机票，以及几张盗版的电钻CD，离开了中国。他去了芝加哥。\n\n在那里，他遇见了真正的洋鸡蛋。也第一次知道：原来世界上还有另一种活法。`,
    imgs: [{ src: pic('bad_end1.webp'), caption: '感染者画像' }],
  },
  {
    tag: '主角',
    title: '小猴猫回来了',
    body: `在芝加哥的几年里，小猴猫逐渐聚集起一群同样没有被感染的、拒绝向土鸡蛋妥协的人。他们自称：猴猫家族。\n\n直到某一天，小猴猫收到消息：土鸡蛋病毒已经全面扩散。\n\n音乐评论区沦陷。综艺沦陷。短视频沦陷。甚至连一些曾经的洋鸡蛋，也开始出现感染症状。\n\n于是，流亡多年的小猴猫，带着芝加哥学来的高雅直播技巧，坐上了飞回家乡的航班。`,
    imgs: [{ src: pic('lmc_chitown.webp') }],
  },
  {
    tag: '计划',
    title: '7月4日，上海，蛋仔派对',
    body: `小猴猫要在 7 月 4 日，于上海，办一场蛋仔派对。\n\n把天南海北的猴子猴孙们聚到一块儿，狂欢一场。这是猴猫家族久违的团圆，是给这个发灰的世道点的一把火。\n\n但计划走漏了风声。`,
    imgs: [{ src: pic('good_end.webp') }],
  },
  {
    tag: '危机',
    title: '感染者的阴谋',
    body: `感染者们盯上了派对当天——要在 7/4 那天搞破坏，把蛋仔派对搅个稀烂，把好不容易聚起来的猴子猴孙们，连同小猴猫本人一起摧毁。\n\n猴猫家族的安危，危在旦夕。`,
    imgs: [{ src: pic('bad_end2.webp'), caption: '蛋仔派对被搅黄的模样' }],
  },
  {
    tag: '使命',
    title: '十万粉丝，召唤爱志兵',
    body: `小猴猫只有一条路：直播。\n\n从 6/16 到 7/3，靠一场场直播——拷打土鸡蛋综艺、唱 ASEN 的《英雄》、和各路主播打 PK——把粉丝攒到十万。\n\n为什么非得是十万？因为只有粉丝破十万，才能解锁 ASEN 的那张专辑，《Life After Small Town》\n\n这张专辑一响，爱志兵便会被集结起来\n有了爱志兵，才能在 7/4 正面硬刚感染者，守住蛋仔派对。\n\n此外，一路被他收服、签进猴猫传媒的猴女郎们，每一位都是一份底气。集齐十位，就是集齐十份胜算。`,
    imgs: [
      { src: pic('album_cover.webp'), caption: '《Life After Small Town》' },
      { src: pic('aizhibing.webp'), caption: '爱志兵' },
    ],
  },
];

interface IntroScreenProps {
  onDone: () => void;
}

export function IntroScreen({ onDone }: IntroScreenProps) {
  const [idx, setIdx] = useState(0);
  const beat = BEATS[idx];
  const isLast = idx === BEATS.length - 1;
  const visibleImgs = beat.imgs?.filter((i) => i.src) ?? [];

  return (
    <main class="screen intro-screen">
      <div class="intro-progress">
        {BEATS.map((_, i) => (
          <span key={i} class={`intro-dot${i === idx ? ' active' : i < idx ? ' done' : ''}`} />
        ))}
      </div>

      <div class="intro-card">
        <span class="intro-tag">{beat.tag}</span>
        <h2 class="intro-title">{beat.title}</h2>

        {visibleImgs.length > 0 && (
          <div class={`intro-imgs${visibleImgs.length > 1 ? ' multi' : ''}`}>
            {visibleImgs.map((img, i) => (
              <figure key={i} class={`intro-fig${img.portrait ? ' portrait' : ''}`}>
                <img src={img.src} alt={img.caption ?? ''} />
                {img.caption && <figcaption>{img.caption}</figcaption>}
              </figure>
            ))}
          </div>
        )}

        <div class="intro-body">
          {beat.body.split('\n\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </div>

      <div class="intro-nav">
        {idx > 0 && (
          <button class="intro-prev" onClick={() => setIdx(idx - 1)}>
            ← 上一页
          </button>
        )}
        <button
          class={`primary intro-next${isLast ? ' launch' : ''}`}
          onClick={() => (isLast ? onDone() : setIdx(idx + 1))}
        >
          {isLast ? '明白了，开播！' : '下一页 →'}
        </button>
      </div>
    </main>
  );
}
