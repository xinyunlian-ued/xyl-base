import {ReactChild, CSSProperties, ReactNode} from 'react';

export interface DrawerPropTypes {
    prefixCls?: string;
    className?: string;
    children: ReactChild;
    style?: CSSProperties;
    sidebarStyle?: CSSProperties;
    contentStyle?: CSSProperties;
    overlayStyle?: CSSProperties;
    dragHandleStyle?: CSSProperties;

    // sidebar content to render
    sidebar: ReactNode;

    // boolean if sidebar should be docked
    docked?: boolean;

    // boolean if sidebar should slide open
    open?: boolean;

    // boolean if transitions should be disabled
    transitions?: boolean;

    // boolean if touch gestures are enabled
    touch?: boolean;
    enableDragHandle?: boolean;

    // where to place the sidebar
    position?: 'left' | 'right' | 'top' | 'bottom';

    // distance we have to drag the sidebar to toggle open state
    dragToggleDistance?: number;

    // callback called when the overlay is clicked
    onOpenChange?: (...argument) => void;

}