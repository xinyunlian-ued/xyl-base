import React, {Component, CSSProperties} from 'react';
import {observer} from "mobx-react";
import {observable} from "mobx";
import noop from "../rc-util/noop";
import TableCell from './TableCell';
import ExpandIcon from './ExpandIcon';
import {ITableRowPropTypes} from "./PropsType";

@observer
export default class TableRow extends Component<ITableRowPropTypes, any> {

    static defaultProps = {
        onRowClick: noop,
        onRowDoubleClick: noop,
        onDestroy: noop,
        expandIconColumnIndex: 0,
        expandRowByClick: false,
        onHover: noop,
    };

    state = {
        hovered: false,
        height: null,
    };

    unsubscribe;

    componentDidMount() {
        const {store} = this.props;
        this.pushHeight();
        this.pullHeight();
        this.unsubscribe = store.subscribe(() => {
            this.setHover();
            this.pullHeight();
        });
    }

    componentWillUnmount() {
        const {record, onDestroy, index} = this.props;
        onDestroy(record, index);
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }

    onRowClick = (event) => {
        const {
            record,
            index,
            onRowClick,
            expandable,
            expandRowByClick,
            expanded,
            onExpand,
        } = this.props;
        if (expandable && expandRowByClick) {
            onExpand(!expanded, record, event, index);
        }
        onRowClick(record, index, event);
    }

    onRowDoubleClick = (event) => {
        const {record, index, onRowDoubleClick} = this.props;
        onRowDoubleClick(record, index, event);
    }

    onMouseEnter = () => {
        const {onHover, hoverKey} = this.props;
        onHover(true, hoverKey);
    }

    onMouseLeave = () => {
        const {onHover, hoverKey} = this.props;
        onHover(false, hoverKey);
    }

    setHover() {
        const {store, hoverKey} = this.props;
        const {currentHoverKey} = store.getState();
        if (currentHoverKey === hoverKey) {
            this.setState({hovered: true});
        } else if (this.state.hovered === true) {
            this.setState({hovered: false});
        }
    }

    pullHeight() {
        const {store, expandedRow, fixed, rowKey} = this.props;
        const {expandedRowsHeight} = store.getState();
        if (expandedRow && fixed && expandedRowsHeight[rowKey]) {
            this.setState({height: expandedRowsHeight[rowKey]});
        }
    }

    trRef;

    pushHeight() {
        const {store, expandedRow, fixed, rowKey} = this.props;
        if (expandedRow && !fixed) {
            const {expandedRowsHeight} = store.getState();
            const height = this.trRef.getBoundingClientRect().height;
            expandedRowsHeight[rowKey] = height;
            store.setState({expandedRowsHeight});
        }
    }

    render() {
        const {
            prefixCls, columns, record, visible, index,
            expandIconColumnIndex, expandIconAsCell, expanded, expandRowByClick,
            expandable, onExpand, needIndentSpaced, indent, indentSize,
        } = this.props;

        let {className} = this.props;

        if (this.state.hovered) {
            className += ` ${prefixCls}-hover`;
        }

        const cells = [];

        const expandIcon = (
            <ExpandIcon
                expandable={expandable}
                prefixCls={prefixCls}
                onExpand={onExpand}
                needIndentSpaced={needIndentSpaced}
                expanded={expanded}
                record={record}
            />
        );

        for (let i = 0; i < columns.length; i++) {
            if (expandIconAsCell && i === 0) {
                cells.push(
                    <td
                        className={`${prefixCls}-expand-icon-cell`}
                        key="rc-table-expand-icon-cell"
                    >
                        {expandIcon}
                    </td>
                );
            }
            const isColumnHaveExpandIcon = (expandIconAsCell || expandRowByClick)
                ? false : (i === expandIconColumnIndex);
            cells.push(
                <TableCell
                    prefixCls={prefixCls}
                    record={record}
                    indentSize={indentSize}
                    indent={indent}
                    index={index}
                    column={columns[i]}
                    key={columns[i].key}
                    expandIcon={isColumnHaveExpandIcon ? expandIcon : null}
                />
            );
        }
        const height = this.props.height || this.state.height;
        const style: CSSProperties = {height};
        if (!visible) {
            style.display = 'none';
        }

        return (
            <tr
                ref={this.setTrRef(this)}
                onClick={this.onRowClick}
                onDoubleClick={this.onRowDoubleClick}
                onMouseEnter={this.onMouseEnter}
                onMouseLeave={this.onMouseLeave}
                className={`${prefixCls} ${className} ${prefixCls}-level-${indent}`}
                style={style}
            >
                {cells}
            </tr>
        );
    }

    setTrRef(me) {
        return (node) => {
            me.trRef = node;
        };
    }
}
