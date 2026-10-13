# BOXZY Web Demo

2026-10-13 Web PC 最终交付副本。下载后打开 `index.html` 或 `START-HERE.html`，无需安装依赖即可演示。

## 内容与入口

- `boxzy-interactive.html`：首页、选盒、开奖、出售成功。
- `boxzy-collection.html`：收藏、未开盒、奖品详情、出售与发货。
- `boxzy-account.html`：账户、充值、提现、交易记录、用户名。
- 其他页面：地址、排行榜、帮助、访问限制和加载状态。
- `assets/`：本地图片、字体、视频、CSS 和脚本。
- `src/`：Tailwind 样式源文件；`review/`：源码与逻辑检查。

已包含最终首页 Banner、浅金边、收藏首屏紧凑适配、奖品与出售分离状态、发货税费及金额联动、充值/提现键盘。保持用户确认的黑金设计。

## 配套产品说明

完整说明文档已包含在本仓库 `guide/` 目录中。打开 `guide/START-HERE.html`（或 `guide/index.html`），36 个当前页面预览直接引用本仓库 Demo。只需下载或部署这一个仓库；不再依赖同级的独立说明仓库。

```text
index.html                 # Web Demo 入口
START-HERE.html            # Demo 与说明导航
guide/START-HERE.html      # 完整产品说明
guide/assets/             # 说明素材
guide/images/             # 参考图片
guide/evidence/           # 历史对比图
```

部署时将仓库根目录作为静态站点根目录，保留 `guide/` 子目录。

## 开发

```sh
npm install
npm run build
npm test
```

预编译 CSS 已提供，不需要构建即可打开页面。38 项 Node / DOM stub 与源码检查通过；不等同于浏览器视觉验收。`review/` 内旧日期的检查记录为历次证据，本次交付以根目录 `delivery-verification.json` 为准。

## 实现边界

这是本地前端演示，不是生产服务。账号、余额、支付、提现、物流和奖池等需接入后端。`preview=demo` / `preview=reference` 使用隔离的示例状态；文档预览具有独立会话键，不会当作真实交易执行。
