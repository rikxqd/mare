import fs from 'fs';
import * as msgpack from 'msgpack-lite';
import {Tabson} from './src/tabson';

const data = fs.readFileSync('../lua-example/data.msgpack');
const dumped = msgpack.decode(data);
const idmix = {id: 'test'};
const t = new Tabson(dumped, idmix);
console.log(dumped);

const pathsList = [
    [],
    ['#1'],
    ['@1'],
    ['@literal'],
    ['@value_func'],
    ['@value_inf'],
    ['@value_nan'],
    ['@value_native'],
    ['@value_table'],
    ['@value_table', '#1'],
    ['@value_thread'],
    ['@value_userdata'],
];

for (const paths of pathsList) {
    const title = JSON.stringify(paths);
    console.log(title, t.value(paths), t.props(paths));
}

setTimeout(console.log, 99999);
