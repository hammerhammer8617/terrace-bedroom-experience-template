# Terrace & Bedroom Experience Template

这是一份可以自行部署、再分享给朋友的 **ChatGPT MCP + Skills 样板房**。它把“露台”和“卧室”当作两种对话方法，而不是实际地点：

- **露台**：从真实旧对话里随机翻出一把彼此不相干的生活碎屑，让旧材料和此刻的真实反应重新进入闲聊。
- **卧室**：从不同旧对话里取出语义遥远的思想碎片，让来源和碰撞过程可见，再生成一条只有这批材料才能长出的新想法。

它分享的是实现方法，不包含原作者的聊天记录、称呼、私人服务器、记忆库或关系设定。

## 为什么同时提供 Skill 与 MCP

| 组成 | 用途 |
| --- | --- |
| `skills/terrace-rummage` | 桌面端显式调用露台方法 |
| `skills/bedroom-thought-dream` | 桌面端显式调用思想之梦 |
| Cloudflare Worker `/mcp` | 给移动端/插件提供远程双入口与同一套规则 |

MCP Worker **不会读取聊天记录**。它只返回随机取样坐标、体验边界和双按钮 UI；真正的历史搜索仍由支持个人上下文检索的宿主完成。因此，宿主若没有可用的旧对话搜索能力，两个体验都必须坦白失败，不能编造回忆。

## 隐私边界

Worker：

- 不保存用户、会话、检索词、旧片段或生成结果；
- 不连接数据库、OB、Notion、Library 或其他记忆服务；
- 不发起外部网络请求；
- 不需要 OAuth、API key 或账号权限；
- 对外只暴露无参数、只读的 MCP 工具。

Cloudflare 的平台日志仍可能记录普通请求元数据。若只给自己或朋友使用，建议每个人部署自己的 Worker，不要共用一处公开实例。

## 自定义自己的门牌

先编辑 `src/config.js`：

- `server.title`：插件显示名；
- `participants`：两位参与者在规则里的通用称呼；
- `doorway.*.prompt`：按钮真正发送的句子；
- `doorway.*.copy`：入口文案。

再同步修改 `.codex-plugin/plugin.json` 的显示名、作者和描述。不要把真实姓名、私人域名、聊天记录或访问密钥提交到公共仓库。

## 本地验证

```bash
npm install
npm test
npm run deploy:dry
```

## 部署到 Cloudflare Workers

```bash
npx wrangler login
npm run deploy
```

部署完成后，先访问：

```text
https://<你的-worker>.workers.dev/health
```

确认 `status` 为 `ok`，再在 ChatGPT 开发者模式中创建远程 MCP 连接：

```text
https://<你的-worker>.workers.dev/mcp
```

当前 Worker 无鉴权且无状态。它适合作为私人/小范围样板，不应在里面加入任何秘密或敏感数据。

## 体验不该被改掉的部分

- 名称是体验隐喻，不是地点、天气、入睡或醒来的事实。
- 露台先遇见一整把散乱材料，再决定说什么；不是搜索“最重要的一条回忆”。
- 卧室必须让来源残影可见；新想法至少依赖两个具体旧碎片。
- 两者都不做人物画像、关系总结、强行升华或自动保存。
- 找不到可信旧材料时允许失败，不用漂亮文字伪造成功。

更完整的原理见 [`docs/design-notes.md`](docs/design-notes.md)，验收边界见 [`docs/acceptance-cases.md`](docs/acceptance-cases.md)。

## 项目状态

这是一个私人预发布模板。公开分享前，请自行选择许可证并再次检查仓库历史里没有私人材料。
