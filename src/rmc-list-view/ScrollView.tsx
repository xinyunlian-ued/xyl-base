import * as React from 'react';
import {findDOMNode} from "react-dom";
import {observer} from 'inferno-mobx';
import DOMScroller from 'zscroller';
import * as assign from 'object-assign';
import * as classNames from 'classnames';
import {throttle} from './util';
import {IScrollView} from "./PropsType";

const SCROLLVIEW = 'ScrollView';
const INNERVIEW = 'InnerScrollView';

const styles = {
    base: {
        position: 'relative',
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
        flex: 1,
    },
    zScroller: {
        position: 'relative',
        overflow: 'hidden',
        flex: 1,
    },
};

@observer
export default class ScrollView extends React.Component<IScrollView, any> {

    refreshControlRefresh;
    manuallyRefresh;
    domScroller;

    componentDidUpdate(prevProps) {
        if (prevProps.refreshControl && this.props.refreshControl) {
            const preRefreshing = prevProps.refreshControl.props.refreshing;
            const nowRefreshing = this.props.refreshControl.props.refreshing;
            if (preRefreshing && !nowRefreshing && this.refreshControlRefresh) {
                this.refreshControlRefresh();
            } else if (!this.manuallyRefresh && !preRefreshing && nowRefreshing) {
                this.domScroller.scroller.triggerPullToRefresh();
            }
        }
    }

    tsExec;
    onLayout;

    ScrollView;
    InnerScrollView;
    refreshControl;
    bindScrollView = (ScrollView) => {
        this.ScrollView = ScrollView;
    }

    bindInnerScrollView = (InnerScrollView) => {
        this.InnerScrollView = InnerScrollView;
    }

    bindRefreshControl = (refreshControl) => {
        this.refreshControl = refreshControl;
    }

    componentDidMount() {
        this.tsExec = this.throttleScroll();
        // IE supports onresize on all HTML elements.
        // In all other Browsers the onresize is only available at the window object
        this.onLayout = () => this.props.onLayout({
            nativeEvent: {layout: {width: window.innerWidth, height: window.innerHeight}},
        });
        const ele = findDOMNode(this[SCROLLVIEW]);

        if (this.props.stickyHeader || this.props.useBodyScroll) {
            window.addEventListener('scroll', this.tsExec);
            window.addEventListener('resize', this.onLayout);
            // todo
            // ele.addEventListener('resize', this.onContentSizeChange);
        } else {
            // todo
            // ele.addEventListener('resize', this.onLayout);
            // findDOMNode(this.refs[INNERVIEW])
            // .addEventListener('resize', this.onContentSizeChange);
            if (this.props.useZscroller) {
                this.renderZscroller();
            } else {
                ele.addEventListener('scroll', this.tsExec);
            }
        }
    }

    componentWillUnmount() {
        if (this.props.stickyHeader || this.props.useBodyScroll) {
            window.removeEventListener('scroll', this.tsExec);
            window.removeEventListener('resize', this.onLayout);
        } else if (this.props.useZscroller) {
            this.domScroller.destroy();
        } else {
            findDOMNode(this[SCROLLVIEW]).removeEventListener('scroll', this.tsExec);
        }
    }

    scrollTo = (...args) => {
        if (this.props.stickyHeader || this.props.useBodyScroll) {
            window.scrollTo(args[0], args[1]);
        } else if (this.props.useZscroller) {
            this.domScroller.scroller.scrollTo(...args);
        } else {
            const ele = findDOMNode(this[SCROLLVIEW]);
            ele.scrollLeft = args[0];
            ele.scrollTop = args[1];
        }
    }

    throttleScroll = () => {
        let handleScroll: any;
        const props = this.props;
        if (props.scrollEventThrottle && props.onScroll) {
            handleScroll = throttle((e) => {
                if (props.onScroll) {
                    props.onScroll(e);
                }
            }, props.scrollEventThrottle);
        }
        return handleScroll;
    }

    scrollingComplete = () => {
        const refreshControl: any = this.props.refreshControl;
        if (this.props.refreshControl &&
            this.refreshControl && this.refreshControl.state.deactive) {
            refreshControl.setState({deactive: false});
        }
    }

    renderZscroller = () => {
        const {scrollerOptions, refreshControl} = this.props;

        this.domScroller = new DOMScroller(findDOMNode(this[INNERVIEW]), assign({}, {
            scrollingX: false,
            onScroll: this.tsExec,
            scrollingComplete: this.scrollingComplete,
        }, scrollerOptions));
        if (refreshControl) {
            const scroller = this.domScroller.scroller;
            const {distanceToRefresh, onRefresh} = refreshControl.props;
            const refsRefreshControl: any = this.refreshControl;
            scroller.activatePullToRefresh(distanceToRefresh,
                () => {
                    this.manuallyRefresh = true;
                    if (refsRefreshControl) {
                        refsRefreshControl.setState({active: true});
                    }
                },
                () => {
                    this.manuallyRefresh = false;
                    if (refsRefreshControl) {
                        refsRefreshControl.setState({
                            deactive: true,
                            active: false,
                            loadingState: false,
                        });
                    }
                },
                () => {
                    if (refsRefreshControl) {
                        refsRefreshControl.setState({
                            deactive: false,
                            loadingState: true,
                        });
                    }

                    const finishPullToRefresh = () => {
                        scroller.finishPullToRefresh();
                        this.refreshControlRefresh = null;
                    };
                    Promise.all([
                        new Promise((resolve) => {
                            onRefresh();
                            this.refreshControlRefresh = resolve;
                        }),
                        // at lease 1s for ux
                        new Promise((resolve) => setTimeout(resolve, 1000)),
                    ]).then(finishPullToRefresh, finishPullToRefresh);
                });
            if (refreshControl.props.refreshing) {
                scroller.triggerPullToRefresh();
            }
        }
    }

    render() {
        const {
            children, className, prefixCls = '', listPrefixCls = '', listViewPrefixCls = 'rmc-list-view',
            style = {}, contentContainerStyle,
            useZscroller, refreshControl, stickyHeader, useBodyScroll,
        } = this.props;

        let styleBase: any = styles.base;
        if (stickyHeader || useBodyScroll) {
            styleBase = null;
        } else if (useZscroller) {
            styleBase = styles.zScroller;
        }

        const preCls = prefixCls || listViewPrefixCls || '';

        const containerProps = {
            ref: this.bindScrollView,
            style: assign({}, styleBase, style),
            className: classNames({
                [className]: !!className,
                [`${preCls}-scrollview`]: true,
            }),
        };
        const contentContainerProps = {
            ref: this.bindInnerScrollView,
            style: assign({}, {position: 'absolute', minWidth: '100%'}, contentContainerStyle),
            className: classNames({
                [`${preCls}-scrollview-content`]: true,
                [listPrefixCls]: !!listPrefixCls,
            }),
        };

        if (refreshControl) {
            return (
                <div {...containerProps}>
                    <div {...contentContainerProps}>
                        {React.cloneElement(refreshControl, {ref: this.bindRefreshControl})}
                        {children}
                    </div>
                </div>
            );
        }

        if (stickyHeader || useBodyScroll) {
            return (
                <div {...containerProps}>
                    {children}
                </div>
            );
        }
        return (
            <div {...containerProps}>
                <div {...contentContainerProps}>{children}</div>
            </div>
        );
    }
}
