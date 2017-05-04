import '../assets/index.less';
import '../assets/iconfont.less';
import createElement from 'inferno-create-element';
import inferno from 'inferno';
import Steps, {Step} from '../index';

const container = document.getElementById('app');

const steps = [{
    title: '已完成',
    description: '这里是多信息的描述啊描述啊描述啊描述啊哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶',
}, {
    title: '进行中',
    description: '这里是多信息的描述啊描述啊描述啊描述啊哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶',
}, {
    title: '待运行',
    description: '这里是多信息的描述啊描述啊描述啊描述啊哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶',
}, {
    title: '待运行',
    description: '这里是多信息的描述啊描述啊描述啊描述啊哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶哦耶',
}].map((s, i) => {
    return (
        <Step
            key={i}
            title={s.title}
            description={s.description}
        />
    );
});

inferno.render(
    <Steps current={1}>
        {steps}
    </Steps>
    , container);
