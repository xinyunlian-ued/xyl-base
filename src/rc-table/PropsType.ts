import {VNode} from "inferno";

export interface IColumnPropTypes {
    className?: string;
    colSpan?: number;
    title?: VNode;
    dataIndex?: string;
    width?: number | string;
    fixed?: true | 'left' | 'right';
    onCellClick?: (...argument) => void;
    render?: (...argument) => any;
    key?: string;
}

export interface IColumnGroupPropTypes {
    title: VNode;
}

export interface IExpandIconPropTypes {
    record?: ObjectConstructor;
    prefixCls?: string;
    expandable?: any;
    expanded?: boolean;
    needIndentSpaced?: boolean;
    onExpand?: (...argument) => void;
}

export interface ITableCellPropTypes {
    record?: ObjectConstructor;
    prefixCls?: string;
    index?: number;
    indent?: number;
    indentSize?: number;
    column?: IColumnPropTypes;
    expandIcon?: any;
}

export interface IStore {
    setState;
    getState;
    subscribe;
}

export interface ITableRowPropTypes {
    onDestroy?: (...argument) => void;
    onRowClick?: (...argument) => void;
    onRowDoubleClick?: (...argument) => void;
    record?: ObjectConstructor;
    prefixCls?: string;
    expandIconColumnIndex?: number;
    onHover?: (...argument) => void;
    columns?: IColumnPropTypes[];
    height?: string | number;
    visible?: boolean;
    index?: number;
    hoverKey?: any;
    expanded?: boolean;
    expandable?: any;
    onExpand?: (...argument) => void;
    needIndentSpaced?: boolean;
    className?: string;
    indent?: number;
    indentSize?: number;
    expandIconAsCell?: boolean;
    expandRowByClick?: boolean;
    store: IStore;
    expandedRow?: boolean;
    fixed?: boolean;
    rowKey?: string;
    childrenColumnName?;
}

export interface ITableHeaderPropTypes {
    prefixCls?: string;
    rowStyle?: ObjectConstructor;
    rows?: ITableRowPropTypes[][];
}

export interface ITablePropTypes {
    data?: any[];
    expandIconAsCell?: boolean;
    defaultExpandAllRows?: boolean;
    expandedRowKeys?: string[];
    defaultExpandedRowKeys?: string[];
    useFixedHeader?: boolean;
    columns?: IColumnPropTypes[];
    prefixCls?: string;
    bodyStyle?: any;
    style?: IColumnPropTypes;
    rowKey?: any;
    rowClassName?: (...argument) => string;
    expandedRowClassName?: (...argument) => void;
    childrenColumnName?: string;
    onExpand?: (...argument) => void;
    onExpandedRowsChange?: (...argument) => void;
    indentSize?: number;
    onRowClick?: (...argument) => void;
    onRowDoubleClick?: (...argument) => void;
    expandIconColumnIndex?: number;
    showHeader?: boolean;
    title?: (...argument) => void;
    footer?: (...argument) => void;
    emptyText?: (...argument) => any;
    scroll?: { x?; y? };
    rowRef?: (...argument) => any;
    getBodyWrapper?: (...argument) => void;
    children?: VNode;
    expandedRowRender?: (...argument) => void;
    expandRowByClick?: boolean;
    className?: string;
}