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

    renderNavigation() {
        const pathname = location.pathname;
        const active = style.active;
        return (
            <Navigation>
                {do {
                    const props = {
                        href: '/overview',
                        onClick: href('/overview'),
                        className: pathname === '/overview' ? active : '',
                    };
                    <a {...props}>运行状态</a>;
                }}
                {do {
                    const props = {
                        href: '/session/',
                        onClick: href('/session/'),
                        className: pathname.startsWith('/session/') ? active : '',
                    };
                    <a {...props}>会话列表</a>;
                }}
                {do {
                    const props = {
                        href: '/config',
                        onClick: href('/config'),
                        className: pathname.startsWith('/config') ? active : '',
                    };
                    <a {...props}>查看配置</a>;
                }}
            </Navigation>
        );
    }

    render() {
        return (
            <div className={style.root}>
                <Layout fixedHeader>
                    <Header title={<a className={style.title}
                            href='/' onClick={href('/')}>LDB</a>}>
                        {this.renderNavigation()}
                    </Header>
                    <div className={style.content}>
                        {this.props.children}
                    </div>
                </Layout>
            </div>
        );
    }

}
