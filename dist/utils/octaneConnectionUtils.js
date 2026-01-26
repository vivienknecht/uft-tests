"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OctaneConnectionUtils = void 0;
const OctaneSDK = require('@microfocus/alm-octane-js-rest-sdk').Octane;
class OctaneConnectionUtils {
    static getNewOctaneConnection(octaneServerUrl, sharedSpace, workspace, clientId, clientSecret) {
        return new OctaneSDK({
            server: octaneServerUrl,
            sharedSpace: sharedSpace,
            workspace: workspace,
            user: clientId,
            password: clientSecret,
            headers: {
                HPECLIENTTYPE: 'HPE_CI_CLIENT'
            }
        });
    }
}
exports.OctaneConnectionUtils = OctaneConnectionUtils;
