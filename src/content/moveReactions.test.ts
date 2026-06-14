import { describe, it, expect } from 'vitest';
import { moveReactionLines } from './moveReactions';
import { makeGirl } from '@/test/factories';
import type { DialogueLine } from '@/types';

const beat = (t: string): DialogueLine[] => [{ who: 'girl', text: t }];

describe('moveReactionLines（逐招对白选取）', () => {
  it('未填 moveReactions → 中性旁白兜底（不替猴女郎编台词）', () => {
    const girl = makeGirl();
    const lines = moveReactionLines(girl, 'rhetoric', 0);
    expect(lines).toHaveLength(1);
    expect(lines[0].who).toBe('narration');
  });

  it('按使用次数递进取 beat，超出后停在最后一条', () => {
    const girl = makeGirl({
      moveReactions: { rhetoric: [beat('一'), beat('二')] },
    });
    expect(moveReactionLines(girl, 'rhetoric', 0)[0].text).toBe('一');
    expect(moveReactionLines(girl, 'rhetoric', 1)[0].text).toBe('二');
    expect(moveReactionLines(girl, 'rhetoric', 5)[0].text).toBe('二'); // 钳到末条
  });

  it('某招填了、另一招没填 → 各自走真迹 / 兜底', () => {
    const girl = makeGirl({ moveReactions: { looks: [beat('痞帅')] } });
    expect(moveReactionLines(girl, 'looks', 0)[0].text).toBe('痞帅');
    expect(moveReactionLines(girl, 'money', 0)[0].who).toBe('narration');
  });
});
