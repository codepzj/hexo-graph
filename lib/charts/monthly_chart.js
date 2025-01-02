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
                            axisLabel: { fontSize: 14, fontWeight: 'bold', fontFamily: 'Microsoft YaHei, SimSun, serif' }
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
                                fontSize: 14,
                                color: '#000',
                                fontWeight: 'bold',
                                fontFamily: 'Microsoft YaHei, SimSun, serif'
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

module.exports = {generateMonthlyChart};
