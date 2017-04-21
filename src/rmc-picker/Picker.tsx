import React, {Children, Component} from 'react';
import * as classNames from 'classnames';
import ZScroller from 'zscroller';
import {IPickerProps} from './PickerTypes';
import isChildrenEqual from './isChildrenEqual';
import noop from "../rc-util/noop";
import {observer} from "mobx-react";

@observer
export default class Picker extends Component<IPickerProps, any> {

    static defaultProps() {
        return {
            prefixCls: 'rmc-picker',
            pure: true,
            onValueChange: noop,
        };
    }

    state = ((me) => {
        let selectedValueState;
        const {selectedValue, defaultSelectedValue, children} = me.props;
        if (selectedValue !== undefined) {
            selectedValueState = selectedValue;
        } else if (defaultSelectedValue !== undefined) {
            selectedValueState = defaultSelectedValue;
        } else if (children && children.length) {
            selectedValueState = children[0].value;
        }
        return {
            selectedValue: selectedValueState,
        };
    })(this);

    zscroller;

    componentDidMount() {
        // https://github.com/react-component/m-picker/issues/18
        const indicator: any = this.refs.indicator;
        const content: any = this.refs.content;
        this.itemHeight = indicator.getBoundingClientRect().height;
        // compact
        content.style.padding = `${this.itemHeight * 3}px 0`;
        this.zscroller = new ZScroller(this.refs.content, {
            scrollingX: false,
            snapping: true,
            penetrationDeceleration: .1,
            minVelocityToKeepDecelerating: 0.5,
            scrollingComplete: this.scrollingComplete,
        });
        this.zscroller.setDisabled(this.props.disabled);
        this.zscroller.scroller.setSnapSize(0, this.itemHeight);
        this.select(this.state.selectedValue);
    }

    select(value) {
        const children: any = this.toChildrenArray(this.props.children);
        for (let i = 0, len = children.length; i < len; i++) {
            if (this.getChildMember(children[i], 'value') === value) {
                this.selectByIndex(i);
                return;
            }
        }
        this.selectByIndex(0);
    }

    itemHeight;

    selectByIndex(index) {
        if (index < 0 || index >= this.toChildrenArray(this.props.children).length
            || !this.itemHeight) {
            return;
        }
        this.scrollTo(index * this.itemHeight);
    }

    doScrollingComplete(top) {
        let index = top / this.itemHeight;
        const floor = Math.floor(index);
        if (index - floor > 0.5) {
            index = floor + 1;
        } else {
            index = floor;
        }
        const children = this.toChildrenArray(this.props.children);
        index = Math.min(index, children.length - 1);
        const child: any = children[index];
        if (child) {
            this.fireValueChange(this.getChildMember(child, 'value'));
        } else if (console.warn) {
            console.warn('child not found', children, index);
        }
    }

    componentWillReceiveProps(nextProps) {
        if ('selectedValue' in nextProps) {
            this.setState({
                selectedValue: nextProps.selectedValue,
            });
        }
        this.zscroller.setDisabled(nextProps.disabled);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.state.selectedValue !== nextState.selectedValue
            || !isChildrenEqual(this.props.children, nextProps.children, this.props.pure);
    }

    componentDidUpdate() {
        this.zscroller.reflow();
        this.select(this.state.selectedValue);
    }

    componentWillUnmount() {
        this.zscroller.destroy();
    }

    scrollTo(top) {
        this.zscroller.scroller.scrollTo(0, top);
    }

    fireValueChange(selectedValue) {
        if (selectedValue !== this.state.selectedValue) {
            if (!('selectedValue' in this.props)) {
                this.setState({
                    selectedValue,
                });
            }
            this.props.onValueChange(selectedValue);
        }
    }

    scrollingComplete() {
        const {top} = this.zscroller.scroller.getValues();
        if (top >= 0) {
            this.doScrollingComplete(top);
        }
    }

    getChildMember(child, m) {
        return child[m];
    }

    getValue() {
        return this.props.selectedValue
            || this.props.children && this.props.children[0]
            && this.props.children[0].value;
    }

    toChildrenArray(children) {
        return children;
    }

    render() {
        const {
            children, prefixCls,
            className, itemStyle,
            indicatorStyle,
        } = this.props;
        const {selectedValue} = this.state;
        const itemClassName = `${prefixCls}-item`;
        const selectedItemClassName = `${itemClassName} ${prefixCls}-item-selected`;
        const items = Children.map(children, (item: any) => {
            return (
                <div
                    style={itemStyle}
                    className={selectedValue === item.value ? selectedItemClassName : itemClassName}
                    key={item.value}
                >
                    {item.label}
                </div>
            );
        });
        const pickerCls = {
            [className]: !!className,
            [prefixCls]: true,
        };
        return (
            <div
                className={classNames(pickerCls)}
            >
                <div className={`${prefixCls}-mask`}/>
                <div className={`${prefixCls}-indicator`} ref="indicator" style={indicatorStyle}/>
                <div className={`${prefixCls}-content`} ref="content">
                    {items}
                </div>
            </div>
        );
    }
}
