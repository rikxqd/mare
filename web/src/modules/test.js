import tape from 'tape';

const testUtils = {

    output: document.querySelector('#output'),

    randomName: (prefix = '') => {
        const time = new Date().getTime() / 1000;
        const second = String(Math.round(time));
        return prefix + String(second).slice(5);
    },

};

tape.createStream().on('data', (row) => {
    const output = testUtils.output;
    output.textContent += row;
    output.parentElement.scrollTop = output.parentElement.scrollHeight;
});

const testcase = (title, func) => {
    tape(title, (test) => {
        func(test).then(() => {
            test.end();
        }, (error) => {
            test.end(error);
        });
    });
};

testcase('hello', async (test) => {
    test.ok('测试通过');
});
