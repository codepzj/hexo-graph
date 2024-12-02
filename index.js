'use strict';

// src/index.js 或 hexo 配置目录中的 index.js
hexo.extend.filter.register('after_render:html', function (data) {
    // 获取生成的统计脚本
    const scripts = require('./lib/generate').generateStats(hexo);
    // 将脚本插入到页面的 `</body>` 前面
    data = data.replace(
        '</body>',  // 寻找 </body> 标签
        `<script src="https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.min.js"></script></body>`  // 在 </body> 标签前插入生成的脚本
    );
    
    data = data.replace(
        '</body>',  // 寻找 </body> 标签
        `${scripts}</body>`  // 在 </body> 标签前插入生成的脚本
    );

    return data;

});

