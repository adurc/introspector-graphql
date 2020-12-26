import { GraphQLIntrospectorOptions } from './options';
import fs from 'fs';
import util from 'util';
import glob from 'glob';
import { parse } from 'graphql';
import { GraphQLSerializer } from './serializer';
import { AdurcModel } from '@adurc/core/dist/interfaces/model';
import { BuilderGeneratorFunction } from '@adurc/core/dist/interfaces/builder.generator';

const readFileAsync = util.promisify(fs.readFile);
const globAsync = util.promisify(glob);

export class GraphQLIntrospector {


    static use(options: GraphQLIntrospectorOptions): BuilderGeneratorFunction {
        return async function* GraphQLIntrospectorGenerator() {
            const files = await globAsync(options.path);
            const readFileOptions = { encoding: options.encoding ?? 'utf8' };
            const output: AdurcModel[] = [];

            for (const file of files) {
                const content = await readFileAsync(file, readFileOptions);

                try {
                    const document = parse(content);

                    for (const definition of document.definitions) {
                        if (definition.kind !== 'ObjectTypeDefinition') {
                            throw new Error(`Unsupported definition type: ${definition.kind}`);
                        }

                        output.push(GraphQLSerializer.deserializeModel(options, definition));
                    }
                } catch (e) {
                    throw new Error('Error parsing graphql document: ' + e.toString());
                }
            }

            yield;
        };
    }
}