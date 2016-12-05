import React from 'react';
import postal from 'postal';
import {Layout, Navigation, Drawer, Header} from 'react-mdl';
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
        const title = (
            <span>
                <span className={style.caption}>LDB / </span>
                <strong>会话列表</strong>
            </span>
        );
        return (
            <Layout fixedHeader>
                <Header title={title}></Header>
                <Drawer title='LDB'>
                    <Navigation>
                        <a href='/session'>会话列表</a>
                        <a href='/debug' target='_blank'>调试页</a>
                    </Navigation>
                </Drawer>
                <div className={style.content}>
                    <SessionList />
                </div>
            </Layout>
        );
    }

}
