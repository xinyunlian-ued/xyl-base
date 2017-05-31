import createElement from 'inferno-create-element';
import Component from 'inferno-component';
import {Children, findDOMNode} from "inferno-compat";
import {observer} from 'inferno-mobx';
import Hammer from '../rc-hammerjs';
import classnames from 'classnames';
import * as warning from 'warning';
import {isVertical, getStyle, setPxStyle} from './utils';
import {componentDidUpdate} from './InkTabBarMixin';


@observer
export default class SwipeableInkTabBar extends Component<any, any> {

    static defaultProps = {
        hammerOptions: {},
        pageSize: 5, // per page show how many tabs
        speed: 5, // swipe speed, 1 to 10, more bigger more faster
    };

    constructor(props) {
        super(props);
        const {hasPrevPage, hasNextPage} = this.checkPaginationByKey(this.props.activeKey);
        this.state = {
            hasPrevPage,
            hasNextPage,
        };
    }

    displayName = 'SwipeableInkTabBar';
    cache;
    swipeNode;
    realNode;
    inkBar;
    root;
    activeTab;
    swipe;
    nav;
    container;
    navWrap;
    inkBarBind = (inkBar) => {
        this.inkBar = inkBar;
    }
    rootBind = (root) => {
        this.root = root;
    }
    activeTabBind = (activeTab) => {
        this.activeTab = activeTab;
    }
    swipeBind = (swipe) => {
        this.swipe = swipe;
    }
    navBind = (nav) => {
        this.nav = nav;
    }
    containerBind = (container) => {
        this.container = container;
    }
    navWrapBind = (navWrap) => {
        this.navWrap = navWrap;
    }

    checkPaginationByKey = (activeKey) => {
        const {panels, pageSize} = this.props;
        const index = this.getIndexByKey(activeKey);
        const centerTabCount = Math.floor(pageSize / 2);
        // the basic rule is to make activeTab be shown in the center of TabBar viewport
        return {
            hasPrevPage: index - centerTabCount > 0,
            hasNextPage: index + centerTabCount < panels.length,
        };
    }

    /**
     * used for props.activeKey setting, not for swipe callback
     */
    getDeltaByKey = (activeKey) => {
        const {pageSize} = this.props;
        const index = this.getIndexByKey(activeKey);
        const centerTabCount = Math.floor(pageSize / 2);
        const {tabWidth} = this.cache;
        const delta = (index - centerTabCount) * tabWidth * -1;
        return delta;
    }

    getIndexByKey = (activeKey) => {
        const {panels} = this.props;
        const length = panels.length;
        for (let i = 0; i <= length; i++) {
            if (panels[i].key === activeKey) {
                return i;
            }
        }
        return -1;
    }

    checkPaginationByDelta = (delta) => {
        const {totalAvaliableDelta} = this.cache;
        return {
            hasPrevPage: delta < 0,
            hasNextPage: -delta < totalAvaliableDelta,
        };
    }

    setSwipePositionByKey = (activeKey) => {
        const {hasPrevPage, hasNextPage} = this.checkPaginationByKey(activeKey);
        const {totalAvaliableDelta} = this.cache;
        this.setState({
            hasPrevPage,
            hasNextPage,
        });
        let delta;
        if (!hasPrevPage) {
            // the first page
            delta = 0;
        } else if (!hasNextPage) {
            // the last page
            delta = -totalAvaliableDelta;
        } else if (hasNextPage) {
            // the middle page
            delta = this.getDeltaByKey(activeKey);
        }
        this.setSwipePositionByDelta(delta);
    }

    setSwipePositionByDelta = (value) => {
        const {relativeDirection} = this.cache;
        setPxStyle(this.swipeNode, relativeDirection, value);
    }

