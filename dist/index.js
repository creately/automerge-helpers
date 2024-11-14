import { Sakota } from '@creately/sakota';
import set from "lodash/set";
import unset from "lodash/unset";
export function automergePatchesToMongoModifier(patches) {
    const proxied = Sakota.create({});
    patches.forEach(patch => {
        if (patch.action === 'del') {
            set(proxied, patch.path, undefined);
        }
        else if (patch.action === 'insert') {
            patch.path.pop();
            set(proxied, patch.path, patch.values);
        }
        else if (patch.action === 'splice') {
            patch.path.pop();
            set(proxied, patch.path, patch.value);
        }
        else {
            set(proxied, patch.path, patch.value);
        }
    });
    return proxied.__sakota__.getChanges();
}
export function applyMongoModifier(doc, modifier) {
    if (modifier.$set) {
        for (const key in modifier.$set) {
            if (modifier.$set[key] !== undefined) {
                set(doc, key, modifier.$set[key]);
            }
        }
    }
    if (modifier.$unset) {
        for (const key in modifier.$unset) {
            unset(doc, key);
        }
    }
}
