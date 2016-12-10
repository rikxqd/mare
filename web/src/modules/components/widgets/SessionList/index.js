import React from 'react';
import sdk from 'sdk';
import {Icon, DataTable, TableHeader} from 'react-mdl';
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

    renderDebuggerCell = (value, item) => {
        const path = `ws=${item.wsPath}`;
        const url = `/devtools/inspector.html?experiments=true&${path}`;
        return (
            <div>
                {do {
                    if (item.frontend.isConnected) {
                        <span className='text-success'>前端已连接</span>;
                    } else {
                        <a href={url} target='_blank'>打开前端</a>;
                    }
                }}
                <Icon className={style.cellIcon}
                    name='compare_arrows' />
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
        const url = `/session/id/${item.id}`;
        return <a href={url}>{item.id}</a>;
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
                        style={{width: '200px'}}>ID</TableHeader>
                    <TableHeader name='title'>标题</TableHeader>
                    <TableHeader name='debugger'
                        cellFormatter={this.renderDebuggerCell}>调试器</TableHeader>
                    <TableHeader name='op'
                        style={{width: '50px'}}
                        cellFormatter={this.renderDetailCell}>操作</TableHeader>
                </DataTable>
            </div>
        );
    }

}
