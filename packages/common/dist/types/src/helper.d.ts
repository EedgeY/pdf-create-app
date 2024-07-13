import { Schema, Template, Font, BasePdf, Plugins, CommonOptions } from './types';
export declare const getFallbackFontName: (font: Font) => string;
export declare const getDefaultFont: () => Font;
export declare const mm2pt: (mm: number) => number;
export declare const pt2mm: (pt: number) => number;
export declare const pt2px: (pt: number) => number;
export declare const px2mm: (px: number) => number;
export declare const isHexValid: (hex: string) => boolean;
export declare const getInputFromTemplate: (template: Template) => {
    [key: string]: string;
}[];
export declare const getB64BasePdf: (basePdf: BasePdf) => string | Promise<string>;
export declare const isBlankPdf: (basePdf: BasePdf) => basePdf is {
    width: number;
    height: number;
    padding: [number, number, number, number];
};
export declare const b64toUint8Array: (base64: string) => Uint8Array;
export declare const checkFont: (arg: {
    font: Font;
    template: Template;
}) => void;
export declare const checkPlugins: (arg: {
    plugins: Plugins;
    template: Template;
}) => void;
export declare const checkInputs: (data: unknown) => void;
export declare const checkUIOptions: (data: unknown) => void;
export declare const checkTemplate: (data: unknown) => void;
export declare const checkUIProps: (data: unknown) => void;
export declare const checkPreviewProps: (data: unknown) => void;
export declare const checkDesignerProps: (data: unknown) => void;
export declare const checkGenerateProps: (data: unknown) => void;
interface ModifyTemplateForDynamicTableArg {
    template: Template;
    input: Record<string, string>;
    _cache: Map<any, any>;
    options: CommonOptions;
    modifyTemplate: (arg: {
        template: Template;
        input: Record<string, string>;
        _cache: Map<any, any>;
        options: CommonOptions;
    }) => Promise<Template>;
    getDynamicHeight: (value: string, args: {
        schema: Schema;
        basePdf: BasePdf;
        options: CommonOptions;
        _cache: Map<any, any>;
    }) => Promise<number>;
}
export declare const getDynamicTemplate: (arg: ModifyTemplateForDynamicTableArg) => Promise<Template>;
export declare const calculateDiffMap: (arg: ModifyTemplateForDynamicTableArg) => Promise<Map<number, number>>;
export declare const normalizePositionsAndPageBreak: (template: Template, diffMap: Map<number, number>) => Template;
export {};
