import createElement from 'inferno-create-element';
import Component from 'inferno-component';
import {Children} from 'inferno-compat';
import {observer} from 'inferno-mobx';
import classnames from 'classnames';
import Picker from './Picker';
import MultiPickerProps from './MultiPickerProps';

@observer
export default class MultiPicker extends Component<MultiPickerProps, any> {

    static defaultProps = {
        prefixCls: 'xyl-base/lib/rmc-multi-picker',
        pickerPrefixCls: 'xyl-base/lib/rmc-picker',
        onValueChange() {
        },
        disabled: false,
    };

    getValue = () => {
        const {children, selectedValue} = this.props;
        if (selectedValue && selectedValue.length) {
            return selectedValue;
        } else {
            if (!children) {
                return [];
            }
            return Children.map(children as any, (c) => {
                const cc = c.props.children;
                return cc && cc[0] && cc[0].value;
            }, null);
        }
    }

    onValueChange = (i, v) => {
        const value = this.getValue().concat();
        value[i] = v;
        this.props.onValueChange(value, i);
    }

    render() {
        const props = this.props;
        const {
            prefixCls, pickerPrefixCls,
            className, rootNativeProps,
            disabled, pickerItemStyle,
            indicatorStyle,
            pure, children,
        } = props;
        const selectedValue = this.getValue();
        const colElements = Children.map(children as any, (col, i) => {
            return (
                <div key={col.key || i} className={`${prefixCls}-item`}>
                    <Picker
                        itemStyle={pickerItemStyle}
                        disabled={disabled}
                        pure={pure}
                        indicatorStyle={indicatorStyle}
                        prefixCls={pickerPrefixCls}
                        selectedValue={selectedValue[i]}
                        onValueChange={this.onValueChange.bind(this, i)}
                        {...col.props as any}
                    />
                </div>
            );
        }, null);
        return (
            <div {...rootNativeProps as any} className={classnames(className, prefixCls)}>
                {colElements}
            </div>
        );
    }
};
