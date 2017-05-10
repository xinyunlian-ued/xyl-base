import React from 'react';
import {observer} from 'inferno-mobx';
import Touchable from '../rc-touchable/index';

@observer
export default class InputHandler extends React.Component<any, any> {
    render() {
        const {prefixCls, disabled, ...otherProps} = this.props;
        return (
            <Touchable disabled={disabled} activeClassName={`${prefixCls}-handler-active`}>
                <span {...otherProps} />
            </Touchable>
        );
    }
}

