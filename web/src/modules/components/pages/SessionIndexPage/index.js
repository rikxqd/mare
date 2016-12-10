import React from 'react';
import postal from 'postal';
import {href} from 'components/router';
import {Button} from 'react-mdl';
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
                <div className={style.toolbar}>
                    <Button raised colored ripple
                        onClick={href('/session/new')}>添加</Button>
                </div>
                <SessionList />
            </div>
        );
    }

}
