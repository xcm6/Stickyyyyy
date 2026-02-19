# 快速开始：Sticky + Processing 连接

## 🎯 效果说明

- **签到数据越多** → 粒子数量增加（最多500个）
- **排行榜越高** → 条形图高度增加
- **游戏玩得越多** → 游戏统计条形图显示，粒子颜色变化
- **活跃天数越多** → 波形振幅增大

## 🚀 3步快速开始

### 步骤1: 启动 API 服务器

在项目目录运行：
```bash
python3 server.py
```

或者直接在浏览器打开 `api.html` 页面。

### 步骤2: 配置 Processing

1. 打开 Processing IDE
2. 复制 `processing_example.pde` 的内容
3. 修改 API URL（第12行）：
   ```processing
   String API_URL = "http://localhost:8000/api.html?format=json";
   ```
   如果是树莓派，改为：
   ```processing
   String API_URL = "http://树莓派IP:8000/api.html?format=json";
   ```

### 步骤3: 运行！

点击 Processing 的运行按钮，可视化效果会每5秒自动更新。

## 📊 可视化元素

1. **左上角**: 总签到数、用户数、群组数、活跃天数
2. **底部**: 排行榜条形图（Top 10用户）
3. **中央**: 活动波形（最近30天）
4. **右上角**: 心情分布
5. **右下角**: 游戏统计（7种游戏）
6. **全屏**: 粒子系统（数量随签到数变化）

## 🔧 自定义

### 修改更新频率
```processing
int updateInterval = 1000; // 改为1秒更新
```

### 修改粒子数量
```processing
particleCount = min(totalCheckIns / 5, 1000); // 更密集
```

### 修改颜色
编辑 `moodColors` 和 `gameColors` 数组。

## 🐛 常见问题

**Q: 看不到数据？**
A: 检查 API URL 是否正确，确认服务器正在运行。

**Q: CORS 错误？**
A: 使用 `server.py` 本地服务器，或部署到支持 CORS 的服务器。

**Q: 数据不更新？**
A: 检查网络连接，查看 Processing 控制台的错误信息。

## 📝 数据格式

API 返回的 JSON 包含：
- `summary`: 总体统计
- `rankings`: 排行榜数据
- `activity`: 活动数据
- `moods`: 心情分布
- `games`: 游戏统计（新增！）

## 🎨 进阶定制

参考 `PROCESSING_SETUP.md` 获取更多自定义选项。

