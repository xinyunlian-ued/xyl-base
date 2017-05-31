import createElement from 'inferno-create-element';
import Component from 'inferno-component';
import {observer} from 'inferno-mobx';
import PopupPicker from '../rmc-picker/Popup';
import {IPopupPickerProps} from '../rmc-picker/PopupPickerTypes';
import {CascaderValue} from './CascaderTypes';

export interface IPopupCascaderProps extends IPopupPickerProps {
    cascader: any;
    onChange?: (date?: CascaderValue) => void;
}

@observer
export default class PopupCascader extends Component<IPopupCascaderProps, any> {

    static defaultProps = {
        pickerValueProp: 'value',
        pickerValueChangeProp: 'onChange',
    };

    onOk(v) {
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
            picker={this.props.cascader}
            {...this.props as any}
            onOk={this.onOk}
        />);
    }
}
