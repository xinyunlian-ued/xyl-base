import {CSSProperties} from 'react';

export interface CheckboxPropTypes {
    prefixCls?: string;
    className?: string;
    style?: CSSProperties;
    name?: string;
    type?: string;
    defaultChecked?: boolean;
    checked?: boolean;
    disabled?: boolean;
    onFocus?: Function;
    onBlur?: Function;
    onChange?: Function;
    onClick?: Function;
    tabIndex?: number;
    readOnly?: boolean;
}

export interface State {
    checked: boolean;
}