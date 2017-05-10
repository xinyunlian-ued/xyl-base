import React from 'react';
import {render} from 'inferno';
import Tooltip from '../../rc-tooltip'
import Slider from '../index';
import '../assets/index.less';
import '../../rc-tooltip/assets/bootstrap.less';

const createSliderWithTooltip = Slider.createSliderWithTooltip;
const Range = createSliderWithTooltip(Slider.Range);
const Handle = Slider.Handle;

const handle = (props) => {
    const { value, dragging, index, ...restProps } = props;
    return (
        <Tooltip
            prefixCls="rc-slider-tooltip"
            overlay={value}
            visible={dragging}
            placement="top"
            key={index}
        >
            <Handle {...restProps} />
        </Tooltip>
    );
};

const wrapperStyle = { width: 400, margin: 50 };
render(
    <div>
        <div style={wrapperStyle}>
            <p>Slider with custom handle</p>
            <Slider min={0} max={20} defaultValue={3} handle={handle} />
        </div>
        <div style={wrapperStyle}>
            <p>Range with custom handle</p>
            <Range min={0} max={20} defaultValue={[3, 10]} tipFormatter={value => `${value}%`} />
        </div>
    </div>,
    document.getElementById('__react-content')
);
