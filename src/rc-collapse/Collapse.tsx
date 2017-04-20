import React, {Children} from 'react';
import {observable} from 'mobx';
import {observer} from 'mobx-react';
import classNames from 'classnames';
import noop from 'rc-util/noop';
import Component from 'rc-base';
import CollapsePanel from './Panel';
import openAnimationFactory from './openAnimationFactory';
import {CollapsePropTypes} from './PropsType';

@observer
export default class Collapse extends Component<CollapsePropTypes, any> {

    static defaultProps = {
        prefixCls: 'rc-collapse',
        onChange: noop,
        accordion: false,
    };

    static Panel = CollapsePanel;

    @observable store = {
        openAnimation: this.props.openAnimation || openAnimationFactory(this.props.prefixCls),
        activeKey: toArray('activeKey' in this.props ? this.props.activeKey : this.props.defaultActiveKey)
    };

    componentWillReceiveProps(nextProps) {
        if ('activeKey' in nextProps) {
            this.changeStore({
                activeKey: toArray(nextProps.activeKey),
            });
        }
        if ('openAnimation' in nextProps) {
            this.changeStore({
                openAnimation: nextProps.openAnimation,
            });
        }
    }

    onClickItem(key) {
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

    getItems() {

        const activeKey = this.state.activeKey;
        const {prefixCls, accordion, children} = this.props;
        const newChildren = [];

        Children.forEach(children, (child: any, index) => {

            const key = child.key || String(index);
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
                isActive,
                prefixCls,
                openAnimation: this.state.openAnimation,
                children: child.props.children,
                onItemClick: this.onClickItem(key).bind(this),
            };

            newChildren.push(React.cloneElement(child, props));
        });

        return newChildren;
    }

    setActiveKey(activeKey) {
        if (!('activeKey' in this.props)) {
            this.changeStore({activeKey});
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

function toArray(activeKey) {
    let currentActiveKey = activeKey;
    if (!Array.isArray(currentActiveKey)) {
        currentActiveKey = currentActiveKey ? [currentActiveKey] : [];
    }
    return currentActiveKey;
}