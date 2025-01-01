> hexo-graph，一个基于 echarts，集成博客热力图，博客月份统计图，分类统计图，标签统计图的多元化可交互插件。

具体效果：https://haohanxinghe.com/social/stats/

代码仓库：

- [NPMJS](https://www.npmjs.com/package/hexo-graph?activeTab=readme)
- [GitHub](https://github.com/codepzj/hexo-graph)

## 安装依赖

```bash
pnpm i moment # 使用hexo-graph先安装相关依赖
pnpm i hexo-graph
```

在根目录的`config.yml`中配置:
**light 主题配置**

```yaml
hexo_graph:
  theme: "light" #light/dark 不设置或不填默认是light
```

**dark 主题配置**

```yaml
hexo_graph:
  theme: "dark" #light/dark 不设置或不填默认是light
```

**进阶主题配色**
目前该插件支持自定义颜色，monthlyColors 只允许填一个主题颜色，其他支持多个
不配置则采用默认配置

```yaml
hexo_graph:
  theme: "light" # 或者 'dark'
  monthlyColors:
    - "#FF9A8B" # 粉红色与橙色的渐变
  heatmapColors:
    - "#A3DFF7" # 浅天蓝色
    - "#B5D8C4" # 浅绿松石色
    - "#F7C9B7" # 浅珊瑚色
  tagsColors:
    - "#F2A7D1" # 粉紫色
    - "#F5E05D" # 明亮的黄绿色
    - "#D74B76" # 玫瑰红色
    - "#1EAEAC" # 湖蓝色
    - "#FFC836" # 浅橙色
    - "#A8A2FF" # 薰衣草紫
    - "#A9E9FF" # 浅天蓝色
    - "#FF6767" # 鲜艳红色
  categoriesColors:
    - "#4C8C99" # 青蓝色
    - "#F9B5E2" # 浅桃粉色
```

**Heatmap年份配置**
可以在 html 标签中添加`year`属性，来指定年份，不填默认为当前年份

```html
### Blog Heatmap

<div
  id="heatmapChart"
  year="2024"
  style="width: 100%; height: 200px; overflow-x: auto; overflow-y: hidden; border-radius: 10px; padding: 10px;box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);"
></div>
```


![image-20241231223115464](https://image.codepzj.cn/image/202412312231916.png)

![image-20241231223150999](https://image.codepzj.cn/image/202412312231480.png)

## 使用方法

在**任意页面**中导入以下 html 标签

```html
### Blog Heatmap

<div
  id="heatmapChart"
  style="width: 100%; height: 200px; overflow-x: auto; overflow-y: hidden; border-radius: 10px; padding: 10px;box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);"
></div>

### Monthly Article Statistics

<div
  id="monthlyChart"
  style="width: 100%; height: 350px; overflow-x: auto; overflow-y: hidden; border-radius: 10px; padding: 10px;box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);"
></div>

### Tag Statistics

<div
  id="tagsChart"
  style="width: 100%; height: 400px; overflow-x: auto; overflow-y: hidden; border-radius: 10px; padding: 10px;box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);"
></div>

### Category Statistics

<div
  id="categoriesChart"
  style="width: 100%; height: 350px;; overflow-x: auto; overflow-y: hidden; border-radius: 10px; padding: 10px;box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);"
></div>
```
