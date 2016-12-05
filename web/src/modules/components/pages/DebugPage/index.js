import React from 'react';
import sdk from 'sdk';
import postal from 'postal';
import style from './index.scss';

export default class DebugPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            output: '',
        };
    }

    componentDidMount() {
        this.load();
        postal.pub('document-title', '调试');
    }

    load = async () => {
        const params = {
            x: 1,
            y: 2,
        };
        const resp = await sdk.getEcho(params);
        const output = JSON.stringify(resp, null, 4);
        this.setState({output});
    }

    render() {
        return (
            <div className={style.root}>
                <pre className={style.code}>{this.state.output}</pre>
            </div>
        );
    }

}
