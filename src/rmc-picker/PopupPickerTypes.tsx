import * as React from 'react';

export interface IPopupPickerProps {
    picker?: any;
    value?: any;
    triggerType?: string;
    WrapComponent?: any;
    dismissText?: string | React.ReactElement<any>; // React.ReactElement only for web
    okText?: string |  React.ReactElement<any>; // React.ReactElement only for web
    title?: string |  React.ReactElement<any>; // React.ReactElement only for web
    visible?: boolean;
    disabled?: boolean;
    onOk?: (...argument) => void;
    style?: any;
    onVisibleChange?: (visible: boolean) => void;
    content?: React.ReactElement<any> | string;
    onDismiss?: () => void;
    wrapStyle?: any;
    prefixCls?: string;
    className?: string;
    pickerValueProp?: string;
    pickerValueChangeProp?: string;
    /** web only */
    transitionName?: string;
    /** web only */
    maskTransitionName?: string;
    popupTransitionName?;
}
