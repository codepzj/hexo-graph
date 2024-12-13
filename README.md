> hexo-graph，一个基于 echarts，集成博客热力图，博客月份统计图，分类统计图，标签统计图的多元化可交互插件。

具体效果：https://haohanxinghe.com/social/stats/

代码仓库：

- [NPMJS](https://www.npmjs.com/package/hexo-graph?activeTab=readme)
- [GitHub](https://github.com/codepzj/hexo-graph)

在此感谢 [姓王者](https://github.com/xingwangzhe)大佬**Pr**,[增加交互性，为每个统计图的子元素添加跳转](https://github.com/codepzj/hexo-graph/pull/1)

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

## 使用方法

在**任意页面**中导入以下 html 标签，一定要带 id 标签(如**heatmapChart**)

### 热力图

```html
### Blog Heatmap

<div
  id="heatmapChart"
  style="width: 100%; height: 200px; margin: 0 auto; border-radius: 10px; padding: 10px;box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);"
></div>
```

![热力图](https://image.codepzj.cn/image/202412022134428.png)

### 月份统计图

```html
<div
  id="monthlyChart"
  style="width: 100%; height: 350px; margin: 0 auto; border-radius: 10px; padding: 10px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);"
></div>
```

![月份统计图](https://image.codepzj.cn/image/202412022135436.png)

### 标签统计图

```html
<div
  id="tagsChart"
  style="width: 100%; height: 400px; margin: 0 auto; border-radius: 10px; padding: 10px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);"
></div>
```

![标签统计图](https://image.codepzj.cn/image/202412022136846.png)

### 分类统计图

```html
<div
  id="categoriesChart"
  style="width: 100%; height: 350px; margin: 0 auto; border-radius: 10px; padding: 10px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);"
></div>
```

![分类统计图](https://image.codepzj.cn/image/202412022137058.png)
