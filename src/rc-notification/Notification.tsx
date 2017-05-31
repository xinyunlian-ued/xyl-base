import createElement from 'inferno-create-element';
import Component from 'inferno-component';
import {unmountComponentAtNode, render} from "inferno-compat";
import {observer} from 'inferno-mobx';
import * as classNames from 'classnames';
import Animate from '../rc-animate/Animate';
import createChainedFunction from '../rc-util/createChainedFunction';
import Notice from './Notice';
import {NotificationPropTypes} from './PropsType';

let seed = 0;
const now = Date.now();

function getUuid() {
    return `rcNotification_${now}_${seed++}`;
}

@observer
export default class Notification extends Component<NotificationPropTypes, any> {

    static defaultProps = {
        prefixCls: 'rc-notification',
        animation: 'fade',
        style: {
            top: 65,
            left: '50%',
        }
    };

    static newInstance = function newNotificationInstance(properties) {
        const {getContainer, ...props} = properties || {} as any;
        let div;
        if (getContainer) {
            div = getContainer();
        } else {
            div = document.createElement('div');
            document.body.appendChild(div);
        }
        const notification: any = render(<Notification {...props} />, div);
        return {
            notice(noticeProps) {
                notification.add(noticeProps);
            },
            removeNotice(key) {
                notification.remove(key);
            },
            component: notification,
            destroy() {
                unmountComponentAtNode(div);
                document.body.removeChild(div);
            },
        };
    };

    state = {
        notices: []
    };

    getTransitionName = () => {
        const props = this.props;
        let transitionName = props.transitionName;
        if (!transitionName && props.animation) {
            transitionName = `${props.prefixCls}-${props.animation}`;
        }
        return transitionName;
    }

    add = (notice) => {
        const key = notice.key = notice.key || getUuid();
        this.setState((previousState) => {
            const notices = previousState.notices;
            if (!notices.filter((v) => v.key === key).length) {
                return {
                    notices: notices.concat(notice),
                };
            }
        });
    }

    remove = (key) => {
        this.setState((previousState) => {
            return {
                notices: previousState.notices.filter((notice) => notice.key !== key),
            };
        });
    }


    render() {
        const props = this.props;
        const noticeNodes = this.state.notices.map((notice) => {
            const onClose = createChainedFunction(this.remove.bind(this, notice.key), notice.onClose);
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
        const animateProps = {
            component: undefined
        };
        if (this.state.notices.length <= 1) {
            animateProps.component = '';
        }
        return (
            <div className={classNames(className)} style={props.style}>
                <Animate transitionName={this.getTransitionName()} {...animateProps}>{noticeNodes}</Animate>
            </div>
        );
    }

}

// const aaa = observer(createClass({
//
//     getDefaultProps() {
//         return {
//             prefixCls: 'rc-notification',
//             animation: 'fade',
//             style: {
//                 top: 65,
//                 left: '50%',
//             },
//         };
//     },
//
//     getInitialState() {
//         return {
//             notices: [],
//         };
//     },
//
//     getTransitionName() {
//         const props = this.props;
//         let transitionName = props.transitionName;
//         if (!transitionName && props.animation) {
//             transitionName = `${props.prefixCls}-${props.animation}`;
//         }
//         return transitionName;
//     },
//
//     add(notice) {
//         const key = notice.key = notice.key || getUuid();
//         this.setState((previousState) => {
//             const notices = previousState.notices;
//             if (!notices.filter((v) => v.key === key).length) {
//                 return {
//                     notices: notices.concat(notice),
//                 };
//             }
//         });
//     },
//
//     remove(key) {
//         this.setState((previousState) => {
//             return {
//                 notices: previousState.notices.filter((notice) => notice.key !== key),
//             };
//         });
//     },
//
//     render() {
//         const props = this.props;
//         const noticeNodes = this.state.notices.map((notice) => {
//             const onClose = createChainedFunction(this.remove.bind(this, notice.key), notice.onClose);
//             return (<Notice
//                 prefixCls={props.prefixCls}
//                 {...notice}
//                 onClose={onClose}
//             >
//                 {notice.content}
//             </Notice>);
//         });
//         const className = {
//             [props.prefixCls]: 1,
//             [props.className]: !!props.className,
//         };
//         return (
//             <div className={classNames(className)} style={props.style}>
//                 <Animate transitionName={this.getTransitionName()}>{noticeNodes}</Animate>
//             </div>
//         );
//     },
// }));
//
// Notification.newInstance = function newNotificationInstance(properties) {
//     const {getContainer, ...props} = properties || {} as any;
//     let div;
//     if (getContainer) {
//         div = getContainer();
//     } else {
//         div = document.createElement('div');
//         document.body.appendChild(div);
//     }
//     const notification: any = render(<Notification {...props} />, div);
//     return {
//         notice(noticeProps) {
//             notification.add(noticeProps);
//         },
//         removeNotice(key) {
//             notification.remove(key);
//         },
//         component: notification,
//         destroy() {
//             unmountComponentAtNode(div);
//             document.body.removeChild(div);
//         },
//     };
// };

// export default Notification;


// @observer
// export default class Notification extends React.Component<NotificationPropTypes, { notices: Notice[] }> {
//
//     static defaultProps: NotificationPropTypes = {
//         prefixCls: 'rc-notification',
//         animation: 'fade',
//         style: {
//             top: 65,
//             left: '50%',
//         }
//     };
//
//     state = {
//         notices: []
//     };
//
//     addNotice(notice: Notice) {
//         const key = notice.key = notice.key || getUuid();
//         const notices = this.state.notices;
//         if (!notices.filter((v) => v.key === key).length) {
//             return this.state.notices = notices.concat(notice);
//         }
//     }
//
//     @action removeNotice(key) {
//         return this.state.notices = this.state.notices.filter((notice) => notice.key !== key);
//     }
//
//     getTransitionName() {
//         const props = this.props;
//         let transitionName = props.transitionName;
//         if (!transitionName && props.animation) {
//             transitionName = `${props.prefixCls}-${props.animation}`;
//         }
//         return transitionName;
//     }
//
//     render() {
//         const props = this.props;
//         const noticeNodes = this.state.notices.map((notice) => {
//             const onClose = createChainedFunction(this.removeNotice.bind(this, notice.key), notice.onClose);
//             return (<Notice
//                 prefixCls={props.prefixCls}
//                 {...notice}
//                 onClose={onClose}
//             >
//                 {notice.content}
//             </Notice>);
//         });
//         const className = {
//             [props.prefixCls]: 1,
//             [props.className]: !!props.className,
//         };
//         return (
//             <div className={classNames(className)} style={props.style}>
//                 <Animate transitionName={this.getTransitionName()}>{noticeNodes}</Animate>
//             </div>
//         );
//     }
//
//     static newInstance = function newNotificationInstance(properties: NotificationInstancePropTypes) {
//         const {getContainer, ...props} = properties || {getContainer: null};
//         let div;
//         if (getContainer) {
//             div = getContainer();
//         } else {
//             div = document.createElement('div');
//             document.body.appendChild(div);
//         }
//         const notification = render(<Notification {...props} />, div) as Notification;
//         return {
//             notice(noticeProps) {
//                 notification.addNotice(noticeProps);
//             },
//             removeNotice(key) {
//                 notification.removeNotice(key);
//             },
//             component: notification,
//             destroy() {
//                 unmountComponentAtNode(div);
//                 document.body.removeChild(div);
//             },
//         };
//     };
// }
