import React from 'react';
import sdk from 'sdk';
import {s2hms} from 'utility';
import {DataTable, TableHeader} from 'react-mdl';
import style from './index.scss';

const uptimeString = (seconds) => {
    const {h, m, s} = s2hms(seconds);
    const p = (v) => String(Math.round(v)).padLeft(2, '0');
    return `${p(h)} 小时 ${p(m)} 分 ${p(s)} 秒`;
};

export default class OverviewTable extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            system: [],
            server: [],
            session: [],
            project: [],
        };
    }

    componentDidMount() {
        this.load();
    }

    load = async () => {
        const info = await sdk.getOverview();
        const system = this.convertSystemData(info.system);
        const server = this.convertServerData(info.server);
        const session = this.convertSessionData(info.session);
        const project = this.convertProjectData(info.project);
        this.setState({system, server, session, project});
    }

    convertSystemData(data) {
        return [
            {
                key: 'hostname',
                label: '主机名',
                value: data.hostname,
            },
            {
                key: 'os',
                label: '操作系统',
                value: data.os,
            },
            {
                key: 'serverTime',
                label: '系统时间',
                value: new Date(data.time).toString(),
            },
            {
                key: 'nodejs',
                label: 'NodeJS',
                value: data.nodejs,
            },
            {
                key: 'uptime',
                label: '运行时长',
                value: uptimeString(data.uptime),
            },
        ];
    }

    convertServerData(data) {
        const {frontend, backend} = data;
        return [
            {
                key: 'version',
                label: '版本',
                value: data.version,
            },
            {
                key: 'pid',
                label: 'PID',
                value: data.pid,
            },
            {
                key: 'frontendListen',
                label: '前端监听地址',
                value: `ws://${frontend.host}:${frontend.port}`,
            },
            {
                key: 'backendListen',
                label: '后端监听地址',
                value: `socket://${backend.host}:${backend.port}`,
            },
            {
                key: 'uptime',
                label: '运行时长',
                value: uptimeString(data.uptime),
            },
        ];
    }

    convertSessionData(data) {
        return [
            {
                key: 'total',
                label: '合计',
                value: data.total,
            },
            {
                key: 'activiting',
                label: '活动',
                value: data.activiting,
            },
            {
                key: 'nonactiviting',
                label: '非活动',
                value: data.total - data.activiting,
            },
        ];
    }

    convertProjectData(data) {
        return [
            {
                key: 'total',
                label: '合计',
                value: data.total,
            },
            {
                key: 'placeholder1',
                label: '',
                value: '',
            },
            {
                key: 'placeholder2',
                label: '',
                value: '',
            },
        ];
    }

    renderLabelCell = (value, item) => {
        return <strong>{item.label}</strong>;
    }

    renderValueCell = (value, item) => {
        return <span>{item.value}</span>;
    }

    renderSystemTable = (items) => {
        return (
            <DataTable className={style.table}
                rowKeyColumn='key'
                shadow={0} rows={items}>
                <TableHeader name='label'
                    style={{width: '100px'}}
                    cellFormatter={this.renderLabelCell}>系统</TableHeader>
                <TableHeader name='value'
                    cellFormatter={this.renderValueCell}></TableHeader>
            </DataTable>
        );
    }

    renderServerTable = (items) => {
        return (
            <DataTable className={style.table}
                rowKeyColumn='key'
                shadow={0} rows={items}>
                <TableHeader name='label'
                    style={{width: '100px'}}
                    cellFormatter={this.renderLabelCell}>服务</TableHeader>
                <TableHeader name='value'
                    cellFormatter={this.renderValueCell}>
                    <a className={style.extra} href='/config'>查看配置</a>
                </TableHeader>
            </DataTable>
        );
    }

    renderSesssionTable = (items) => {
        return (
            <DataTable className={style.table}
                rowKeyColumn='key'
                shadow={0} rows={items}>
                <TableHeader name='label'
                    style={{width: '100px'}}
                    cellFormatter={this.renderLabelCell}>会话</TableHeader>
                <TableHeader name='value'
                    cellFormatter={this.renderValueCell}>
                    <a className={style.extra} href='/session/'>
                        查看全部
                    </a>
                </TableHeader>
            </DataTable>
        );
    }

    renderProjectTable = (items) => {
        return (
            <DataTable className={style.table}
                rowKeyColumn='key'
                shadow={0} rows={items}>
                <TableHeader name='label'
                    style={{width: '100px'}}
                    cellFormatter={this.renderLabelCell}>项目</TableHeader>
                <TableHeader name='value'
                    cellFormatter={this.renderValueCell}>
                    <a className={style.extra} href='/project/'>
                        查看全部
                    </a>
                </TableHeader>
            </DataTable>
        );
    }

    render() {
        return (
            <div className={style.root}>

                <div className={style.section}>
                    {this.renderSystemTable(this.state.system)}
                    {this.renderServerTable(this.state.server)}
                </div>

                <div className={style.section}>
                    {this.renderSesssionTable(this.state.session)}
                </div>

            </div>
        );
    }

}
