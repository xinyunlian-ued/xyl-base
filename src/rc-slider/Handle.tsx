import createElement from 'inferno-create-element';
import Component from 'inferno-component';
import {observer} from 'inferno-mobx';
import {IHandleProps} from "./PropTypes";

@observer
export default class Handle extends Component<IHandleProps, any> {
    render() {
        const {
            className, vertical, offset, handleStyle, ...restProps,
        } = this.props;
        const style = vertical ? {bottom: `${offset}%`} : {left: `${offset}%`};

        const elStyle = {
            ...style,
            ...handleStyle,
        };
        return <div {...restProps} className={className} style={elStyle}/>;
    }
}
