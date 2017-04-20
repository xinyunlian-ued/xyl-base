import {IComponentEnhancerPropTypes} from "./common/PropsType";

export interface IHandlePropTypes {
    className?: string;
    vertical?: boolean;
    offset?: number;
    handleStyle?: ObjectConstructor;
    onMouseEnter;
    onMouseLeave;
}

export interface IRangePropTypes extends IComponentEnhancerPropTypes {
    defaultValue?: number[];
    value?: number[];
    count?: number;
    pushable?: number;
    allowCross?: boolean;
    disabled?: boolean;
    prefixCls?: string;
    vertical?;
    included?;
    handle?;
    min?;
    max?;
    onChange?;
    onBeforeChange?;
    marks?;
    step?;
}

export interface ISlider extends IComponentEnhancerPropTypes {
    defaultValue?: number;
    value?: number;
    disabled?: boolean;
}

export interface IComponentWrapper {
    tipFormatter?: (...argument) => void;
}