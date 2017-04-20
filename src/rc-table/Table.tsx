import React, {CSSProperties} from 'react';
import TableRow from './TableRow';
import TableHeader from './TableHeader';
import {measureScrollbar, debounce, warningOnce} from './utils';
import shallowequal from 'shallowequal';
import addEventListener from 'rc-util/Dom/addEventListener';
import ColumnManager from './ColumnManager';
import createStore from './createStore';
import classes from 'component-classes';
import Component from "rc-base/index";
import {ITablePropTypes} from "./PropsType";
import noop from "../rc-util/noop";
import Column from './Column';
import ColumnGroup from './ColumnGroup';

export default class Table extends Component<ITablePropTypes, any> {

    static Column = Column;
    static ColumnGroup = ColumnGroup;

    static defaultProps: ITablePropTypes = {
        data: [],
        useFixedHeader: false,
        expandIconAsCell: false,
        defaultExpandAllRows: false,
        defaultExpandedRowKeys: [],
        rowKey: 'key',
        rowClassName: () => '',
        expandedRowClassName: () => '',
        onExpand: noop,
        onExpandedRowsChange: noop,
        onRowClick: noop,
        onRowDoubleClick: noop,
        prefixCls: 'rc-table',
        bodyStyle: {},
        style: {},
        childrenColumnName: 'children',
        indentSize: 15,
        expandIconColumnIndex: 0,
        showHeader: true,
        scroll: {},
        rowRef: () => null,
        getBodyWrapper: (body) => body,
        emptyText: () => 'No Data',
    };

    columnManager;

