import * as React from 'react';
import {observer} from 'inferno-mobx';
import {placements} from './placements';
import Trigger from '../rc-trigger';
import {ITooltip} from './PropsType';

@observer
export default class Tooltip extends React.Component<ITooltip, any> {

    static defaultProps = {
        prefixCls: 'rc-tooltip',
        mouseEnterDelay: 0,
        destroyTooltipOnHide: false,
        mouseLeaveDelay: 0.1,
        align: {},
        placement: 'right',
        trigger: ['hover'],
        arrowContent: null,
    };

    trigger;
    triggerBind = (trigger) => {
        this.trigger = trigger;
    }

    getPopupElement = () => {
        const {arrowContent, overlay, prefixCls} = this.props;
        return ([
            <div className={`${prefixCls}-arrow`} key="arrow">
                {arrowContent}
            </div>,
            <div className={`${prefixCls}-inner`} key="content">
                {typeof overlay === 'function' ? overlay() : overlay}
            </div>,
        ]);
    }

    getPopupDomNode = () => {
        const trigger: any = this.trigger;
        return trigger.getPopupDomNode();
    }

    render() {
        const {
            overlayClassName, trigger,
            mouseEnterDelay, mouseLeaveDelay,
            overlayStyle, prefixCls,
            children, onVisibleChange,
            transitionName, animation,
            placement, align,
            destroyTooltipOnHide,
            defaultVisible, getTooltipContainer,
            ...restProps,
        } = this.props;
        const extraProps: any = {...restProps};
        if ('visible' in this.props) {
            extraProps.popupVisible = this.props.visible;
        }
        return (
            <Trigger
                popupClassName={overlayClassName}
                ref={this.triggerBind}
                prefixCls={prefixCls}
                popup={this.getPopupElement}
                action={trigger}
                builtinPlacements={placements}
                popupPlacement={placement}
                popupAlign={align}
                getPopupContainer={getTooltipContainer}
                onPopupVisibleChange={onVisibleChange}
                popupTransitionName={transitionName}
                popupAnimation={animation}
                defaultPopupVisible={defaultVisible}
                destroyPopupOnHide={destroyTooltipOnHide}
                mouseLeaveDelay={mouseLeaveDelay}
                popupStyle={overlayStyle}
                mouseEnterDelay={mouseEnterDelay}
                {...extraProps}
            >
                {children}
            </Trigger>);
    }

}
