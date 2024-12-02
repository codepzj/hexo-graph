const moment = require('moment');

function generateStats(hexo) {
    const posts = hexo.locals.get('posts');

    // 初始化统计对象
    const monthlyCount = {};
    const dailyCount = {}; // 按天统计
    const tagCount = {};
    const categoryCount = {};

    // 遍历所有文章并更新统计数据
    posts.forEach(post => {
        const month = moment(post.date).format('YYYY-MM');
        const day = moment(post.date).format('YYYY-MM-DD'); // 按天统计
        monthlyCount[month] = (monthlyCount[month] || 0) + 1;
        dailyCount[day] = (dailyCount[day] || 0) + 1;

        post.tags.data.forEach(tag => {
            tagCount[tag.name] = (tagCount[tag.name] || 0) + 1;
        });

        post.categories.data.forEach(category => {
            categoryCount[category.name] = (categoryCount[category.name] || 0) + 1;
        });
    });

    // 排序统计数据
    const sortedMonthlyCount = Object.fromEntries(
        Object.entries(monthlyCount)
            .sort((a, b) => a[0].localeCompare(b[0])) // 按月份排序
    );

    // 排序日数据，适合用于热力图
    const sortedDailyCount = Object.entries(dailyCount)
        .sort((a, b) => a[0].localeCompare(b[0])) // 按日期排序
        .map(([date, count]) => [date, count]); // 转换为数组格式，适合热力图

    // 获取前8个标签
    const topTags = Object.entries(tagCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, count]) => ({ name, count }));

    // 获取前5个分类
    const topCategories = Object.entries(categoryCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

    // 将数据传递到模板中
    hexo.locals.set('chartData', {
        monthlyCount: sortedMonthlyCount,
        dailyCount: sortedDailyCount,
        topTags,
        topCategories
    });

    // 在页面插入 ECharts 配置
    return `
        <!-- ECharts 图表容器 -->
        ${generateHeatmapChart(sortedDailyCount)}
        ${generateMonthlyChart(sortedMonthlyCount)}
        ${generateTagsChart(topTags)}
        ${generateCategoriesChart(topCategories)}
    `;
}

function generateHeatmapChart(sortedDailyCount) {
    const data = JSON.stringify(sortedDailyCount);
    return `
        <script>
            if(document.getElementById('heatmapChart')){
                const heatmapChart = echarts.init(document.getElementById('heatmapChart'));
                const containerWidth = document.getElementById('heatmapChart').offsetWidth;
                const cellSize = Math.max(Math.floor(containerWidth / 60));
                console.log(cellSize)
                heatmapChart.setOption({
                    tooltip: {
                        position: 'top',
                        formatter: params => \`\${params.value[0]}: \${params.value[1]} Articles\`
                    },
                    visualMap: {
                        min: 0,
                        max: Math.max(...${data}.map(item => item[1])),
                        calculable: false,
                        orient: 'horizontal', // 横向布局
                        right: '5%',
                        bottom: '5%',
                        inRange: { color: ['#FFEFD5', '#FFA07A', '#FF4500'] }
                    },
                    calendar: {
                        top: '20%',
                        left: 'center',
                        range: new Date().getFullYear(),
                        cellSize: cellSize, // 方格大小
                        splitLine: { lineStyle: { color: '#E0E0E0', width: 1 } },
                        itemStyle: { borderWidth: 1, borderColor: '#E0E0E0' },
                        dayLabel: { firstDay: 1, fontSize: 12, color: '#333', show: false },
                        monthLabel: { fontSize: 12, color: '#555' }
                    },
                    series: [{
                        type: 'heatmap',
                        coordinateSystem: 'calendar',
                        data: ${data}
                    }]
                });
            }
        </script>
    `;
}

function generateMonthlyChart(sortedMonthlyCount) {
    const months = JSON.stringify(Object.keys(sortedMonthlyCount));
    const counts = JSON.stringify(Object.values(sortedMonthlyCount));
    return `
        <script>
            if(document.getElementById('monthlyChart')){
                const monthlyChart = echarts.init(document.getElementById('monthlyChart'));
                monthlyChart.setOption({
                    xAxis: {
                        type: 'category',
                        data: ${months},
                        axisLabel: { fontSize: 12 }
                    },
                    yAxis: {
                        type: 'value',
                        splitLine: { lineStyle: { type: 'dashed', color: '#ccc' } }
                    },
                    series: [{
                        name: 'Articles',
                        type: 'line',
                        data: ${counts},
                        smooth: true,
                        lineStyle: { color: '#5470C6', width: 2 },
                        itemStyle: { color: '#5470C6' },
                        areaStyle: { color: 'rgba(84, 112, 198, 0.4)' },
                        animationDuration: 1000
                    }]
                });
            }
        </script>
    `;
}

function generateTagsChart(topTags) {
    const tags = JSON.stringify(topTags.map(tag => ({ name: tag.name, value: tag.count })));
    return `
        <script>
            if(document.getElementById('tagsChart')){    
                const tagsChart = echarts.init(document.getElementById('tagsChart'));
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
                        color: ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE', '#3BA272', '#FC8452', '#9A60B4'],
                        animationDuration: 1000
                    }],
                    legend: {
                        bottom: '0',
                        left: 'center',
                        data: ${tags}.map(tag => tag.name),
                        textStyle: { fontSize: 12 }
                    }
                });
            }
        </script>
    `;
}

function generateCategoriesChart(topCategories) {
    const categories = JSON.stringify(topCategories.map(category => ({ name: category.name, value: category.count })));
    return `
        <script>
            if(document.getElementById('categoriesChart')){
                const categoriesChart = echarts.init(document.getElementById('categoriesChart'));
                categoriesChart.setOption({
                    xAxis: {
                        type: 'value',
                        splitLine: { lineStyle: { type: 'dashed', color: '#ccc' } }
                    },
                    yAxis: {
                        type: 'category',
                        data: ${categories}.map(category => category.name).reverse(),
                        axisLabel: { fontSize: 12 }
                    },
                    series: [{
                        name: 'Category Count',
                        type: 'bar',
                        data: ${categories}.map(category => category.value).reverse(),
                        label: {
                            show: true,
                            position: 'right',
                            fontSize: 12
                        },
                        itemStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                                { offset: 0, color: '#91CC75' },
                                { offset: 1, color: '#73C0DE' }
                            ])
                        },
                        animationDuration: 1000
                    }]
                });
            }
        </script>
    `;
}

module.exports = { generateStats };
