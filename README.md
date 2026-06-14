# 猴猫直播模拟器 · Life After Chitown

一个浏览器端的直播模拟游戏，纯前端静态站，完全离线可用。

**在线游玩：** https://feilithekat.github.io/lmc_life_after_chitown/

---

## 本地运行

**环境要求：** Node.js 20 及以上，npm

```bash
# 克隆仓库
git clone https://github.com/FeiliTheKat/lmc_life_after_chitown.git
cd lmc_life_after_chitown

# 安装依赖
npm install

# 启动开发服务器（支持热更新）
npm run dev
```

浏览器打开 http://localhost:5173 即可。

## 构建

```bash
npm run build
```

产物在 `dist/` 目录，可直接部署到任意静态托管平台（GitHub Pages、Netlify、Vercel 等），也可以本地直接打开 `dist/index.html`。

## 单元测试

```bash
npm test
```

## 技术栈

- [Vite](https://vitejs.dev/) — 构建工具
- [Preact](https://preactjs.com/) — UI 框架
- [TypeScript](https://www.typescriptlang.org/) — 类型系统
- [Vitest](https://vitest.dev/) — 单元测试
