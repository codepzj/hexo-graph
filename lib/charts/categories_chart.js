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
                            axisLabel: { fontSize: 14, fontWeight: 'bold', fontFamily: 'Microsoft YaHei, SimSun, serif' }
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

module.exports = {generateCategoriesChart};
