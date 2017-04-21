import React, {Component} from 'react';
import classnames from 'classnames';
import {PanelContentPropTypes} from "./PropsType";
import {observer} from "mobx-react";

@observer
export default class PanelContent extends Component<PanelContentPropTypes, any> {

    shouldComponentUpdate(nextProps) {
        return this.props.isActive || nextProps.isActive;
    }

    _isActived;

    render() {
        this._isActived = this._isActived || this.props.isActive;
        if (!this._isActived) {
            return null;
        }
        const {prefixCls, isActive, children, destroyInactivePanel} = this.props;
        const contentCls = classnames({
            [`${prefixCls}-content`]: true,
            [`${prefixCls}-content-active`]: isActive,
            [`${prefixCls}-content-inactive`]: !isActive,
        });
        const child = !isActive && destroyInactivePanel ? null :
            <div className={`${prefixCls}-content-box`}>{children}</div>;
        return (
            <div
                className={contentCls}
                role="tabpanel"
            >
                {child}
            </div>
        );
    }
}


