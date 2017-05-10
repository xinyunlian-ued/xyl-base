import {ReactChildren} from 'react';

export interface IAlign {
    childrenProps?: any;
    align: any;
    target?: (...argument) => void;
    onAlign?: (...argument) => void;
    monitorBufferTime?: number;
    monitorWindowResize?: boolean;
    disabled?: boolean;
    xVisible?: boolean;
}