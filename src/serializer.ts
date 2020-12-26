import { AdurcDirective, AdurcField, AdurcFieldReference, AdurcModel } from '@adurc/core/dist/interfaces/model';
import { AdurcObject, AdurcPrimitiveDefinition, AdurcValue } from '@adurc/core/dist/interfaces/common';
import { DefinitionNode, DirectiveNode, FieldDefinitionNode, ListTypeNode, ListValueNode, NonNullTypeNode, ObjectValueNode, StringValueNode, ValueNode } from 'graphql';
import { GraphQLIntrospectorOptions } from './options';

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
        const parts = definition.name.value.split('_', 1);

        if(parts.length !== 2){
            throw new Error(`Unknown directive ${definition.name}, correct format is @<provider>_<name>`);
        }

        const provider = parts[0];
        const name = parts[1];

        const args: AdurcObject<string | number | boolean | AdurcObject> | AdurcValue = {};

        for (const argument of definition.arguments) {
            args[argument.name.value] = this.deserializeValue(argument.value);
        }

        return {
            provider,
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
            directives: definition.directives
                // ignore core directives
                ?.filter(x => ['source'].indexOf(x.name.value) === -1)
                .map(x => this.deserializeDirective(x)) ?? [],
        };
    }

    public static graphqlTypeToDataServerType(graphqlType: string): AdurcPrimitiveDefinition | AdurcFieldReference {
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
                return { model: graphqlType, source: '' };
        }
    }

    public static deserializeModel(options: GraphQLIntrospectorOptions, definition: DefinitionNode): AdurcModel {
        if (definition.kind !== 'ObjectTypeDefinition') {
            throw new Error(`Invalid definition node. Expected ObjectTypeDefinition and received ${definition.kind}`);
        }

        const sourceDirective = definition.directives.find(x => x.name.value === 'source');

        const name: string = definition.name.value;
        const fields: AdurcField[] = [];
        const source = sourceDirective ? (sourceDirective.arguments.find(x => x.name.value === 'name')?.value as StringValueNode).value : options.defaultSourceName;

        if (!source) {
            throw new Error(`Source not declared in model ${name}`);
        }

        for (const field of definition.fields) {
            const modelField = this.deserializeField(field);
            fields.push(modelField);
        }

        return {
            source,
            name,
            fields,
            directives: definition.directives?.map(x => this.deserializeDirective(x)) ?? [],
        };
    }

}