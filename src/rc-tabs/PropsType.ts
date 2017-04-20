import {CSSProperties, ReactChildren, ReactNode} from 'react';

export interface ITabBarMixinPropTypes {
    onTabClick?: (key?: string) => void;
    panels?: ReactChildren;
    activeKey?: string;
    prefixCls?: string;
    onKeyDown: (event: any) => void;
    className?: any;
    extraContent?: ReactNode;
    style?: CSSProperties;
}

export interface ITabContent {
    animated?: boolean;
    animatedWithMargin?: boolean;
    prefixCls?: string;
    children?: ReactChildren;
    activeKey?: string;
    style?: CSSProperties;
    tabBarPosition?: string;
    destroyInactiveTabPane?;
}

export interface ITabPane {
    className?: string;
    active?: boolean;
    style?: CSSProperties;
    destroyInactiveTabPane?: boolean;
    forceRender?: boolean;
    placeholder?: ReactNode;
    rootPrefixCls?: string;
}

export interface ITabs {
    destroyInactiveTabPane?: boolean;
    renderTabBar: (...argument) => void;
    renderTabContent: () => any;
    onChange?: (event: any) => void;
    children?: ReactChildren;
    prefixCls?: string;
    className?: string;
    tabBarPosition?: string;
    style?: CSSProperties;
    activeKey?: string;
    defaultActiveKey?: string;
}

export interface IInkTabBarMixin {
    prefixCls?: string;
    styles?: CSSProperties;
    inkBarAnimated?: boolean;
    onKeyDown: (event: any) => void;
}