function getColorPalette(hexo) {
    return {
        heatmapColors: hexo.config.hexo_graph?.heatmapColors || [
            "#ACE7AE",
            "#69C16D",
            "#549F57",
        ],
        monthlyChartColor: hexo.config.hexo_graph?.monthlyColors || "#5470C6",
        tagColors: hexo.config.hexo_graph?.tagsColors || [
            "#5470C6",
            "#91CC75",
            "#FAC858",
            "#EE6666",
            "#73C0DE",
            "#3BA272",
            "#FC8452",
            "#9A60B4",
        ],
        categoryColors: hexo.config.hexo_graph?.categoriesColors || [
            "#91CC75",
            "#73C0DE",
        ],
    };
}

module.exports = {getColorPalette};
