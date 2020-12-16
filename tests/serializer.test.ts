import { AdurcModel } from '@adurc/core';
import gql from 'graphql-tag';
import {GraphQLSerializer} from '../src/serializer';

describe('serialize nullable & collection fields', () => {
    test('serialize non null field', () => {
        const modelDocument = gql`
            type Test {
                id: ID!
            }
        `;

        const model = GraphQLSerializer.deserializeModel(modelDocument.definitions[0]);

        expect(model).toStrictEqual<AdurcModel>({
            name: 'Test',
            directives: [],
            fields: [
                { name: 'id', type: 'uuid', nonNull: true, collection: false, directives: [] }
            ],
        });
    });

    test('serialize nullable field', () => {
        const modelDocument = gql`
            type Test {
                id: ID
            }
        `;

        const model = GraphQLSerializer.deserializeModel(modelDocument.definitions[0]);

        expect(model).toStrictEqual<AdurcModel>({
            name: 'Test',
            directives: [],
            fields: [
                { name: 'id', type: 'uuid', nonNull: false, collection: false, directives: [] }
            ],
        });
    });

    test('serialize not null collection field', () => {
        const modelDocument = gql`
            type Test {
                id: [ID]!
            }
        `;

        const model = GraphQLSerializer.deserializeModel(modelDocument.definitions[0]);

        expect(model).toStrictEqual<AdurcModel>({
            name: 'Test',
            directives: [],
            fields: [
                { name: 'id', type: 'uuid', nonNull: true, collection: true, directives: [] }
            ],
        });
    });

    test('serialize nullable collection field', () => {
        const modelDocument = gql`
            type Test {
                id: [ID]
            }
        `;

        const model = GraphQLSerializer.deserializeModel(modelDocument.definitions[0]);

        expect(model).toStrictEqual<AdurcModel>({
            name: 'Test',
            directives: [],
            fields: [
                { name: 'id', type: 'uuid', nonNull: false, collection: true, directives: [] }
            ],
        });
    });
});

describe('directive declarations', () => {
    test('directive in model context without args', () => {
        const modelDocument = gql`
            type Test @custom {
                id: ID!
            }
        `;

        const model = GraphQLSerializer.deserializeModel(modelDocument.definitions[0]);

        expect(model).toStrictEqual<AdurcModel>({
            name: 'Test',
            directives: [{ name: 'custom', args: {} }],
            fields: [
                { name: 'id', type: 'uuid', nonNull: true, collection: false, directives: [] }
            ],
        });
    });

    test('directive in model context with string arg', () => {
        const modelDocument = gql`
            type Test @custom(value: "test") {
                id: ID!
            }
        `;

        const model = GraphQLSerializer.deserializeModel(modelDocument.definitions[0]);

        expect(model).toStrictEqual<AdurcModel>({
            name: 'Test',
            directives: [{ name: 'custom', args: { value: 'test' } }],
            fields: [
                { name: 'id', type: 'uuid', nonNull: true, collection: false, directives: [] }
            ],
        });
    });

    test('directive in model context with number arg', () => {
        const modelDocument = gql`
            type Test @custom(value: 1) {
                id: ID!
            }
        `;

        const model = GraphQLSerializer.deserializeModel(modelDocument.definitions[0]);

        expect(model).toStrictEqual<AdurcModel>({
            name: 'Test',
            directives: [{ name: 'custom', args: { value: 1 } }],
            fields: [
                { name: 'id', type: 'uuid', nonNull: true, collection: false, directives: [] }
            ],
        });
    });

    test('directive in model context with float arg', () => {
        const modelDocument = gql`
            type Test @custom(value: 1.1) {
                id: ID!
            }
        `;

        const model = GraphQLSerializer.deserializeModel(modelDocument.definitions[0]);

        expect(model).toStrictEqual<AdurcModel>({
            name: 'Test',
            directives: [{ name: 'custom', args: { value: 1.1 } }],
            fields: [
                { name: 'id', type: 'uuid', nonNull: true, collection: false, directives: [] }
            ],
        });
    });

    test('directive in model context with boolean arg', () => {
        const modelDocument = gql`
            type Test @custom(value: true) {
                id: ID!
            }
        `;

        const model = GraphQLSerializer.deserializeModel(modelDocument.definitions[0]);

        expect(model).toStrictEqual<AdurcModel>({
            name: 'Test',
            directives: [{ name: 'custom', args: { value: true } }],
            fields: [
                { name: 'id', type: 'uuid', nonNull: true, collection: false, directives: [] }
            ],
        });
    });

    test('directive in model context with array arg', () => {
        const modelDocument = gql`
            type Test @custom(value: [1]) {
                id: ID!
            }
        `;

        const model = GraphQLSerializer.deserializeModel(modelDocument.definitions[0]);

        expect(model).toStrictEqual<AdurcModel>({
            name: 'Test',
            directives: [{ name: 'custom', args: { value: [1] } }],
            fields: [
                { name: 'id', type: 'uuid', nonNull: true, collection: false, directives: [] }
            ],
        });
    });

    test('directive in model context with object arg', () => {
        const modelDocument = gql`
            type Test @custom(value: {test: 1}) {
                id: ID!
            }
        `;

        const model = GraphQLSerializer.deserializeModel(modelDocument.definitions[0]);

        expect(model).toStrictEqual<AdurcModel>({
            name: 'Test',
            directives: [{ name: 'custom', args: { value: { test: 1 } } }],
            fields: [
                { name: 'id', type: 'uuid', nonNull: true, collection: false, directives: [] }
            ],
        });
    });
});

