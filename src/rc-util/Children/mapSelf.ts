import {Children} from "inferno-compat";

function mirror(o) {
    return o;
}

export default function mapSelf(children) {
    // return ReactFragment
    return Children.map(children, mirror, null);
}
