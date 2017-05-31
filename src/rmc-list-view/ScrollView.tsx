import createElement from 'inferno-create-element';
import Component from 'inferno-component';
import {cloneElement, findDOMNode} from "inferno-compat";
import {observer} from 'inferno-mobx';
import DOMScroller from 'zscroller';
import assign from 'object-assign';
import classNames from 'classnames';
import {throttle} from './util';
import {IScrollView} from "xyl-base/lib/rmc-list-view/PropsType";

const SCROLLVIEW = 'ScrollView';
const INNERVIEW = 'InnerScrollView';

// https://github.com/facebook/react-native/blob/master/Libraries/Components/ScrollView/ScrollView.js
// https://facebook.github.io/react-native/docs/refreshcontrol.html

/* eslint react/prop-types: 0, react/sort-comp: 0, no-unused-expressions: 0 */

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
export default class ScrollView extends Component<IScrollView, any> {

    refreshControlRefresh;
    manuallyRefresh;
    domScroller;
    tsExec;
    onLayout;
    refreshControl;
    overDistanceThenRelease;

    componentDidUpdate(prevProps) {
        // console.log('componentDidUpdate');
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
            // findDOMNode(this[INNERVIEW])
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

    scrollTo(...args) {
        if (this.props.stickyHeader || this.props.useBodyScroll) {
            (window as any).scrollTo(...(args));
        } else if (this.props.useZscroller) {
            this.domScroller.scroller.scrollTo(...args);
        } else {
            const ele = findDOMNode(this[SCROLLVIEW]);
            ele.scrollLeft = args[0];
            ele.scrollTop = args[1];
        }
    }

    throttleScroll = () => {
        let handleScroll = (e) => {
        };
        if (this.props.scrollEventThrottle && this.props.onScroll) {
            handleScroll = throttle(e => {
                this.props.onScroll && this.props.onScroll(e);
            }, this.props.scrollEventThrottle);
        }
        return handleScroll;
    }

    scrollingComplete = () => {
        // console.log('scrolling complete');
        if (this.props.refreshControl &&
            this.refreshControl && this.refreshControl.state.deactive) {
            this.refreshControl.setState({deactive: false});
        }
    }

    renderZscroller() {
        const {scrollerOptions, refreshControl} = this.props;
        // console.log('onRefresh will not change', refreshControl.props.onRefresh.toString());
        this.domScroller = new DOMScroller(findDOMNode(this[INNERVIEW]), assign({}, {
            scrollingX: false,
            onScroll: this.tsExec,
            scrollingComplete: this.scrollingComplete,
        }, scrollerOptions));
        if (refreshControl) {
            const scroller = this.domScroller.scroller;
            const {distanceToRefresh, onRefresh} = refreshControl.props;
            scroller.activatePullToRefresh(distanceToRefresh,
                () => {
                    // console.log('first reach the distance');
                    this.manuallyRefresh = true;
                    this.overDistanceThenRelease = false;
                    this.refreshControl && this.refreshControl.setState({active: true});
                },
                () => {
                    // console.log('back to the distance', this.overDistanceThenRelease);
                    this.manuallyRefresh = false;
                    this.refreshControl && this.refreshControl.setState({
                        deactive: this.overDistanceThenRelease,
                        active: false,
                        loadingState: false,
                    });
                },
                () => {
                    // console.log('Over distance and release to loading');
                    this.overDistanceThenRelease = true;
                    this.refreshControl && this.refreshControl.setState({
                        deactive: false,
                        loadingState: true,
                    });
                    const finishPullToRefresh = () => {
                        scroller.finishPullToRefresh();
                        this.refreshControlRefresh = null;
                    };
                    Promise.all([
                        new Promise(resolve => {
                            onRefresh();
                            this.refreshControlRefresh = resolve;
                        }),
                        // at lease 1s for ux
                        new Promise(resolve => setTimeout(resolve, 1000)),
                    ]).then(finishPullToRefresh, finishPullToRefresh);
                });
            if (refreshControl.props.refreshing) {
                scroller.triggerPullToRefresh();
            }
        }
    }

    render() {
        const {
            children, className, prefixCls = '', listPrefixCls = '', listViewPrefixCls = 'xyl-base/lib/rmc-list-view',
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
            ref: SCROLLVIEW,
            style: assign({}, styleBase, style),
            className: classNames({
                [className]: !!className,
                [`${preCls}-scrollview`]: true,
            }),
        };
        const contentContainerProps = {
            ref: INNERVIEW,
            style: assign({}, {position: 'absolute', minWidth: '100%'}, contentContainerStyle),
            className: classNames({
                [`${preCls}-scrollview-content`]: true,
                [listPrefixCls]: !!listPrefixCls,
            }),
        };

        if (refreshControl) {
            return (
                <div {...containerProps as any}>
                    <div {...contentContainerProps as any}>
                        {cloneElement(refreshControl, {ref: 'refreshControl'})}
                        {children}
                    </div>
                </div>
            );
        }

        if (stickyHeader || useBodyScroll) {
            return (
                <div {...containerProps as any}>
                    {children}
                </div>
            );
        }
        return (
            <div {...containerProps as any}>
                <div {...contentContainerProps as any}>{children}</div>
            </div>
        );
    }
}
