import { GraphQLIntrospectorOptions } from './options';
import fs from 'fs';
import util from 'util';
import glob from 'glob';
import { parse } from 'graphql';
import { GraphQLSerializer } from './serializer';
import { AdurcIntrospector, AdurcModel } from '@adurc/core';

const readFileAsync = util.promisify(fs.readFile);
const globAsync = util.promisify(glob);

export class GraphQLIntrospector extends AdurcIntrospector {

    constructor(
        private readonly options: GraphQLIntrospectorOptions,
    ) {
        super();
    }

    public async introspect(): Promise<AdurcModel[]> {
        const files = await globAsync(this.options.path);
        const readFileOptions = { encoding: this.options.encoding ?? 'utf8' };
        const output: AdurcModel[] = [];

        for (const file of files) {
            const content = await readFileAsync(file, readFileOptions);

            try {
                const document = parse(content);

                for (const definition of document.definitions) {
                    if (definition.kind !== 'ObjectTypeDefinition') {
                        throw new Error(`Unsupported definition type: ${definition.kind}`);
                    }

                    output.push(GraphQLSerializer.deserializeModel(definition));
                }
            } catch (e) {
                throw new Error('Error parsing graphql document: ' + e.toString());
            }
        }

        return output;
    }
}