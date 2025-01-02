const moment = require("moment");

function processPosts(posts) {
    const monthlyCount = {},
        dailyCount = {},
        tagCount = {},
        categoryCount = {};
    const categoryTree = {
        name: "Categories",
        children: [],
        count: 0,
        path: "",
    };

    posts.forEach((post) => {
        const month = moment(post.date).format("YYYY-MM");
        const day = moment(post.date).format("YYYY-MM-DD");

        // 更新每月、每日统计
        monthlyCount[month] = (monthlyCount[month] || 0) + 1;
        dailyCount[day] = (dailyCount[day] || 0) + 1;

        // 更新标签和分类统计
        post.tags.data.forEach(
            (tag) => (tagCount[tag.name] = (tagCount[tag.name] || 0) + 1)
        );
        post.categories.data.forEach(
            (category) =>
                (categoryCount[category.name] = (categoryCount[category.name] || 0) + 1)
        );
        updateCategoryTree(post, categoryTree);
    });

    return {monthlyCount, dailyCount, tagCount, categoryCount, categoryTree};
}

function updateCategoryTree(post, categoryTree) {
    if (post.categories.length > 0) {
        let current = categoryTree;
        let path = "";
        post.categories.data.forEach((category) => {
            path = path ? `${path}/${category.name}` : `${category.name}`;
            let found = false;
            if (!current.children) {
                current.children = [];
            }
            // Find existing category in children array
            for (let child of current.children) {
                if (child.name === category.name) {
                    child.count += 1;
                    current = child;
                    found = true;
                    break;
                }
            }
            // Create new category if not found
            if (!found) {
                let newNode = {
                    name: category.name,
                    children: [],
                    count: 1,
                    path: path,
                };
                current.children.push(newNode);
                current = newNode;
            }
        });
    }
}

module.exports = {processPosts};
