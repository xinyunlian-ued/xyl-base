import {CSSProperties} from 'react';

export interface ITooltip {
    trigger?: any;
    children?: any;
    defaultVisible?: boolean;
    visible?: boolean;
    placement?: string;
    transitionName?: string;
    animation?: any;
    onVisibleChange?: () => void;
    afterVisibleChange?: () => void;
    overlay: any;
    overlayStyle?: CSSProperties;
    overlayClassName?: string;
    prefixCls?: string;
    mouseEnterDelay?: number;
    mouseLeaveDelay?: number;
    getTooltipContainer?: () => void;
    destroyTooltipOnHide?: boolean;
    align?: ObjectConstructor;
    arrowContent?: any;
}