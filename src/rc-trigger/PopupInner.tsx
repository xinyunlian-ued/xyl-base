import React from 'react';
import LazyRenderBox from './LazyRenderBox';
import {IPopupInner} from "./PropsType";
import {observer} from "mobx-react";

@observer
export default class PopupInner extends React.Component<IPopupInner, any> {
    render() {
        const props = this.props;
        let className = props.className;
        if (!props.visible) {
            className += ` ${props.hiddenClassName}`;
        }
        return (<div
            className={className}
            onMouseEnter={props.onMouseEnter}
            onMouseLeave={props.onMouseLeave}
            style={props.style}
        >
            <LazyRenderBox className={`${props.prefixCls}-content`} visible={props.visible}>
                {props.children}
            </LazyRenderBox>
        </div>);
    }
}
