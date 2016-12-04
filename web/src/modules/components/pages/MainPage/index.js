import React from 'react';
import Sidebar from 'components/views/Sidebar';
import ContentPanel from 'components/views/ContentPanel';
import style from './index.scss';

const sidebarItems = [
    {
        label: '活动会话',
        value: 'session',
    },
    {
        label: '活动链接',
        value: 'connection',
    },
    {
        label: '项目配置',
        value: 'project',
    },
];

export default class MainPage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            item: sidebarItems[0],
        };
    }

    onChange = (value) => {
        const item = sidebarItems.find((e) => e.value === value);
        console.log(value, item);
        this.setState({item});
    }

    render() {
        const item = this.state.item;
        return (
            <div className={style.root}>
                <Sidebar title='LDB'
                    items={sidebarItems}
                    onChange={this.onChange} />
                <ContentPanel title={item.label} key={item.value}>
                    <p>hello</p>
                </ContentPanel>
            </div>
        );
    }

}

