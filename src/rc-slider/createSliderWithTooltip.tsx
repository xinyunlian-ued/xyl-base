import React from 'react';
import Tooltip from 'rc-tooltip';
import Handle from './Handle';
import Component from "../rc-base/index";
import {observer} from "mobx-react";
import {IComponentWrapper} from "./PropsType";
import {observable} from "mobx";

export default function createSliderWithTooltip<P extends IComponentWrapper>(Cmp: any) {
    return observer(class ComponentWrapper extends Component<P, any> {

        static defaultProps = {
            tipFormatter(value) {
                return value;
            },
        };

        store = observable({visibles: {}});

        constructor(props) {
            super(props);
        }

        handleTooltipVisibleChange(index, visible) {
            this.changeStore({
                visibles: {
                    ...this.store.visibles,
                    [index]: visible,
                },
            });
        }

        handleWithTooltip({value, dragging, index, disabled, ...restProps}) {
            const {tipFormatter} = this.props;
            return (
                <Tooltip
                    prefixCls="rc-slider-tooltip"
                    overlay={tipFormatter(value)}
                    visible={!disabled && (this.store.visibles[index] || dragging)}
                    placement="top"
                    key={index}
                >
                    <Handle
                        {...restProps}
                        onMouseEnter={this.handleTooltipVisibleChange.bind(this, [index, true])}
                        onMouseLeave={this.handleTooltipVisibleChange.bind(this, [index, false])}
                    />
                </Tooltip>
            );
        }

        render() {
            return <Cmp {...this.props} handle={this.handleWithTooltip}/>;
        }
    });
}
