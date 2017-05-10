export interface IRangeProps {
    defaultValue?: number[];
    value?: number[];
    count?: number;
    pushable?: boolean | number;
    allowCross?: boolean;
    disabled?: boolean;
    onChange?;
    onBeforeChange?;
    onAfterChange?;
    prefixCls?;
    vertical?;
    included?;
    handle?;
    marks?;
    step?;
    min?;
    max?;
}

export interface ISliderProps {
    defaultValue?: number;
    value?: number;
    disabled?: boolean;
    onChange?;
    onBeforeChange?;
    onAfterChange?;
    min?;
    prefixCls?;
    vertical?;
    included?;
    minimumTrackStyle?;
    handleStyle?;
    handle?;
}

export interface IHandleProps {
    className?: string;
    vertical?: boolean;
    offset?: number;
    handleStyle?: any;
}

export interface ISliderWithTooltipProps {
    tipFormatter?: any;
}