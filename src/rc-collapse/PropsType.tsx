import {ReactChild, ReactNode, ReactElement, CSSProperties} from 'react';

export interface PanelContentPropTypes {
    prefixCls?: string;
    isActive?: boolean;
    children?: ReactChild;
    destroyInactivePanel?;
}

export interface CollapsePanelPropTypes {
    className?: string | ObjectConstructor;
    children?: any;
    openAnimation?: ObjectConstructor;
    prefixCls?: string;
    header?: string | number | ReactNode;
    showArrow?: boolean;
    isActive?: boolean;
    onItemClick?: (event?: any) => void;
    style?: ObjectConstructor;
    key?: string;
    destroyInactivePanel?;
    headerClass?: string;
}

export type ChildrenType = ReactElement<CollapsePanelPropTypes>;

export interface CollapsePropTypes {
    prefixCls?: string;
    activeKey?: string | string[];
    defaultActiveKey?: string | string[];
    openAnimation?: ObjectConstructor;
    onChange?: (event?: any) => void;
    accordion?: boolean;
    className?: string;
    style?: CSSProperties;
    [key: string]: any;
}

