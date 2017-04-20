import {CSSProperties, ReactNode} from 'react';

export interface ILazyRenderBox {
    children?: any;
    className?: string;
    visible?: boolean;
    hiddenClassName?: string;
    style?: CSSProperties;
}

export interface IPopup {
    visible?: boolean;
    style?: CSSProperties;
    getClassNameFromAlign?: (...argument) => void;
    onAlign?: (...argument) => void;
    getRootDomNode?: (...argument) => void;
    onMouseEnter?: (...argument) => void;
    align?: any;
    destroyPopupOnHide?: boolean;
    className?: string;
    prefixCls?: string;
    onMouseLeave?: (...argument) => void;
    maskTransitionName?: string | ObjectConstructor;
    maskAnimation?;
    transitionName?: string | ObjectConstructor;
    animation?;
    zIndex?: number;
    mask?: number;
    action?: string | string[];
}

export interface IPopupInner {
    hiddenClassName?: string;
    className?: string;
    prefixCls?: string;
    onMouseEnter?: (...argument) => void;
    onMouseLeave?: (...argument) => void;
    children?: any;
    style?: CSSProperties;
    visible?: boolean;
}

export interface ITrigger {
    children?: any;
    action?: string | string[];
    showAction?: any;
    hideAction?: any;
    getPopupClassNameFromAlign?: any;
    onPopupVisibleChange?: (...argument) => void;
    afterPopupVisibleChange?: (...argument) => void;
    popup: (...argument) => void | ReactNode;
    popupStyle?: CSSProperties;
    prefixCls?: string;
    popupClassName?: string;
    popupPlacement?: string;
    builtinPlacements?: any;
    popupTransitionName?: string | ObjectConstructor;
    popupAnimation?: any;
    mouseEnterDelay?: number;
    mouseLeaveDelay?: number;
    zIndex?: number;
    focusDelay?: number;
    blurDelay?: number;
    getPopupContainer?: (...argument) => void;
    getDocument?: (...argument) => void;
    destroyPopupOnHide?: boolean;
    mask?: number;
    maskClosable?: boolean;
    onPopupAlign?: (...argument) => void;
    popupAlign?: ObjectConstructor;
    popupVisible?: boolean;
    maskTransitionName?: string | ObjectConstructor;
    maskAnimation?: string;
    defaultPopupVisible?: boolean;
}