export interface IStepsPropTypes {
    prefixCls?: string;
    iconPrefix?: string;
    direction?: string;
    labelPlacement?: string;
    children?: any;
    status?: string;
    size?: string;
    progressDot?: () => void | boolean;
    style?: any;
    className?: string;
    current?;
}

export interface IStepPropTypes {
    className?: string;
    prefixCls?: string;
    style?: any;
    wrapperStyle?: any;
    itemWidth?: number | string;
    status?: string;
    iconPrefix?: string;
    icon?: any;
    adjustMarginRight?: number | string;
    stepNumber?: string;
    description?: any;
    title?: any;
    progressDot?: (iconDot?, option?: any) => any;
}