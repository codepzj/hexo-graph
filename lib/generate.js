const moment = require("moment");
const {generateHeatmapChart} = require("./charts/heatmap_chart");
const {generateMonthlyChart} = require("./charts/monthly_chart");
const {generateTagsChart} = require("./charts/tags_chart");
const {generateCategoriesChart} = require("./charts/categories_chart");
const {generateCategoriesTreeChart} = require("./charts/categories_tree_chart");
const {getColorPalette} = require("./utils/color_palette");
const {processPosts} = require("./utils/stats");

function generateStats(hexo) {
  const posts = hexo.locals.get("posts");
  const darkMode = hexo.config.hexo_graph?.theme || "light";
    const colorPalette = getColorPalette(hexo);

    const {monthlyCount, dailyCount, tagCount, categoryCount, categoryTree} = processPosts(posts);

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
      .map(([name, count]) => ({name, count}));
  const topCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({name, count}));

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

module.exports = { generateStats };
