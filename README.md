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

将 `boxzy-product-web-guide` 与本目录放在同一级，打开其中的 `START-HERE.html`。说明中的 36 个当前页面预览直接引用本 Demo；两目录名称请保持不变。

## 开发

```sh
npm install
npm run build
npm test
```

预编译 CSS 已提供，不需要构建即可打开页面。38 项 Node / DOM stub 与源码检查通过；不等同于浏览器视觉验收。`review/` 保留测试脚本、测试基线及当前测试结果；根目录 `delivery-verification.json` 为当前交付检查记录。

检查两个同级目录的资源引用：`python3 review/verify-offline.py`。

## 实现边界

这是本地前端演示，不是生产服务。账号、余额、支付、提现、物流和奖池等需接入后端。`preview=demo` / `preview=reference` 使用隔离的示例状态；文档预览具有独立会话键，不会当作真实交易执行。

## 文件整理

未引用的生成草稿、旧 Banner、重复研究图与过期报告已清理。运行资源、样式源码、测试及说明中仍展示的历史对比图保留。删除项可从 Git 历史恢复；本地原交付副本未删除。
