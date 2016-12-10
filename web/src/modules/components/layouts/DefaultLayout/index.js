import React from 'react';
import {href} from 'components/router';
import {Layout, Navigation, Header} from 'react-mdl';
import style from './index.scss';

export default class DefaultLayout extends React.Component {

    static propTypes = {
        children: React.PropTypes.any,
        layoutProps: React.PropTypes.object,
    };

    constructor(props) {
        super(props);
    }

    render() {
        const title = (
            <strong>LDB</strong>
        );
        return (
            <div className={style.root}>
                <Layout fixedHeader>
                    <Header title={title}>
                        <Navigation>
                            {do {
                                if (location.pathname === '/overview') {
                                    <span className={style.active}>运行状态</span>;
                                } else {
                                    <a href='/overview'
                                        onClick={href('/overview')}>运行状态</a>;
                                }
                            }}
                            {do {
                                if (location.pathname.startsWith('/session/')) {
                                    <span className={style.active}>会话列表</span>;
                                } else {
                                    <a href='/session/'
                                        onClick={href('/session/')}>会话列表</a>;
                                }
                            }}
                            {do {
                                if (location.pathname.startsWith('/config')) {
                                    <span className={style.active}>查看配置</span>;
                                } else {
                                    <a href='/session/'
                                        onClick={href('/config')}>查看配置</a>;
                                }
                            }}
                        </Navigation>
                    </Header>
                    <div className={style.content}>
                        {this.props.children}
                    </div>
                </Layout>
            </div>
        );
    }

}
