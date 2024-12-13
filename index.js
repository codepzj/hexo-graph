'use strict';

hexo.extend.filter.register('after_render:html', function (data) {
    // 获取生成的统计脚本
    const scripts = require('./lib/generate').generateStats(hexo);
    // 将脚本插入到页面的 `</body>` 前面
    return data.replace(
        '</body>',
        `<script src="https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.min.js"></script>${scripts}</body>`  // 在 </body> 标签前插入生成的脚本
    );
});

