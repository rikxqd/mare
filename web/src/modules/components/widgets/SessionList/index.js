import React from 'react';
import sdk from 'sdk';
import {DataTable, TableHeader} from 'react-mdl';
import style from './index.scss';

export default class SessionList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            sessions: [],
        };
    }

    componentDidMount() {
        this.unsub = sdk.on('session-update', this.onSessionUpdate);
        this.load();
    }

    componentWillUnmount() {
        this.unsub();
    }

    load = async () => {
        const sessions = await sdk.getSessions();
        this.setState({sessions});
    }

    onSessionUpdate = (sessions) => {
        this.setState({sessions});
    }

    openFrontendWin = (url, title) => {
        const width = Math.round(screen.width * 0.618);
        const height = Math.round(screen.height * 0.618);
        const left = Math.round(screen.width / 2 - width / 2);
        const top = Math.round(screen.height / 2 - height / 2);
        const features = `
            menubar=no,location=no,
            width=${width},height=${height},
            top=${top},left=${left}`;
        window.open(url, title, features);
    }

    openFrontendTab = (url, title) => {
        window.open(url, title);
    }

    onFrontendLinkClick = (url, title) => () => {
        this.openFrontendTab(url, title);
    }

    renderDebuggerCell = (value, item) => {
        const path = `ws=${item.wsPath}`;
        const url = `/devtools/inspector.html?${path}`;
        return (
            <div>
                {do {
                    if (item.frontend.isConnected) {
                        <span className='text-success'>前端已连接</span>;
                    } else {
                        <a href={url} target='_blank'
                            onClick={this.onFrontendLinkClick(url, item.title)}>打开前端</a>;
                    }
                }}
                <span> ~ </span>
                {do {
                    if (item.backend.isConnected) {
                        <span className='text-success'>后端已连接</span>;
                    } else {
                        <span>正在监听中</span>;
                    }
                }}
            </div>
        );
    }

    renderIdCell = (value, item) => {
        return <span>{item.id}</span>;
    }

    renderDetailCell = (value, item) => {
        const url = `/session/id/${item.id}`;
        return <a href={url}>详情</a>;
    }

    render() {
        const sessions = this.state.sessions;
        return (
            <div className={style.root}>
                <DataTable className={style.table}
                    rowKeyColumn='id'
                    shadow={0} rows={sessions}>
                    <TableHeader name='id'
                        cellFormatter={this.renderIdCell}
                        style={{width: '220px'}}>ID</TableHeader>
                    <TableHeader name='title'>标题</TableHeader>
                    <TableHeader name='_debugger'
                        style={{width: '220px'}}
                        cellFormatter={this.renderDebuggerCell}>调试器</TableHeader>
                </DataTable>
            </div>
        );
    }

}
