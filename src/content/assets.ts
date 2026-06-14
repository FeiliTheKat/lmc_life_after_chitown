/**
 * 图库加载（design §10）。图源 = 项目根 /pweb（作者提供的 Source/GMod 风渲染图）。
 * 用 Vite glob 让构建处理+哈希，base './' 下也能正确解析；内容层只存文件名，UI 经 pic() 取 URL。
 *
 * ⚠️ 纪律（作者要求）：每个女主播只能用她自己对应的图片，不得混用。
 */
const urls = import.meta.glob('/pweb/*.{webp,png,jpg,jpeg}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

/** 按文件名取图 URL（如 'sixiaoba.webp'）；不存在返回 undefined。 */
export function pic(file: string): string | undefined {
  return urls[`/pweb/${file}`];
}

/** 游戏封面。 */
export const COVER = pic('game_cover.webp');
