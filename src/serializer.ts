import { AdurcDirective, AdurcField, AdurcModel, AdurcObject, AdurcValue } from '@adurc/core/dist/interfaces/model';
import { DefinitionNode, DirectiveNode, FieldDefinitionNode, ListTypeNode, ListValueNode, NonNullTypeNode, ObjectValueNode, ValueNode } from 'graphql';

export class GraphQLSerializer {

    public static deserializeObjectValue(definition: ObjectValueNode): AdurcObject {
        const output: AdurcObject = {};

        for (const field of definition.fields) {
            output[field.name.value] = this.deserializeValue(field.value);
        }

        return output;
    }

    public static deserializeListValue(definition: ListValueNode): AdurcValue {
        const output: AdurcValue[] = [];

        for (const value of definition.values) {
            output.push(this.deserializeValue(value));
        }

        return output;
    }

    public static deserializeValue(definition: ValueNode): AdurcValue {
        switch (definition.kind) {
            case 'BooleanValue':
            case 'EnumValue':
            case 'StringValue':
                return definition.value;
            case 'FloatValue':
                return parseFloat(definition.value);
            case 'IntValue':
                return parseInt(definition.value, 10);
            case 'NullValue':
                return null;
            case 'ObjectValue':
                return this.deserializeObjectValue(definition);
            case 'ListValue':
                return this.deserializeListValue(definition);
            default:
                throw new Error(`Value type ${definition.kind} not implemented`);
        }
    }

    public static deserializeDirective(definition: DirectiveNode): AdurcDirective {
        const name = definition.name.value;
        const args: AdurcObject<string | number | boolean | AdurcObject> | AdurcValue = {};

        for (const argument of definition.arguments) {
            args[argument.name.value] = this.deserializeValue(argument.value);
        }

        return {
            name,
            args,
        };
    }

    public static deserializeField(definition: FieldDefinitionNode): AdurcField {
        if (definition.kind !== 'FieldDefinition') {
            throw new Error(`Invalid definition node. Expected ObjectTypeDefinition and received ${definition.kind}`);
        }

        const name = definition.name.value;
        let typeNode = definition.type;
        const nonNull = typeNode.kind === 'NonNullType';
        typeNode = nonNull ? (definition.type as NonNullTypeNode).type : definition.type;
        const collection = typeNode.kind === 'ListType';
        typeNode = collection ? (typeNode as ListTypeNode).type : typeNode;

        if (typeNode.kind !== 'NamedType') {
            throw new Error('Expected NamedType');
        }

        return {
            name,
            nonNull,
            collection,
            type: this.graphqlTypeToDataServerType(typeNode.name.value),
            directives: definition.directives?.map(x => this.deserializeDirective(x)) ?? [],
        };
    }

    public static graphqlTypeToDataServerType(graphqlType: string): string {
        switch (graphqlType) {
            case 'String':
                return 'string';
            case 'Int':
                return 'int';
            case 'Boolean':
                return 'boolean';
            case 'Float':
                return 'float';
            case 'Date':
                return 'date';
            case 'ID':
                return 'uuid';
            case 'Buffer':
                return 'buffer';
            default: // Is relation entity
                return graphqlType;
        }
    }

    public static deserializeModel(definition: DefinitionNode): AdurcModel {
        if (definition.kind !== 'ObjectTypeDefinition') {
            throw new Error(`Invalid definition node. Expected ObjectTypeDefinition and received ${definition.kind}`);
        }

        const name: string = definition.name.value;
        const fields: AdurcField[] = [];

        for (const field of definition.fields) {
            const modelField = this.deserializeField(field);
            fields.push(modelField);
        }

        return {
            name,
            fields,
            directives: definition.directives?.map(x => this.deserializeDirective(x)) ?? [],
        };
    }

}