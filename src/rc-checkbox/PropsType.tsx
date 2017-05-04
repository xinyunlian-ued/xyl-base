
export interface CheckboxPropTypes {
    prefixCls?: string;
    className?: string;
    style?;
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