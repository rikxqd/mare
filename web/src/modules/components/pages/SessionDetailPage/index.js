import React from 'react';
import sdk from 'sdk';
import postal from 'postal';
import style from './index.scss';

export default class SessionDetailPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            output: '',
        };
    }

    componentDidMount() {
        this.load();
        postal.pub('document-title', '会话详情');
    }

    load = async () => {
        const id = location.pathname.replace('/session/id/', '');
        const resp = await sdk.getSession(id);
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
