import React, {Component} from 'react';
import {observer} from 'mobx-react';
import * as classNames from 'classnames';

import noop from '../rc-util/noop';
import {NoticePropTypes} from './PropsType';

@observer
export default class Notice extends Component<NoticePropTypes, any> {

    closeTimer;
    key;
    onClose = noop;
    content;

    static defaultProps = {
        onEnd: noop,
        onClose: noop,
        duration: 1.5,
        style: {
            right: '50%',
        }
    };

    componentDidMount() {
        if (this.props.duration) {
            this.closeTimer = setTimeout(() => {
                this.close();
            }, this.props.duration * 1000);
        }
    }

    componentWillUnmount() {
        this.clearCloseTimer();
    }

    clearCloseTimer() {
        if (this.closeTimer) {
            clearTimeout(this.closeTimer);
            this.closeTimer = null;
        }
    }

    close() {
        this.clearCloseTimer();
        this.props.onClose();
    }

    render() {
        const props = this.props;
        const componentClass = `${props.prefixCls}-notice`;
        const className = {
            [`${componentClass}`]: 1,
            [`${componentClass}-closable`]: props.closable,
            [props.className]: !!props.className,
        };
        return (
            <div className={classNames(className)} style={props.style}>
                <div className={`${componentClass}-content`}>{props.children}</div>
                {props.closable ?
                    <a tabIndex={0} onClick={this.close} className={`${componentClass}-close`}>
                        <span className={`${componentClass}-close-x`}/>
                    </a> : null
                }
            </div>
        );
    }
}