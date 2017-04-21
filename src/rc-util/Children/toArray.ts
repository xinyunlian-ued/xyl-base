import React, {Children} from 'react';

export default function toArray(children) {
    const ret = [];
    Children.forEach(children, (c) => {
        ret.push(c);
    });
    return ret;
}
