import * as React from 'react';
import {observer} from 'inferno-mobx';
import {
    toArrayChildren,
    mergeChildren,
    findShownChildInChildrenByKey,
    findChildInChildrenByKey,
    isSameChildren,
} from './ChildrenUtils';
import AnimateChild from './AnimateChild';
import animUtil from './util';
import {AnimatePropTypes} from "./PropsType";
import noop from "../rc-util/noop";

const defaultKey = `rc_animate_${Date.now()}`;

function getChildrenFromProps(props) {
    const children: any = props.children;
    if (React.isValidElement(children)) {
        if (!children.key) {
            return React.cloneElement(children as any, {
                key: defaultKey,
            });
        }
    }
    return children;
}

@observer
export default class Animate extends React.Component<AnimatePropTypes, any> {

    static defaultProps = {
        animation: {},
        component: 'span',
        componentProps: {},
        transitionEnter: true,
        transitionLeave: true,
        transitionAppear: false,
        onEnd: noop,
        onEnter: noop,
        onLeave: noop,
        onAppear: noop,
    };

    currentlyAnimatingKeys = {};
    keysToEnter = [];
    keysToLeave = [];

    _refs: any = {};

    bindRef = (key) => {
        return (ref) => {
            this._refs[key] = ref;
        }
    }

    constructor(props) {
        super(props);

        this.state = {
            children: toArrayChildren(getChildrenFromProps(this.props)),
        };
    }

    componentDidMount() {
        const showProp = this.props.showProp;
        let children = this.state.children;
        if (showProp) {
            children = children.filter((child) => {
                return !!child.props[showProp];
            });
        }
        children.forEach((child) => {
            if (child) {
                this.performAppear(child.key);
            }
        });
    }

    nextProps;

    componentWillReceiveProps(nextProps) {
        this.nextProps = nextProps;
        const nextChildren = toArrayChildren(getChildrenFromProps(nextProps));
        const props = this.props;
        // exclusive needs immediate response
        if (props.exclusive) {
            Object.keys(this.currentlyAnimatingKeys).forEach((key) => {
                this.stop(key);
            });
        }
        const showProp = props.showProp;
        const currentlyAnimatingKeys = this.currentlyAnimatingKeys;
        // last props children if exclusive
        const currentChildren = props.exclusive ?
            toArrayChildren(getChildrenFromProps(props)) :
            this.state.children;
        // in case destroy in showProp mode
        let newChildren = [];
        if (showProp) {
            currentChildren.forEach((currentChild) => {
                const nextChild = currentChild && findChildInChildrenByKey(nextChildren, currentChild.key);
                let newChild;
                if ((!nextChild || !nextChild.props[showProp]) && currentChild.props[showProp]) {
                    newChild = React.cloneElement(nextChild || currentChild, {
                        [showProp]: true,
                    });
                } else {
                    newChild = nextChild;
                }
                if (newChild) {
                    newChildren.push(newChild);
                }
            });
            nextChildren.forEach((nextChild) => {
                if (!nextChild || !findChildInChildrenByKey(currentChildren, nextChild.key)) {
                    newChildren.push(nextChild);
                }
            });
        } else {
            newChildren = mergeChildren(
                currentChildren,
                nextChildren
            );
        }

        // need render to avoid update
        this.setState({
            children: newChildren,
        });

        nextChildren.forEach((child) => {
            const key = child && child.key;
            if (child && currentlyAnimatingKeys[key]) {
                return;
            }
            const hasPrev = child && findChildInChildrenByKey(currentChildren, key);
            if (showProp) {
                const showInNext = child.props[showProp];
                if (hasPrev) {
                    const showInNow = findShownChildInChildrenByKey(currentChildren, key, showProp);
                    if (!showInNow && showInNext) {
                        this.keysToEnter.push(key);
                    }
                } else if (showInNext) {
                    this.keysToEnter.push(key);
                }
            } else if (!hasPrev) {
                this.keysToEnter.push(key);
            }
        });

        currentChildren.forEach((child) => {
            const key = child && child.key;
            if (child && currentlyAnimatingKeys[key]) {
                return;
            }
            const hasNext = child && findChildInChildrenByKey(nextChildren, key);
            if (showProp) {
                const showInNow = child.props[showProp];
                if (hasNext) {
                    const showInNext = findShownChildInChildrenByKey(nextChildren, key, showProp);
                    if (!showInNext && showInNow) {
                        this.keysToLeave.push(key);
                    }
                } else if (showInNow) {
                    this.keysToLeave.push(key);
                }
            } else if (!hasNext) {
                this.keysToLeave.push(key);
            }
        });
    }

