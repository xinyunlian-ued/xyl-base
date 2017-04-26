import {CSSProperties, ReactChildren} from 'react';

export interface NoticePropTypes {
    duration?: number;
    onClose?: (event?: any) => {};
    children?: ReactChildren;
    prefixCls?: string;
    className?: string;
    closable?: string;
    style?: CSSProperties;
}

export interface NotificationPropTypes {
    prefixCls?: string;
    transitionName?: string;
    animation?: string | object;
    style?: object;
    className?: string;
    [key: string]: any;
}

export interface NotificationInstancePropTypes {
    getContainer?: () => void;
}