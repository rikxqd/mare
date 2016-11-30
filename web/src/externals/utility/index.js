// 把对象拼成 url 地址参数格式
const urlencode = (params) => {
    const usp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => usp.set(k, v));
    return usp.toString();
};

// 把 url 地址参数格式转换回对象
const urldecode = (paramsString) => {
    const usp = new URLSearchParams(paramsString);
    const params = {};
    for (const [k, v] of usp.entries()) {
        params[k] = v;
    }
    return params;
};

// 提取 url 的参数对象
const parseUrlQuery = (url) => {
    const paramsString = url.split('?')[1];
    return urldecode(paramsString);
};

// 重定向
const locationRedirect = (url, query) => {
    if (!query) {
        location.href = url;
        return;
    }
    const paramsString = urlencode(query);
    location.href = `${url}?${paramsString}`;
};

// Promise 顺序执行
const promiseSeq = (tasks) => {
    return tasks.reduce((p, t) => {
        return p.then(() => t());
    }, Promise.resolve());
};

// 简单粗暴深复制
const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};

// 休眠
const sleep = (ms) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};

// 按姓名拼音排序，修复多音字问题
let pinyinSurnameCompare;
{
    const heteronymTable = {
        '曾': '增',
    };
    const heteronym = (text) => {
        if (text === '') {
            return '';
        }
        const src = text[0];
        const dst = heteronymTable[src];
        if (!dst) {
            return text;
        }
        return text.replace(src, dst);
    };
    const locale = 'zh-CN-u-co-pinyin';
    pinyinSurnameCompare = (a, b) => {
        a = heteronym(a);
        b = heteronym(b);
        return a.localeCompare(b, locale);
    };
}

export {
    urlencode,
    urldecode,
    parseUrlQuery,
    locationRedirect,
    promiseSeq,
    deepClone,
    sleep,
    pinyinSurnameCompare,
};
