import React from 'react';
import sdk from 'sdk';
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
                    value: JSON.stringify(value),
                };
                items.push(item);
            }
        }

        this.setState({items});
    }

    render() {
        return (
            <div className={`mdl-shadow--2dp ${style.root}`}>
                <table className={`mdl-data-table mdl-js-data-table ${style.table}`}>
                    <thead>
                        <tr>
                            <th>配置名</th>
                            <th>配置值</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.items.map((item) => {
                            return (
                                <tr>
                                    <td className='column-key'>{item.key}</td>
                                    <td className='column-value'><code>{item.value}</code></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    }

}
