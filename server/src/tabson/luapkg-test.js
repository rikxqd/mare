import luapkg from './luapkg';

const test = () => {
    const tests = [
        '@aaa/bbb/ccc',
        '@./aaa/bbb/ccc',
        '@/aaa/bbb/ccc',
        '@aaa\\bbb\\ccc',
        '@.\\aaa\\bbb\\ccc',
        '@C:\\aaa\\bbb\\ccc',
        '@C:\\aaa/bbb\\ccc/ddd',
    ];
    const r1 = '/home/mare/mare';
    const r2 = 'E:/mare/mare';

    for (const source of tests) {
        const url = luapkg.sourceToUrl(source);
        const path1 = luapkg.sourceToFile(source, r1);
        const path2 = luapkg.urlToFile(url, r1);
        console.log(source, url, path1, path2, path1 === path2);
    }

    console.log('--');

    for (const source of tests) {
        const url = luapkg.sourceToUrl(source);
        const path1 = luapkg.sourceToFile(source, r2);
        const path2 = luapkg.urlToFile(url, r2);
        console.log(source, url, path1, path2, path1 === path2);
    }
};

test();
