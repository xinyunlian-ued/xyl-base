export interface IRangeProps {
    defaultValue?: number[];
    value?: number[];
    count?: number;
    pushable?: boolean | number;
    allowCross?: boolean;
    disabled?: boolean;
}

export interface ISliderProps {
    defaultValue?: number;
    value?: number;
    disabled?: boolean;
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