# 项目架构详细分析报告

## 📋 执行摘要

本报告详细分析了 NYC Startup IPO Simulator 项目的架构，识别了数据一致性、类型定义、文件组织和代码结构等方面的问题，并提供了整合方案。

---

## 🔍 1. 项目结构分析

### 1.1 目录结构

```
RoadMap/
├── src/                    # 源代码目录
│   ├── components/         # React 组件
│   ├── hooks/              # 自定义 Hooks
│   ├── store/              # 状态管理 (Zustand)
│   ├── types/              # TypeScript 类型定义
│   ├── content/            # 数据模式定义 (Zod)
│   ├── constants/          # 常量定义
│   ├── lib/                # 工具函数
│   └── ui/                 # UI 组件和布局
├── public/                 # 静态资源
│   ├── images/             # Firm logos (53 张图片)
│   ├── datasets/           # 数据集文件
│   └── startup_ipo_game_pack/  # 游戏数据包
├── scripts/                # 构建和数据处理脚本
├── 3.interactive-archive/  # 归档项目（数据源）
└── images/                 # ⚠️ 重复的图片文件夹（应删除）
```

### 1.2 数据文件位置

| 文件路径 | 状态 | 用途 | 问题 |
|---------|------|------|------|
| `nyc_firms.json` (根目录) | ✅ 主数据源 | 包含 49 个匹配图片的 firms | logo_url 路径正确 (`/images/`) |
| `public/nyc_firms.json` | ⚠️ 过时 | 旧版本数据 | logo_url 路径错误 (`/assets/logos/`) |
| `public/datasets/nyc_firms.json` | ⚠️ 过时 | 旧版本数据 | logo_url 路径错误 (`/assets/logos/`) |
| `3.interactive-archive/nyc_firms.json` | 📦 数据源 | 原始完整数据（50个firms） | 作为数据源保留 |

---

## ⚠️ 2. 发现的问题

### 2.1 数据一致性问题

#### 问题 1: Logo URL 路径不一致
- **根目录 `nyc_firms.json`**: 使用 `/images/` ✅
- **`public/nyc_firms.json`**: 使用 `/assets/logos/` ❌
- **`public/datasets/nyc_firms.json`**: 使用 `/assets/logos/` ❌

**影响**: 如果应用从 `public/` 目录加载数据，logo 将无法显示。

#### 问题 2: 数据文件重复
- 根目录和 `public/` 目录都有 `nyc_firms.json`
- 根目录和 `public/` 目录都有 `nyc_firms.csv`
- 可能导致数据加载混乱

### 2.2 类型定义不一致

#### 问题 3: Firm 类型定义不统一

**`src/types/firm.ts`** (旧接口):
```typescript
export interface Firm {
  // ... 基础字段
  // ❌ 缺少新字段: logo_url, entry_barrier, role_in_ipo 等
}
```

**`src/content/schema.ts`** (新接口):
```typescript
export type FirmInput = z.infer<typeof FirmZ>
// ✅ 包含所有新字段
```

**影响**: 
- `src/mock/firms.ts` 使用旧的 `Firm` 类型
- 代码中混用 `Firm` 和 `FirmInput`，可能导致类型错误

### 2.3 文件组织问题

#### 问题 4: 重复的图片文件夹
- 根目录 `images/` 文件夹（53张图片）
- `public/images/` 文件夹（53张图片，已复制）
- **建议**: 删除根目录的 `images/` 文件夹

#### 问题 5: 归档项目占用空间
- `3.interactive-archive/` 包含完整的 node_modules
- 包含构建产物 `dist/`
- **建议**: 只保留数据文件，删除 node_modules 和 dist

### 2.4 数据加载逻辑

#### 问题 6: 数据加载优先级
`src/hooks/useContent.ts` 中的数据加载顺序：
1. `startup_ipo_game_pack/data/firms.json` (base)
2. `nyc_firms.json` (根目录) ✅
3. `datasets/nyc_firms.json` (fallback)
4. CSV 文件

