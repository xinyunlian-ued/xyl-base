import createElement from 'inferno-create-element';
import Component from 'inferno-component';
import {observer} from 'inferno-mobx';
import {IColumnGroupPropTypes} from "./PropsType";

@observer
export default class ColumnGroup extends Component<IColumnGroupPropTypes, any> {
    static isTableColumnGroup = true;
}
