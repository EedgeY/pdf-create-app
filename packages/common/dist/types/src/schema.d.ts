import { z } from 'zod';
export declare const Lang: z.ZodEnum<["en", "zh", "ja", "ko", "ar", "th", "pl", "it", "de", "es", "fr"]>;
export declare const Dict: z.ZodObject<{
    cancel: z.ZodString;
    field: z.ZodString;
    fieldName: z.ZodString;
    align: z.ZodString;
    width: z.ZodString;
    opacity: z.ZodString;
    height: z.ZodString;
    rotate: z.ZodString;
    edit: z.ZodString;
    plsInputName: z.ZodString;
    fieldMustUniq: z.ZodString;
    notUniq: z.ZodString;
    noKeyName: z.ZodString;
    fieldsList: z.ZodString;
    editField: z.ZodString;
    type: z.ZodString;
    errorOccurred: z.ZodString;
    errorBulkUpdateFieldName: z.ZodString;
    commitBulkUpdateFieldName: z.ZodString;
    bulkUpdateFieldName: z.ZodString;
    addPageAfter: z.ZodString;
    removePage: z.ZodString;
    removePageConfirm: z.ZodString;
    hexColorPrompt: z.ZodString;
    'schemas.color': z.ZodString;
    'schemas.borderWidth': z.ZodString;
    'schemas.borderColor': z.ZodString;
    'schemas.backgroundColor': z.ZodString;
    'schemas.textColor': z.ZodString;
    'schemas.bgColor': z.ZodString;
    'schemas.horizontal': z.ZodString;
    'schemas.vertical': z.ZodString;
    'schemas.left': z.ZodString;
    'schemas.center': z.ZodString;
    'schemas.right': z.ZodString;
    'schemas.top': z.ZodString;
    'schemas.middle': z.ZodString;
    'schemas.bottom': z.ZodString;
    'schemas.padding': z.ZodString;
    'schemas.text.fontName': z.ZodString;
    'schemas.text.size': z.ZodString;
    'schemas.text.spacing': z.ZodString;
    'schemas.text.textAlign': z.ZodString;
    'schemas.text.verticalAlign': z.ZodString;
    'schemas.text.lineHeight': z.ZodString;
    'schemas.text.min': z.ZodString;
    'schemas.text.max': z.ZodString;
    'schemas.text.fit': z.ZodString;
    'schemas.text.dynamicFontSize': z.ZodString;
    'schemas.barcodes.barColor': z.ZodString;
    'schemas.barcodes.includetext': z.ZodString;
    'schemas.table.alternateBackgroundColor': z.ZodString;
    'schemas.table.tableStyle': z.ZodString;
    'schemas.table.headStyle': z.ZodString;
    'schemas.table.bodyStyle': z.ZodString;
    'schemas.table.columnStyle': z.ZodString;
}, "strip", z.ZodTypeAny, {
    cancel: string;
    field: string;
    fieldName: string;
    align: string;
    width: string;
    opacity: string;
    height: string;
    rotate: string;
    edit: string;
    plsInputName: string;
    fieldMustUniq: string;
    notUniq: string;
    noKeyName: string;
    fieldsList: string;
    editField: string;
    type: string;
    errorOccurred: string;
    errorBulkUpdateFieldName: string;
    commitBulkUpdateFieldName: string;
    bulkUpdateFieldName: string;
    addPageAfter: string;
    removePage: string;
    removePageConfirm: string;
    hexColorPrompt: string;
    'schemas.color': string;
    'schemas.borderWidth': string;
    'schemas.borderColor': string;
    'schemas.backgroundColor': string;
    'schemas.textColor': string;
    'schemas.bgColor': string;
    'schemas.horizontal': string;
    'schemas.vertical': string;
    'schemas.left': string;
    'schemas.center': string;
    'schemas.right': string;
    'schemas.top': string;
    'schemas.middle': string;
    'schemas.bottom': string;
    'schemas.padding': string;
    'schemas.text.fontName': string;
    'schemas.text.size': string;
    'schemas.text.spacing': string;
    'schemas.text.textAlign': string;
    'schemas.text.verticalAlign': string;
    'schemas.text.lineHeight': string;
    'schemas.text.min': string;
    'schemas.text.max': string;
    'schemas.text.fit': string;
    'schemas.text.dynamicFontSize': string;
    'schemas.barcodes.barColor': string;
    'schemas.barcodes.includetext': string;
    'schemas.table.alternateBackgroundColor': string;
    'schemas.table.tableStyle': string;
    'schemas.table.headStyle': string;
    'schemas.table.bodyStyle': string;
    'schemas.table.columnStyle': string;
}, {
    cancel: string;
    field: string;
    fieldName: string;
    align: string;
    width: string;
    opacity: string;
    height: string;
    rotate: string;
    edit: string;
    plsInputName: string;
    fieldMustUniq: string;
    notUniq: string;
    noKeyName: string;
    fieldsList: string;
    editField: string;
    type: string;
    errorOccurred: string;
    errorBulkUpdateFieldName: string;
    commitBulkUpdateFieldName: string;
    bulkUpdateFieldName: string;
    addPageAfter: string;
    removePage: string;
    removePageConfirm: string;
    hexColorPrompt: string;
    'schemas.color': string;
    'schemas.borderWidth': string;
    'schemas.borderColor': string;
    'schemas.backgroundColor': string;
    'schemas.textColor': string;
    'schemas.bgColor': string;
    'schemas.horizontal': string;
    'schemas.vertical': string;
    'schemas.left': string;
    'schemas.center': string;
    'schemas.right': string;
    'schemas.top': string;
    'schemas.middle': string;
    'schemas.bottom': string;
    'schemas.padding': string;
    'schemas.text.fontName': string;
    'schemas.text.size': string;
    'schemas.text.spacing': string;
    'schemas.text.textAlign': string;
    'schemas.text.verticalAlign': string;
    'schemas.text.lineHeight': string;
    'schemas.text.min': string;
    'schemas.text.max': string;
    'schemas.text.fit': string;
    'schemas.text.dynamicFontSize': string;
    'schemas.barcodes.barColor': string;
    'schemas.barcodes.includetext': string;
    'schemas.table.alternateBackgroundColor': string;
    'schemas.table.tableStyle': string;
    'schemas.table.headStyle': string;
    'schemas.table.bodyStyle': string;
    'schemas.table.columnStyle': string;
}>;
export declare const Mode: z.ZodEnum<["viewer", "form", "designer"]>;
export declare const ColorType: z.ZodOptional<z.ZodEnum<["rgb", "cmyk"]>>;
export declare const Size: z.ZodObject<{
    height: z.ZodNumber;
    width: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    width: number;
    height: number;
}, {
    width: number;
    height: number;
}>;
export declare const Schema: z.ZodObject<{
    type: z.ZodString;
    icon: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodString>;
    position: z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        x: number;
        y: number;
    }, {
        x: number;
        y: number;
    }>;
    width: z.ZodNumber;
    height: z.ZodNumber;
    rotate: z.ZodOptional<z.ZodNumber>;
    opacity: z.ZodOptional<z.ZodNumber>;
    readOnly: z.ZodOptional<z.ZodBoolean>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    type: z.ZodString;
    icon: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodString>;
    position: z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        x: number;
        y: number;
    }, {
        x: number;
        y: number;
    }>;
    width: z.ZodNumber;
    height: z.ZodNumber;
    rotate: z.ZodOptional<z.ZodNumber>;
    opacity: z.ZodOptional<z.ZodNumber>;
    readOnly: z.ZodOptional<z.ZodBoolean>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    type: z.ZodString;
    icon: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodString>;
    position: z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        x: number;
        y: number;
    }, {
        x: number;
        y: number;
    }>;
    width: z.ZodNumber;
    height: z.ZodNumber;
    rotate: z.ZodOptional<z.ZodNumber>;
    opacity: z.ZodOptional<z.ZodNumber>;
    readOnly: z.ZodOptional<z.ZodBoolean>;
}, z.ZodTypeAny, "passthrough">>;
export declare const SchemaForUI: z.ZodObject<{
    width: z.ZodNumber;
    opacity: z.ZodOptional<z.ZodNumber>;
    height: z.ZodNumber;
    rotate: z.ZodOptional<z.ZodNumber>;
    type: z.ZodString;
    icon: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodString>;
    position: z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        x: number;
        y: number;
    }, {
        x: number;
        y: number;
    }>;
    readOnly: z.ZodOptional<z.ZodBoolean>;
    id: z.ZodString;
    key: z.ZodString;
}, "strip", z.ZodTypeAny, {
    width: number;
    height: number;
    type: string;
    position: {
        x: number;
        y: number;
    };
    id: string;
    key: string;
    opacity?: number | undefined;
    rotate?: number | undefined;
    icon?: string | undefined;
    content?: string | undefined;
    readOnly?: boolean | undefined;
}, {
    width: number;
    height: number;
    type: string;
    position: {
        x: number;
        y: number;
    };
    id: string;
    key: string;
    opacity?: number | undefined;
    rotate?: number | undefined;
    icon?: string | undefined;
    content?: string | undefined;
    readOnly?: boolean | undefined;
}>;
export declare const BlankPdf: z.ZodObject<{
    width: z.ZodNumber;
    height: z.ZodNumber;
    padding: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
}, "strip", z.ZodTypeAny, {
    width: number;
    height: number;
    padding: [number, number, number, number];
}, {
    width: number;
    height: number;
    padding: [number, number, number, number];
}>;
export declare const BasePdf: z.ZodUnion<[z.ZodString, z.ZodType<ArrayBuffer, z.ZodTypeDef, ArrayBuffer>, z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>, z.ZodObject<{
    width: z.ZodNumber;
    height: z.ZodNumber;
    padding: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
}, "strip", z.ZodTypeAny, {
    width: number;
    height: number;
    padding: [number, number, number, number];
}, {
    width: number;
    height: number;
    padding: [number, number, number, number];
}>]>;
export declare const Template: z.ZodObject<{
    schemas: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodObject<{
        type: z.ZodString;
        icon: z.ZodOptional<z.ZodString>;
        content: z.ZodOptional<z.ZodString>;
        position: z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
        }, {
            x: number;
            y: number;
        }>;
        width: z.ZodNumber;
        height: z.ZodNumber;
        rotate: z.ZodOptional<z.ZodNumber>;
        opacity: z.ZodOptional<z.ZodNumber>;
        readOnly: z.ZodOptional<z.ZodBoolean>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        type: z.ZodString;
        icon: z.ZodOptional<z.ZodString>;
        content: z.ZodOptional<z.ZodString>;
        position: z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
        }, {
            x: number;
            y: number;
        }>;
        width: z.ZodNumber;
        height: z.ZodNumber;
        rotate: z.ZodOptional<z.ZodNumber>;
        opacity: z.ZodOptional<z.ZodNumber>;
        readOnly: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        type: z.ZodString;
        icon: z.ZodOptional<z.ZodString>;
        content: z.ZodOptional<z.ZodString>;
        position: z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
        }, {
            x: number;
            y: number;
        }>;
        width: z.ZodNumber;
        height: z.ZodNumber;
        rotate: z.ZodOptional<z.ZodNumber>;
        opacity: z.ZodOptional<z.ZodNumber>;
        readOnly: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">>>, "many">;
    basePdf: z.ZodUnion<[z.ZodString, z.ZodType<ArrayBuffer, z.ZodTypeDef, ArrayBuffer>, z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>, z.ZodObject<{
        width: z.ZodNumber;
        height: z.ZodNumber;
        padding: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
    }, "strip", z.ZodTypeAny, {
        width: number;
        height: number;
        padding: [number, number, number, number];
    }, {
        width: number;
        height: number;
        padding: [number, number, number, number];
    }>]>;
    pdfmeVersion: z.ZodOptional<z.ZodString>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    schemas: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodObject<{
        type: z.ZodString;
        icon: z.ZodOptional<z.ZodString>;
        content: z.ZodOptional<z.ZodString>;
        position: z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
        }, {
            x: number;
            y: number;
        }>;
        width: z.ZodNumber;
        height: z.ZodNumber;
        rotate: z.ZodOptional<z.ZodNumber>;
        opacity: z.ZodOptional<z.ZodNumber>;
        readOnly: z.ZodOptional<z.ZodBoolean>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        type: z.ZodString;
        icon: z.ZodOptional<z.ZodString>;
        content: z.ZodOptional<z.ZodString>;
        position: z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
        }, {
            x: number;
            y: number;
        }>;
        width: z.ZodNumber;
        height: z.ZodNumber;
        rotate: z.ZodOptional<z.ZodNumber>;
        opacity: z.ZodOptional<z.ZodNumber>;
        readOnly: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        type: z.ZodString;
        icon: z.ZodOptional<z.ZodString>;
        content: z.ZodOptional<z.ZodString>;
        position: z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
        }, {
            x: number;
            y: number;
        }>;
        width: z.ZodNumber;
        height: z.ZodNumber;
        rotate: z.ZodOptional<z.ZodNumber>;
        opacity: z.ZodOptional<z.ZodNumber>;
        readOnly: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">>>, "many">;
    basePdf: z.ZodUnion<[z.ZodString, z.ZodType<ArrayBuffer, z.ZodTypeDef, ArrayBuffer>, z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>, z.ZodObject<{
        width: z.ZodNumber;
        height: z.ZodNumber;
        padding: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
    }, "strip", z.ZodTypeAny, {
        width: number;
        height: number;
        padding: [number, number, number, number];
    }, {
        width: number;
        height: number;
        padding: [number, number, number, number];
    }>]>;
    pdfmeVersion: z.ZodOptional<z.ZodString>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    schemas: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodObject<{
        type: z.ZodString;
        icon: z.ZodOptional<z.ZodString>;
        content: z.ZodOptional<z.ZodString>;
        position: z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
        }, {
            x: number;
            y: number;
        }>;
        width: z.ZodNumber;
        height: z.ZodNumber;
        rotate: z.ZodOptional<z.ZodNumber>;
        opacity: z.ZodOptional<z.ZodNumber>;
        readOnly: z.ZodOptional<z.ZodBoolean>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        type: z.ZodString;
        icon: z.ZodOptional<z.ZodString>;
        content: z.ZodOptional<z.ZodString>;
        position: z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
        }, {
            x: number;
            y: number;
        }>;
        width: z.ZodNumber;
        height: z.ZodNumber;
        rotate: z.ZodOptional<z.ZodNumber>;
        opacity: z.ZodOptional<z.ZodNumber>;
        readOnly: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        type: z.ZodString;
        icon: z.ZodOptional<z.ZodString>;
        content: z.ZodOptional<z.ZodString>;
        position: z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
        }, {
            x: number;
            y: number;
        }>;
        width: z.ZodNumber;
        height: z.ZodNumber;
        rotate: z.ZodOptional<z.ZodNumber>;
        opacity: z.ZodOptional<z.ZodNumber>;
        readOnly: z.ZodOptional<z.ZodBoolean>;
    }, z.ZodTypeAny, "passthrough">>>, "many">;
    basePdf: z.ZodUnion<[z.ZodString, z.ZodType<ArrayBuffer, z.ZodTypeDef, ArrayBuffer>, z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>, z.ZodObject<{
        width: z.ZodNumber;
        height: z.ZodNumber;
        padding: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
    }, "strip", z.ZodTypeAny, {
        width: number;
        height: number;
        padding: [number, number, number, number];
    }, {
        width: number;
        height: number;
        padding: [number, number, number, number];
    }>]>;
    pdfmeVersion: z.ZodOptional<z.ZodString>;
}, z.ZodTypeAny, "passthrough">>;
export declare const Inputs: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodAny>, "many">;
export declare const Font: z.ZodRecord<z.ZodString, z.ZodObject<{
    data: z.ZodUnion<[z.ZodString, z.ZodType<ArrayBuffer, z.ZodTypeDef, ArrayBuffer>, z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>]>;
    fallback: z.ZodOptional<z.ZodBoolean>;
    subset: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
    fallback?: boolean | undefined;
    subset?: boolean | undefined;
}, {
    data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
    fallback?: boolean | undefined;
    subset?: boolean | undefined;
}>>;
export declare const CommonOptions: z.ZodObject<{
    font: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        data: z.ZodUnion<[z.ZodString, z.ZodType<ArrayBuffer, z.ZodTypeDef, ArrayBuffer>, z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>]>;
        fallback: z.ZodOptional<z.ZodBoolean>;
        subset: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
        fallback?: boolean | undefined;
        subset?: boolean | undefined;
    }, {
        data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
        fallback?: boolean | undefined;
        subset?: boolean | undefined;
    }>>>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    font: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        data: z.ZodUnion<[z.ZodString, z.ZodType<ArrayBuffer, z.ZodTypeDef, ArrayBuffer>, z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>]>;
        fallback: z.ZodOptional<z.ZodBoolean>;
        subset: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
        fallback?: boolean | undefined;
        subset?: boolean | undefined;
    }, {
        data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
        fallback?: boolean | undefined;
        subset?: boolean | undefined;
    }>>>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    font: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        data: z.ZodUnion<[z.ZodString, z.ZodType<ArrayBuffer, z.ZodTypeDef, ArrayBuffer>, z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>]>;
        fallback: z.ZodOptional<z.ZodBoolean>;
        subset: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
        fallback?: boolean | undefined;
        subset?: boolean | undefined;
    }, {
        data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
        fallback?: boolean | undefined;
        subset?: boolean | undefined;
    }>>>;
}, z.ZodTypeAny, "passthrough">>;
export declare const GeneratorOptions: z.ZodObject<{
    font: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        data: z.ZodUnion<[z.ZodString, z.ZodType<ArrayBuffer, z.ZodTypeDef, ArrayBuffer>, z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>]>;
        fallback: z.ZodOptional<z.ZodBoolean>;
        subset: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
        fallback?: boolean | undefined;
        subset?: boolean | undefined;
    }, {
        data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
        fallback?: boolean | undefined;
        subset?: boolean | undefined;
    }>>>;
    colorType: z.ZodOptional<z.ZodEnum<["rgb", "cmyk"]>>;
    author: z.ZodOptional<z.ZodString>;
    creationDate: z.ZodOptional<z.ZodDate>;
    creator: z.ZodOptional<z.ZodString>;
    keywords: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    language: z.ZodOptional<z.ZodString>;
    modificationDate: z.ZodOptional<z.ZodDate>;
    producer: z.ZodOptional<z.ZodString>;
    subject: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    font: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        data: z.ZodUnion<[z.ZodString, z.ZodType<ArrayBuffer, z.ZodTypeDef, ArrayBuffer>, z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>]>;
        fallback: z.ZodOptional<z.ZodBoolean>;
        subset: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
        fallback?: boolean | undefined;
        subset?: boolean | undefined;
    }, {
        data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
        fallback?: boolean | undefined;
        subset?: boolean | undefined;
    }>>>;
    colorType: z.ZodOptional<z.ZodEnum<["rgb", "cmyk"]>>;
    author: z.ZodOptional<z.ZodString>;
    creationDate: z.ZodOptional<z.ZodDate>;
    creator: z.ZodOptional<z.ZodString>;
    keywords: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    language: z.ZodOptional<z.ZodString>;
    modificationDate: z.ZodOptional<z.ZodDate>;
    producer: z.ZodOptional<z.ZodString>;
    subject: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    font: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        data: z.ZodUnion<[z.ZodString, z.ZodType<ArrayBuffer, z.ZodTypeDef, ArrayBuffer>, z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>]>;
        fallback: z.ZodOptional<z.ZodBoolean>;
        subset: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
        fallback?: boolean | undefined;
        subset?: boolean | undefined;
    }, {
        data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
        fallback?: boolean | undefined;
        subset?: boolean | undefined;
    }>>>;
    colorType: z.ZodOptional<z.ZodEnum<["rgb", "cmyk"]>>;
    author: z.ZodOptional<z.ZodString>;
    creationDate: z.ZodOptional<z.ZodDate>;
    creator: z.ZodOptional<z.ZodString>;
    keywords: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    language: z.ZodOptional<z.ZodString>;
    modificationDate: z.ZodOptional<z.ZodDate>;
    producer: z.ZodOptional<z.ZodString>;
    subject: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
}, z.ZodTypeAny, "passthrough">>;
export declare const GenerateProps: z.ZodObject<{
    template: z.ZodObject<{
        schemas: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodObject<{
            type: z.ZodString;
            icon: z.ZodOptional<z.ZodString>;
            content: z.ZodOptional<z.ZodString>;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>;
            width: z.ZodNumber;
            height: z.ZodNumber;
            rotate: z.ZodOptional<z.ZodNumber>;
            opacity: z.ZodOptional<z.ZodNumber>;
            readOnly: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            type: z.ZodString;
            icon: z.ZodOptional<z.ZodString>;
            content: z.ZodOptional<z.ZodString>;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>;
            width: z.ZodNumber;
            height: z.ZodNumber;
            rotate: z.ZodOptional<z.ZodNumber>;
            opacity: z.ZodOptional<z.ZodNumber>;
            readOnly: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            type: z.ZodString;
            icon: z.ZodOptional<z.ZodString>;
            content: z.ZodOptional<z.ZodString>;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>;
            width: z.ZodNumber;
            height: z.ZodNumber;
            rotate: z.ZodOptional<z.ZodNumber>;
            opacity: z.ZodOptional<z.ZodNumber>;
            readOnly: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>>, "many">;
        basePdf: z.ZodUnion<[z.ZodString, z.ZodType<ArrayBuffer, z.ZodTypeDef, ArrayBuffer>, z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>, z.ZodObject<{
            width: z.ZodNumber;
            height: z.ZodNumber;
            padding: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
        }, "strip", z.ZodTypeAny, {
            width: number;
            height: number;
            padding: [number, number, number, number];
        }, {
            width: number;
            height: number;
            padding: [number, number, number, number];
        }>]>;
        pdfmeVersion: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        schemas: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodObject<{
            type: z.ZodString;
            icon: z.ZodOptional<z.ZodString>;
            content: z.ZodOptional<z.ZodString>;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>;
            width: z.ZodNumber;
            height: z.ZodNumber;
            rotate: z.ZodOptional<z.ZodNumber>;
            opacity: z.ZodOptional<z.ZodNumber>;
            readOnly: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            type: z.ZodString;
            icon: z.ZodOptional<z.ZodString>;
            content: z.ZodOptional<z.ZodString>;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>;
            width: z.ZodNumber;
            height: z.ZodNumber;
            rotate: z.ZodOptional<z.ZodNumber>;
            opacity: z.ZodOptional<z.ZodNumber>;
            readOnly: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            type: z.ZodString;
            icon: z.ZodOptional<z.ZodString>;
            content: z.ZodOptional<z.ZodString>;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>;
            width: z.ZodNumber;
            height: z.ZodNumber;
            rotate: z.ZodOptional<z.ZodNumber>;
            opacity: z.ZodOptional<z.ZodNumber>;
            readOnly: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>>, "many">;
        basePdf: z.ZodUnion<[z.ZodString, z.ZodType<ArrayBuffer, z.ZodTypeDef, ArrayBuffer>, z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>, z.ZodObject<{
            width: z.ZodNumber;
            height: z.ZodNumber;
            padding: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
        }, "strip", z.ZodTypeAny, {
            width: number;
            height: number;
            padding: [number, number, number, number];
        }, {
            width: number;
            height: number;
            padding: [number, number, number, number];
        }>]>;
        pdfmeVersion: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        schemas: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodObject<{
            type: z.ZodString;
            icon: z.ZodOptional<z.ZodString>;
            content: z.ZodOptional<z.ZodString>;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>;
            width: z.ZodNumber;
            height: z.ZodNumber;
            rotate: z.ZodOptional<z.ZodNumber>;
            opacity: z.ZodOptional<z.ZodNumber>;
            readOnly: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            type: z.ZodString;
            icon: z.ZodOptional<z.ZodString>;
            content: z.ZodOptional<z.ZodString>;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>;
            width: z.ZodNumber;
            height: z.ZodNumber;
            rotate: z.ZodOptional<z.ZodNumber>;
            opacity: z.ZodOptional<z.ZodNumber>;
            readOnly: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            type: z.ZodString;
            icon: z.ZodOptional<z.ZodString>;
            content: z.ZodOptional<z.ZodString>;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>;
            width: z.ZodNumber;
            height: z.ZodNumber;
            rotate: z.ZodOptional<z.ZodNumber>;
            opacity: z.ZodOptional<z.ZodNumber>;
            readOnly: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>>, "many">;
        basePdf: z.ZodUnion<[z.ZodString, z.ZodType<ArrayBuffer, z.ZodTypeDef, ArrayBuffer>, z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>, z.ZodObject<{
            width: z.ZodNumber;
            height: z.ZodNumber;
            padding: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
        }, "strip", z.ZodTypeAny, {
            width: number;
            height: number;
            padding: [number, number, number, number];
        }, {
            width: number;
            height: number;
            padding: [number, number, number, number];
        }>]>;
        pdfmeVersion: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>;
    plugins: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        ui: z.ZodAny;
        pdf: z.ZodAny;
        propPanel: z.ZodAny;
    }, "strip", z.ZodTypeAny, {
        ui?: any;
        pdf?: any;
        propPanel?: any;
    }, {
        ui?: any;
        pdf?: any;
        propPanel?: any;
    }>>>;
    inputs: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodAny>, "many">;
    options: z.ZodOptional<z.ZodObject<{
        font: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            data: z.ZodUnion<[z.ZodString, z.ZodType<ArrayBuffer, z.ZodTypeDef, ArrayBuffer>, z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>]>;
            fallback: z.ZodOptional<z.ZodBoolean>;
            subset: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
            fallback?: boolean | undefined;
            subset?: boolean | undefined;
        }, {
            data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
            fallback?: boolean | undefined;
            subset?: boolean | undefined;
        }>>>;
        colorType: z.ZodOptional<z.ZodEnum<["rgb", "cmyk"]>>;
        author: z.ZodOptional<z.ZodString>;
        creationDate: z.ZodOptional<z.ZodDate>;
        creator: z.ZodOptional<z.ZodString>;
        keywords: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        language: z.ZodOptional<z.ZodString>;
        modificationDate: z.ZodOptional<z.ZodDate>;
        producer: z.ZodOptional<z.ZodString>;
        subject: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        font: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            data: z.ZodUnion<[z.ZodString, z.ZodType<ArrayBuffer, z.ZodTypeDef, ArrayBuffer>, z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>]>;
            fallback: z.ZodOptional<z.ZodBoolean>;
            subset: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
            fallback?: boolean | undefined;
            subset?: boolean | undefined;
        }, {
            data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
            fallback?: boolean | undefined;
            subset?: boolean | undefined;
        }>>>;
        colorType: z.ZodOptional<z.ZodEnum<["rgb", "cmyk"]>>;
        author: z.ZodOptional<z.ZodString>;
        creationDate: z.ZodOptional<z.ZodDate>;
        creator: z.ZodOptional<z.ZodString>;
        keywords: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        language: z.ZodOptional<z.ZodString>;
        modificationDate: z.ZodOptional<z.ZodDate>;
        producer: z.ZodOptional<z.ZodString>;
        subject: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        font: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            data: z.ZodUnion<[z.ZodString, z.ZodType<ArrayBuffer, z.ZodTypeDef, ArrayBuffer>, z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>]>;
            fallback: z.ZodOptional<z.ZodBoolean>;
            subset: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
            fallback?: boolean | undefined;
            subset?: boolean | undefined;
        }, {
            data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
            fallback?: boolean | undefined;
            subset?: boolean | undefined;
        }>>>;
        colorType: z.ZodOptional<z.ZodEnum<["rgb", "cmyk"]>>;
        author: z.ZodOptional<z.ZodString>;
        creationDate: z.ZodOptional<z.ZodDate>;
        creator: z.ZodOptional<z.ZodString>;
        keywords: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        language: z.ZodOptional<z.ZodString>;
        modificationDate: z.ZodOptional<z.ZodDate>;
        producer: z.ZodOptional<z.ZodString>;
        subject: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>>;
}, "strict", z.ZodTypeAny, {
    template: {
        schemas: Record<string, z.objectOutputType<{
            type: z.ZodString;
            icon: z.ZodOptional<z.ZodString>;
            content: z.ZodOptional<z.ZodString>;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>;
            width: z.ZodNumber;
            height: z.ZodNumber;
            rotate: z.ZodOptional<z.ZodNumber>;
            opacity: z.ZodOptional<z.ZodNumber>;
            readOnly: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>[];
        basePdf: (string | ArrayBuffer | Uint8Array | {
            width: number;
            height: number;
            padding: [number, number, number, number];
        }) & (string | ArrayBuffer | Uint8Array | {
            width: number;
            height: number;
            padding: [number, number, number, number];
        } | undefined);
        pdfmeVersion?: string | undefined;
    } & {
        [k: string]: unknown;
    };
    inputs: Record<string, any>[];
    plugins?: Record<string, {
        ui?: any;
        pdf?: any;
        propPanel?: any;
    }> | undefined;
    options?: z.objectOutputType<{
        font: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            data: z.ZodUnion<[z.ZodString, z.ZodType<ArrayBuffer, z.ZodTypeDef, ArrayBuffer>, z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>]>;
            fallback: z.ZodOptional<z.ZodBoolean>;
            subset: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
            fallback?: boolean | undefined;
            subset?: boolean | undefined;
        }, {
            data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
            fallback?: boolean | undefined;
            subset?: boolean | undefined;
        }>>>;
        colorType: z.ZodOptional<z.ZodEnum<["rgb", "cmyk"]>>;
        author: z.ZodOptional<z.ZodString>;
        creationDate: z.ZodOptional<z.ZodDate>;
        creator: z.ZodOptional<z.ZodString>;
        keywords: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        language: z.ZodOptional<z.ZodString>;
        modificationDate: z.ZodOptional<z.ZodDate>;
        producer: z.ZodOptional<z.ZodString>;
        subject: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
}, {
    template: {
        schemas: Record<string, z.objectInputType<{
            type: z.ZodString;
            icon: z.ZodOptional<z.ZodString>;
            content: z.ZodOptional<z.ZodString>;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>;
            width: z.ZodNumber;
            height: z.ZodNumber;
            rotate: z.ZodOptional<z.ZodNumber>;
            opacity: z.ZodOptional<z.ZodNumber>;
            readOnly: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>[];
        basePdf: (string | ArrayBuffer | Uint8Array | {
            width: number;
            height: number;
            padding: [number, number, number, number];
        }) & (string | ArrayBuffer | Uint8Array | {
            width: number;
            height: number;
            padding: [number, number, number, number];
        } | undefined);
        pdfmeVersion?: string | undefined;
    } & {
        [k: string]: unknown;
    };
    inputs: Record<string, any>[];
    plugins?: Record<string, {
        ui?: any;
        pdf?: any;
        propPanel?: any;
    }> | undefined;
    options?: z.objectInputType<{
        font: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            data: z.ZodUnion<[z.ZodString, z.ZodType<ArrayBuffer, z.ZodTypeDef, ArrayBuffer>, z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>]>;
            fallback: z.ZodOptional<z.ZodBoolean>;
            subset: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
            fallback?: boolean | undefined;
            subset?: boolean | undefined;
        }, {
            data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
            fallback?: boolean | undefined;
            subset?: boolean | undefined;
        }>>>;
        colorType: z.ZodOptional<z.ZodEnum<["rgb", "cmyk"]>>;
        author: z.ZodOptional<z.ZodString>;
        creationDate: z.ZodOptional<z.ZodDate>;
        creator: z.ZodOptional<z.ZodString>;
        keywords: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        language: z.ZodOptional<z.ZodString>;
        modificationDate: z.ZodOptional<z.ZodDate>;
        producer: z.ZodOptional<z.ZodString>;
        subject: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
}>;
export declare const UIOptions: z.ZodObject<{
    font: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        data: z.ZodUnion<[z.ZodString, z.ZodType<ArrayBuffer, z.ZodTypeDef, ArrayBuffer>, z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>]>;
        fallback: z.ZodOptional<z.ZodBoolean>;
        subset: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
        fallback?: boolean | undefined;
        subset?: boolean | undefined;
    }, {
        data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
        fallback?: boolean | undefined;
        subset?: boolean | undefined;
    }>>>;
    lang: z.ZodOptional<z.ZodEnum<["en", "zh", "ja", "ko", "ar", "th", "pl", "it", "de", "es", "fr"]>>;
    labels: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    font: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        data: z.ZodUnion<[z.ZodString, z.ZodType<ArrayBuffer, z.ZodTypeDef, ArrayBuffer>, z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>]>;
        fallback: z.ZodOptional<z.ZodBoolean>;
        subset: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
        fallback?: boolean | undefined;
        subset?: boolean | undefined;
    }, {
        data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
        fallback?: boolean | undefined;
        subset?: boolean | undefined;
    }>>>;
    lang: z.ZodOptional<z.ZodEnum<["en", "zh", "ja", "ko", "ar", "th", "pl", "it", "de", "es", "fr"]>>;
    labels: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    font: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        data: z.ZodUnion<[z.ZodString, z.ZodType<ArrayBuffer, z.ZodTypeDef, ArrayBuffer>, z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>]>;
        fallback: z.ZodOptional<z.ZodBoolean>;
        subset: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
        fallback?: boolean | undefined;
        subset?: boolean | undefined;
    }, {
        data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
        fallback?: boolean | undefined;
        subset?: boolean | undefined;
    }>>>;
    lang: z.ZodOptional<z.ZodEnum<["en", "zh", "ja", "ko", "ar", "th", "pl", "it", "de", "es", "fr"]>>;
    labels: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, z.ZodTypeAny, "passthrough">>;
export declare const UIProps: z.ZodObject<{
    template: z.ZodObject<{
        schemas: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodObject<{
            type: z.ZodString;
            icon: z.ZodOptional<z.ZodString>;
            content: z.ZodOptional<z.ZodString>;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>;
            width: z.ZodNumber;
            height: z.ZodNumber;
            rotate: z.ZodOptional<z.ZodNumber>;
            opacity: z.ZodOptional<z.ZodNumber>;
            readOnly: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            type: z.ZodString;
            icon: z.ZodOptional<z.ZodString>;
            content: z.ZodOptional<z.ZodString>;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>;
            width: z.ZodNumber;
            height: z.ZodNumber;
            rotate: z.ZodOptional<z.ZodNumber>;
            opacity: z.ZodOptional<z.ZodNumber>;
            readOnly: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            type: z.ZodString;
            icon: z.ZodOptional<z.ZodString>;
            content: z.ZodOptional<z.ZodString>;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>;
            width: z.ZodNumber;
            height: z.ZodNumber;
            rotate: z.ZodOptional<z.ZodNumber>;
            opacity: z.ZodOptional<z.ZodNumber>;
            readOnly: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>>, "many">;
        basePdf: z.ZodUnion<[z.ZodString, z.ZodType<ArrayBuffer, z.ZodTypeDef, ArrayBuffer>, z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>, z.ZodObject<{
            width: z.ZodNumber;
            height: z.ZodNumber;
            padding: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
        }, "strip", z.ZodTypeAny, {
            width: number;
            height: number;
            padding: [number, number, number, number];
        }, {
            width: number;
            height: number;
            padding: [number, number, number, number];
        }>]>;
        pdfmeVersion: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        schemas: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodObject<{
            type: z.ZodString;
            icon: z.ZodOptional<z.ZodString>;
            content: z.ZodOptional<z.ZodString>;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>;
            width: z.ZodNumber;
            height: z.ZodNumber;
            rotate: z.ZodOptional<z.ZodNumber>;
            opacity: z.ZodOptional<z.ZodNumber>;
            readOnly: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            type: z.ZodString;
            icon: z.ZodOptional<z.ZodString>;
            content: z.ZodOptional<z.ZodString>;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>;
            width: z.ZodNumber;
            height: z.ZodNumber;
            rotate: z.ZodOptional<z.ZodNumber>;
            opacity: z.ZodOptional<z.ZodNumber>;
            readOnly: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            type: z.ZodString;
            icon: z.ZodOptional<z.ZodString>;
            content: z.ZodOptional<z.ZodString>;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>;
            width: z.ZodNumber;
            height: z.ZodNumber;
            rotate: z.ZodOptional<z.ZodNumber>;
            opacity: z.ZodOptional<z.ZodNumber>;
            readOnly: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>>, "many">;
        basePdf: z.ZodUnion<[z.ZodString, z.ZodType<ArrayBuffer, z.ZodTypeDef, ArrayBuffer>, z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>, z.ZodObject<{
            width: z.ZodNumber;
            height: z.ZodNumber;
            padding: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
        }, "strip", z.ZodTypeAny, {
            width: number;
            height: number;
            padding: [number, number, number, number];
        }, {
            width: number;
            height: number;
            padding: [number, number, number, number];
        }>]>;
        pdfmeVersion: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        schemas: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodObject<{
            type: z.ZodString;
            icon: z.ZodOptional<z.ZodString>;
            content: z.ZodOptional<z.ZodString>;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>;
            width: z.ZodNumber;
            height: z.ZodNumber;
            rotate: z.ZodOptional<z.ZodNumber>;
            opacity: z.ZodOptional<z.ZodNumber>;
            readOnly: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            type: z.ZodString;
            icon: z.ZodOptional<z.ZodString>;
            content: z.ZodOptional<z.ZodString>;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>;
            width: z.ZodNumber;
            height: z.ZodNumber;
            rotate: z.ZodOptional<z.ZodNumber>;
            opacity: z.ZodOptional<z.ZodNumber>;
            readOnly: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            type: z.ZodString;
            icon: z.ZodOptional<z.ZodString>;
            content: z.ZodOptional<z.ZodString>;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>;
            width: z.ZodNumber;
            height: z.ZodNumber;
            rotate: z.ZodOptional<z.ZodNumber>;
            opacity: z.ZodOptional<z.ZodNumber>;
            readOnly: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>>, "many">;
        basePdf: z.ZodUnion<[z.ZodString, z.ZodType<ArrayBuffer, z.ZodTypeDef, ArrayBuffer>, z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>, z.ZodObject<{
            width: z.ZodNumber;
            height: z.ZodNumber;
            padding: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
        }, "strip", z.ZodTypeAny, {
            width: number;
            height: number;
            padding: [number, number, number, number];
        }, {
            width: number;
            height: number;
            padding: [number, number, number, number];
        }>]>;
        pdfmeVersion: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>;
    plugins: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        ui: z.ZodAny;
        pdf: z.ZodAny;
        propPanel: z.ZodAny;
    }, "strip", z.ZodTypeAny, {
        ui?: any;
        pdf?: any;
        propPanel?: any;
    }, {
        ui?: any;
        pdf?: any;
        propPanel?: any;
    }>>>;
    domContainer: z.ZodType<HTMLElement, z.ZodTypeDef, HTMLElement>;
    options: z.ZodOptional<z.ZodObject<{
        font: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            data: z.ZodUnion<[z.ZodString, z.ZodType<ArrayBuffer, z.ZodTypeDef, ArrayBuffer>, z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>]>;
            fallback: z.ZodOptional<z.ZodBoolean>;
            subset: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
            fallback?: boolean | undefined;
            subset?: boolean | undefined;
        }, {
            data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
            fallback?: boolean | undefined;
            subset?: boolean | undefined;
        }>>>;
        lang: z.ZodOptional<z.ZodEnum<["en", "zh", "ja", "ko", "ar", "th", "pl", "it", "de", "es", "fr"]>>;
        labels: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        font: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            data: z.ZodUnion<[z.ZodString, z.ZodType<ArrayBuffer, z.ZodTypeDef, ArrayBuffer>, z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>]>;
            fallback: z.ZodOptional<z.ZodBoolean>;
            subset: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
            fallback?: boolean | undefined;
            subset?: boolean | undefined;
        }, {
            data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
            fallback?: boolean | undefined;
            subset?: boolean | undefined;
        }>>>;
        lang: z.ZodOptional<z.ZodEnum<["en", "zh", "ja", "ko", "ar", "th", "pl", "it", "de", "es", "fr"]>>;
        labels: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        font: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            data: z.ZodUnion<[z.ZodString, z.ZodType<ArrayBuffer, z.ZodTypeDef, ArrayBuffer>, z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>]>;
            fallback: z.ZodOptional<z.ZodBoolean>;
            subset: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
            fallback?: boolean | undefined;
            subset?: boolean | undefined;
        }, {
            data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
            fallback?: boolean | undefined;
            subset?: boolean | undefined;
        }>>>;
        lang: z.ZodOptional<z.ZodEnum<["en", "zh", "ja", "ko", "ar", "th", "pl", "it", "de", "es", "fr"]>>;
        labels: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, z.ZodTypeAny, "passthrough">>>;
}, "strip", z.ZodTypeAny, {
    template: {
        schemas: Record<string, z.objectOutputType<{
            type: z.ZodString;
            icon: z.ZodOptional<z.ZodString>;
            content: z.ZodOptional<z.ZodString>;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>;
            width: z.ZodNumber;
            height: z.ZodNumber;
            rotate: z.ZodOptional<z.ZodNumber>;
            opacity: z.ZodOptional<z.ZodNumber>;
            readOnly: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>[];
        basePdf: (string | ArrayBuffer | Uint8Array | {
            width: number;
            height: number;
            padding: [number, number, number, number];
        }) & (string | ArrayBuffer | Uint8Array | {
            width: number;
            height: number;
            padding: [number, number, number, number];
        } | undefined);
        pdfmeVersion?: string | undefined;
    } & {
        [k: string]: unknown;
    };
    domContainer: HTMLElement;
    plugins?: Record<string, {
        ui?: any;
        pdf?: any;
        propPanel?: any;
    }> | undefined;
    options?: z.objectOutputType<{
        font: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            data: z.ZodUnion<[z.ZodString, z.ZodType<ArrayBuffer, z.ZodTypeDef, ArrayBuffer>, z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>]>;
            fallback: z.ZodOptional<z.ZodBoolean>;
            subset: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
            fallback?: boolean | undefined;
            subset?: boolean | undefined;
        }, {
            data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
            fallback?: boolean | undefined;
            subset?: boolean | undefined;
        }>>>;
        lang: z.ZodOptional<z.ZodEnum<["en", "zh", "ja", "ko", "ar", "th", "pl", "it", "de", "es", "fr"]>>;
        labels: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
}, {
    template: {
        schemas: Record<string, z.objectInputType<{
            type: z.ZodString;
            icon: z.ZodOptional<z.ZodString>;
            content: z.ZodOptional<z.ZodString>;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>;
            width: z.ZodNumber;
            height: z.ZodNumber;
            rotate: z.ZodOptional<z.ZodNumber>;
            opacity: z.ZodOptional<z.ZodNumber>;
            readOnly: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>[];
        basePdf: (string | ArrayBuffer | Uint8Array | {
            width: number;
            height: number;
            padding: [number, number, number, number];
        }) & (string | ArrayBuffer | Uint8Array | {
            width: number;
            height: number;
            padding: [number, number, number, number];
        } | undefined);
        pdfmeVersion?: string | undefined;
    } & {
        [k: string]: unknown;
    };
    domContainer: HTMLElement;
    plugins?: Record<string, {
        ui?: any;
        pdf?: any;
        propPanel?: any;
    }> | undefined;
    options?: z.objectInputType<{
        font: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            data: z.ZodUnion<[z.ZodString, z.ZodType<ArrayBuffer, z.ZodTypeDef, ArrayBuffer>, z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>]>;
            fallback: z.ZodOptional<z.ZodBoolean>;
            subset: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
            fallback?: boolean | undefined;
            subset?: boolean | undefined;
        }, {
            data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
            fallback?: boolean | undefined;
            subset?: boolean | undefined;
        }>>>;
        lang: z.ZodOptional<z.ZodEnum<["en", "zh", "ja", "ko", "ar", "th", "pl", "it", "de", "es", "fr"]>>;
        labels: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
}>;
export declare const PreviewProps: z.ZodObject<{
    options: z.ZodOptional<z.ZodObject<{
        font: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            data: z.ZodUnion<[z.ZodString, z.ZodType<ArrayBuffer, z.ZodTypeDef, ArrayBuffer>, z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>]>;
            fallback: z.ZodOptional<z.ZodBoolean>;
            subset: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
            fallback?: boolean | undefined;
            subset?: boolean | undefined;
        }, {
            data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
            fallback?: boolean | undefined;
            subset?: boolean | undefined;
        }>>>;
        lang: z.ZodOptional<z.ZodEnum<["en", "zh", "ja", "ko", "ar", "th", "pl", "it", "de", "es", "fr"]>>;
        labels: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        font: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            data: z.ZodUnion<[z.ZodString, z.ZodType<ArrayBuffer, z.ZodTypeDef, ArrayBuffer>, z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>]>;
            fallback: z.ZodOptional<z.ZodBoolean>;
            subset: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
            fallback?: boolean | undefined;
            subset?: boolean | undefined;
        }, {
            data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
            fallback?: boolean | undefined;
            subset?: boolean | undefined;
        }>>>;
        lang: z.ZodOptional<z.ZodEnum<["en", "zh", "ja", "ko", "ar", "th", "pl", "it", "de", "es", "fr"]>>;
        labels: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        font: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            data: z.ZodUnion<[z.ZodString, z.ZodType<ArrayBuffer, z.ZodTypeDef, ArrayBuffer>, z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>]>;
            fallback: z.ZodOptional<z.ZodBoolean>;
            subset: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
            fallback?: boolean | undefined;
            subset?: boolean | undefined;
        }, {
            data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
            fallback?: boolean | undefined;
            subset?: boolean | undefined;
        }>>>;
        lang: z.ZodOptional<z.ZodEnum<["en", "zh", "ja", "ko", "ar", "th", "pl", "it", "de", "es", "fr"]>>;
        labels: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, z.ZodTypeAny, "passthrough">>>;
    template: z.ZodObject<{
        schemas: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodObject<{
            type: z.ZodString;
            icon: z.ZodOptional<z.ZodString>;
            content: z.ZodOptional<z.ZodString>;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>;
            width: z.ZodNumber;
            height: z.ZodNumber;
            rotate: z.ZodOptional<z.ZodNumber>;
            opacity: z.ZodOptional<z.ZodNumber>;
            readOnly: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            type: z.ZodString;
            icon: z.ZodOptional<z.ZodString>;
            content: z.ZodOptional<z.ZodString>;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>;
            width: z.ZodNumber;
            height: z.ZodNumber;
            rotate: z.ZodOptional<z.ZodNumber>;
            opacity: z.ZodOptional<z.ZodNumber>;
            readOnly: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            type: z.ZodString;
            icon: z.ZodOptional<z.ZodString>;
            content: z.ZodOptional<z.ZodString>;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>;
            width: z.ZodNumber;
            height: z.ZodNumber;
            rotate: z.ZodOptional<z.ZodNumber>;
            opacity: z.ZodOptional<z.ZodNumber>;
            readOnly: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>>, "many">;
        basePdf: z.ZodUnion<[z.ZodString, z.ZodType<ArrayBuffer, z.ZodTypeDef, ArrayBuffer>, z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>, z.ZodObject<{
            width: z.ZodNumber;
            height: z.ZodNumber;
            padding: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
        }, "strip", z.ZodTypeAny, {
            width: number;
            height: number;
            padding: [number, number, number, number];
        }, {
            width: number;
            height: number;
            padding: [number, number, number, number];
        }>]>;
        pdfmeVersion: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        schemas: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodObject<{
            type: z.ZodString;
            icon: z.ZodOptional<z.ZodString>;
            content: z.ZodOptional<z.ZodString>;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>;
            width: z.ZodNumber;
            height: z.ZodNumber;
            rotate: z.ZodOptional<z.ZodNumber>;
            opacity: z.ZodOptional<z.ZodNumber>;
            readOnly: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            type: z.ZodString;
            icon: z.ZodOptional<z.ZodString>;
            content: z.ZodOptional<z.ZodString>;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>;
            width: z.ZodNumber;
            height: z.ZodNumber;
            rotate: z.ZodOptional<z.ZodNumber>;
            opacity: z.ZodOptional<z.ZodNumber>;
            readOnly: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            type: z.ZodString;
            icon: z.ZodOptional<z.ZodString>;
            content: z.ZodOptional<z.ZodString>;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>;
            width: z.ZodNumber;
            height: z.ZodNumber;
            rotate: z.ZodOptional<z.ZodNumber>;
            opacity: z.ZodOptional<z.ZodNumber>;
            readOnly: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>>, "many">;
        basePdf: z.ZodUnion<[z.ZodString, z.ZodType<ArrayBuffer, z.ZodTypeDef, ArrayBuffer>, z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>, z.ZodObject<{
            width: z.ZodNumber;
            height: z.ZodNumber;
            padding: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
        }, "strip", z.ZodTypeAny, {
            width: number;
            height: number;
            padding: [number, number, number, number];
        }, {
            width: number;
            height: number;
            padding: [number, number, number, number];
        }>]>;
        pdfmeVersion: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        schemas: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodObject<{
            type: z.ZodString;
            icon: z.ZodOptional<z.ZodString>;
            content: z.ZodOptional<z.ZodString>;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>;
            width: z.ZodNumber;
            height: z.ZodNumber;
            rotate: z.ZodOptional<z.ZodNumber>;
            opacity: z.ZodOptional<z.ZodNumber>;
            readOnly: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            type: z.ZodString;
            icon: z.ZodOptional<z.ZodString>;
            content: z.ZodOptional<z.ZodString>;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>;
            width: z.ZodNumber;
            height: z.ZodNumber;
            rotate: z.ZodOptional<z.ZodNumber>;
            opacity: z.ZodOptional<z.ZodNumber>;
            readOnly: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            type: z.ZodString;
            icon: z.ZodOptional<z.ZodString>;
            content: z.ZodOptional<z.ZodString>;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>;
            width: z.ZodNumber;
            height: z.ZodNumber;
            rotate: z.ZodOptional<z.ZodNumber>;
            opacity: z.ZodOptional<z.ZodNumber>;
            readOnly: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>>, "many">;
        basePdf: z.ZodUnion<[z.ZodString, z.ZodType<ArrayBuffer, z.ZodTypeDef, ArrayBuffer>, z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>, z.ZodObject<{
            width: z.ZodNumber;
            height: z.ZodNumber;
            padding: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
        }, "strip", z.ZodTypeAny, {
            width: number;
            height: number;
            padding: [number, number, number, number];
        }, {
            width: number;
            height: number;
            padding: [number, number, number, number];
        }>]>;
        pdfmeVersion: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>;
    plugins: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        ui: z.ZodAny;
        pdf: z.ZodAny;
        propPanel: z.ZodAny;
    }, "strip", z.ZodTypeAny, {
        ui?: any;
        pdf?: any;
        propPanel?: any;
    }, {
        ui?: any;
        pdf?: any;
        propPanel?: any;
    }>>>;
    domContainer: z.ZodType<HTMLElement, z.ZodTypeDef, HTMLElement>;
    inputs: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodAny>, "many">;
}, "strict", z.ZodTypeAny, {
    template: {
        schemas: Record<string, z.objectOutputType<{
            type: z.ZodString;
            icon: z.ZodOptional<z.ZodString>;
            content: z.ZodOptional<z.ZodString>;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>;
            width: z.ZodNumber;
            height: z.ZodNumber;
            rotate: z.ZodOptional<z.ZodNumber>;
            opacity: z.ZodOptional<z.ZodNumber>;
            readOnly: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>[];
        basePdf: (string | ArrayBuffer | Uint8Array | {
            width: number;
            height: number;
            padding: [number, number, number, number];
        }) & (string | ArrayBuffer | Uint8Array | {
            width: number;
            height: number;
            padding: [number, number, number, number];
        } | undefined);
        pdfmeVersion?: string | undefined;
    } & {
        [k: string]: unknown;
    };
    inputs: Record<string, any>[];
    domContainer: HTMLElement;
    options?: z.objectOutputType<{
        font: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            data: z.ZodUnion<[z.ZodString, z.ZodType<ArrayBuffer, z.ZodTypeDef, ArrayBuffer>, z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>]>;
            fallback: z.ZodOptional<z.ZodBoolean>;
            subset: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
            fallback?: boolean | undefined;
            subset?: boolean | undefined;
        }, {
            data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
            fallback?: boolean | undefined;
            subset?: boolean | undefined;
        }>>>;
        lang: z.ZodOptional<z.ZodEnum<["en", "zh", "ja", "ko", "ar", "th", "pl", "it", "de", "es", "fr"]>>;
        labels: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    plugins?: Record<string, {
        ui?: any;
        pdf?: any;
        propPanel?: any;
    }> | undefined;
}, {
    template: {
        schemas: Record<string, z.objectInputType<{
            type: z.ZodString;
            icon: z.ZodOptional<z.ZodString>;
            content: z.ZodOptional<z.ZodString>;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>;
            width: z.ZodNumber;
            height: z.ZodNumber;
            rotate: z.ZodOptional<z.ZodNumber>;
            opacity: z.ZodOptional<z.ZodNumber>;
            readOnly: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>[];
        basePdf: (string | ArrayBuffer | Uint8Array | {
            width: number;
            height: number;
            padding: [number, number, number, number];
        }) & (string | ArrayBuffer | Uint8Array | {
            width: number;
            height: number;
            padding: [number, number, number, number];
        } | undefined);
        pdfmeVersion?: string | undefined;
    } & {
        [k: string]: unknown;
    };
    inputs: Record<string, any>[];
    domContainer: HTMLElement;
    options?: z.objectInputType<{
        font: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            data: z.ZodUnion<[z.ZodString, z.ZodType<ArrayBuffer, z.ZodTypeDef, ArrayBuffer>, z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>]>;
            fallback: z.ZodOptional<z.ZodBoolean>;
            subset: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
            fallback?: boolean | undefined;
            subset?: boolean | undefined;
        }, {
            data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
            fallback?: boolean | undefined;
            subset?: boolean | undefined;
        }>>>;
        lang: z.ZodOptional<z.ZodEnum<["en", "zh", "ja", "ko", "ar", "th", "pl", "it", "de", "es", "fr"]>>;
        labels: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    plugins?: Record<string, {
        ui?: any;
        pdf?: any;
        propPanel?: any;
    }> | undefined;
}>;
export declare const DesignerProps: z.ZodObject<{
    options: z.ZodOptional<z.ZodObject<{
        font: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            data: z.ZodUnion<[z.ZodString, z.ZodType<ArrayBuffer, z.ZodTypeDef, ArrayBuffer>, z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>]>;
            fallback: z.ZodOptional<z.ZodBoolean>;
            subset: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
            fallback?: boolean | undefined;
            subset?: boolean | undefined;
        }, {
            data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
            fallback?: boolean | undefined;
            subset?: boolean | undefined;
        }>>>;
        lang: z.ZodOptional<z.ZodEnum<["en", "zh", "ja", "ko", "ar", "th", "pl", "it", "de", "es", "fr"]>>;
        labels: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        font: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            data: z.ZodUnion<[z.ZodString, z.ZodType<ArrayBuffer, z.ZodTypeDef, ArrayBuffer>, z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>]>;
            fallback: z.ZodOptional<z.ZodBoolean>;
            subset: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
            fallback?: boolean | undefined;
            subset?: boolean | undefined;
        }, {
            data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
            fallback?: boolean | undefined;
            subset?: boolean | undefined;
        }>>>;
        lang: z.ZodOptional<z.ZodEnum<["en", "zh", "ja", "ko", "ar", "th", "pl", "it", "de", "es", "fr"]>>;
        labels: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        font: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            data: z.ZodUnion<[z.ZodString, z.ZodType<ArrayBuffer, z.ZodTypeDef, ArrayBuffer>, z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>]>;
            fallback: z.ZodOptional<z.ZodBoolean>;
            subset: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
            fallback?: boolean | undefined;
            subset?: boolean | undefined;
        }, {
            data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
            fallback?: boolean | undefined;
            subset?: boolean | undefined;
        }>>>;
        lang: z.ZodOptional<z.ZodEnum<["en", "zh", "ja", "ko", "ar", "th", "pl", "it", "de", "es", "fr"]>>;
        labels: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, z.ZodTypeAny, "passthrough">>>;
    template: z.ZodObject<{
        schemas: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodObject<{
            type: z.ZodString;
            icon: z.ZodOptional<z.ZodString>;
            content: z.ZodOptional<z.ZodString>;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>;
            width: z.ZodNumber;
            height: z.ZodNumber;
            rotate: z.ZodOptional<z.ZodNumber>;
            opacity: z.ZodOptional<z.ZodNumber>;
            readOnly: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            type: z.ZodString;
            icon: z.ZodOptional<z.ZodString>;
            content: z.ZodOptional<z.ZodString>;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>;
            width: z.ZodNumber;
            height: z.ZodNumber;
            rotate: z.ZodOptional<z.ZodNumber>;
            opacity: z.ZodOptional<z.ZodNumber>;
            readOnly: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            type: z.ZodString;
            icon: z.ZodOptional<z.ZodString>;
            content: z.ZodOptional<z.ZodString>;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>;
            width: z.ZodNumber;
            height: z.ZodNumber;
            rotate: z.ZodOptional<z.ZodNumber>;
            opacity: z.ZodOptional<z.ZodNumber>;
            readOnly: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>>, "many">;
        basePdf: z.ZodUnion<[z.ZodString, z.ZodType<ArrayBuffer, z.ZodTypeDef, ArrayBuffer>, z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>, z.ZodObject<{
            width: z.ZodNumber;
            height: z.ZodNumber;
            padding: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
        }, "strip", z.ZodTypeAny, {
            width: number;
            height: number;
            padding: [number, number, number, number];
        }, {
            width: number;
            height: number;
            padding: [number, number, number, number];
        }>]>;
        pdfmeVersion: z.ZodOptional<z.ZodString>;
    }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
        schemas: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodObject<{
            type: z.ZodString;
            icon: z.ZodOptional<z.ZodString>;
            content: z.ZodOptional<z.ZodString>;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>;
            width: z.ZodNumber;
            height: z.ZodNumber;
            rotate: z.ZodOptional<z.ZodNumber>;
            opacity: z.ZodOptional<z.ZodNumber>;
            readOnly: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            type: z.ZodString;
            icon: z.ZodOptional<z.ZodString>;
            content: z.ZodOptional<z.ZodString>;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>;
            width: z.ZodNumber;
            height: z.ZodNumber;
            rotate: z.ZodOptional<z.ZodNumber>;
            opacity: z.ZodOptional<z.ZodNumber>;
            readOnly: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            type: z.ZodString;
            icon: z.ZodOptional<z.ZodString>;
            content: z.ZodOptional<z.ZodString>;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>;
            width: z.ZodNumber;
            height: z.ZodNumber;
            rotate: z.ZodOptional<z.ZodNumber>;
            opacity: z.ZodOptional<z.ZodNumber>;
            readOnly: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>>, "many">;
        basePdf: z.ZodUnion<[z.ZodString, z.ZodType<ArrayBuffer, z.ZodTypeDef, ArrayBuffer>, z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>, z.ZodObject<{
            width: z.ZodNumber;
            height: z.ZodNumber;
            padding: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
        }, "strip", z.ZodTypeAny, {
            width: number;
            height: number;
            padding: [number, number, number, number];
        }, {
            width: number;
            height: number;
            padding: [number, number, number, number];
        }>]>;
        pdfmeVersion: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
        schemas: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodObject<{
            type: z.ZodString;
            icon: z.ZodOptional<z.ZodString>;
            content: z.ZodOptional<z.ZodString>;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>;
            width: z.ZodNumber;
            height: z.ZodNumber;
            rotate: z.ZodOptional<z.ZodNumber>;
            opacity: z.ZodOptional<z.ZodNumber>;
            readOnly: z.ZodOptional<z.ZodBoolean>;
        }, "passthrough", z.ZodTypeAny, z.objectOutputType<{
            type: z.ZodString;
            icon: z.ZodOptional<z.ZodString>;
            content: z.ZodOptional<z.ZodString>;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>;
            width: z.ZodNumber;
            height: z.ZodNumber;
            rotate: z.ZodOptional<z.ZodNumber>;
            opacity: z.ZodOptional<z.ZodNumber>;
            readOnly: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">, z.objectInputType<{
            type: z.ZodString;
            icon: z.ZodOptional<z.ZodString>;
            content: z.ZodOptional<z.ZodString>;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>;
            width: z.ZodNumber;
            height: z.ZodNumber;
            rotate: z.ZodOptional<z.ZodNumber>;
            opacity: z.ZodOptional<z.ZodNumber>;
            readOnly: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>>, "many">;
        basePdf: z.ZodUnion<[z.ZodString, z.ZodType<ArrayBuffer, z.ZodTypeDef, ArrayBuffer>, z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>, z.ZodObject<{
            width: z.ZodNumber;
            height: z.ZodNumber;
            padding: z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber, z.ZodNumber], null>;
        }, "strip", z.ZodTypeAny, {
            width: number;
            height: number;
            padding: [number, number, number, number];
        }, {
            width: number;
            height: number;
            padding: [number, number, number, number];
        }>]>;
        pdfmeVersion: z.ZodOptional<z.ZodString>;
    }, z.ZodTypeAny, "passthrough">>;
    plugins: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        ui: z.ZodAny;
        pdf: z.ZodAny;
        propPanel: z.ZodAny;
    }, "strip", z.ZodTypeAny, {
        ui?: any;
        pdf?: any;
        propPanel?: any;
    }, {
        ui?: any;
        pdf?: any;
        propPanel?: any;
    }>>>;
    domContainer: z.ZodType<HTMLElement, z.ZodTypeDef, HTMLElement>;
}, "strict", z.ZodTypeAny, {
    template: {
        schemas: Record<string, z.objectOutputType<{
            type: z.ZodString;
            icon: z.ZodOptional<z.ZodString>;
            content: z.ZodOptional<z.ZodString>;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>;
            width: z.ZodNumber;
            height: z.ZodNumber;
            rotate: z.ZodOptional<z.ZodNumber>;
            opacity: z.ZodOptional<z.ZodNumber>;
            readOnly: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>[];
        basePdf: (string | ArrayBuffer | Uint8Array | {
            width: number;
            height: number;
            padding: [number, number, number, number];
        }) & (string | ArrayBuffer | Uint8Array | {
            width: number;
            height: number;
            padding: [number, number, number, number];
        } | undefined);
        pdfmeVersion?: string | undefined;
    } & {
        [k: string]: unknown;
    };
    domContainer: HTMLElement;
    options?: z.objectOutputType<{
        font: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            data: z.ZodUnion<[z.ZodString, z.ZodType<ArrayBuffer, z.ZodTypeDef, ArrayBuffer>, z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>]>;
            fallback: z.ZodOptional<z.ZodBoolean>;
            subset: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
            fallback?: boolean | undefined;
            subset?: boolean | undefined;
        }, {
            data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
            fallback?: boolean | undefined;
            subset?: boolean | undefined;
        }>>>;
        lang: z.ZodOptional<z.ZodEnum<["en", "zh", "ja", "ko", "ar", "th", "pl", "it", "de", "es", "fr"]>>;
        labels: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    plugins?: Record<string, {
        ui?: any;
        pdf?: any;
        propPanel?: any;
    }> | undefined;
}, {
    template: {
        schemas: Record<string, z.objectInputType<{
            type: z.ZodString;
            icon: z.ZodOptional<z.ZodString>;
            content: z.ZodOptional<z.ZodString>;
            position: z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                x: number;
                y: number;
            }, {
                x: number;
                y: number;
            }>;
            width: z.ZodNumber;
            height: z.ZodNumber;
            rotate: z.ZodOptional<z.ZodNumber>;
            opacity: z.ZodOptional<z.ZodNumber>;
            readOnly: z.ZodOptional<z.ZodBoolean>;
        }, z.ZodTypeAny, "passthrough">>[];
        basePdf: (string | ArrayBuffer | Uint8Array | {
            width: number;
            height: number;
            padding: [number, number, number, number];
        }) & (string | ArrayBuffer | Uint8Array | {
            width: number;
            height: number;
            padding: [number, number, number, number];
        } | undefined);
        pdfmeVersion?: string | undefined;
    } & {
        [k: string]: unknown;
    };
    domContainer: HTMLElement;
    options?: z.objectInputType<{
        font: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
            data: z.ZodUnion<[z.ZodString, z.ZodType<ArrayBuffer, z.ZodTypeDef, ArrayBuffer>, z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>]>;
            fallback: z.ZodOptional<z.ZodBoolean>;
            subset: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
            fallback?: boolean | undefined;
            subset?: boolean | undefined;
        }, {
            data: (string | ArrayBuffer | Uint8Array) & (string | ArrayBuffer | Uint8Array | undefined);
            fallback?: boolean | undefined;
            subset?: boolean | undefined;
        }>>>;
        lang: z.ZodOptional<z.ZodEnum<["en", "zh", "ja", "ko", "ar", "th", "pl", "it", "de", "es", "fr"]>>;
        labels: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        theme: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    }, z.ZodTypeAny, "passthrough"> | undefined;
    plugins?: Record<string, {
        ui?: any;
        pdf?: any;
        propPanel?: any;
    }> | undefined;
}>;
