import React from 'react';
import postal from 'postal';
import ConfigList from 'components/widgets/ConfigList';
import style from './index.scss';

export default class ConfigPage extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        postal.pub('document-title', '查看服务配置');
    }

    render() {
        return (
            <div className={style.root}>
                <ConfigList />
            </div>
        );
    }

}
