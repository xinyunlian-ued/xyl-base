import createElement from 'inferno-create-element';
import Component from 'inferno-component';
import {observer} from 'inferno-mobx';
import {IStaticRenderer} from "./PropsType";

@observer
export default class StaticRenderer extends Component<IStaticRenderer, any> {

    shouldComponentUpdate(nextProps) {
        return nextProps.shouldUpdate;
    }

    render() {
        return this.props.render();
    }
}
