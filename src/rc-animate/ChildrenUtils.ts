import React, {isValidElement, ReactElement} from 'react';

export type Key = string | number;

export type ReactChildElement = ReactElement<{
    [x: string]: any;
    key: string
}>;

export function toArrayChildren(children: ReactChildElement): ReactChildElement[] {

    const ret: ReactChildElement[] = [];

    React
        .Children
        .forEach(children, each);

    function each(child: ReactChildElement): void {
        ret.push(child);
    }

    return ret;
}

export function findChildInChildrenByKey(children?: ReactChildElement[], key?: Key): ReactChildElement {
    let ret = null;
    if (children) {
        const each = (child: ReactChildElement): void => {
            if (ret) {
                return;
            }
            if (child && child[`${key}`] === key) {
                ret = child;
            }
        };
        children.forEach(each);
    }
    return ret;
}

export function findShownChildInChildrenByKey(children?: ReactChildElement[],
                                              key?: Key,
                                              showProp?: string): ReactChildElement {
    let ret = null;
    if (children) {
        const each = (child: ReactChildElement): void => {
            if (isValidElement(child)) {
                if (child && child[`${key}`] === key && child.props[showProp]) {
                    if (ret) {
                        throw new Error('two child with same key for <rc-animate> children');
                    }
                    ret = child;
                }
            }
        };
        children.forEach(each);
    }
    return ret;
}

export function findHiddenChildInChildrenByKey(children: ReactChildElement[],
                                               key: Key,
                                               showProp: string): number | boolean {
    let found: number | boolean = 0;
    if (children) {
        const each = (child: ReactChildElement): void => {
            if (found) {
                return;
            }
            if (isValidElement(child)) {
                found = child && child[`${key}`] === key && !child.props[showProp];
            }
        };
        children.forEach(each);
    }
    return found;
}

export function isSameChildren(c1: ReactChildElement[],
                               c2: ReactChildElement[],
                               showProp: string): boolean {
    let same = c1.length === c2.length;
    if (same) {
        const each = (child: ReactChildElement, index: number): void => {
            if (isValidElement(child)) {
                const child2: ReactChildElement = c2[index];
                if (child && child2) {
                    if ((child && !child2) || (!child && child2)) {
                        same = false;
                    } else if (child.key !== child2.key) {
                        same = false;
                    } else if (showProp && isValidElement(child2) && child.props[showProp] !== child2.props[showProp]) {
                        same = false;
                    }
                }
            }
        };
        c1.forEach(each);
    }
    return same;
}

export function mergeChildren(prev: ReactChildElement[], next: ReactChildElement[]): ReactChildElement[] {
    let ret: ReactChildElement[] = [];

    // For each key of `next`, the list of keys to insert before that key in the
    // combined list
    const nextChildrenPending = {};
    let pendingChildren = [];
    prev.forEach(prevEach);

    next.forEach(nextEach);

    ret = ret.concat(pendingChildren);

    return ret;

    function prevEach(child) {
        if (child && findChildInChildrenByKey(next, child.key)) {
            if (pendingChildren.length) {
                nextChildrenPending[child.key] = pendingChildren;
                pendingChildren = [];
            }
        } else {
            pendingChildren.push(child);
        }
    }

    function nextEach(child) {
        if (child && nextChildrenPending.hasOwnProperty(child.key)) {
            ret = ret.concat(nextChildrenPending[child.key]);
        }
        ret.push(child);
    }
}

const defaultKey = `rc_animate_${Date.now()}`;

export function getChildrenFromProps(props?): ReactChildElement {
    const children: ReactChildElement = props.children;
    if (React.isValidElement(children)) {
        if (!children.key) {
            return React.cloneElement(children, {key: defaultKey});
        }
    }
    return children;
}

export function noop() {
    return;
}
