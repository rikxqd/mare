import React from 'react';
import style from './index.scss';

export default class VerticalTabbar extends React.Component {

    static propTypes = {
        items: React.PropTypes.array,
        defaultValue: React.PropTypes.string,
        onChange: React.PropTypes.func,
    };

    constructor(props) {
        super(props);

        this.state = {
            selectedValue: props.defaultValue || props.items[0].value,
        };
    }

    onClick = (value) => (event) => {
        event.target.blur();
        this.setState({selectedValue: value});
        this.props.onChange(this.state.selectedValue);
    }

    render() {
        return (
            <div>
                {this.props.items.map((item) => do {
                    const className = do {
                        if (this.state.selectedValue === item.value) {
                            `${style.tabHeader} selected`;
                        } else {
                            style.tabHeader;
                        }
                    };
                    const onClick = this.onClick(item.value);
                    <div className={className} key={item.value}>
                        <button onClick={onClick}>{item.label}</button>
                    </div>;
                })}
            </div>
        );
    }

}
