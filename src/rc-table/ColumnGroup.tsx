import * as React from 'react';
import {observer} from 'inferno-mobx';
import {IColumnGroupPropTypes} from "./PropsType";

@observer
export default class ColumnGroup extends React.Component<IColumnGroupPropTypes, any> {
    static isTableColumnGroup = true;
}
