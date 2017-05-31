import createElement from 'inferno-create-element';
import Component from 'inferno-component';
import {observer} from 'inferno-mobx';
import Tooltip from '../rc-tooltip';
import Handle from './Handle';
import {ISliderWithTooltipProps} from "./PropTypes";

export default function createSliderWithTooltip(Cmp) {

    return observer(class ComponentWrapper extends Component<ISliderWithTooltipProps, any> {
        static defaultProps = {
            tipFormatter(value) {
                return value;
            },
        };

        constructor(props) {
            super(props);
            this.state = {visibles: {}};
        }

        handleTooltipVisibleChange = (index, visible) => {
            this.setState({
                visibles: {
                    ...this.state.visibles,
                    [index]: visible,
                },
            });
        }
        handleWithTooltip = ({value, dragging, index, disabled, ...restProps}) => {
            const {tipFormatter} = this.props;
            return (
                <Tooltip
                    prefixCls="rc-slider-tooltip"
                    overlay={tipFormatter(value)}
                    visible={!disabled && (this.state.visibles[index] || dragging)}
                    placement="top"
                    key={index}
                >
                    <Handle
                        {...restProps as any}
                        onMouseEnter={() => this.handleTooltipVisibleChange(index, true)}
                        onMouseLeave={() => this.handleTooltipVisibleChange(index, false)}
                    />
                </Tooltip>
            );
        }

        render() {
            return <Cmp {...this.props} handle={this.handleWithTooltip}/>;
        }
    });
}
