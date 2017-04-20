import React from 'react';
import ReactDOM from 'react-dom';
import {observer} from 'mobx-react';
import {observable, action} from 'mobx';
import classnames from 'classnames';
import Component from '../rc-base';
import Animate from '../rc-animate/Animate';
import createChainedFunction from '../rc-util/createChainedFunction';
import Notice from './Notice';
import {NotificationPropTypes, NotificationInstancePropTypes} from './PropsType';

let seed = 0;
const now = Date.now();

function getUuid() {
    return `rcNotification_${now}_${seed++}`;
}

@observer
export default class Notification extends Component<NotificationPropTypes, { notices: Notice[] }> {

    static defaultProps: NotificationPropTypes = {
        prefixCls: 'rc-notification',
        animation: 'fade',
        style: {
            top: 65,
            left: '50%',
        }
    };

    @observable store = {
        notices: []
    };

    @action addNotice(notice: Notice) {
        const key = notice.key = notice.key || getUuid();
        const notices = this.store.notices;
        if (!notices.filter((v) => v.key === key).length) {
            return this.store.notices = notices.concat(notice);
        }
    }

    @action removeNotice(key) {
        return this.store.notices = this.store.notices.filter((notice) => notice.key !== key);
    }

    getTransitionName() {
        const props = this.props;
        let transitionName = props.transitionName;
        if (!transitionName && props.animation) {
            transitionName = `${props.prefixCls}-${props.animation}`;
        }
        return transitionName;
    }

    render() {
        const props = this.props;
        const noticeNodes = this.state.notices.map((notice) => {
            const onClose = createChainedFunction(this.removeNotice.bind(this, notice.key), notice.onClose);
            return (<Notice
                prefixCls={props.prefixCls}
                {...notice}
                onClose={onClose}
            >
                {notice.content}
            </Notice>);
        });
        const className = {
            [props.prefixCls]: 1,
            [props.className]: !!props.className,
        };
        return (
            <div className={classnames(className)} style={props.style}>
                <Animate transitionName={this.getTransitionName()}>{noticeNodes}</Animate>
            </div>
        );
    }

    static newInstance = function newNotificationInstance(properties: NotificationInstancePropTypes) {
        const {getContainer, ...props} = properties || {getContainer: null};
        let div;
        if (getContainer) {
            div = getContainer();
        } else {
            div = document.createElement('div');
            document.body.appendChild(div);
        }
        const notification = ReactDOM.render(<Notification {...props} />, div) as Notification;
        return {
            notice(noticeProps) {
                notification.addNotice(noticeProps);
            },
            removeNotice(key) {
                notification.removeNotice(key);
            },
            component: notification,
            destroy() {
                ReactDOM.unmountComponentAtNode(div);
                document.body.removeChild(div);
            },
        };
    };
}
