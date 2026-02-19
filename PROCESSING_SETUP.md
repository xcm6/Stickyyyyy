# Sticky + Processing 连接指南

## 概述

这个项目将 Sticky 应用的签到数据、排行榜和游戏统计连接到 Processing，实现动态可视化效果。

## 数据影响效果

- **签到数据越多** → 粒子数量增加
- **排行榜越高** → 条形图高度增加
- **游戏玩得越多** → 颜色变化更丰富
- **活跃天数越多** → 波形振幅增大

## 设置步骤

### 方法1: 使用本地服务器（推荐用于树莓派）

1. **在树莓派上启动服务器**:
```bash
cd /path/to/Sticky_V2
python3 server.py 8000
```

2. **在 Processing 中更新 API URL**:
```processing
String API_URL = "http://树莓派IP:8000/api.html?format=json";
```

### 方法2: 直接访问 API 页面

1. **部署 Sticky 应用到服务器**（如 GitHub Pages, Netlify 等）

2. **在 Processing 中设置 URL**:
```processing
String API_URL = "https://your-domain.com/api.html?format=json";
```

### 方法3: 使用 CORS 代理（开发测试）

如果遇到 CORS 问题，可以使用代理：
```processing
String API_URL = "https://cors-anywhere.herokuapp.com/your-api-url";
```

## Processing 代码使用

1. **打开 Processing IDE**

2. **复制 `processing_example.pde` 的内容**

3. **更新 API_URL**:
   - 本地测试: `"http://localhost:8000/api.html?format=json"`
   - 树莓派: `"http://树莓派IP:8000/api.html?format=json"`
   - 在线服务器: `"https://your-domain.com/api.html?format=json"`

4. **运行 sketch**

## 可视化效果说明

### 1. 粒子系统
- **数据源**: `total_check_ins`
- **效果**: 粒子数量 = 签到总数 / 10（最多500个）
- **位置**: 全屏随机移动

### 2. 排行榜条形图
- **数据源**: `rankings.top_users`
- **效果**: 条形高度 = 用户签到天数
- **位置**: 屏幕底部

### 3. 活动波形
- **数据源**: `activity.daily` (最近30天)
- **效果**: 波形振幅 = 每日签到数量
- **位置**: 屏幕中央

### 4. 心情分布
- **数据源**: `moods`
- **效果**: 颜色方块大小 = 心情出现次数
- **位置**: 右上角

## API 数据格式

```json
{
  "timestamp": "2024-01-01T00:00:00Z",
  "summary": {
    "total_check_ins": 1234,
    "total_users": 56,
    "total_groups": 8,
    "active_days": 30
  },
  "rankings": {
    "top_users": [
      {"username": "user1", "check_ins": 100, "mood": "🔥"},
      ...
    ],
    "top_groups": [
      {"name": "Group1", "check_ins": 50},
      ...
    ]
  },
  "activity": {
    "daily": {
      "2024-01-01": 10,
      "2024-01-02": 15,
      ...
    },
    "recent_count": 200
  },
  "moods": {
    "🔥": 50,
    "💀": 30,
    ...
  }
}
```

## 自定义效果

### 修改粒子数量
```processing
particleCount = min(totalCheckIns / 5, 1000); // 更密集
```

### 修改更新频率
```processing
int updateInterval = 1000; // 1秒更新一次
```

### 添加新效果
根据 `data` 对象中的任何字段创建新的可视化效果。

## 故障排除

### CORS 错误
- 使用本地服务器（方法1）
- 或使用 CORS 代理

### 连接超时
- 检查网络连接
- 确认 API URL 正确
- 检查防火墙设置

### 数据为空
- 确认 Supabase 连接正常
- 检查 `api.html` 页面是否正常工作
- 查看浏览器控制台错误信息

## 进阶功能

### 添加游戏类型统计

在 `api.html` 中添加游戏类型记录：
```javascript
// 记录游戏类型（需要在 GameManager.js 中实现）
const gameStats = {
  math: 0,
  slider: 0,
  puzzle: 0,
  // ...
};
```

### 实时数据流

使用 WebSocket 实现实时更新（需要额外开发）。

## 联系支持

如有问题，请检查：
1. API 端点是否可访问
2. Processing 控制台错误信息
3. 网络连接状态

