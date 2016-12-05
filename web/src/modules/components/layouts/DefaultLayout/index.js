import React from 'react';
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
        return (
            <div className={style.root}>
                {this.props.children}
            </div>
        );
    }

}
