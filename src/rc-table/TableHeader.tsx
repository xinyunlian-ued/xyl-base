import createElement from 'inferno-create-element';
import Component from 'inferno-component';
import {observer} from 'inferno-mobx';
import shallowequal from 'shallowequal';
import {ITableHeaderPropTypes} from "./PropsType";

@observer
export default class TableHeader extends Component<ITableHeaderPropTypes, any> {

    shouldComponentUpdate(nextProps) {
        return !shallowequal(nextProps, this.props);
    }

    render() {
        const {prefixCls, rowStyle, rows} = this.props;
        return (
            <thead className={`${prefixCls}-thead`}>
            {
                rows.map((row, index) => (
                    <tr key={index} style={rowStyle}>
                        {row.map((cellProps, i) => <th {...cellProps as any} key={i}/>)}
                    </tr>
                ))
            }
            </thead>
        );
    }
}
