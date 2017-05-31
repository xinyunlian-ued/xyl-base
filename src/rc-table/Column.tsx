import createElement from 'inferno-create-element';
import Component from 'inferno-component';
import {observer} from 'inferno-mobx';
import {IColumnPropTypes} from "./PropsType";

@observer
export default class Column extends Component<IColumnPropTypes, any> {
}
