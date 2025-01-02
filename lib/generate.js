const moment = require("moment");

function generateStats(hexo) {
  const posts = hexo.locals.get("posts");
  const darkMode = hexo.config.hexo_graph?.theme || "light";

  // 从配置中读取颜色
  const colorPalette = {
    heatmapColors: hexo.config.hexo_graph?.heatmapColors || [
      "#ACE7AE",
      "#69C16D",
      "549F57",
    ], // Github图表绿色
    monthlyChartColor: hexo.config.hexo_graph?.monthlyColors || "#5470C6", // 月度图表颜色
    tagColors: hexo.config.hexo_graph?.tagsColors || [
      "#5470C6",
      "#91CC75",
      "#FAC858",
      "#EE6666",
      "#73C0DE",
      "#3BA272",
      "#FC8452",
      "#9A60B4",
    ], // 标签图表颜色
    categoryColors: hexo.config.hexo_graph?.categoriesColors || [
      "#91CC75",
      "#73C0DE",
    ], // 分类图表渐变颜色
  };
  // 初始化统计对象
  const monthlyCount = {},
    dailyCount = {},
    tagCount = {},
    categoryCount = {};
  const categoryTree = {
    name: hexo.config.title || "Categories",
    children: [],
    count: 0,
    path: "",
  };
  posts.forEach((post) => {
    const month = moment(post.date).format("YYYY-MM");
    const day = moment(post.date).format("YYYY-MM-DD");

    // 更新每月、每日统计
    monthlyCount[month] = (monthlyCount[month] || 0) + 1;
    dailyCount[day] = (dailyCount[day] || 0) + 1;

    // 更新标签和分类统计
    post.tags.data.forEach(
      (tag) => (tagCount[tag.name] = (tagCount[tag.name] || 0) + 1)
    );
    post.categories.data.forEach(
      (category) =>
        (categoryCount[category.name] = (categoryCount[category.name] || 0) + 1)
    );
    if (post.categories.length > 0) {
      let current = categoryTree;
      let path = "";
      post.categories.data.forEach((category, index) => {
        path = path ? `${path}/${category.name}` : `${category.name}`;
        let found = false;
        if (!current.children) {
          current.children = [];
        }
        // Find existing category in children array
        for (let child of current.children) {
          if (child.name === category.name) {
            child.count += 1;
            current = child;
            found = true;
            break;
          }
        }
        // Create new category if not found
        if (!found) {
          let newNode = {
            name: category.name,
            children: [],
            count: 1,
            path: path,
          };
          current.children.push(newNode);
          current = newNode;
        }
      });
    }
  });
  // 排序并提取统计数据
  const sortedMonthlyCount = Object.fromEntries(
    Object.entries(monthlyCount).sort((a, b) => a[0].localeCompare(b[0]))
  );
  const sortedDailyCount = Object.entries(dailyCount).sort((a, b) =>
    a[0].localeCompare(b[0])
  );
  const topTags = Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));
  const topCategories = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));
  // 将数据传递到模板中
  hexo.locals.set("chartData", {
    monthlyCount: sortedMonthlyCount,
    dailyCount: sortedDailyCount,
    topTags,
    topCategories,
  });

  // 返回包含 ECharts 配置的 HTML
  return `
        ${generateHeatmapChart(sortedDailyCount, darkMode, colorPalette)}
        ${generateMonthlyChart(sortedMonthlyCount, darkMode, colorPalette)}
        ${generateTagsChart(topTags, darkMode, colorPalette)}
        ${generateCategoriesChart(topCategories, darkMode, colorPalette)}
        ${generateCategoriesTreeChart(categoryTree, darkMode, colorPalette)}
    `;
}

// 生成热力图
function generateHeatmapChart(sortedDailyCount, darkMode, colors) {
  const data = JSON.stringify(sortedDailyCount);
  return `
        <script>
            document.addEventListener("DOMContentLoaded", function() {
                const heatmapChartDom = document.getElementById('heatmapChart');
                if(heatmapChartDom){
                    const heatmapChart = echarts.init(heatmapChartDom, '${darkMode}');
                    const containerWidth = document.getElementById('heatmapChart').offsetWidth;
                    const cellSize = Math.max(Math.floor(containerWidth / 58), 10);
                    var year = document.getElementById('heatmapChart').getAttribute('year') || new Date().getFullYear();

                    heatmapChart.setOption({
                        tooltip: { position: 'top', formatter: params => \`\${params.value[0]}: \${params.value[1]} Articles\` },
                        calendar: { 
                            top: '20%', left: 'center', range: year, cellSize, 
                            splitLine: { lineStyle: { color: '#E0E0E0', width: 1 } }, 
                            itemStyle: { borderWidth: 1, borderColor: '#E0E0E0' }, 
                            dayLabel: { show: false }, 
                            monthLabel: { fontSize: 14, color: '#555', fontWeight: 'bold', fontFamily: 'Microsoft YaHei, SimSun, serif' }
                        },
                        visualMap: { min: 0, max: Math.max(...${data}.map(item => item[1])), orient: 'horizontal', right: '5%', bottom: '5%', inRange: { color: ${JSON.stringify(colors.heatmapColors)} } },
                        series: [{
                            type: 'heatmap',
                            coordinateSystem: 'calendar',
                            data: ${data},
                        }]
                    });

                    heatmapChart.on('click', function (params) {
                        if (params.componentType === 'series') {
                            const [year, month] = params.value[0].split('-');
                            window.location.href = '/archives/' + year + '/' + month;
                        }
                    });
                }
            })
        </script>
    `;
}