    componentDidUpdate() {
        const keysToEnter = this.keysToEnter;
        this.keysToEnter = [];
        keysToEnter.forEach(this.performEnter.bind(this));
        const keysToLeave = this.keysToLeave;
        this.keysToLeave = [];
        keysToLeave.forEach(this.performLeave.bind(this));
    }

    performEnter = (key) => {
        let refs: any = this._refs[key];
        // may already remove by exclusive
        if (refs) {
            this.currentlyAnimatingKeys[key] = true;
            refs.componentWillEnter(
                this.handleDoneAdding.bind(this, key, 'enter')
            );
        }
    }

    performAppear = (key) => {
        let refs: any = this._refs[key];
        if (refs) {
            this.currentlyAnimatingKeys[key] = true;
            refs.componentWillAppear(
                this.handleDoneAdding.bind(this, key, 'appear')
            );
        }
    }

    handleDoneAdding = (key, type) => {
        const props = this.props;
        delete this.currentlyAnimatingKeys[key];
        // if update on exclusive mode, skip check
        if (props.exclusive && props !== this.nextProps) {
            return;
        }
        const currentChildren = toArrayChildren(getChildrenFromProps(props));
        if (!this.isValidChildByKey(currentChildren, key)) {
            // exclusive will not need this
            this.performLeave(key);
        } else {
            if (type === 'appear') {
                if (animUtil.allowAppearCallback(props)) {
                    props.onAppear(key);
                    props.onEnd(key, true);
                }
            } else {
                if (animUtil.allowEnterCallback(props)) {
                    props.onEnter(key);
                    props.onEnd(key, true);
                }
            }
        }
    }

    performLeave = (key) => {
        let refs: any = this._refs[key];
        // may already remove by exclusive
        if (refs) {
            this.currentlyAnimatingKeys[key] = true;
            refs.componentWillLeave(this.handleDoneLeaving.bind(this, key));
        }
    }

    handleDoneLeaving = (key) => {
        const props = this.props;
        delete this.currentlyAnimatingKeys[key];
        // if update on exclusive mode, skip check
        if (props.exclusive && props !== this.nextProps) {
            return;
        }
        const currentChildren = toArrayChildren(getChildrenFromProps(props));
        // in case state change is too fast
        if (this.isValidChildByKey(currentChildren, key)) {
            this.performEnter(key);
        } else {
            const end = () => {
                if (animUtil.allowLeaveCallback(props)) {
                    props.onLeave(key);
                    props.onEnd(key, false);
                }
            };
            if (!isSameChildren(this.state.children,
                    currentChildren, props.showProp)) {
                this.setState({
                    children: currentChildren,
                }, end);
            } else {
                end();
            }
        }
    }

    isValidChildByKey = (currentChildren, key) => {
        const showProp = this.props.showProp;
        if (showProp) {
            return findShownChildInChildrenByKey(currentChildren, key, showProp);
        }
        return findChildInChildrenByKey(currentChildren, key);
    }

    stop = (key) => {
        delete this.currentlyAnimatingKeys[key];
        const component: any = this._refs[key];
        if (component) {
            component.stop();
        }
    }

    render() {
        const props = this.props;
        this.nextProps = props;
        const stateChildren = this.state.children;
        let children = null;
        if (stateChildren) {
            children = stateChildren.map((child) => {
                if (child === null || child === undefined) {
                    return child;
                }
                if (!child.key) {
                    throw new Error('must set key for <rc-animate> children');
                }
                return (
                    <AnimateChild
                        key={child.key}
                        ref={this.bindRef(child.key)}
                        animation={props.animation}
                        transitionName={props.transitionName}
                        transitionEnter={props.transitionEnter}
                        transitionAppear={props.transitionAppear}
                        transitionLeave={props.transitionLeave}
                    >
                        {child}
                    </AnimateChild>
                );
            });
        }
        const Component = props.component;
        if (Component) {
            let passedProps = props;
            if (typeof Component === 'string') {
                passedProps = {
                    className: props.className,
                    style: props.style,
                    ...props.componentProps,
                };
            }
            return <Component {...passedProps} />;
        }
        return React.Children.only(children[0] || null);
    }
}
