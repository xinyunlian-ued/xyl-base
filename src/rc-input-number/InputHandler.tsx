import createElement from 'inferno-create-element';
import Component from 'inferno-component';
import {observer} from 'inferno-mobx';
import Touchable from '../rc-touchable/index';

@observer
export default class InputHandler extends Component<any, any> {
    render() {
        const {prefixCls, disabled, ...otherProps} = this.props;
        return (
            <Touchable disabled={disabled} activeClassName={`${prefixCls}-handler-active`}>
                <span {...otherProps} />
            </Touchable>
        );
    }
}

