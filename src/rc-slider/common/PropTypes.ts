export interface IComponentEnhancer {
    min?: number;
    max?: number;
    step?: number;
    marks?: any;
    included?: boolean;
    className?: string;
    prefixCls?: string;
    disabled?: boolean;
    children?: any;
    onBeforeChange?: any;
    onChange?: any;
    onAfterChange?: any;
    handle?: any;
    dots?: boolean;
    vertical?: boolean;
    style?: any;
    minimumTrackStyle?: any;
    maximumTrackStyle?: any;
    handleStyle?: any;
}