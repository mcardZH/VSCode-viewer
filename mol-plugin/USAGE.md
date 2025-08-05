# Mol* Plugin 使用说明

## 概述

此插件将原本内联在 HTML 模板中的 Mol* viewer 代码提取为独立的 React 组件，便于开发 Mol* 插件和扩展功能。

## 构建

### 插件构建
```bash
npm run build:plugin     # 生产环境构建
npm run build:plugin:dev # 开发环境构建（带监听）
```

### 完整构建
```bash
npm run vscode:prepublish # 构建插件 + 编译扩展
```

## React 组件使用

### 基本使用

```tsx
import React from 'react';
import { MolstarViewer } from './mol-plugin';

function App() {
  return (
    <MolstarViewer
      id="my-viewer"
      pdb="1abc"
      layoutShowControls={true}
      onViewerReady={(viewer) => {
        console.log('Viewer ready:', viewer);
      }}
    />
  );
}
```

### 高级配置

```tsx
import React from 'react';
import { MolstarViewer, parseUrlConfig } from './mol-plugin';

function AdvancedViewer() {
  // 从 URL 解析配置
  const config = parseUrlConfig();
  
  return (
    <MolstarViewer
      id="advanced-viewer"
      debugMode={true}
      layoutShowControls={!config.hideControls}
      collapseLeftPanel={config.collapseLeftPanel}
      pdbProvider="rcsb"
      pixelScale={2.0}
      pickScale={0.5}
      structureUrl="https://example.com/structure.pdb"
      structureUrlFormat="pdb"
      onViewerReady={(viewer) => {
        // 执行自定义操作
        viewer.loadPdb('4hhb');
      }}
      onError={(error) => {
        console.error('Viewer error:', error);
      }}
    />
  );
}
```

## 工具函数

### URL 参数解析

```javascript
import { getParam, parseUrlConfig } from './mol-plugin';

// 获取单个参数
const debugMode = getParam('debug-mode', '[^&]+').trim() === '1';

// 解析所有配置
const config = parseUrlConfig();
console.log(config.pdbProvider); // 'pdbe' or 'rcsb'
```

## 组件属性

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `id` | string | 'molstar-viewer' | 容器元素 ID |
| `className` | string | - | CSS 类名 |
| `style` | CSSProperties | - | 内联样式 |
| `layoutShowControls` | boolean | true | 显示控制面板 |
| `viewportShowExpand` | boolean | false | 显示展开按钮 |
| `collapseLeftPanel` | boolean | false | 折叠左侧面板 |
| `pdbProvider` | string | 'pdbe' | PDB 数据提供商 |
| `emdbProvider` | string | 'pdbe' | EMDB 数据提供商 |
| `pixelScale` | number | 1 | 像素缩放 |
| `pickScale` | number | 0.25 | 拾取缩放 |
| `pickPadding` | number | 1 | 拾取填充 |
| `debugMode` | boolean | false | 调试模式 |
| `pdb` | string | - | PDB ID |
| `structureUrl` | string | - | 结构文件 URL |
| `structureUrlFormat` | string | - | 结构文件格式 |
| `onViewerReady` | function | - | 查看器就绪回调 |
| `onError` | function | - | 错误回调 |

## 目录结构

```
mol-plugin/
├── src/
│   ├── components/
│   │   └── MolstarViewer.tsx    # React 组件
│   ├── types/
│   │   └── molstar.d.ts         # TypeScript 类型定义
│   └── index.ts                 # 主入口
├── dist/                        # 构建输出
├── package.json
├── tsconfig.json
└── webpack.config.js
```

## 开发注意事项

1. **外部依赖**: molstar 被配置为外部依赖，需要在 webview 中通过 script 标签预先加载
2. **TypeScript 支持**: 提供了完整的类型定义
3. **React 兼容**: 使用 React 18+ 的新 JSX 转换
4. **构建分离**: 插件代码独立构建，不影响主扩展编译

## 扩展 VSCode 集成

HTML 模板现在引用编译后的插件：

```html
<script type="text/javascript" src="{{PLUGIN_URI}}"></script>
<script type="text/javascript">
  var config = MolstarPlugin.parseUrlConfig();
  // 使用插件工具函数
</script>
```

`{{PLUGIN_URI}}` 变量由扩展代码自动设置为 `mol-plugin/dist/index.js` 的 webview URI。