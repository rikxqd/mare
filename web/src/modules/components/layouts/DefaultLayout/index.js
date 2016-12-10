import React from 'react';
import {href} from 'components/router';
import {Layout, Navigation, Drawer, Header} from 'react-mdl';
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
            <span>
                <span className={style.caption}>LDB / </span>
                <strong>{this.props.layoutProps.title}</strong>
            </span>
        );
        return (
            <div className={style.root}>
                <Layout fixedHeader>
                    <Header title={title}></Header>
                    <Drawer title='LDB'>
                        <Navigation>
                            <a href='/overview'
                                onClick={href('/overview')}>运行状态</a>
                            <a href='/session/'
                                onClick={href('/session/')}>会话列表</a>
                        </Navigation>
                    </Drawer>
                    <div className={style.content}>
                        {this.props.children}
                    </div>
                </Layout>
            </div>
        );
    }

}
