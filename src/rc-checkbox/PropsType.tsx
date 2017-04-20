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
    onFocus?: any;
    onBlur?: any;
    onChange?: any;
    onClick?: any;
    tabIndex?: number;
    readOnly?: boolean;
}

export interface State {
    checked: boolean;
}