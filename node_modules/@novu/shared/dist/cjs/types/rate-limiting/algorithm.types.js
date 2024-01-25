"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IApiRateLimitAlgorithm = exports.ApiRateLimitAlgorithmEnum = void 0;
var ApiRateLimitAlgorithmEnum;
(function (ApiRateLimitAlgorithmEnum) {
    ApiRateLimitAlgorithmEnum["BURST_ALLOWANCE"] = "burst_allowance";
    ApiRateLimitAlgorithmEnum["WINDOW_DURATION"] = "window_duration";
})(ApiRateLimitAlgorithmEnum = exports.ApiRateLimitAlgorithmEnum || (exports.ApiRateLimitAlgorithmEnum = {}));
class IApiRateLimitAlgorithm {
}
exports.IApiRateLimitAlgorithm = IApiRateLimitAlgorithm;
ApiRateLimitAlgorithmEnum.BURST_ALLOWANCE, ApiRateLimitAlgorithmEnum.WINDOW_DURATION;
