import * as React from 'react';
import {observer} from 'inferno-mobx';
import * as classNames from 'classnames';
import {IRefreshControl} from "./PropsType";

@observer
export default class RefreshControl extends React.Component<IRefreshControl, any> {

    static defaultProps = {
        prefixCls: 'list-view-refresh-control',
        distanceToRefresh: 50,
        refreshing: false,
        icon: [
            <div key="0" className="list-view-refresh-control-pull">
                ↓ 下拉
            </div>,
            <div key="1" className="list-view-refresh-control-release">
                ↑ 释放
            </div>,
        ],
        loading: <div>loading...</div>,
    };

    state = {
        active: false,
        deactive: false,
        loadingState: false,
    };

    ptr;
    bindPtr = (ptr) => {
        this.ptr = ptr;
    }

    render() {
        const {
            prefixCls, className = '', style, icon, loading, refreshing,
        } = this.props;
        const {active, deactive, loadingState} = this.state;
        const wrapCls = classNames({
            [className]: className,
            [`${prefixCls}-ptr`]: true,
            [`${prefixCls}-active`]: active,
            [`${prefixCls}-deactive`]: deactive,
            [`${prefixCls}-loading`]: loadingState || refreshing,
        });
        return (
            <div ref={this.bindPtr} className={wrapCls} style={style}>
                <div className={`${prefixCls}-ptr-icon`}>{icon}</div>
                <div className={`${prefixCls}-ptr-loading`}>{loading}</div>
            </div>
        );
    }
}