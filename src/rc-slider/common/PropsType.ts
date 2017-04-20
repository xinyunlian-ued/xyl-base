export interface MarksPropTypes {
    className?: string;
    vertical?: boolean;
    marks?: ObjectConstructor;
    included?: boolean;
    upperBound?: number;
    lowerBound?: number;
    max?: number;
    min?: number;
}

export interface IStepsPropTypes {
    prefixCls;
    vertical;
    marks;
    dots;
    step;
    included;
    lowerBound;
    upperBound;
    max;
    min;
}

export interface ITrackPropTypes {
    className;
    included;
    vertical;
    offset;
    length;
    minimumTrackStyle;
}

export interface IComponentEnhancerPropTypes {
    min?: number;
    max?: number;
    step?: number;
    marks?: ObjectConstructor;
    included?: boolean;
    className?: string;
    prefixCls?: string;
    disabled?: boolean;
    children?: any;
    onBeforeChange?: (event?: any) => void;
    onChange?: (event?: any) => void;
    onAfterChange?: (event?: any) => void;
    handle?: (event?: any) => void;
    dots?: boolean;
    vertical?: boolean;
    style?: ObjectConstructor;
    minimumTrackStyle?: ObjectConstructor;
    maximumTrackStyle?: ObjectConstructor;
    handleStyle?: ObjectConstructor;
}