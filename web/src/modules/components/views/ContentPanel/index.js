import React from 'react';
import style from './index.scss';

export default class ContentPanel extends React.Component {

    static propTypes = {
        title: React.PropTypes.string,
        children: React.PropTypes.any,
    };

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className={style.root}>
                <div className={style.contentHeader}>{this.props.title}</div>
                {this.props.children}
            </div>
        );
    }

}
