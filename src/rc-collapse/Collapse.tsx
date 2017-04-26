import React, {Component, Children, cloneElement} from 'react';
import CollapsePanel from './Panel';
import openAnimationFactory from './openAnimationFactory';
import classNames from 'classnames';
import {CollapsePropTypes} from "./PropsType";
import noop from "../rc-util/noop";
import {observer} from "mobx-react";

function toArray(activeKey) {
    let currentActiveKey = activeKey;
    if (!Array.isArray(currentActiveKey)) {
        currentActiveKey = currentActiveKey ? [currentActiveKey] : [];
    }
    return currentActiveKey;
}

@observer
export default class Collapse extends Component<CollapsePropTypes, any> {

    static defaultProps = {
        prefixCls: 'rc-collapse',
        onChange: noop,
        accordion: false,
        destroyInactivePanel: false,
    };

    Panel = CollapsePanel;

    constructor(props) {
        super(props);

        const {activeKey, defaultActiveKey} = this.props;
        let currentActiveKey = defaultActiveKey;
        if ('activeKey' in this.props) {
            currentActiveKey = activeKey;
        }

        this.state = {
            openAnimation: this.props.openAnimation || openAnimationFactory(this.props.prefixCls),
            activeKey: toArray(currentActiveKey),
        };
    }

    componentWillReceiveProps(nextProps) {
        if ('activeKey' in nextProps) {
            this.setState({
                activeKey: toArray(nextProps.activeKey),
            });
        }
        if ('openAnimation' in nextProps) {
            this.setState({
                openAnimation: nextProps.openAnimation,
            });
        }
    }

    onClickItem = (key) => {
        return () => {
            let activeKey = this.state.activeKey;
            if (this.props.accordion) {
                activeKey = activeKey[0] === key ? [] : [key];
            } else {
                activeKey = [...activeKey];
                const index = activeKey.indexOf(key);
                const isActive = index > -1;
                if (isActive) {
                    // remove active state
                    activeKey.splice(index, 1);
                } else {
                    activeKey.push(key);
                }
            }
            this.setActiveKey(activeKey);
        };
    }

    getItems = () => {
        const activeKey = this.state.activeKey;
        const {prefixCls, accordion, destroyInactivePanel} = this.props;
        const newChildren = [];

        Children.forEach(this.props.children, (child: any, index) => {
            if (!child) {
                return;
            }
            // If there is no key provide, use the panel order as default key
            const key = child.key || String(index);
            const headerClass = child.props.headerClass;
            const header = child.props.header;
            let isActive = false;
            if (accordion) {
                isActive = activeKey[0] === key;
            } else {
                isActive = activeKey.indexOf(key) > -1;
            }

            const props = {
                key,
                header,
                headerClass,
                isActive,
                prefixCls,
                destroyInactivePanel,
                openAnimation: this.state.openAnimation,
                children: child.props.children,
                onItemClick: this.onClickItem(key).bind(this),
            };

            newChildren.push(cloneElement(child, props));
        });

        return newChildren;
    }

    setActiveKey = (activeKey) => {
        if (!('activeKey' in this.props)) {
            this.setState({activeKey});
        }
        this.props.onChange(this.props.accordion ? activeKey[0] : activeKey);
    }

    render() {
        const {prefixCls, className, style} = this.props;
        const collapseClassName = classNames({
            [prefixCls]: true,
            [className]: !!className,
        });
        return (
            <div className={collapseClassName} style={style}>
                {this.getItems()}
            </div>
        );
    }
}
