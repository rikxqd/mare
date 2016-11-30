import {CLIEngine} from 'eslint';

const eslint = (paths) => {
    const engine = new CLIEngine();
    const report = engine.executeOnFiles(paths);
    const formatter = engine.getFormatter();
    return formatter(report.results);
};

console.info(eslint(['./builder', './src']));
