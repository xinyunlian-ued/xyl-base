import React from 'react';
import ReactDOM from 'react-dom';
import {observer} from 'mobx-react';
import cssAnimate, {isCssAnimationSupported} from 'css-animation';
import animUtil from './util';
import {AnimateChildPropTypes, TransitionMap} from './PropsType';

const transitionMap: TransitionMap = {
    enter: 'transitionEnter',
    appear: 'transitionAppear',
    leave: 'transitionLeave',
};

@observer
export default class AnimateChild extends React.Component<AnimateChildPropTypes, any> {

    static defaultProps = {
        transitionName: ''
    };

    stopper;

    componentWillUnmount() {
        this.stop();
    }

    componentWillEnter(done) {
        if (animUtil.isEnterSupported(this.props)) {
            this.transition('enter', done);
        } else {
            done();
        }
    }

    componentWillAppear(done) {
        if (animUtil.isAppearSupported(this.props)) {
            this.transition('appear', done);
        } else {
            done();
        }
    }

    componentWillLeave(done) {
        if (animUtil.isLeaveSupported(this.props)) {
            this.transition('leave', done);
        } else {
            done();
        }
    }

    transition(animationType, finishCallback) {
        const node = ReactDOM.findDOMNode(this);
        const props = this.props;
        const transitionName = props.transitionName;
        const nameIsObj = typeof transitionName === 'object';
        this.stop();
        const end = () => {
            this.stopper = null;
            finishCallback();
        };
        if ((isCssAnimationSupported || !props.animation[animationType]) &&
            transitionName && props[transitionMap[animationType]]) {
            const name = nameIsObj ? transitionName[animationType] : `${transitionName}-${animationType}`;
            let activeName = `${name}-active`;
            if (nameIsObj && transitionName[`${animationType}Active`]) {
                activeName = transitionName[`${animationType}Active`];
            }
            this.stopper = cssAnimate(node, {
                name,
                active: activeName,
            }, end);
        } else {
            this.stopper = props.animation[animationType](node, end);
        }
    }

    stop() {
        const stopper = this.stopper;
        if (stopper) {
            this.stopper = null;
            stopper.stop();
        }
    }

    render() {
        return React.Children.only(this.props.children);
    }
}
