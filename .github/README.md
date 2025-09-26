# GitHub Actions 配置

本目录包含项目的 CI/CD 工作流配置。

## 工作流文件

- **`pr-check.yml`** - PR 构建检查（不推送镜像）
- **`release.yml`** - 版本发布（推送到 DockerHub）

## 快速开始

1. 配置 GitHub Secrets:
   - `DOCKERHUB_USERNAME`
   - `DOCKERHUB_TOKEN`

2. 设置分支保护规则（参见 [CI_CD_SETUP.md](./CI_CD_SETUP.md)）

3. 开始使用：
   - 提交 PR → 自动构建检查
   - 创建标签 → 自动发布镜像

详细配置说明请查看 [CI_CD_SETUP.md](./CI_CD_SETUP.md)