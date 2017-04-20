import {ReactNode} from 'react';

interface IDialogPropTypes {
    className?: string;
    keyboard?: boolean;
    style?: {};
    mask?: boolean;
    children?: any;
    afterClose?: (e?: any) => void;
    onClose?: (e?: any) => void;
    closable?: boolean;
    maskClosable?: boolean;
    visible?: boolean;
    mousePosition?: { x?: number, y?: number };
    title?: ReactNode;
    footer?: ReactNode;
    transitionName?: string;
    maskTransitionName?: string;
    animation?: any;
    maskAnimation?: any;
    wrapStyle?: {};
    bodyStyle?: {};
    maskStyle?: {};
    prefixCls?: string;
    wrapClassName?: string;
    width?: number;
    height?: number;
    bodyProps?: any;
    zIndex?: number;
    maskProps?: any;
    wrapProps?: any;
}

export interface ILazyRenderBoxPropTypes {
    className?: string;
    visible?: boolean;
    hiddenClassName?: string;
    role?: string;
    style?: {};
}

export default IDialogPropTypes;
