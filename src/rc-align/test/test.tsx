// import React, {Component} from 'react';
// import {render} from 'react-dom';
// import assign from 'object-assign';
// import Align from '../index';
//
// class Test extends React.Component<any, any> {
//
//     state = {
//         monitor: true,
//         align: {
//             points: ['cc', 'cc'],
//         },
//     };
//
//     container;
//
//     getTarget = () => {
//         let ref = this.container;
//         if (!ref) {
//             // parent ref not attached
//             ref = document.getElementById('container');
//         }
//         return ref;
//     }
//
//     toggleMonitor = () => {
//         this.setState({
//             monitor: !this.state.monitor,
//         });
//     }
//
//     forceAlign = () => {
//         this.setState({
//             align: assign({}, this.state.align),
//         });
//     }
//
//     render() {
//         return (
//             <div
//                 style={{
//                     margin: 50,
//                 }}
//             >
//                 <p>
//                     <button onClick={this.forceAlign}>force align</button>
//                     &nbsp;&nbsp;&nbsp;
//                     <button onClick={this.toggleMonitor}>toggle monitor</button>
//                 </p>
//                 <div
//                     ref={(e) => {
//                         this.container = e;
//                     }}
//                     id="container"
//                     style={{
//                         width: '80%',
//                         height: 500,
//                         border: '1px solid red',
//                     }}
//                 >
//                     <Align
//                         target={this.getTarget}
//                         monitorWindowResize={this.state.monitor}
//                         align={this.state.align}
//                     >
//                         <div
//                             style={{
//                                 position: 'absolute',
//                                 width: 50,
//                                 height: 50,
//                                 background: 'yellow',
//                             }}
//                         >
//                             source
//                         </div>
//                     </Align>
//                 </div>
//             </div>
//         );
//     }
// }
//
// render(<Test />, document.getElementById('app'));
