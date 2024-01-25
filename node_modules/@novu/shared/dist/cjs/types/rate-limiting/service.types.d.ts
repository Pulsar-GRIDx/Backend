import { ApiServiceLevelEnum } from '../organization';
import { ApiRateLimitConfigEnum, ApiRateLimitEnvVarNamespace } from './config.types';
export declare enum ApiRateLimitCategoryEnum {
    TRIGGER = "trigger",
    CONFIGURATION = "configuration",
    GLOBAL = "global"
}
export type IApiRateLimitMaximum = Record<ApiRateLimitCategoryEnum, number>;
export type IApiRateLimitServiceMaximum = Record<ApiServiceLevelEnum, IApiRateLimitMaximum>;
export type ApiRateLimitServiceMaximumEnvVarFormat = Uppercase<`${ApiRateLimitEnvVarNamespace}_${ApiRateLimitConfigEnum.MAXIMUM}_${ApiServiceLevelEnum}_${ApiRateLimitCategoryEnum}`>;
//# sourceMappingURL=service.types.d.ts.map