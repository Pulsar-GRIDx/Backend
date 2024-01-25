import { EnvironmentId, ExternalSubscriberId, OrganizationId, SubscriberId, TopicId, TopicKey, TopicName } from '../../types';
export declare class TopicDto {
    _id: TopicId;
    _organizationId: OrganizationId;
    _environmentId: EnvironmentId;
    key: TopicKey;
    name: TopicName;
    subscribers: ExternalSubscriberId[];
}
export declare class TopicSubscribersDto {
    _organizationId: OrganizationId;
    _environmentId: EnvironmentId;
    _subscriberId: SubscriberId;
    _topicId: TopicId;
    topicKey: TopicKey;
    externalSubscriberId: ExternalSubscriberId;
}
//# sourceMappingURL=topic.dto.d.ts.map