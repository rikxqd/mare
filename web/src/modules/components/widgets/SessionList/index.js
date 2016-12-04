import React from 'react';
import sdk from 'sdk';
import style from './index.scss';

const frontendUrl = (wsUrl) => {
    const url = wsUrl.replace('ws://', 'ws=');
    return `/devtools/inspector.html?experiments=true&${url}`;
};

export default class SessionList extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            sessions: [],
        };
    }

    componentDidMount() {
        setInterval(() => {
            this.load();
        }, 1000);
    }

    load = async () => {
        const sessions = await sdk.getSessions();
        this.setState({sessions});
    }

    render() {
        const sessions = this.state.sessions;
        return (
            <div className={style.root}>
                {sessions.map((s) => do {
                    <div key={s.id}>
                        <div>
                            <span>{s.title}</span><span>{s.id}</span>
                        </div>
                        <div>
                            <img src={s.faviconUrl} className={style.favicon}/>
                            {do {
                                if (s.webSocketDebuggerUrl) {
                                    <a target='_blank'
                                    href={frontendUrl(s.webSocketDebuggerUrl)}>inspect</a>;
                                }
                            }}
                        </div>
                    </div>;
                })}
            </div>
        );
    }

}
