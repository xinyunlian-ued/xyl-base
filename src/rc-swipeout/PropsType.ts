export interface ISwipeoutPropTypes {
    prefixCls?: string;
    autoClose?: boolean;
    disabled?: boolean;
    left?: ObjectConstructor[];
    right?: ObjectConstructor[];
    onOpen?: () => void;
    onClose?: () => void;
    children?: () => void;
}