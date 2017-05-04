import {VNode} from "inferno";

export interface IPopupPickerProps {
    picker?: any;
    value?: any;
    triggerType?: string;
    WrapComponent?: any;
    dismissText?: string | VNode; // React.ReactElement only for web
    okText?: string | VNode; // React.ReactElement only for web
    title?: string | VNode; // React.ReactElement only for web
    visible?: boolean;
    disabled?: boolean;
    onOk?: (...argument) => void;
    style?: any;
    onVisibleChange?: (visible: boolean) => void;
    content?: VNode | string;
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
}
