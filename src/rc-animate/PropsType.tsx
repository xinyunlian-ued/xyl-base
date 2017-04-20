export interface TransitionMap {
    enter?: 'transitionEnter';
    appear?: 'transitionAppear';
    leave?: 'transitionLeave';
}

export interface AnimateChildPropTypes {
    transitionName?: string | object;
    animation?: object;
    transitionEnter?: boolean;
    transitionAppear?: boolean;
    transitionLeave?: boolean;
    ref?: any;
}

export interface AnimatePropTypes {
    component?: any;
    componentProps?: object;
    animation?: object;
    transitionName?: string | object;
    transitionEnter?: boolean;
    transitionAppear?: boolean;
    exclusive?: boolean;
    transitionLeave?: boolean;
    onEnd?: (event?: any, end?: boolean) => void;
    onEnter?: (event?: any) => void;
    onLeave?: (event?: any) => void;
    onAppear?: (event?: any) => void;
    showProp?: string;
    className?: string;
    style?: ObjectConstructor;
}
