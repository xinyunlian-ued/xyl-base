import createElement from 'inferno-create-element';
import Component from 'inferno-component';
import {Children} from 'inferno-compat';
import {observer} from 'inferno-mobx';
import classnames from 'classnames';
import warning from 'warning';
import {componentDidUpdate} from './InkTabBarMixin';

export interface IInkTabBar {
    inkBarAnimated?: boolean;
    onTabClick?;
    prefixCls?;
    styles?;
    panels?;
    activeKey?;
    onKeyDown?;
    className?;
    extraContent?;
    style?;
}

// const aa = createReactClass({
//     displayName: 'InkTabBar',
//     mixins: [TabBarMixin, InkTabBarMixin],
//     render() {
//         const inkBarNode = this.getInkBarNode();
//         const tabs = this.getTabs();
//         return this.getRootNode([inkBarNode, tabs]);
//     },
// });

@observer
export default class InkTabBar extends Component<IInkTabBar, any> {

    static defaultProps = {
        inkBarAnimated: true,
    };

    inkBar;
    root;
    activeTab;
    inkBarBind = (inkBar) => {
        this.inkBar = inkBar;
    }
    rootBind = (root) => {
        this.root = root;
    }
    activeTabBind = (activeTab) => {
        this.activeTab = activeTab;
    }


    componentDidUpdate() {
        componentDidUpdate(this);
    }

    componentDidMount() {
        componentDidUpdate(this, true);
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


    render() {
        const inkBarNode = this.getInkBarNode();
        const tabs = this.getTabs();
        return this.getRootNode([inkBarNode, tabs]);
    }
};
