import {VNode} from "inferno";

export interface ITabBarMixinPropTypes {
    onTabClick?: (key?: string) => void;
    panels?: VNode[];
    activeKey?: string;
    prefixCls?: string;
    onKeyDown?: (event: any) => void;
    className?: any;
    extraContent?: VNode;
    style?: any;
}

export interface ITabContent {
    animated?: boolean;
    animatedWithMargin?: boolean;
    prefixCls?: string;
    children?: VNode[];
    activeKey?: string;
    style?: VNode[];
    tabBarPosition?: string;
    destroyInactiveTabPane?;
}

export interface ITabPane {
    className?: string;
    active?: boolean;
    style?: any;
    destroyInactiveTabPane?: boolean;
    forceRender?: boolean;
    placeholder?;
    rootPrefixCls?: string;
    tab?;
}

export interface ITabs {
    destroyInactiveTabPane?: boolean;
    renderTabBar: (...argument) => void;
    renderTabContent: () => any;
    onChange?: (event: any) => void;
    prefixCls?: string;
    className?: string;
    tabBarPosition?: string;
    style?: any;
    activeKey?: string;
    defaultActiveKey?: string;
}

export interface IInkTabBarMixin {
    prefixCls?: string;
    styles?: any;
    inkBarAnimated?: boolean;
    onKeyDown: (event: any) => void;
}

export interface ISwipeableTabContent {
    tabBarPosition?: string;
    onChange?: Function;
    children?;
    hammerOptions?;
    animated?: boolean;
    activeKey?: string;
}