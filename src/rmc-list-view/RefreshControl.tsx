import React from 'react';
import classNames from 'classnames';
import Component from "../rc-base/index";
import {IRefreshControl} from "./PropsType";
import {observer} from "mobx-react";
import {observable} from "mobx";

@observer
export default class RefreshControl extends Component<IRefreshControl, any> {

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

    @observable store = {
        active: false,
        deactive: false,
        loadingState: false,
    };

    render() {
        const {
            prefixCls, className = '', style, icon, loading, refreshing,
        } = this.props;
        const {active, deactive, loadingState} = this.store;
        const wrapCls = classNames({
            [className]: className,
            [`${prefixCls}-ptr`]: true,
            [`${prefixCls}-active`]: active,
            [`${prefixCls}-deactive`]: deactive,
            [`${prefixCls}-loading`]: loadingState || refreshing,
        });
        return (
            <div ref="ptr" className={wrapCls} style={style}>
                <div className={`${prefixCls}-ptr-icon`}>{icon}</div>
                <div className={`${prefixCls}-ptr-loading`}>{loading}</div>
            </div>
        );
    }
}