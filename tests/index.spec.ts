import { GraphQLIntrospector } from '../src';

describe('introspector graphql', () => {
    test('parse document', async () => {
        const introspector = new GraphQLIntrospector({
            path: __dirname + '/mock/simple-model.graphql',
        });

        const result = await introspector.introspect();

        expect(result).toStrictEqual([
            {
                name: 'Test',
                directives: [],
                fields: [
                    { name: 'id', type: 'uuid', nonNull: true, collection: false, directives: [] }
                ],
            }
        ]);
    });

    test('parse blob pattern', async () => {
        const introspector = new GraphQLIntrospector({
            path: __dirname + '/mock/simple-*.graphql',
        });

        const result = await introspector.introspect();

        expect(result).toHaveLength(2);
    });
});