// 生成月份图表
function generateMonthlyChart(sortedMonthlyCount, darkMode, colors) {
  const months = JSON.stringify(Object.keys(sortedMonthlyCount));
  const counts = JSON.stringify(Object.values(sortedMonthlyCount));
  return `
        <script>
            document.addEventListener("DOMContentLoaded", function() {
                const monthlyChartDom = document.getElementById('monthlyChart');
                if(monthlyChartDom){
                    const monthlyChart = echarts.init(monthlyChartDom, '${darkMode}');
                    monthlyChart.setOption({
                        xAxis: { 
                            type: 'category', 
                            data: ${months}, 
                            axisLabel: { fontSize: 14, fontWeight: 'bold', fontFamily: 'Microsoft YaHei, SimSun, serif' }  // 使用有衬线字体，稍大一点
                        },
                        yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed', color: '#ccc' } } },
                        series: [{
                            name: 'Articles',
                            type: 'line',
                            data: ${counts},
                            smooth: true,
                            lineStyle: { color: '${colors.monthlyChartColor}', width: 2 },
                            itemStyle: { color: '${colors.monthlyChartColor}' },
                            areaStyle: { color: 'rgba(84, 112, 198, 0.4)' },
                            symbolSize: 10,
                            label: {
                                show: true,
                                position: 'top',
                                formatter: params => params.value,
                                fontSize: 14,  // 稍大字体
                                color: '#000',
                                fontWeight: 'bold',
                                fontFamily: 'Microsoft YaHei, SimSun, serif'  // 使用有衬线字体
                            }
                        }]
                    });

                    monthlyChart.on('click', function (params) {
                        const [year, month] = params.name.split('-');
                        window.location.href = '/archives/' + year + '/' + month;
                    });
                }
            })
        </script>
    `;
}

// 生成标签图表
function generateTagsChart(topTags, darkMode, colors) {
  const tags = JSON.stringify(
    topTags.map((tag) => ({ name: tag.name, value: tag.count }))
  );
  return `
        <script>
            document.addEventListener("DOMContentLoaded", function() {
                const tagsChartDom = document.getElementById('tagsChart');
                if(tagsChartDom){
                    const tagsChart = echarts.init(tagsChartDom, '${darkMode}');
                    tagsChart.setOption({
                        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
                        series: [{
                            type: 'pie',
                            radius: '60%',
                            data: ${tags},
                            label: {
                                position: 'outside',
                                formatter: '{b} {c} ({d}%)',
                                fontSize: 14,  // 稍大字体
                                fontWeight: 'bold',
                                fontFamily: 'Microsoft YaHei, SimSun, serif'  // 使用有衬线字体
                            },
                            color: ${JSON.stringify(colors.tagColors)},
                            labelLine: { show: true }
                        }],
                        legend: {
                            bottom: '0',
                            left: 'center',
                            data: ${tags}.map(tag => tag.name),
                            textStyle: { fontSize: 14, fontWeight: 'bold', fontFamily: 'Microsoft YaHei, SimSun, serif' }  // 使用有衬线字体
                        }
                    });

                    tagsChart.on('click', function (params) {
                        window.location.href = '/tags/' + params.name;
                    });
                }
            })
        </script>
    `;
}

