const moment = require('moment');

function generateStats(hexo) {
    const posts = hexo.locals.get('posts');
    const darkMode = hexo.config.hexo_graph?.theme || "light";

    // 从配置中读取颜色
    const colorPalette = {
        heatmapColors: hexo.config.hexo_graph?.heatmapColors || ['#ACE7AE', '#69C16D', '549F57'], // Github图表绿色
        monthlyChartColor: hexo.config.hexo_graph?.monthlyColors || '#5470C6', // 月度图表颜色
        tagColors: hexo.config.hexo_graph?.tagsColors || ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE', '#3BA272', '#FC8452', '#9A60B4'], // 标签图表颜色
        categoryColors: hexo.config.hexo_graph?.categoriesColors || ['#91CC75', '#73C0DE'] // 分类图表渐变颜色
    };

    // 初始化统计对象
    const monthlyCount = {}, dailyCount = {}, tagCount = {}, categoryCount = {};

    posts.forEach(post => {
        const month = moment(post.date).format('YYYY-MM');
        const day = moment(post.date).format('YYYY-MM-DD');

        // 更新每月、每日统计
        monthlyCount[month] = (monthlyCount[month] || 0) + 1;
        dailyCount[day] = (dailyCount[day] || 0) + 1;

        // 更新标签和分类统计
        post.tags.data.forEach(tag => tagCount[tag.name] = (tagCount[tag.name] || 0) + 1);
        post.categories.data.forEach(category => categoryCount[category.name] = (categoryCount[category.name] || 0) + 1);
    });

    // 排序并提取统计数据
    const sortedMonthlyCount = Object.fromEntries(Object.entries(monthlyCount).sort((a, b) => a[0].localeCompare(b[0])));
    const sortedDailyCount = Object.entries(dailyCount).sort((a, b) => a[0].localeCompare(b[0]));
    const topTags = Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, count]) => ({ name, count }));
    const topCategories = Object.entries(categoryCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }));

    // 将数据传递到模板中
    hexo.locals.set('chartData', { monthlyCount: sortedMonthlyCount, dailyCount: sortedDailyCount, topTags, topCategories });

    // 返回包含 ECharts 配置的 HTML
    return `
        ${generateHeatmapChart(sortedDailyCount, darkMode, colorPalette)}
        ${generateMonthlyChart(sortedMonthlyCount, darkMode, colorPalette)}
        ${generateTagsChart(topTags, darkMode, colorPalette)}
        ${generateCategoriesChart(topCategories, darkMode, colorPalette)}
    `;
}

// 生成热力图
function generateHeatmapChart(sortedDailyCount, darkMode, colors) {
    const data = JSON.stringify(sortedDailyCount);
    return `
        <script>
            const heatmapChart = echarts.init(document.getElementById('heatmapChart'), '${darkMode}');
            const containerWidth = document.getElementById('heatmapChart').offsetWidth;
            const cellSize = Math.max(Math.floor(containerWidth / 58), 10);

            heatmapChart.setOption({
                tooltip: { position: 'top', formatter: params => \`\${params.value[0]}: \${params.value[1]} Articles\` },
                calendar: { top: '20%', left: 'center', range: new Date().getFullYear(), cellSize, splitLine: { lineStyle: { color: '#E0E0E0', width: 1 } }, itemStyle: { borderWidth: 1, borderColor: '#E0E0E0' }, dayLabel: { show: false }, monthLabel: { fontSize: 12, color: '#555' } },
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
        </script>
    `;
}

// 生成月份图表
function generateMonthlyChart(sortedMonthlyCount, darkMode, colors) {
    const months = JSON.stringify(Object.keys(sortedMonthlyCount));
    const counts = JSON.stringify(Object.values(sortedMonthlyCount));
    return `
        <script>
            const monthlyChart = echarts.init(document.getElementById('monthlyChart'), '${darkMode}');
            monthlyChart.setOption({
                xAxis: { type: 'category', data: ${months}, axisLabel: { fontSize: 12 } },
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
                        fontSize: 12,
                        color: '#000'
                    }
                }]
            });

            monthlyChart.on('click', function (params) {
                const [year, month] = params.name.split('-');
                window.location.href = '/archives/' + year + '/' + month;
            });
        </script>
    `;
}

// 生成标签图表
function generateTagsChart(topTags, darkMode, colors) {
    const tags = JSON.stringify(topTags.map(tag => ({ name: tag.name, value: tag.count })));
    return `
        <script>
            const tagsChart = echarts.init(document.getElementById('tagsChart'), '${darkMode}');
            tagsChart.setOption({
                tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
                series: [{
                    type: 'pie',
                    radius: '60%',
                    data: ${tags},
                    label: {
                        position: 'outside',
                        formatter: '{b} {c} ({d}%)',
                        fontSize: 12
                    },
                    color: ${JSON.stringify(colors.tagColors)},
                    labelLine: { show: true }
                }],
                legend: {
                    bottom: '0',
                    left: 'center',
                    data: ${tags}.map(tag => tag.name),
                    textStyle: { fontSize: 12 }
                }
            });

            tagsChart.on('click', function (params) {
                window.location.href = '/tags/' + params.name;
            });
        </script>
    `;
}

// 生成分类图表
function generateCategoriesChart(topCategories, darkMode, colors) {
    const categories = JSON.stringify(topCategories.map(category => ({ name: category.name, value: category.count })));
    return `
        <script>
            const categoriesChart = echarts.init(document.getElementById('categoriesChart'), '${darkMode}');
            categoriesChart.setOption({
                xAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed', color: '#ccc' } } },
                yAxis: { type: 'category', data: ${categories}.map(category => category.name).reverse(), axisLabel: { fontSize: 12 } },
                series: [{
                    name: 'Category Count',
                    type: 'bar',
                    data: ${categories}.map(category => category.value).reverse(),
                    label: {
                        show: true,
                        position: 'right',
                        formatter: params => params.value,
                        fontSize: 12,
                        color: '#000'
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
        </script>
    `;
}

module.exports = { generateStats };
