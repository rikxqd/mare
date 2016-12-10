import React from 'react';
import sdk from 'sdk';
import {DataTable, TableHeader} from 'react-mdl';
import style from './index.scss';

export default class ConfigList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            items: [],
        };
    }

    componentDidMount() {
        this.load();
    }

    load = async () => {
        const config = await sdk.getConfig();

        const items = [];
        for (const [groupKey, groupValue] of Object.entries(config)) {
            for (const [key, value] of Object.entries(groupValue)) {
                const item = {
                    key: `${groupKey}.${key}`,
                    value: value,
                };
                items.push(item);
            }
        }

        this.setState({items});
    }

    render() {
        return (
            <div className={style.root}>

                <DataTable className={style.table}
                    rowKeyColumn='key'
                    shadow={0} rows={this.state.items}>
                    <TableHeader name='key'
                        style={{width: '200px'}}>键</TableHeader>
                    <TableHeader name='value'>值</TableHeader>
                </DataTable>

            </div>
        );
    }

}
