/**
 * 听歌·专辑列表（作者提供 2026-06-13）。听歌时随机翻一张，文案展示专辑名+歌手。
 * 《英雄》(ASEN) 是才艺/感化母题（大秀里唱），这里是"练歌/听歌"曲库。
 */
export interface AlbumDef {
  title: string;
  artist: string;
}

export const ALBUMS: AlbumDef[] = [
  { title: '龙年', artist: '华云龙' },
  { title: 'Life After Small Town', artist: 'ASEN 艾志恒' },
  { title: '牛窝坑之子', artist: 'Vansdaddy' },
  { title: 'Exordinary', artist: 'Uzzy' },
  { title: '八方来财', artist: '揽佬' },
  { title: '生活麻辣烫', artist: '王齐铭' },
  { title: 'ICEMAN', artist: 'Drake' },
  { title: 'Real G', artist: 'Gai' },
  { title: 'RACER', artist: 'CashTrippy' },
  { title: '娘子', artist: '春' },
  { title: '幽默与笑话', artist: '卡虎 / 杰西马' },
  { title: 'GUOXIA', artist: '李佳隆' },
  { title: '灰太阳', artist: '施鑫文月' },
  { title: 'Rebuild', artist: 'Mac Ova Seas' },
  { title: 'NESA', artist: 'ASEN 艾志恒' },
  { title: '生于未来', artist: '法老' },
  { title: '理想国', artist: '杨和苏' },
  { title: '逃跑计划', artist: '龙飘飘' },
];

export function randomAlbum(): AlbumDef {
  return ALBUMS[Math.floor(Math.random() * ALBUMS.length)];
}
