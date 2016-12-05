import React from 'react';
import postal from 'postal';
import SessionList from 'components/widgets/SessionList';
import style from './index.scss';

export default class SessionIndexPage extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        postal.pub('document-title', '会话列表');
    }

    render() {
        return (
            <div className={style.root}>
                <SessionList />
            </div>
        );
    }

}
