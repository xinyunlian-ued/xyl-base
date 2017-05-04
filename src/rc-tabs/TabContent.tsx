import createElement from 'inferno-create-element';
import Component from 'inferno-component';
import {observer} from 'inferno-mobx';
import {Children, cloneElement} from "inferno-compat";
import * as classNames from 'classnames';
import {
    getTransformByIndex,
    getActiveIndex,
    getTransformPropValue,
    getMarginStyle,
} from './utils';
import {ITabContent} from "./PropsType";

@observer
export default class TabContent extends Component<ITabContent, any> {

    static defaultProps = {
        animated: true,
    };

    getTabPanes() {
        const props = this.props;
        const activeKey = props.activeKey;
        const children = props.children;
        const newChildren = [];

        Children.forEach(children, (child: any) => {
            if (!child) {
                return;
            }
            const key = child.key;
            const active = activeKey === key;
            newChildren.push(cloneElement(child, {
                active,
                destroyInactiveTabPane: props.destroyInactiveTabPane,
                rootPrefixCls: props.prefixCls,
            }));
        }, null);

        return newChildren;
    }

    render() {
        const {props} = this;
        const {
            prefixCls, children, activeKey,
            tabBarPosition, animated, animatedWithMargin,
        } = props;
        let {style} = props;
        const classes = classNames({
            [`${prefixCls}-content`]: true,
            [animated ?
                `${prefixCls}-content-animated` :
                `${prefixCls}-content-no-animated`]: true,
        });
        if (animated) {
            const activeIndex = getActiveIndex(children, activeKey);
            if (activeIndex !== -1) {
                const animatedStyle = animatedWithMargin ?
                    getMarginStyle(activeIndex, tabBarPosition) :
                    getTransformPropValue(getTransformByIndex(activeIndex, tabBarPosition));
                style = {
                    ...style,
                    ...animatedStyle,
                };
            } else {
                style = {
                    ...style,
                    display: 'none',
                };
            }
        }
        return (
            <div
                className={classes}
                style={style}
            >
                {this.getTabPanes()}
            </div>
        );
    }
}