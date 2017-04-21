import React, {Component} from 'react';
import {observer} from 'mobx-react';
import * as classNames from 'classnames';
import noop from '../rc-util/noop';
import Animate from '../rc-animate/Animate';
import PanelContent from './PanelContent';
import {CollapsePanelPropTypes} from './PropsType';

@observer
export default class CollapsePanel extends Component<CollapsePanelPropTypes, any> {

    static defaultProps = {
        showArrow: true,
        isActive: false,
        onItemClick: noop,
    };

    handleItemClick() {
        this.props.onItemClick();
    }

    render() {
        const {className, style, prefixCls, header, children, isActive, showArrow} = this.props;
        const headerCls = `${prefixCls}-header`;
        const itemCls = classNames({
            [`${prefixCls}-item`]: true,
            [`${prefixCls}-item-active`]: isActive,
        }, className);
        return (
            <div className={itemCls} style={style}>
                <div
                    className={headerCls}
                    onClick={this.handleItemClick}
                    role="tab"
                    aria-expanded={isActive}
                >
                    {showArrow && <i className="arrow"/>}
                    {header}
                </div>
                <Animate
                    showProp="isActive"
                    exclusive={true}
                    component=""
                    animation={this.props.openAnimation}
                >
                    <PanelContent prefixCls={prefixCls} isActive={isActive}>
                        {children}
                    </PanelContent>
                </Animate>
            </div>
        );
    }
}