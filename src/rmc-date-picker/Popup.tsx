import createElement from 'inferno-create-element';
import Component from 'inferno-component';
import {observer} from 'inferno-mobx';
import IDatePickerProps from './IDatePickerProps';
import PopupPicker from '../rmc-picker/Popup';
import {IPopupPickerProps} from '../rmc-picker/PopupPickerTypes';

export interface IPopupDatePickerProps extends IPopupPickerProps {
    datePicker: Component<IDatePickerProps, any>;
    onChange?: (date?) => void;
    date?: any;
}

@observer
export default class PopupDatePicker extends Component<IPopupDatePickerProps, any> {

    static defaultProps = {
        pickerValueProp: 'date',
        pickerValueChangeProp: 'onDateChange',
    };

    onOk = (v) => {
        const {onChange, onOk} = this.props;
        if (onChange) {
            onChange(v);
        }
        if (onOk) {
            onOk(v);
        }
    }

    render() {
        return (<PopupPicker
            picker={this.props.datePicker}
            value={this.props.date}
            {...this.props}
            onOk={this.onOk}
        />);
    }
}