**问题**: 如果根目录文件不存在，会回退到 `public/datasets/` 中的旧数据。

---

## ✅ 3. 整合方案

### 3.1 数据文件整合

#### 步骤 1: 统一数据源
- ✅ 保留根目录 `nyc_firms.json` 作为主数据源
- ✅ 更新 `public/nyc_firms.json` 与根目录保持一致
- ✅ 更新 `public/datasets/nyc_firms.json` 与根目录保持一致
- 📦 保留 `3.interactive-archive/nyc_firms.json` 作为数据源参考

#### 步骤 2: 清理重复文件
- ❌ 删除根目录 `images/` 文件夹（已复制到 public）
- ❌ 删除 `3.interactive-archive/node_modules/`
- ❌ 删除 `3.interactive-archive/dist/`

### 3.2 类型定义整合

#### 步骤 3: 统一类型系统
- ✅ 更新 `src/types/firm.ts` 添加新字段
- ✅ 或者统一使用 `FirmInput` 类型
- ✅ 更新 `src/mock/firms.ts` 使用新类型

### 3.3 代码整合

#### 步骤 4: 确保组件正确使用新字段
- ✅ `FirmCard.tsx` 已支持 `logo_url`
- ⚠️ 检查其他组件是否需要使用新字段（entry_barrier, notes 等）

---

## 📊 4. 数据统计

### 4.1 Firms 数据
- **总 firms 数**: 49 个（有匹配图片）
- **未匹配图片**: 5 张（Deloitte, EY, KPMG, PWC, Sequoia）
- **图片总数**: 53 张
- **图片位置**: `public/images/`

### 4.2 数据字段完整性

| 字段 | 覆盖率 | 说明 |
|------|--------|------|
| logo_url | 100% | 所有 49 个 firms 都有 |
| entry_barrier | 100% | 所有 firms 都有 |
| role_in_ipo | 100% | 所有 firms 都有 |
| notes | 100% | 所有 firms 都有 |
| position | 100% | 所有 firms 都有坐标 |

---

## 🔧 5. 实施计划

### 阶段 1: 数据文件同步 ✅
- [x] 创建匹配脚本
- [x] 生成统一的 `nyc_firms.json`
- [x] 复制图片到 `public/images/`

### 阶段 2: 类型定义统一 ⏳
- [ ] 更新 `src/types/firm.ts`
- [ ] 统一使用 `FirmInput` 或更新 `Firm`
- [ ] 更新所有引用

### 阶段 3: 文件清理 ⏳
- [ ] 删除根目录 `images/`
- [ ] 同步 `public/` 目录的数据文件
- [ ] 清理归档项目的构建产物

### 阶段 4: 验证测试 ⏳
- [ ] 验证所有 logo 正确显示
- [ ] 验证数据加载逻辑
- [ ] 运行类型检查
- [ ] 测试应用功能

---

## 📝 6. 建议

### 6.1 短期建议
1. **立即同步数据文件**: 确保所有位置的 `nyc_firms.json` 一致
2. **统一类型定义**: 避免类型不一致导致的错误
3. **清理重复文件**: 减少项目体积和混淆

### 6.2 长期建议
1. **数据源管理**: 考虑使用单一数据源，其他位置通过脚本同步
2. **类型系统**: 统一使用 Zod schema 作为单一数据源
3. **文档**: 添加数据文件说明和更新流程文档

---

## 🎯 7. 优先级

| 优先级 | 任务 | 影响 | 工作量 |
|--------|------|------|--------|
| 🔴 高 | 同步 public 目录的数据文件 | 功能正确性 | 低 |
| 🔴 高 | 统一类型定义 | 类型安全 | 中 |
| 🟡 中 | 删除重复的 images 文件夹 | 项目整洁 | 低 |
| 🟡 中 | 清理归档项目构建产物 | 项目体积 | 低 |
| 🟢 低 | 添加数据文档 | 可维护性 | 中 |

---

生成时间: 2024
报告版本: 1.0

