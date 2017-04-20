import React from 'react';
import classnames from 'classnames';
import Picker from './Picker';
import MultiPickerProps from './MultiPickerProps';
import {observer} from "mobx-react";
import noop from "../rc-util/noop";

@observer
export default class MultiPicker extends React.Component<MultiPickerProps, any> {

    static defaultProps = {
        prefixCls: 'rmc-multi-picker',
        pickerPrefixCls: 'rmc-picker',
        onValueChange: noop,
        disabled: false,
    };

    getValue() {
        const {children, selectedValue} = this.props;
        if (selectedValue && selectedValue.length) {
            return selectedValue;
        } else {
            if (!children) {
                return [];
            }
            return React.Children.map(children, (c: any) => {
                const cc = c.props.children;
                return cc && cc[0] && cc[0].value;
            });
        }
    }

    onValueChange(i, v) {
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
        const colElements = React.Children.map(children, (col: any, i) => {
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
