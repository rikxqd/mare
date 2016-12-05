import React from 'react';
import sdk from 'sdk';
import {DataTable, TableHeader} from 'react-mdl';
import style from './index.scss';

const opCellFormater = (wsUrl) => {
    if (!wsUrl) {
        return <span className={style.attached}>调试器已连接</span>;
    }
    const ws = wsUrl.replace('ws://', 'ws=');
    const url = `/devtools/inspector.html?experiments=true&${ws}`;
    return <a href={url} target='_blank'>打开调试器</a>;
};

export default class SessionList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            sessions: [],
        };
    }

    componentDidMount() {
        this.load();
    }

    load = async () => {
        const sessions = await sdk.getSessions();
        this.setState({sessions});
    }

    render() {
        const sessions = this.state.sessions;
        return (
            <div className={style.root}>
                <DataTable className={style.table}
                    rowKeyColumn='id'
                    shadow={0} rows={sessions}>
                    <TableHeader name='id'
                        style={{width: '200px'}}>ID</TableHeader>
                    <TableHeader name='title'>标题</TableHeader>
                    <TableHeader name='webSocketDebuggerUrl'
                        style={{width: '100px'}}
                        cellFormatter={opCellFormater}>操作</TableHeader>
                </DataTable>
            </div>
        );
    }

}
