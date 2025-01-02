function generateCategoriesTreeChart(categoryTree, darkMode, colors) {
    const data = JSON.stringify([categoryTree]);
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
                            initialTreeDepth: -1,
                            top: '5%',
                            bottom: '10%',
                            left: '0%',
                            right: '0%',
                            symbolSize: 15,
                            layout: 'orthogonal',
                            orient: 'TB',
                            itemStyle: {
                                color: '${colors.categoryColors[0]}',
                                borderColor: '${colors.categoryColors[1]}'
                            },
                            label: {
                                position: 'bottom',
                                verticalAlign: 'middle',
                                align: 'center',
                                fontSize: 14,
                                distance: 28,
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
                            expandAndCollapse: true
                        }]
                    });

                    treeChart.on('dblclick', function (params) {
                        if (params.data && params.data.path) {
                            window.location.href = '/categories/' + params.data.path;
                        }
                    });
                }
            });
        </script>
    `;
}

module.exports = {generateCategoriesTreeChart};
