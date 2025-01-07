function generateHeatmapChart(sortedDailyCount, darkMode, colors) {
    const data = JSON.stringify(sortedDailyCount);
    const heatmapColors = JSON.stringify(colors.heatmapColors);
    return `
        <script>
            document.addEventListener("DOMContentLoaded", function() {
                const heatmapChartDom = document.getElementById('heatmapChart');
                if(heatmapChartDom){
                    const heatmapChart = echarts.init(heatmapChartDom, '${darkMode}');
                    const cellSize = [18, 18];
                    
                    const groupByYear = (data) => {
                        const result = {};
                        data.forEach(([date, value]) => {
                            const [year] = date.split('-').map(Number);
                            if (!result[year]) {
                                result[year] = [];
                            }
                            result[year].push([date, value]);
                        });
                        return result;
                    };
                    
                    const groupedData = groupByYear(${data});
                    const years = Object.keys(groupedData).reverse();
                    
                    var initYear = parseInt(heatmapChartDom.getAttribute('year')) || new Date().getFullYear();
                    const minYear = years[years.length - 1];
                    const maxYear = years[0];
                    if (initYear < minYear || initYear > maxYear) {
                        initYear = maxYear;
                    }
                    console.log('[hexo-graph]generateHeatmapChart|initYear:', initYear, 'minYear:', minYear, 'maxYear:', maxYear);
                    
                    heatmapChart.setOption({
                        grid: {},
                        tooltip: { 
                            position: 'top', 
                            formatter: params => \`\${params.value[0]}: \${params.value[1]} Articles\` 
                        },
                        calendar: { 
                            top: '10%',
                            left: 'left', 
                            right: '8%',
                            range: initYear,
                            cellSize: cellSize, 
                            splitLine: { lineStyle: { color: '#E0E0E0', width: 1 } }, 
                            itemStyle: { borderWidth: 1, borderColor: '#E0E0E0' }, 
                            dayLabel: { show: false },
                            monthLabel: { show: true },
                            yearLabel: { show: false },
                        },
                        visualMap: { 
                            show: true,
                            right: '8%',
                            bottom: '5%',
                            type: 'piecewise',
                            orient: 'horizontal',
                            text: ['More', 'Less'],
                            min: 0,
                            max: Math.max(...groupedData[initYear].map(item => item[1])),
                            inRange: { color: ${heatmapColors} }
                        },
                        legend: {
                            type: 'scroll',
                            icon: 'none',
                            data: years,
                            orient: 'vertical',
                            top: '5%',
                            right: 'right',
                            itemWidth: 20,
                            itemHeight: 20,
                            itemGap: 10,
                            pageIconSize: 10,
                            pageTextStyle: { fontSize: 14 },
                            selectedMode: 'single',
                        },
                        series: years.map(year => ({
                            type: 'heatmap',
                            coordinateSystem: 'calendar',
                            data: groupedData[year],
                            name: year,
                            emphasis: {
                                disabled: true,
                            },
                            silent: year !== initYear,
                        })),
                    });
                    
                    // init selected year
                    heatmapChart.dispatchAction({
                        type: 'legendSelect',
                        name: initYear,
                    });
                    
                    heatmapChart.on('legendselectchanged', function(params) {
                        console.log('[hexo-graph]generateHeatmapChart|legendselectchanged:', params);
                        const selectedYear = Object.keys(params.selected).find(key => params.selected[key]);
                        if (selectedYear && groupedData[selectedYear]) {
                            heatmapChart.setOption({
                                calendar: {
                                    range: selectedYear,
                                },
                                visualMap: {
                                    max: Math.max(...groupedData[selectedYear].map(item => item[1])),
                                },
                                series: years.map(year => ({
                                    type: 'heatmap',
                                    coordinateSystem: 'calendar',
                                    data: groupedData[year],
                                    name: year,
                                    emphasis: {
                                        disabled: true,
                                    },
                                    silent: year !== selectedYear,
                                })),
                            });
                        }
                    });
                    
                    heatmapChart.on('click', function (params) {
                        if (params.componentType === 'series') {
                            const [year, month] = params.value[0].split('-');
                            window.location.href = '/archives/' + year + '/' + month;
                        }
                    });
                }
            });
        </script>
    `;
}

module.exports = {generateHeatmapChart};