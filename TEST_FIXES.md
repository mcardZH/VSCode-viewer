# 🧪 测试修复效果

## 错误修复验证步骤

### 1. 启动调试会话
```bash
# 在 VSCode 中按 F5 或选择 "Run Extension (Full Build)"
# 这会自动构建插件并启动调试会话
```

### 2. 测试基本功能
在新打开的 VSCode 扩展开发窗口中：

1. **打开命令面板** (`Ctrl+Shift+P`)
2. **运行命令**: `Start Molecular Simulation Visualizer`
3. **观察**: 扩展是否正常启动，webview 是否加载

### 3. 测试销毁逻辑（关键测试）
这是修复的核心部分：

1. **启动查看器**: 使用任何命令打开 MSV 窗口
2. **关闭窗口**: 直接点击 webview 窗口的 X 按钮关闭
3. **观察控制台**: 应该**不再出现** `Cannot read properties of undefined (reading 'dispose')` 错误
4. **重复测试**: 多次打开和关闭，确保稳定性

### 4. 测试文件加载功能
1. **右键点击** `.pdb`, `.cif`, 或其他支持的分子文件
2. **选择**: `Launch MSV from File(s)`
3. **关闭窗口**: 验证销毁逻辑
4. **检查控制台**: 确保无错误

## 🔍 调试 Source Map 验证

### 如果仍有错误发生：

1. **打开开发者工具**: 在扩展开发窗口中按 `F12`
2. **查看错误堆栈**: 现在应该显示 TypeScript 源文件位置而不是编译后的 JS 位置
3. **示例对比**:

   **修复前** (无 source map):
   ```
   at /home/zyx/project/VSCode-viewer/out/panels/MolecularSimulationVisualizerPanel.js:46:21
   ```

   **修复后** (有 source map):
   ```
   at MolecularSimulationVisualizerPanel.dispose (src/panels/MolecularSimulationVisualizerPanel.ts:51:7)
   ```

## 📊 预期结果

### ✅ 成功指标：
- [ ] 扩展正常启动和运行
- [ ] 关闭 webview 窗口无错误
- [ ] 多次打开/关闭无内存泄漏
- [ ] Source map 正确映射错误位置
- [ ] 控制台中看到友好的警告信息（如果有清理错误）

### ❌ 失败指标：
- [ ] 仍然出现 "Cannot read properties of undefined" 错误
- [ ] 错误堆栈指向编译后的 JS 文件而非 TS 源文件
- [ ] 扩展崩溃或无响应

## 🛠️ 如果问题仍然存在

### 1. 重新完整构建
```bash
# 清理并重新构建
rm -rf out/ mol-plugin/dist/
npm run vscode:prepublish
```

### 2. 检查版本兼容性
```bash
# 确保 VSCode 和扩展 API 版本兼容
npm list @types/vscode
```

### 3. 查看详细错误日志
- 打开 VSCode 开发者工具 (`Help` > `Toggle Developer Tools`)
- 查看 Console 标签页中的完整错误堆栈
- 检查 Network 标签页确认资源加载

### 4. 验证 mol-plugin 集成
```bash
# 手动测试插件构建
cd mol-plugin
npm run build
ls -la dist/  # 应该看到 index.js 和 index.js.map
```

## 📝 测试报告模板

测试完成后，请提供以下信息：

```
## 测试结果

**日期**: ___________
**VSCode 版本**: ___________
**扩展版本**: 0.0.1

### 基本功能测试
- [ ] 扩展启动: ✅/❌
- [ ] Webview 加载: ✅/❌  
- [ ] 文件加载: ✅/❌

### 销毁逻辑测试
- [ ] 正常关闭: ✅/❌
- [ ] 无 dispose 错误: ✅/❌
- [ ] 重复开关: ✅/❌

### Source Map 测试
- [ ] 错误映射到 TS: ✅/❌
- [ ] 调试断点工作: ✅/❌

### 其他观察
___________
```

完成测试后，如果仍有问题，请提供具体的错误信息和测试结果！