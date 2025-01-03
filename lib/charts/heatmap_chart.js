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
                    var year = parseInt(heatmapChartDom.getAttribute('year')) || new Date().getFullYear();
                    const minYear = Math.min(...${data}.map(item => parseInt(item[0].split('-')[0])));
                    const maxYear = Math.max(...${data}.map(item => parseInt(item[0].split('-')[0])));
                    
                    // 如果初始年份不在有效范围内，设置为最小年份
                    if (year < minYear || year > maxYear) {
                        year = minYear;
                    }

                    function updateHeatmap(newYear) {
                        // 循环轮播图
                        if (newYear > maxYear) {
                            newYear = minYear;
                        } else if (newYear < minYear) {
                            newYear = maxYear;
                        }

                        year = newYear;
                        heatmapChart.setOption({
                            calendar: {
                                range: year,
                                cellSize,        
                            },
                            series: [{
                                data: ${data}.filter(item => item[0].startsWith(String(year)))
                            }]
                        });
                    }

                    heatmapChart.setOption({
                        tooltip: { position: 'top', formatter: params => \`\${params.value[0]}: \${params.value[1]} Articles\` },
                        calendar: { 
                            top: '20%', left: 'center', range: year, cellSize, 
                            splitLine: { lineStyle: { color: '#E0E0E0', width: 1 } }, 
                            itemStyle: { borderWidth: 1, borderColor: '#E0E0E0' }, 
                            dayLabel: { show: false }, 
                            monthLabel: { fontSize: 14, color: '#555', fontWeight: 'bold', fontFamily: 'Microsoft YaHei, SimSun, serif' }
                        },
                        visualMap: { 
                            min: 0, 
                            max: Math.max(...${data}.map(item => item[1])), 
                            orient: 'horizontal', 
                            right: '5%', 
                            bottom: '5%', 
                            inRange: { color: ${JSON.stringify(colors.heatmapColors)} } 
                        },
                        series: [{
                            type: 'heatmap',
                            coordinateSystem: 'calendar',
                            data: ${data}.filter(item => item[0].startsWith(String(year))),
                        }]
                    });

                    heatmapChart.on('click', function (params) {
                        if (params.componentType === 'series') {
                            const [year, month] = params.value[0].split('-');
                            window.location.href = '/archives/' + year + '/' + month;
                        }
                    });
                    
                    const buttonLeft = document.createElement('button');
                    const buttonRight = document.createElement('button');
        
                    // set button style
                    buttonLeft.innerText = '<';
                    buttonRight.innerText = '>';
                    buttonLeft.style.left = '5px';
                    buttonRight.style.right = '5px';
                    buttonLeft.style.position = buttonRight.style.position = 'absolute';
                    buttonLeft.style.top = buttonRight.style.top = '50%';
                    buttonLeft.style.transform = buttonRight.style.transform = 'translateY(-50%)';
                    buttonLeft.style.fontSize = buttonRight.style.fontSize = '24px';
                    buttonLeft.style.cursor = buttonRight.style.cursor = 'pointer';
                    buttonLeft.style.display = buttonRight.style.display = 'none';
                    buttonLeft.style.background = buttonRight.style.background = 'none';
                    buttonLeft.style.border = buttonRight.style.border = 'none';
                    buttonLeft.style.padding = buttonRight.style.padding = '0';
                    
                    heatmapChartDom.style.position = 'relative';
                    heatmapChartDom.appendChild(buttonLeft);
                    heatmapChartDom.appendChild(buttonRight);
        
                    buttonLeft.addEventListener('click', function () {
                        updateHeatmap(year - 1);
                    });
        
                    buttonRight.addEventListener('click', function () {
                        updateHeatmap(year + 1);
                    });
        
                    heatmapChartDom.addEventListener('mousemove', function (e) {
                        const rect = heatmapChartDom.getBoundingClientRect();
                        const buttonWidth = 30;
        
                        // check mouse position
                        if (e.clientX - rect.left < buttonWidth + 10) { // 10px is extra click area
                            buttonLeft.style.display = 'block';
                        } else {
                            buttonLeft.style.display = 'none';
                        }
        
                        if (rect.right - e.clientX < buttonWidth + 10) { // 10px is extra click area
                            buttonRight.style.display = 'block';
                        } else {
                            buttonRight.style.display = 'none';
                        }
                    });
        
                    heatmapChartDom.addEventListener('mouseleave', function () {
                        buttonLeft.style.display = 'none';
                        buttonRight.style.display = 'none';
                    });
                }
            })
        </script>
    `;
}

module.exports = {generateHeatmapChart};
