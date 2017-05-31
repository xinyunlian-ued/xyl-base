import createElement from 'inferno-create-element';
import Component from 'inferno-component';
import {observer} from 'inferno-mobx';
import assign from 'object-assign';
import {ILazyRenderBoxPropTypes} from "./IDialogPropTypes";

@observer
export default class LazyRenderBox extends Component<ILazyRenderBoxPropTypes, any> {

    shouldComponentUpdate(nextProps) {
        return !!nextProps.hiddenClassName || !!nextProps.visible;
    }

    render() {
        let className = this.props.className;
        if (!!this.props.hiddenClassName && !this.props.visible) {
            className += ` ${this.props.hiddenClassName}`;
        }
        const props: any = assign({}, this.props);
        delete props.hiddenClassName;
        delete props.visible;
        props.className = className;
        return <div {...props} />;
    }
}
