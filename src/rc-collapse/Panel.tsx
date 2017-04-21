import React, {Component} from 'react';
import classNames from 'classnames';
import PanelContent from './PanelContent';
import Animate from '../rc-animate';
import {CollapsePanelPropTypes} from "./PropsType";
import noop from "../rc-util/noop";
import {observer} from "mobx-react";

@observer
export default class CollapsePanel extends Component<CollapsePanelPropTypes, any> {
    handleItemClick() {
        this.props.onItemClick();
    }

    static defaultProps = {
        showArrow: true,
        isActive: false,
        destroyInactivePanel: false,
        onItemClick: noop,
    };

    render() {
        const {
            className,
            style,
            prefixCls,
            header,
            children,
            isActive,
            showArrow,
            destroyInactivePanel,
        } = this.props;
        const headerCls = `${prefixCls}-header`;
        const itemCls = classNames({
            [`${prefixCls}-item`]: true,
            [`${prefixCls}-item-active`]: isActive,
        }, className);
        return (
            <div className={itemCls} style={style}>
                <div
                    className={headerCls}
                    onClick={this.handleItemClick.bind(this)}
                    role="tab"
                    aria-expanded={isActive}
                >
                    {showArrow && <i className="arrow"/>}
                    {header}
                </div>
                <Animate
                    showProp="isActive"
                    exclusive
                    component=""
                    animation={this.props.openAnimation}
                >
                    <PanelContent
                        prefixCls={prefixCls}
                        isActive={isActive}
                        destroyInactivePanel={destroyInactivePanel}
                    >
                        {children}
                    </PanelContent>
                </Animate>
            </div>
        );
    }
}
