import { describe, it, expect } from 'vitest';
import { checkContentInvariants } from './contentInvariants';

describe('内容自检（design §8.4）', () => {
  it('当前内容零违例（含图资源全部可解析）', () => {
    expect(checkContentInvariants()).toEqual([]);
  });
});
