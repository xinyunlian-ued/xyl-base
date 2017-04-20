import React from 'react';
import {observer} from 'mobx-react';
import classnames from 'classnames';
import {PanelContentPropTypes} from './PropsType';

@observer
export default class PanelContent extends React.Component<PanelContentPropTypes, any> {

    _isActived;

    shouldComponentUpdate(nextProps) {
        return this.props.isActive || nextProps.isActive;
    }

    render() {
        this._isActived = this._isActived || this.props.isActive;
        if (!this._isActived) {
            return null;
        }
        const {prefixCls, isActive, children} = this.props;
        const contentCls = classnames({
            [`${prefixCls}-content`]: true,
            [`${prefixCls}-content-active`]: isActive,
            [`${prefixCls}-content-inactive`]: !isActive,
        });
        return (
            <div
                className={contentCls}
                role="tabpanel"
            >
                <div className={`${prefixCls}-content-box`}>{children}</div>
            </div>
        );
    }
}