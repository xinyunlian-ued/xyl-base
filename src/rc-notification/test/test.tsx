// /* eslint-disable no-console */
// import Notification from '../index';
// import React from 'react';
// import ReactDOM from 'react-dom';
// const notification = Notification.newInstance({});
// import '../assets/index.less';
// function simpleFn() {
//     notification.notice({
//         content: <span>simple show</span>,
//         onClose() {
//             alert('simple close');
//         },
//     });
// }
//
// function durationFn() {
//     notification.notice({
//         content: <span>can not close...</span>,
//         duration: null,
//     });
// }
//
// function closableFn() {
//     notification.notice({
//         content: <span>closable</span>,
//         duration: null,
//         onClose() {
//             alert('closable close');
//         },
//         closable: true,
//     });
// }
//
// function close(key) {
//     notification.removeNotice(key);
// }
//
// function manualClose() {
//     const key = Date.now();
//     notification.notice({
//         content: <div>
//             <p>click below button to close</p>
//             <button onClick={close.bind(null, key)}>close</button>
//         </div>,
//         key,
//         duration: null,
//     });
// }
//
// ReactDOM.render(<div>
//     <div>
//         <button onClick={simpleFn}>simple show</button>
//         <button onClick={durationFn}>duration=0</button>
//         <button onClick={closableFn}>closable</button>
//         <button onClick={manualClose}>controlled close</button>
//     </div>
// </div>, document.getElementById('app'));
