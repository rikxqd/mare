import React from 'react';
import VerticalTabbar from 'components/views/VerticalTabbar';
import style from './index.scss';

export default class Sidebar extends React.Component {

    static propTypes = {
        title: React.PropTypes.string,
        items: React.PropTypes.array,
        defaultValue: React.PropTypes.string,
        onChange: React.PropTypes.func,
    };

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className={style.root}>
                <div className={style.caption}>{this.props.title}</div>
                <VerticalTabbar items={this.props.items}
                    defaultValue={this.props.defaultValue}
                    onChange={this.props.onChange} />
            </div>
        );
    }

}
