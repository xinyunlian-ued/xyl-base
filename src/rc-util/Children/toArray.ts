import {Children} from "inferno-compat";

export default function toArray(children) {
    const ret = [];
    Children.forEach(children, (c) => {
        ret.push(c);
    }, null);
    return ret;
}
