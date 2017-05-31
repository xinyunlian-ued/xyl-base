export interface NoticePropTypes {
    duration?: number;
    onClose?: (event?: any) => {};
    children?: any;
    prefixCls?: string;
    className?: string;
    closable?: string;
    style?: any;
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