// 生成分类图表
//留着吧，万一哪天能用在别的地方呢
function generateCategoriesChart(topCategories, darkMode, colors) {
  const categories = JSON.stringify(
    topCategories.map((category) => ({
      name: category.name,
      value: category.count,
    }))
  );
  return `
        <script>
            document.addEventListener("DOMContentLoaded", function() {
                const categoriesChartDom = document.getElementById('categoriesChart');
                if(categoriesChartDom){
                    const categoriesChart = echarts.init(categoriesChartDom, '${darkMode}');
                    categoriesChart.setOption({
                        xAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed', color: '#ccc' } } },
                        yAxis: { 
                            type: 'category', 
                            data: ${categories}.map(category => category.name).reverse(), 
                            axisLabel: { fontSize: 14, fontWeight: 'bold', fontFamily: 'Microsoft YaHei, SimSun, serif' }  // 使用有衬线字体，稍大一点
                        },
                        series: [{
                            name: 'Category Count',
                            type: 'bar',
                            data: ${categories}.map(category => category.value).reverse(),
                            label: {
                                show: true,
                                position: 'right',
                                formatter: params => params.value,
                                fontSize: 14,
                                color: '#000',
                                fontWeight: 'bold',
                                fontFamily: 'Microsoft YaHei, SimSun, serif'
                            },
                            itemStyle: {
                                color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                                    { offset: 0, color: '${colors.categoryColors[0]}' },
                                    { offset: 1, color: '${colors.categoryColors[1]}' }
                                ])
                            }
                        }]
                    });

                    categoriesChart.on('click', function (params) {
                        window.location.href = '/categories/' + params.name;
                    });
                }
            });
        </script>
    `;
}
//正好仿照上面的传参，省劲了
function generateCategoriesTreeChart(categoryTree, darkMode, colors) {
  const data = JSON.stringify([categoryTree]); //只有一个根节点，就是博客标题
  return `
        <script>
            document.addEventListener("DOMContentLoaded", function() {
                const categoriesTreeChartDom = document.getElementById('categoriesTreeChart');
                if(categoriesTreeChartDom){
                    const treeChart = echarts.init(categoriesTreeChartDom, '${darkMode}');
                    treeChart.setOption({
                        title: {
                            text: '操作提示：单击展开分类，双击进入具体分类页面',
                            textStyle: {
                                fontSize: 12,
                                color: '#999',
                                fontWeight: 'normal'
                            },
                            bottom: 0,
                            left: 'center'
                        },
                        tooltip: {
                            trigger: 'item',
                            triggerOn: 'mousemove'
                        },
                        series: [{
                            type: 'tree',
                            data: ${data},
                            initialTreeDepth: -1,    // 默认展开所有节点
                            top: '5%',           // 调整上边距
                            bottom: '10%',       // 调整下边距，为提示文字留出更多空间
                            left: '0%',          // 调整左边距
                            right: '0%',        // 调整右边距
                            symbolSize: 15,      // 增大节点大小
                            layout: 'orthogonal',// 使用正交布局
                            orient: 'TB',        // 从左到右布局
                            itemStyle: {
                                color: '${colors.categoryColors[0]}',
                                borderColor: '${colors.categoryColors[1]}'
                            },
                            label: {
                                position: 'bottom',
                                verticalAlign: 'middle',
                                align: 'center',
                                fontSize: 14,    // 增大字体
                                distance: 28,    // 标签与节点的距离
                                formatter: function(params) {
                                    return params.data.name + (params.data.count ? ' (' + params.data.count + ')' : '');
                                }
                            },
                            leaves: {
                                label: {
                                    position: 'top',
                                    verticalAlign: 'middle',
                                    align: 'center'
                                }
                            },
                            emphasis: {
                                focus: 'descendant'
                            },
                            expandAndCollapse: true,
                            animationDuration: 550,
                            animationDurationUpdate: 750,
                            lineStyle: {
                                width: 1.5,      // 增加线条宽度
                                curveness: 0.5
                            },
                            nodeAlign: 'justify',// 节点对齐方式
                            levelStep: 200       // 增加层级间距
                        }]
                    });

                    let lastClickTime = 0;
                    let timer = null;

                    treeChart.on('click', function (params) {
                        const currentTime = new Date().getTime();
                        const timeDiff = currentTime - lastClickTime;
                        
                        // 清除之前的定时器
                        if (timer) {
                            clearTimeout(timer);
                        }

                        // 如果两次点击间隔小于300ms，认为是双击
                        if (timeDiff < 300) {
                            // 双击事件 - 跳转链接
                            if (params.data.path) {
                                window.location.href = '/categories/' + params.data.path;
                            }
                        } else {
                            // 单击事件 - 设置延时以区分双击
                            timer = setTimeout(() => {
                                // 获取当前节点的展开状态
                                const expandedNodes = treeChart.getOption().series[0].data[0];
                                // 使用路径查找节点
                                const currentNode = findNodeByPath(expandedNodes, params.data.path || '');
                                if (currentNode) {
                                    // 切换展开/收起状态
                                    currentNode.collapsed = !currentNode.collapsed;
                                    // 更新图表
                                    treeChart.setOption({
                                        series: [{
                                            data: [expandedNodes]
                                        }]
                                    });
                                }
                            }, 300);
                        }
                        
                        lastClickTime = currentTime;
                    });

                    // 使用路径查找节点的新函数
                    function findNodeByPath(tree, targetPath) {
                        if (!targetPath) return null;
                        
                        // 如果是根节点
                        if (tree.path === targetPath) {
                            return tree;
                        }

                        // 递归查找子节点
                        if (tree.children) {
                            for (let child of tree.children) {
                                const found = findNodeByPath(child, targetPath);
                                if (found) return found;
                            }
                        }
                        return null;
                    }
                }
            })
        </script>
    `;
}

module.exports = { generateStats };
