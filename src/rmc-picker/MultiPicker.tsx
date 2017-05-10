import * as React from 'react';
import {observer} from 'inferno-mobx';
import noop from "../rc-util/noop";
import classnames from 'classnames';
import Picker from './Picker';
import MultiPickerProps from './MultiPickerProps';

@observer
export default class MultiPicker extends React.Component<MultiPickerProps, any> {

    getDefaultProps = () => {
        return {
            prefixCls: 'rmc-multi-picker',
            pickerPrefixCls: 'rmc-picker',
            onValueChange: noop,
            disabled: false,
        };
    }

    getValue = () => {
        const {children, selectedValue} = this.props;
        if (selectedValue && selectedValue.length) {
            return selectedValue;
        } else {
            if (!children) {
                return [];
            }
            return (children as any).map(c => {
                const cc = c.props.children;
                return cc && cc[0] && cc[0].value;
            });
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
        const colElements = (children as any).map((col, i) => {
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
                        {...col.props}
                    />
                </div>
            );
        });
        return (
            <div {...rootNativeProps} className={classnames(className, prefixCls)}>
                {colElements}
            </div>
        );
    }
}
