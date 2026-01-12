# Error 1101 故障排除指南

## 问题

部署后反复出现 Error 1101: "Worker threw exception"

## 可能的原因

1. **`_headers` 文件格式问题**
   - 某些头部规则可能与 Worker 冲突
   - 通配符规则可能导致问题

2. **Worker 运行时错误**
   - 导入的模块不存在
   - 环境变量缺失
   - 运行时异常

3. **构建输出问题**
   - `_worker.js` 文件损坏
   - 静态资源路径错误

## 已实施的修复

### 1. 简化 `_headers` 文件

移除了可能导致冲突的规则：
- 移除了 `X-Content-Type-Options` 头部（可能冲突）
- 移除了字体文件的通配符规则（可能冲突）
- 移除了 HTML 和根路径的规则（可能冲突）
- 只保留静态资源的缓存规则

### 2. 保留核心功能

仍然保留：
- `/images/*` 的缓存规则
- `/_next/static/*` 的缓存规则

这些是最重要的性能优化，且不太可能导致冲突。

## 如果问题仍然存在

### 方案 1：完全移除 `_headers` 文件（临时）

如果简化后仍然有问题，可以暂时移除：

```bash
# 移除 _headers 文件
rm public/_headers

# 更新构建脚本，不再复制 _headers
# 编辑 scripts/fix-worker.js，注释掉复制 _headers 的部分
```

### 方案 2：使用正常工作的部署

`c04ebc5d` 仍然正常工作，可以：
1. 将其提升为 Production
2. 或者重新部署该版本

### 方案 3：检查 Worker 日志

在 Cloudflare Dashboard 中：
1. 访问部署详情
2. 查看 "Logs" 标签
3. 查找具体的错误信息

## 验证步骤

1. **重新部署**
   ```bash
   cd prediction-web
   ./deploy.sh
   ```

2. **等待部署完成**（约 2-3 分钟）

3. **测试访问**
   - 访问：https://predictiongod.app
   - 应该不再出现 Error 1101

4. **检查缓存**
   - 在浏览器开发者工具中
   - 查看静态资源的响应头
   - 应该看到缓存头（如果 `_headers` 生效）

## 长期解决方案

如果 `_headers` 文件持续导致问题：

1. **使用 Cloudflare Dashboard 设置缓存**
   - 在 Cloudflare Dashboard 中设置缓存规则
   - 不需要 `_headers` 文件

2. **在 Worker 中设置缓存头**
   - 修改 `_worker.js` 来设置缓存头
   - 更灵活，但需要代码修改

3. **使用 Cloudflare Transform Rules**
   - 在 Cloudflare Dashboard 中配置
   - 不需要文件，直接在 Dashboard 设置

## 当前状态

- ✅ `next.config.ts` 已设置 `unoptimized: true`
- ✅ `_headers` 文件已简化
- ✅ `_worker.js` 文件正常
- ⚠️ 需要重新部署验证

## 建议

**立即操作：**
1. 重新部署（使用简化后的 `_headers`）
2. 如果仍然失败，暂时移除 `_headers` 文件
3. 使用 `c04ebc5d` 作为 Production（已验证正常）

**长期：**
- 考虑使用 Cloudflare Dashboard 设置缓存规则
- 或者使用 Worker 代码设置缓存头
