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

// 秒数转时分秒
const s2hms = (seconds) => {
    let m = Math.floor(seconds / 60);
    const s = seconds % 60;
    const h = Math.floor(m / 60);
    m = m % 60;
    return {h, m, s};
};

// 秒数转时分秒格式化
const s2hmsf = (seconds) => {
    const pad = (v) => String(v).padLeft(2, '0');
    const {h, m, s} = s2hms(seconds);
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
};

export {
    urlencode,
    urldecode,
    parseUrlQuery,
    locationRedirect,
    promiseSeq,
    deepClone,
    sleep,
    s2hms,
    s2hmsf,
};