    constructor(props) {
        super(props);
        let expandedRowKeys = [];
        let rows = [...props.data];
        this.columnManager = new ColumnManager(props.columns, props.children);
        this.store = createStore({
            currentHoverKey: null,
            expandedRowsHeight: {},
        });
        this.setScrollPosition('left');

        if (props.defaultExpandAllRows) {
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                expandedRowKeys.push(this.getRowKey(row, i));
                rows = rows.concat(row[props.childrenColumnName] || []);
            }
        } else {
            expandedRowKeys = props.expandedRowKeys || props.defaultExpandedRowKeys;
        }
        this.state = {
            expandedRowKeys,
            currentHoverKey: null,
            fixedColumnsHeadRowsHeight: [],
            fixedColumnsBodyRowsHeight: [],
        };
    }

    debouncedWindowResize;
    resizeEvent;

    componentDidMount() {
        if (this.columnManager.isAnyColumnsFixed()) {
            this.handleWindowResize();
            this.debouncedWindowResize = debounce(this.handleWindowResize, 150);
            this.resizeEvent = addEventListener(
                window, 'resize', this.debouncedWindowResize
            );
        }
    }

    componentWillReceiveProps(nextProps) {
        if ('expandedRowKeys' in nextProps) {
            this.setState({
                expandedRowKeys: nextProps.expandedRowKeys,
            });
        }
        if (nextProps.columns && nextProps.columns !== this.props.columns) {
            this.columnManager.reset(nextProps.columns);
        } else if (nextProps.children !== this.props.children) {
            this.columnManager.reset(null, nextProps.children);
        }
    }

    componentDidUpdate(prevProps) {
        if (this.columnManager.isAnyColumnsFixed()) {
            this.handleWindowResize();
        }
        // when table changes to empty, reset scrollLeft
        if (prevProps.data.length > 0 && this.props.data.length === 0 && this.hasScrollX()) {
            this.resetScrollX();
        }
    }

    componentWillUnmount() {
        if (this.resizeEvent) {
            this.resizeEvent.remove();
        }
        if (this.debouncedWindowResize) {
            this.debouncedWindowResize.cancel();
        }
    }

    onExpandedRowsChange(expandedRowKeys) {
        if (!this.props.expandedRowKeys) {
            this.setState({expandedRowKeys});
        }
        this.props.onExpandedRowsChange(expandedRowKeys);
    }

    onExpanded = (expanded, record, e, index) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        const info = this.findExpandedRow(record);
        if (typeof info !== 'undefined' && !expanded) {
            this.onRowDestroy(record, index);
        } else if (!info && expanded) {
            const expandedRows = this.getExpandedRows().concat();
            expandedRows.push(this.getRowKey(record, index));
            this.onExpandedRowsChange(expandedRows);
        }
        this.props.onExpand(expanded, record);
    }

    onRowDestroy = (record, rowIndex) => {
        const expandedRows = this.getExpandedRows().concat();
        const rowKey = this.getRowKey(record, rowIndex);
        let index = -1;
        expandedRows.forEach((r, i) => {
            if (r === rowKey) {
                index = i;
            }
        });
        if (index !== -1) {
            expandedRows.splice(index, 1);
        }
        this.onExpandedRowsChange(expandedRows);
    }

    getRowKey(record, index) {
        const rowKey = this.props.rowKey;
        const key = (typeof rowKey === 'function') ?
            rowKey(record, index) : record[rowKey];
        warningOnce(
            key !== undefined,
            'Each record in table should have a unique `key` prop,' +
            'or set `rowKey` to an unique primary key.'
        );
        return key === undefined ? index : key;
    }

    getExpandedRows() {
        return this.props.expandedRowKeys || this.state.expandedRowKeys;
    }

    getHeader(columns, fixed) {
        const {showHeader, expandIconAsCell, prefixCls} = this.props;
        const rows = this.getHeaderRows(columns);

        if (expandIconAsCell && fixed !== 'right') {
            rows[0].unshift({
                key: 'rc-table-expandIconAsCell',
                className: `${prefixCls}-expand-icon-th`,
                title: '',
                rowSpan: rows.length,
            });
        }

        const trStyle: any = fixed ? this.getHeaderRowStyle(columns, rows) : null;

        return showHeader ? (
            <TableHeader
                prefixCls={prefixCls}
                rows={rows}
                rowStyle={trStyle}
            />
        ) : null;
    }

    getHeaderRows(columns, currentRow = 0, rows?) {
        rows = rows || [];
        rows[currentRow] = rows[currentRow] || [];

        columns.forEach((column) => {
            if (column.rowSpan && rows.length < column.rowSpan) {
                while (rows.length < column.rowSpan) {
                    rows.push([]);
                }
            }
            const cell = {
                key: column.key,
                className: column.className || '',
                children: column.title,
                colSpan: undefined,
                rowSpan: undefined
            };
            if (column.children) {
                this.getHeaderRows(column.children, currentRow + 1, rows);
            }
            if ('colSpan' in column) {
                cell.colSpan = column.colSpan;
            }
            if ('rowSpan' in column) {
                cell.rowSpan = column.rowSpan;
            }
            if (cell.colSpan !== 0) {
                rows[currentRow].push(cell);
            }
        });
        return rows.filter((row) => row.length > 0);
    }

    getExpandedRow(key, content, visible, className, fixed) {
        const {prefixCls, expandIconAsCell} = this.props;
        let colCount;
        if (fixed === 'left') {
            colCount = this.columnManager.leftLeafColumns().length;
        } else if (fixed === 'right') {
            colCount = this.columnManager.rightLeafColumns().length;
        } else {
            colCount = this.columnManager.leafColumns().length;
        }
        const columns = [{
            key: 'extra-row',
            render: () => ({
                props: {
                    colSpan: colCount,
                },
                children: fixed !== 'right' ? content : '&nbsp;',
            }),
        }];
        if (expandIconAsCell && fixed !== 'right') {
            columns.unshift({
                key: 'expand-icon-placeholder',
                render: () => null,
            });
        }
        return (
            <TableRow
                columns={columns}
                visible={visible}
                className={className}
                key={`${key}-extra-row`}
                rowKey={`${key}-extra-row`}
                prefixCls={`${prefixCls}-expanded-row`}
                indent={1}
                expandable={false}
                store={this.store}
                expandedRow={true}
                fixed={!!fixed}
            />
        );
    }

    getRowsByData(data, visible, indent, columns, fixed) {
        const props = this.props;
        const childrenColumnName = props.childrenColumnName;
        const expandedRowRender = props.expandedRowRender;
        const expandRowByClick = props.expandRowByClick;
        const {fixedColumnsBodyRowsHeight} = this.state;
        let rst = [];
        const rowClassName = props.rowClassName;
        const rowRef = props.rowRef;
        const expandedRowClassName = props.expandedRowClassName;
        const needIndentSpaced = props.data.some((record) => record[childrenColumnName]);
        const onRowClick = props.onRowClick;
        const onRowDoubleClick = props.onRowDoubleClick;

        const expandIconAsCell = fixed !== 'right' ? props.expandIconAsCell : false;
        const expandIconColumnIndex = fixed !== 'right' ? props.expandIconColumnIndex : -1;

        for (let i = 0; i < data.length; i++) {
            const record = data[i];
            const key = this.getRowKey(record, i);
            const childrenColumn = record[childrenColumnName];
            const isRowExpanded = this.isRowExpanded(record, i);
            let expandedRowContent;
            if (expandedRowRender && isRowExpanded) {
                expandedRowContent = expandedRowRender(record, i, indent);
            }
            const className = rowClassName(record, i, indent);

            const onHoverProps = {onHover: undefined};
            if (this.columnManager.isAnyColumnsFixed()) {
                onHoverProps.onHover = this.handleRowHover;
            }

            const height = (fixed && fixedColumnsBodyRowsHeight[i]) ?
                fixedColumnsBodyRowsHeight[i] : null;

            let leafColumns;
            if (fixed === 'left') {
                leafColumns = this.columnManager.leftLeafColumns();
            } else if (fixed === 'right') {
                leafColumns = this.columnManager.rightLeafColumns();
            } else {
                leafColumns = this.columnManager.leafColumns();
            }

            rst.push(
                <TableRow
                    indent={indent}
                    indentSize={props.indentSize}
                    needIndentSpaced={needIndentSpaced}
                    className={className}
                    record={record}
                    expandIconAsCell={expandIconAsCell}
                    onDestroy={this.onRowDestroy}
                    index={i}
                    visible={visible}
                    expandRowByClick={expandRowByClick}
                    onExpand={this.onExpanded}
                    expandable={childrenColumn || expandedRowRender}
                    expanded={isRowExpanded}
                    prefixCls={`${props.prefixCls}-row`}
                    childrenColumnName={childrenColumnName}
                    columns={leafColumns}
                    expandIconColumnIndex={expandIconColumnIndex}
                    onRowClick={onRowClick}
                    onRowDoubleClick={onRowDoubleClick}
                    height={height}
                    {...onHoverProps}
                    key={key}
                    hoverKey={key}
                    ref={rowRef(record, i, indent)}
                    store={this.store}
                />
            );

            const subVisible = visible && isRowExpanded;

            if (expandedRowContent && isRowExpanded) {
                rst.push(this.getExpandedRow(
                    key, expandedRowContent, subVisible, expandedRowClassName(record, i, indent), fixed
                ));
            }
            if (childrenColumn) {
                rst = rst.concat(this.getRowsByData(
                    childrenColumn, subVisible, indent + 1, columns, fixed
                ));
            }
        }
        return rst;
    }

    getRows(columns, fixed) {
        return this.getRowsByData(this.props.data, true, 0, columns, fixed);
    }

    getColGroup(columns, fixed) {
        let cols = [];
        if (this.props.expandIconAsCell && fixed !== 'right') {
            cols.push(
                <col
                    className={`${this.props.prefixCls}-expand-icon-col`}
                    key="rc-table-expand-icon-col"
                />
            );
        }
        let leafColumns;
        if (fixed === 'left') {
            leafColumns = this.columnManager.leftLeafColumns();
        } else if (fixed === 'right') {
            leafColumns = this.columnManager.rightLeafColumns();
        } else {
            leafColumns = this.columnManager.leafColumns();
        }
        cols = cols.concat(leafColumns.map((c) => {
            return <col key={c.key} style={{width: c.width, minWidth: c.width}}/>;
        }));
        return <colgroup>{cols}</colgroup>;
    }

    getLeftFixedTable() {
        return this.getTable({
            columns: this.columnManager.leftColumns(),
            fixed: 'left',
        });
    }

    getRightFixedTable() {
        return this.getTable({
            columns: this.columnManager.rightColumns(),
            fixed: 'right',
        });
    }

    getTable(options = {columns: undefined, fixed: undefined}) {
        const {columns, fixed} = options;
        const {prefixCls, scroll = {}, getBodyWrapper} = this.props;
        let {useFixedHeader} = this.props;
        const bodyStyle = {...this.props.bodyStyle};
        const headStyle: CSSProperties = {};

        let tableClassName = '';
        if (scroll.x || fixed) {
            tableClassName = `${prefixCls}-fixed`;
            bodyStyle.overflowX = bodyStyle.overflowX || 'auto';
        }

        const innerBodyStyle = {maxHeight: undefined, overflowY: undefined};
        if (scroll.y) {
            // maxHeight will make fixed-Table scrolling not working
            // so we only set maxHeight to body-Table here
            if (fixed) {
                innerBodyStyle.maxHeight = bodyStyle.maxHeight || scroll.y;
                innerBodyStyle.overflowY = bodyStyle.overflowY || 'scroll';
            } else {
                bodyStyle.maxHeight = bodyStyle.maxHeight || scroll.y;
            }
            bodyStyle.overflowY = bodyStyle.overflowY || 'scroll';
            useFixedHeader = true;

            // Add negative margin bottom for scroll bar overflow bug
            const scrollbarWidth = measureScrollbar();
            if (scrollbarWidth > 0) {
                (fixed ? bodyStyle : headStyle).marginBottom = `-${scrollbarWidth}px`;
                (fixed ? bodyStyle : headStyle).paddingBottom = '0px';
            }
        }

        const renderTable = (hasHead = true, hasBody = true) => {
            const tableStyle = {tableLayout: undefined, width: undefined};
            if (!fixed && scroll.x) {
                // not set width, then use content fixed width
                if (scroll.x === true) {
                    tableStyle.tableLayout = 'fixed';
                } else {
                    tableStyle.width = scroll.x;
                }
            }
            const tableBody = hasBody ? getBodyWrapper(
                <tbody className={`${prefixCls}-tbody`}>
                {this.getRows(columns, fixed)}
                </tbody>
            ) : null;
            return (
                <table className={tableClassName} style={tableStyle} key="table">
                    {this.getColGroup(columns, fixed)}
                    {hasHead ? this.getHeader(columns, fixed) : null}
                    {tableBody}
                </table>
            );
        };

        let headTable;

        if (useFixedHeader) {
            headTable = (
                <div
                    key="headTable"
                    className={`${prefixCls}-header`}
                    ref={fixed ? null : 'headTable'}
                    style={headStyle}
                    onMouseOver={this.detectScrollTarget}
                    onTouchStart={this.detectScrollTarget}
                    onScroll={this.handleBodyScroll}
                >
                    {renderTable(true, false)}
                </div>
            );
        }

        let bodyTable = (
            <div
                key="bodyTable"
                className={`${prefixCls}-body`}
                style={bodyStyle}
                ref="bodyTable"
                onMouseOver={this.detectScrollTarget}
                onTouchStart={this.detectScrollTarget}
                onScroll={this.handleBodyScroll}
            >
                {renderTable(!useFixedHeader)}
            </div>
        );

        if (fixed && columns.length) {
            let refName;
            if (columns[0].fixed === 'left' || columns[0].fixed === true) {
                refName = 'fixedColumnsBodyLeft';
            } else if (columns[0].fixed === 'right') {
                refName = 'fixedColumnsBodyRight';
            }
            delete bodyStyle.overflowX;
            delete bodyStyle.overflowY;
            bodyTable = (
                <div
                    key="bodyTable"
                    className={`${prefixCls}-body-outer`}
                    style={{...bodyStyle}}
                >
                    <div
                        className={`${prefixCls}-body-inner`}
                        style={innerBodyStyle}
                        ref={refName}
                        onMouseOver={this.detectScrollTarget}
                        onTouchStart={this.detectScrollTarget}
                        onScroll={this.handleBodyScroll}
                    >
                        {renderTable(!useFixedHeader)}
                    </div>
                </div>
            );
        }
        return [headTable, bodyTable];
    }

    getTitle() {
        const {title, prefixCls} = this.props;
        return title ? (
            <div className={`${prefixCls}-title`} key="title">
                {title(this.props.data)}
            </div>
        ) : null;
    }

    getFooter() {
        const {footer, prefixCls} = this.props;
        return footer ? (
            <div className={`${prefixCls}-footer`} key="footer">
                {footer(this.props.data)}
            </div>
        ) : null;
    }

    getEmptyText() {
        const {emptyText, prefixCls, data} = this.props;
        return !data.length ? (
            <div className={`${prefixCls}-placeholder`} key="emptyText">
                {(typeof emptyText === 'function') ? emptyText() : emptyText}
            </div>
        ) : null;
    }

    getHeaderRowStyle(columns, rows) {
        const {fixedColumnsHeadRowsHeight} = this.state;
        const headerHeight = fixedColumnsHeadRowsHeight[0];
        if (headerHeight && columns) {
            if (headerHeight === 'auto') {
                return {height: 'auto'};
            }
            return {height: headerHeight / rows.length};
        }
        return null;
    }

    scrollPosition;
    tableNode;

    setScrollPosition(position) {
        this.scrollPosition = position;
        if (this.tableNode) {
            const {prefixCls} = this.props;
            if (position === 'both') {
                classes(this.tableNode)
                    .remove(new RegExp(`^${prefixCls}-scroll-position-.+$`))
                    .add(`${prefixCls}-scroll-position-left`)
                    .add(`${prefixCls}-scroll-position-right`);
            } else {
                classes(this.tableNode)
                    .remove(new RegExp(`^${prefixCls}-scroll-position-.+$`))
                    .add(`${prefixCls}-scroll-position-${position}`);
            }
        }
    }

    setScrollPositionClassName(target?) {
        const node = target || this.refs.bodyTable;
        const scrollToLeft = node.scrollLeft === 0;
        const scrollToRight = node.scrollLeft + 1 >=
            node.children[0].getBoundingClientRect().width -
            node.getBoundingClientRect().width;
        if (scrollToLeft && scrollToRight) {
            this.setScrollPosition('both');
        } else if (scrollToLeft) {
            this.setScrollPosition('left');
        } else if (scrollToRight) {
            this.setScrollPosition('right');
        } else if (this.scrollPosition !== 'middle') {
            this.setScrollPosition('middle');
        }
    }

    handleWindowResize = () => {
        this.syncFixedTableRowHeight();
        this.setScrollPositionClassName();
    }

    syncFixedTableRowHeight = () => {
        const tableRect = this.tableNode.getBoundingClientRect();
        // If tableNode's height less than 0, suppose it is hidden and don't recalculate rowHeight.
        // see: https://github.com/ant-design/ant-design/issues/4836
        if (tableRect.height !== undefined && tableRect.height <= 0) {
            return;
        }
        const {prefixCls} = this.props;
        const headRows = ((me) => {
            if (me.refs.headTable) {
                const headTable: any = me.refs.headTable;
                return headTable.querySelectorAll('thead');
            } else {
                const bodyTable: any = me.refs.bodyTable;
                return bodyTable.querySelectorAll('thead');
            }
        })(this);

        const bodyRows = ((me) => {
            const bodyTable: any = me.refs.bodyTable;
            return bodyTable.querySelectorAll(`.${prefixCls}-row`) || [];
        })(this);
        const fixedColumnsHeadRowsHeight = [].map.call(
            headRows, (row) => row.getBoundingClientRect().height || 'auto'
        );
        const fixedColumnsBodyRowsHeight = [].map.call(
            bodyRows, (row) => row.getBoundingClientRect().height || 'auto'
        );
        if (shallowequal(this.state.fixedColumnsHeadRowsHeight, fixedColumnsHeadRowsHeight) &&
            shallowequal(this.state.fixedColumnsBodyRowsHeight, fixedColumnsBodyRowsHeight)) {
            return;
        }
        this.setState({
            fixedColumnsHeadRowsHeight,
            fixedColumnsBodyRowsHeight,
        });
    }

    resetScrollX() {
        if (this.refs.headTable) {
            (this.refs.headTable as HTMLElement).scrollLeft = 0;
        }
        if (this.refs.bodyTable) {
            (this.refs.bodyTable as HTMLElement).scrollLeft = 0;
        }
    }

    findExpandedRow(record, index?) {
        const rows = this.getExpandedRows().filter((i) => i === this.getRowKey(record, index));
        return rows[0];
    }

    isRowExpanded(record, index) {
        return typeof this.findExpandedRow(record, index) !== 'undefined';
    }

    scrollTarget;

    detectScrollTarget = (e) => {
        if (this.scrollTarget !== e.currentTarget) {
            this.scrollTarget = e.currentTarget;
        }
    }

    hasScrollX() {
        const {scroll = {}} = this.props;
        return 'x' in scroll;
    }

    lastScrollLeft;

    handleBodyScroll = (e) => {
        // Prevent scrollTop setter trigger onScroll event
        // http://stackoverflow.com/q/1386696
        if (e.target !== this.scrollTarget) {
            return;
        }
        const {scroll = {}} = this.props;
        const headTable: any = this.refs.headTable;
        const bodyTable: any = this.refs.bodyTable;
        const fixedColumnsBodyLeft: any = this.refs.bodyTable;
        const fixedColumnsBodyRight: any = this.refs.fixedColumnsBodyRight;
        if (scroll.x && e.target.scrollLeft !== this.lastScrollLeft) {
            if (e.target === bodyTable && headTable) {
                headTable.scrollLeft = e.target.scrollLeft;
            } else if (e.target === headTable && bodyTable) {
                bodyTable.scrollLeft = e.target.scrollLeft;
            }
            this.setScrollPositionClassName(e.target);
        }
        if (scroll.y) {
            if (fixedColumnsBodyLeft && e.target !== fixedColumnsBodyLeft) {
                fixedColumnsBodyLeft.scrollTop = e.target.scrollTop;
            }
            if (fixedColumnsBodyRight && e.target !== fixedColumnsBodyRight) {
                fixedColumnsBodyRight.scrollTop = e.target.scrollTop;
            }
            if (bodyTable && e.target !== bodyTable) {
                bodyTable.scrollTop = e.target.scrollTop;
            }
        }
        // Remember last scrollLeft for scroll direction detecting.
        this.lastScrollLeft = e.target.scrollLeft;
    }

    handleRowHover = (isHover, key) => {
        this.store.setState({
            currentHoverKey: isHover ? key : null,
        });
    }

    render() {
        const props = this.props;
        const prefixCls = props.prefixCls;

        let className = props.prefixCls;
        if (props.className) {
            className += ` ${props.className}`;
        }
        if (props.useFixedHeader || (props.scroll && props.scroll.y)) {
            className += ` ${prefixCls}-fixed-header`;
        }
        if (this.scrollPosition === 'both') {
            className += ` ${prefixCls}-scroll-position-left ${prefixCls}-scroll-position-right`;
        } else {
            className += ` ${prefixCls}-scroll-position-${this.scrollPosition}`;
        }

        const isTableScroll =
            this.columnManager.isAnyColumnsFixed() || props.scroll.x || props.scroll.y;

        const content = [
            this.getTable({columns: this.columnManager.groupedColumns(), fixed: undefined}),
            this.getEmptyText(),
            this.getFooter(),
        ];

        const scrollTable = isTableScroll
            ? <div className={`${prefixCls}-scroll`}>{content}</div>
            : content;

        return (
            <div ref={this.setRef(this)} className={className} style={props.style}>
                {this.getTitle()}
                <div className={`${prefixCls}-content`}>
                    {scrollTable}
                    {this.columnManager.isAnyColumnsLeftFixed() &&
                    <div className={`${prefixCls}-fixed-left`}>
                        {this.getLeftFixedTable()}
                    </div>}
                    {this.columnManager.isAnyColumnsRightFixed() &&
                    <div className={`${prefixCls}-fixed-right`}>
                        {this.getRightFixedTable()}
                    </div>}
                </div>
            </div>
        );
    }

    setRef(me) {
        return (node) => {
            me.tableNode = node;
        };
    }
}