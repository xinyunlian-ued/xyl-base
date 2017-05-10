import {ReactNode} from 'react';

interface IDialogPropTypes {
    className?: string;
    keyboard?: boolean;
    style?: any;
    mask?: boolean;
    children?: any;
    afterClose?: () => void;
    onClose?: (...argument) => void;
    closable?: boolean;
    maskClosable?: boolean;
    visible?: boolean;
    mousePosition?: any;
    title?: ReactNode;
    footer?: ReactNode;
    transitionName?: string;
    maskTransitionName?: string;
    animation?: any;
    maskAnimation?: any;
    wrapStyle?: any;
    bodyStyle?: any;
    maskStyle?: any;
    prefixCls?: string;
    wrapClassName?: string;
    width?;
    height?;
    bodyProps?;
    wrapProps?;
    zIndex?;
    maskProps?;
}

export interface ILazyRenderBoxPropTypes {
    className?: string;
    visible?: boolean;
    hiddenClassName?: string;
    role?: string;
    style?: {};
}

export default IDialogPropTypes;
