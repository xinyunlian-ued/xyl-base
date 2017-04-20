import {CSSProperties, ReactNode} from "react";
export interface IStepsPropTypes {
    prefixCls?: string;
    iconPrefix?: string;
    direction?: string;
    labelPlacement?: string;
    children?: any;
    status?: string;
    size?: string;
    progressDot?: () => void | boolean;
    style?: CSSProperties;
    className?: string;
    current?;
}

export interface IStepPropTypes {
    className?: string;
    prefixCls?: string;
    style?: CSSProperties;
    wrapperStyle?: CSSProperties;
    itemWidth?: number | string;
    status?: string;
    iconPrefix?: string;
    icon?: ReactNode;
    adjustMarginRight?: number | string;
    stepNumber?: string;
    description?: any;
    title?: any;
    progressDot?: (iconDot?, option?: any) => void | boolean;
}