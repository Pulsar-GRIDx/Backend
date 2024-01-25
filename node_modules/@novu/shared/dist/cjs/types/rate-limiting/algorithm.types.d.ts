import { ApiRateLimitConfigEnum, ApiRateLimitEnvVarNamespace } from './config.types';
export declare enum ApiRateLimitAlgorithmEnum {
    BURST_ALLOWANCE = "burst_allowance",
    WINDOW_DURATION = "window_duration"
}
export declare class IApiRateLimitAlgorithm implements Record<ApiRateLimitAlgorithmEnum, unknown> {
    [ApiRateLimitAlgorithmEnum.BURST_ALLOWANCE]: number;
    [ApiRateLimitAlgorithmEnum.WINDOW_DURATION]: number;
}
export type ApiRateLimitAlgorithmEnvVarFormat = Uppercase<`${ApiRateLimitEnvVarNamespace}_${ApiRateLimitConfigEnum.ALGORITHM}_${ApiRateLimitAlgorithmEnum}`>;
//# sourceMappingURL=algorithm.types.d.ts.map