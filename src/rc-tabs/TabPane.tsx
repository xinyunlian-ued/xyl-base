import React from 'react';
import classnames from 'classnames';
import {ITabPane} from "./PropsType";
import {observer} from "mobx-react";

@observer
export default class TabPane extends React.Component<ITabPane, any> {

    static defaultProps = {placeholder: null};
    _isActived;

    render() {
        const props = this.props;
        const {className, destroyInactiveTabPane, active, forceRender} = props;
        this._isActived = this._isActived || active;
        const prefixCls = `${props.rootPrefixCls}-tabpane`;
        const cls = classnames({
            [prefixCls]: 1,
            [`${prefixCls}-inactive`]: !active,
            [`${prefixCls}-active`]: active,
            [className]: className,
        });
        const isRender = destroyInactiveTabPane ? active : this._isActived;
        return (
            <div
                style={props.style}
                role="tabpanel"
                aria-hidden={props.active ? 'false' : 'true'}
                className={cls}
            >
                {isRender || forceRender ? props.children : props.placeholder}
            </div>
        );
    }
}
