import { TemplateVariableTypeEnum } from '../channel';
export declare enum EmailBlockTypeEnum {
    BUTTON = "button",
    TEXT = "text"
}
export declare enum TextAlignEnum {
    CENTER = "center",
    LEFT = "left",
    RIGHT = "right"
}
export interface IEmailBlock {
    type: EmailBlockTypeEnum;
    content: string;
    url?: string;
    styles?: {
        textAlign?: TextAlignEnum;
    };
}
export interface ITemplateVariable {
    type: TemplateVariableTypeEnum;
    name: string;
    required?: boolean;
    defaultValue?: string | boolean;
}
//# sourceMappingURL=index.d.ts.map