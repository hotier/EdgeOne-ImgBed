# EdgeOne Pages 部署指南

## 项目概述

CloudFlare-ImgBed 是一个开源的文件托管解决方案，支持多种存储渠道和部署方式。本指南将帮助您将项目部署到 EdgeOne Pages 平台。

## EdgeOne Pages 介绍

EdgeOne Pages 是基于 Tencent EdgeOne 基础设施打造的全栈开发部署平台，提供从前端页面到动态 API 的无服务器部署体验。它具有以下优势：

- 现代化部署流程：支持 Git 连接、CLI、MCP 及 IDE 插件
- 全球极速体验：基于 EdgeOne 全球边缘网络
- Serverless 函数：提供边缘函数到云端函数的无服务器部署
- 全栈框架深度集成：零配置支持主流全栈框架

## 部署前准备

### 1. 注册 EdgeOne 账号

前往 [EdgeOne 官网](https://edgeone.ai/) 注册账号并完成实名认证。

### 2. 准备项目代码

确保您已克隆或下载了 CloudFlare-ImgBed 项目代码。

### 3. 配置存储渠道

根据您的需求配置存储渠道，支持以下存储方式：
- Telegram
- Discord
- Cloudflare R2
- S3 兼容存储
- HuggingFace

## 部署步骤

### 方法一：通过 EdgeOne 控制台部署

1. **登录 EdgeOne 控制台**
   - 进入 [EdgeOne 控制台](https://console.edgeone.ai/)

2. **创建 Pages 项目**
   - 点击左侧导航栏的 "Pages"
   - 点击 "创建项目"
   - 选择 "从本地文件上传"
   - 上传项目的压缩包（包含所有文件）

3. **配置构建设置**
   - 构建命令：`npm run build`
   - 输出目录：`./`
   - 运行时：`Node.js 18.x`

4. **配置 KV 存储**
   - 在 "KV 存储" 部分，创建一个名为 `img_url` 的命名空间

5. **部署项目**
   - 点击 "部署" 按钮，等待部署完成

### 方法二：通过 CLI 部署

1. **安装 EdgeOne CLI**
   ```bash
   npm install -g @tencent-edgeone/cli
   ```

2. **登录 CLI**
   ```bash
   eone login
   ```

3. **部署项目**
   ```bash
   eone pages deploy ./ --name cloudflare-imgbed
   ```

## 环境变量配置

在 EdgeOne Pages 控制台的 "环境变量" 部分，添加以下必要的环境变量：

| 环境变量名称 | 说明 | 示例值 |
|-------------|------|--------|
| `AUTH_CODE` | 上传认证码 | `your_auth_code` |
| `ADMIN_USERNAME` | 管理员用户名 | `admin` |
| `ADMIN_PASSWORD` | 管理员密码 | `your_admin_password` |
| 存储渠道配置 | 根据您选择的存储渠道添加相应的配置 | 例如 `TELEGRAM_BOT_TOKEN` |

## 测试和验证

### 1. 访问前端页面

部署完成后，EdgeOne Pages 会为您分配一个域名，例如 `cloudflare-imgbed-xxxx.pages.edgeone.ai`。访问该域名查看前端页面是否正常加载。

### 2. 测试上传功能

使用 curl 命令测试上传功能：

```bash
curl -X POST "https://cloudflare-imgbed-xxxx.pages.edgeone.ai/upload" -F "file=@/path/to/image.jpg"
```

### 3. 测试管理功能

访问管理界面，使用配置的管理员账号登录，测试文件管理、设置修改等功能。

## 常见问题

### 1. KV 存储访问失败

- 确保已正确创建 `img_url` KV 命名空间
- 检查环境变量配置是否正确

### 2. 上传失败

- 检查存储渠道配置是否正确
- 验证存储渠道的访问权限
- 查看 EdgeOne Pages 的日志获取详细错误信息

### 3. 前端页面加载缓慢

- 检查 EdgeOne Pages 的缓存配置
- 确保静态资源已正确部署

## 性能优化

1. **启用 EdgeOne 缓存**：在 EdgeOne 控制台中配置缓存规则，加速静态资源访问

2. **优化存储渠道**：选择距离用户较近的存储渠道，提高访问速度

3. **启用压缩**：确保静态资源已启用压缩，减少传输大小

## 监控和维护

1. **查看日志**：在 EdgeOne 控制台的 "日志" 部分查看函数执行日志

2. **监控流量**：使用 EdgeOne 的监控功能，查看项目的访问流量和性能指标

3. **定期备份**：定期备份 KV 存储中的数据，防止数据丢失

## 总结

通过本指南，您应该能够成功将 CloudFlare-ImgBed 部署到 EdgeOne Pages 平台。如果遇到问题，请参考 EdgeOne Pages 的官方文档或联系 EdgeOne 技术支持。

---

**注意**：本指南基于 EdgeOne Pages 的当前版本，如有功能变更，请参考官方文档进行调整。