    componentDidMount() {
        const {swipe, nav} = this;
        const {tabBarPosition, pageSize, panels, activeKey} = this.props;
        this.swipeNode = findDOMNode(swipe); // dom which scroll (9999px)
        this.realNode = findDOMNode(nav); // dom which visiable in screen (viewport)
        const _isVertical = isVertical(tabBarPosition);
        const _viewSize = getStyle(this.realNode, _isVertical ? 'height' : 'width');
        const _tabWidth = _viewSize / pageSize;
        this.cache = {
            vertical: _isVertical,
            relativeDirection: _isVertical ? 'top' : 'left',
            totalAvaliableDelta: _tabWidth * panels.length - _viewSize,
            tabWidth: _tabWidth,
        };
        this.setSwipePositionByKey(activeKey);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.activeKey && nextProps.activeKey !== this.props.activeKey) {
            this.setSwipePositionByKey(nextProps.activeKey);
        }
    }

    onPan = (e) => {
        const {vertical, relativeDirection} = this.cache;
        const {speed} = this.props;
        let nowDelta = vertical ? e.deltaY : e.deltaX;
        nowDelta = nowDelta * (speed / 10);
        const preDelta = getStyle(this.swipeNode, relativeDirection);
        const nextTotalDelta = nowDelta + preDelta;
        const {hasPrevPage, hasNextPage} = this.checkPaginationByDelta(nextTotalDelta);
        this.setState({
            hasPrevPage,
            hasNextPage,
        });
        if (hasPrevPage && hasNextPage) {
            this.setSwipePositionByDelta(nextTotalDelta);
        }
    }

    getSwipeBarNode = (tabs) => {
        const {prefixCls, hammerOptions, tabBarPosition} = this.props;
        const {hasPrevPage, hasNextPage} = this.state;
        const navClassName = `${prefixCls}-nav`;
        const navClasses = classnames({
            [navClassName]: true,
        });
        let direction = {};
        if (isVertical(tabBarPosition)) {
            direction = {
                vertical: true,
            };
        }
        const events = {
            onPan: this.onPan,
        };
        return (
            <div
                className={classnames({
                    [`${prefixCls}-nav-container`]: 1,
                    [`${prefixCls}-nav-swipe-container`]: 1,
                    // page classname can be used to render special style when there has a prev/next page
                    [`${prefixCls}-prevpage`]: hasPrevPage,
                    [`${prefixCls}-nextpage`]: hasNextPage,
                })}
                key="container"
                ref={this.containerBind}
            >
                <div className={`${prefixCls}-nav-wrap`} ref={this.navWrapBind}>
                    <Hammer
                        {...events}
                        {...direction}
                        options={hammerOptions}
                    >
                        <div className={`${prefixCls}-nav-swipe`} ref={this.swipeBind}>
                            <div className={navClasses} ref={this.navBind}>
                                {tabs}
                            </div>
                        </div>
                    </Hammer>
                </div>
            </div>
        );
    }


    componentDidUpdate() {
        componentDidUpdate(this);
    }

    getInkBarNode = () => {
        const {prefixCls, styles, inkBarAnimated} = this.props;
        const className = `${prefixCls}-ink-bar`;
        const classes = classnames({
            [className]: true,
            [
                inkBarAnimated ?
                    `${className}-animated` :
                    `${className}-no-animated`
                ]: true,
        });
        return (
            <div
                style={styles.inkBar}
                className={classes}
                key="inkBar"
                ref={this.inkBarBind}
            />
        );
    }


    onTabClick = (key) => {
        this.props.onTabClick(key);
    }

    getTabs = () => {
        const props = this.props;
        const children = props.panels;
        const activeKey = props.activeKey;
        const rst = [];
        const prefixCls = props.prefixCls;
        Children.forEach(children, (child: any) => {
            if (!child) {
                return;
            }
            const key = child.key;
            let cls = activeKey === key ? `${prefixCls}-tab-active` : '';
            cls += ` ${prefixCls}-tab`;
            let events = {};
            if (child.props.disabled) {
                cls += ` ${prefixCls}-tab-disabled`;
            } else {
                events = {
                    onClick: this.onTabClick.bind(this, key),
                };
            }
            const ref: any = {};
            if (activeKey === key) {
                ref.ref = this.activeTabBind;
            }
            warning('tab' in child.props, 'There must be `tab` property on children of Tabs.');
            rst.push(<div
                role="tab"
                aria-disabled={child.props.disabled ? 'true' : 'false'}
                aria-selected={activeKey === key ? 'true' : 'false'}
                {...events}
                className={cls}
                key={key}
                {...ref}
            >
                {child.props.tab}
            </div>);
        }, null);
        return rst;
    }

    getRootNode = (contents) => {
        const {prefixCls, onKeyDown, className, extraContent, style} = this.props;
        const cls = classnames({
            [`${prefixCls}-bar`]: 1,
            [className]: !!className,
        });
        return (
            <div
                role="tablist"
                className={cls}
                tabIndex={0}
                ref={this.rootBind}
                onKeyDown={onKeyDown}
                style={style}
            >
                {extraContent ?
                    (<div
                        style={{
                            float: 'right',
                        }}
                        key="extra"
                    >
                        {extraContent}
                    </div>) : null}
                {contents}
            </div>);
    }


    getSwipeableTabs = () => {
        const props = this.props;
        const children = props.panels;
        const activeKey = props.activeKey;
        const rst = [];
        const prefixCls = props.prefixCls;

        const tabStyle = {
            display: 'flex',
            flex: `0 0 ${1 / props.pageSize * 100}%`,
        };

        Children.forEach(children, (child: any) => {
            if (!child) {
                return;
            }
            const key = child.key;
            let cls = activeKey === key ? `${prefixCls}-tab-active` : '';
            cls += ` ${prefixCls}-tab`;
            let events = {};
            if (child.props.disabled) {
                cls += ` ${prefixCls}-tab-disabled`;
            } else {
                events = {
                    onClick: this.onTabClick.bind(this, key),
                };
            }
            const ref: any = {};
            if (activeKey === key) {
                ref.ref = this.activeTabBind;
            }
            rst.push(<div
                role="tab"
                style={tabStyle}
                aria-disabled={child.props.disabled ? 'true' : 'false'}
                aria-selected={activeKey === key ? 'true' : 'false'}
                {...events}
                className={cls}
                key={key}
                {...ref}
            >
                {child.props.tab}
            </div>);
        }, null);

        return rst;
    }

    render() {
        const inkBarNode = this.getInkBarNode();
        const tabs = this.getSwipeableTabs();
        const scrollbarNode = this.getSwipeBarNode([inkBarNode, tabs]);
        return this.getRootNode(scrollbarNode);
    }
}