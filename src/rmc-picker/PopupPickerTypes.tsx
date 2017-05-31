export interface IPopupPickerProps {
    picker?: any;
    value?: any;
    triggerType?: string;
    WrapComponent?: any;
    dismissText?: any; // React.ReactElement only for web
    okText?: any; // React.ReactElement only for web
    title?: any; // React.ReactElement only for web
    visible?: boolean;
    disabled?: boolean;
    onOk?: (value?: any) => void;
    style?: any;
    onVisibleChange?: (visible: boolean) => void;
    content?: any;
    onDismiss?: () => void;
    /** react-native only */
    styles?: any;
    /** react-native only */
    actionTextUnderlayColor?: string;
    /** react-native only */
    actionTextActiveOpacity?: number;
    /** web only */
    wrapStyle?: any;
    /** web only */
    prefixCls?: string;
    className?: string;
    pickerValueProp?: string;
    pickerValueChangeProp?: string;
    /** web only */
    transitionName?: string;
    /** web only */
    maskTransitionName?: string;
}
