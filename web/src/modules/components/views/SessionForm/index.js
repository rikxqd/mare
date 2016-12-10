import React from 'react';
import {Button} from 'react-mdl';
import style from './index.scss';

const defaultValue = {
    id: '',
    title: '',
};

export default class SessionForm extends React.Component {

    static propTypes = {
        defaultValue: React.PropTypes.object,
        onSubmit: React.PropTypes.func,
        onCancel: React.PropTypes.func,
    };

    constructor(props) {
        super(props);
        this.state = {
            value: this.props.defaultValue || defaultValue,
            submitable: false,
        };
        this.value = {...this.state.value};
    }

    onIdInputChange = (event) => {
        const id = event.target.value.trim();
        this.value.id = id;
        this.setState({submitable: id !== ''});
    }

    onTitleInputChange = (event) => {
        this.value.title = event.target.value;
    }

    onSubmitButtonClick = () => {
        this.props.onSubmit(this.value);
    }

    onCancelButtonClick = () => {
        this.props.onCancel();
    }

    render() {
        const {value, submitable} = this.state;
        return (
            <div className={style.root}>
                <table className={`mdl-data-table mdl-js-data-table ${style.table}`}>
                    <tbody>
                        <tr>
                            <td className='form-label'>ID</td>
                            <td className='form-input'>
                                <input defaultValue={value.id}
                                    onChange={this.onIdInputChange}/>
                            </td>
                        </tr>
                        <tr>
                            <td className='form-label'>标题</td>
                            <td className='form-input'>
                                <input defaultValue={value.title}
                                    onChange={this.onTitleInputChange}/>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan='2' className='form-action'>
                                <Button raised colored disabled={!submitable}
                                    onClick={this.onSubmitButtonClick}>提交</Button>
                                <Button raised accent
                                    onClick={this.onCancelButtonClick}>取消</Button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }

}
