import React from 'react';
import Sidebar from 'components/views/Sidebar';

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
    }

    onChange = (value) => {
        console.log(value);
    }

    render() {
        return (
            <div>
            <Sidebar title='LDB'
                items={sidebarItems}
                onChange={this.onChange} />
            </div>
        );
    }

}

