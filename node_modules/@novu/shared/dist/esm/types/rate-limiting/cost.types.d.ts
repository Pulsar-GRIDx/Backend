import { ApiRateLimitConfigEnum, ApiRateLimitEnvVarNamespace } from './config.types';
export declare enum ApiRateLimitCostEnum {
    SINGLE = "single",
    BULK = "bulk"
}
export type IApiRateLimitCost = Record<ApiRateLimitCostEnum, number>;
export type ApiRateLimitCostEnvVarFormat = Uppercase<`${ApiRateLimitEnvVarNamespace}_${ApiRateLimitConfigEnum.COST}_${ApiRateLimitCostEnum}`>;
//# sourceMappingURL=cost.types.d.ts.map