function generateTagsChart(topTags, darkMode, colors) {
    const tags = JSON.stringify(
        topTags.map((tag) => ({name: tag.name, value: tag.count}))
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
                                fontSize: 14,
                                fontWeight: 'bold',
                                fontFamily: 'Microsoft YaHei, SimSun, serif'
                            },
                            color: ${JSON.stringify(colors.tagColors)},
                            labelLine: { show: true }
                        }],
                        legend: {
                            bottom: '0',
                            left: 'center',
                            data: ${tags}.map(tag => tag.name),
                            textStyle: { fontSize: 14, fontWeight: 'bold', fontFamily: 'Microsoft YaHei, SimSun, serif' }
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

module.exports = {generateTagsChart};
