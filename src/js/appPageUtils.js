export const flattenRouteDict = (routeDict) => {
    const ans = {};

    const routeKeys = Object.keys(routeDict);

    for (let i = 0; i < routeKeys.length; i++) {
        const routeKey = routeKeys[i];

        // 葉ノードであるReact Componentはfunction
        // objectなら更に再帰
        const child = routeDict[routeKey];
        if (typeof child === typeof ({})) {
            // まだ続く
            const dict = flattenRouteDict(child);
            const recKeys = Object.keys(dict);
            for (let k = 0; k < recKeys.length; k++) {
                const recKey = recKeys[k];
                const recVal = dict[recKey];
                ans[`${routeKey}/${recKey}`] = recVal;
            }
        } else {
            // 葉
            ans[`${routeKey}.html`] = routeDict[routeKey];
        }
    }

    return ans;
};
