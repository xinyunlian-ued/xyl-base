export interface PanelContentPropTypes {
    prefixCls?: string;
    isActive?: boolean;
    children?: any;
    destroyInactivePanel?;
}

export interface CollapsePanelPropTypes {
    className?: string | ObjectConstructor;
    children?: any;
    openAnimation?: ObjectConstructor;
    prefixCls?: string;
    header?: string | number | any;
    showArrow?: boolean;
    isActive?: boolean;
    onItemClick?: (event?: any) => void;
    style?: ObjectConstructor;
    key?: string;
    destroyInactivePanel?;
    headerClass?: string;
    disabled?: boolean;
}

export type ChildrenType = any;

export interface CollapsePropTypes {
    prefixCls?: string;
    activeKey?: string | string[];
    defaultActiveKey?: string | string[];
    openAnimation?: ObjectConstructor;
    onChange?: (event?: any) => void;
    accordion?: boolean;
    className?: string;
    style?: any;
    [key: string]: any;
}

