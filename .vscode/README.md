# VSCode 调试配置说明

## 🚀 调试配置

现在项目提供了两种调试配置：

### 1. **Run Extension (Full Build)** - 完整构建 🔧
- **使用场景**: 首次调试、修改了 mol-plugin 代码、或确保所有代码都是最新的
- **构建流程**: 
  1. 构建 mol-plugin (`npm run build:plugin`)
  2. 编译主扩展代码 (`npm run compile`)
- **耗时**: 相对较长（约 20-30 秒）
- **推荐**: 修改插件代码后使用

### 2. **Run Extension (Quick)** - 快速调试 ⚡
- **使用场景**: 只修改了主扩展代码，mol-plugin 无变化
- **构建流程**: 仅编译主扩展代码 (`npm run compile`)
- **耗时**: 较短（约 5-10 秒）
- **推荐**: 日常开发调试使用

## 🛠️ 可用任务

在 VSCode 中按 `Ctrl+Shift+P` 输入 "Tasks: Run Task" 可以看到以下任务：

### 构建任务
- **`build-all`** ⭐ (默认构建任务)
  - 完整构建：先构建插件，再编译主项目
  - 对应 `npm run vscode:prepublish`

- **`build-plugin`**
  - 仅构建 mol-plugin
  - 对应 `npm run build:plugin`

- **`npm: compile`**
  - 仅编译主扩展代码
  - 对应 `npm run compile`

### 监听任务
- **`watch-plugin`**
  - 监听 mol-plugin 变化并自动重新构建
  - 对应 `npm run build:plugin:dev`

- **`npm: watch`**
  - 监听主扩展代码变化并自动重新编译
  - 对应 `npm run watch`

## 📋 开发工作流程

### 首次开发/大改动
1. 选择 **"Run Extension (Full Build)"** 进行调试
2. 这会确保所有代码都是最新编译的

### 日常开发流程

#### 如果修改了 mol-plugin 代码：
1. 手动运行 `build-plugin` 任务，或
2. 使用 **"Run Extension (Full Build)"** 调试

#### 如果只修改了主扩展代码：
1. 使用 **"Run Extension (Quick)"** 快速调试

#### 持续开发模式：
1. 在一个终端运行 `npm run watch` (监听主项目)
2. 在另一个终端运行 `npm run build:plugin:dev` (监听插件)
3. 使用 **"Run Extension (Quick)"** 调试（因为代码已经自动编译）

## ⚠️ 注意事项

1. **插件依赖**: mol-plugin 使用 molstar 作为外部依赖，在 webview 中通过 script 标签加载
2. **文件输出**: 
   - mol-plugin 输出到 `mol-plugin/dist/index.js`
   - 主扩展输出到 `out/` 目录
3. **调试顺序**: 确保先构建 mol-plugin，再编译主项目
4. **缓存清理**: 如果遇到奇怪问题，可以删除 `mol-plugin/dist/` 和 `out/` 目录重新构建

## 🎯 快捷键建议

- `F5`: 启动调试（使用默认配置）
- `Ctrl+Shift+P` → "Tasks: Run Task": 运行构建任务
- `Ctrl+Shift+P` → "Tasks: Run Build Task": 运行默认构建任务 (build-all)

现在你可以更高效地开发 Mol* React 插件了！🎉