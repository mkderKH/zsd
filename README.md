
![tw-banner](https://github.com/thirdweb-example/next-starter/assets/57885104/20c8ce3b-4e55-4f10-ae03-2fe4743a5ee8)

# thirdweb-next-starter

Starter template to build an onchain react native app with [thirdweb](https://thirdweb.com/) and [next](https://nextjs.org/).

## Installation

Install the template using [thirdweb create](https://portal.thirdweb.com/cli/create)

```bash
  npx thirdweb create app --next
```

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file:

`CLIENT_ID`

To learn how to create a client ID, refer to the [client documentation](https://portal.thirdweb.com/typescript/v5/client). 

## Run locally

Install dependencies

```bash
yarn
```

Start development server

```bash
yarn dev
```

Create a production build

```bash
yarn build
```

Preview the production build

```bash
yarn start
```

## Resources

- [Documentation](https://portal.thirdweb.com/typescript/v5)
- [Templates](https://thirdweb.com/templates)
- [YouTube](https://www.youtube.com/c/thirdweb)
- [Blog](https://blog.thirdweb.com)

## Need help?

For help or feedback, please [visit our support site](https://thirdweb.com/support)

## 目录文件

.git/: Git 仓库目录，存放版本控制的元数据。
.next/: Next.js 构建输出目录，包含编译后的文件。
component/: 存放 React 组件。
config/: 存放配置文件。
hooks/: 存放自定义 React Hooks。
node_modules/: 存放项目依赖的第三方库和模块。
pages/: Next.js 的路由目录，每个文件对应一个路由。
public/: 存放静态资源，如图片、图标等。
src/: 源代码目录，存放所有的应用代码。
styles/: 存放全局样式文件。
types/: 存放 TypeScript 声明文件。
utils/: 存放实用工具函数。
.env.local: 环境变量文件，用于本地开发环境的配置。
.eslintrc.json: ESLint 配置文件，用于代码风格和错误检查。
.gitignore: Git 忽略文件，定义哪些文件或目录不被 Git 跟踪。
.prettierrc: Prettier 配置文件，用于代码格式化。
next.config.mjs: Next.js 配置文件，使用 JavaScript 模块语法。
next-env.d.ts: Next.js 环境类型定义文件，用于 TypeScript 开发。
package.json: 项目依赖和脚本定义。
postcss.config.js: PostCSS 配置文件，用于 CSS 后处理。
README.md: 项目说明文件，通常包含项目简介和使用说明。
tailwind.config.ts: Tailwind CSS 配置文件，用于定义样式和主题。
tsconfig.json: TypeScript 配置文件，用于 TypeScript 开发。
yarn.lock: Yarn 锁文件，确保依赖的版本一致性。
static:静态文件。

# 功能文件
marketCommon  行情  （展示市值、最新价、24H波动）
CallWallet    钱包  （调起钱包）
topMenu       头部公共文件 





