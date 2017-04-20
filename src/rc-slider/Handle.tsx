import React from 'react';
import assign from 'object-assign';
import {observer} from 'mobx-react';
import {IHandlePropTypes} from "rc-slider/PropsType";

@observer
export default class Handle extends React.Component<IHandlePropTypes, any> {
    render() {
        const {
            className, vertical, offset, handleStyle, ...restProps,
        } = this.props;
        const style = vertical ? {bottom: `${offset}%`} : {left: `${offset}%`};
        return (
            <div {...restProps} className={className} style={assign({}, style, handleStyle)}/>
        );
    }
}