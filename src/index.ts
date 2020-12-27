import { GraphQLIntrospectorOptions } from './options';
import fs from 'fs';
import util from 'util';
import glob from 'glob';
import { parse } from 'graphql';
import { GraphQLSerializer } from './serializer';
import { BuilderGeneratorFunction } from '@adurc/core/dist/interfaces/builder.generator';

const readFileAsync = util.promisify(fs.readFile);
const globAsync = util.promisify(glob);

export class GraphQLIntrospector {

    static use(options: GraphQLIntrospectorOptions): BuilderGeneratorFunction {
        return async function* GraphQLIntrospectorGenerator(context) {
            const files: string[] = await globAsync(options.path);
            const readFileOptions = { encoding: options.encoding ?? 'utf8' };

            console.log(`[introspector-graphql] glob: ${options.path}`);

            for (const file of files) {
                console.log(`[introspector-graphql] + ${file}`);

                const content = await readFileAsync(file, readFileOptions);

                try {
                    const document = parse(content);

                    for (const definition of document.definitions) {
                        if (definition.kind !== 'ObjectTypeDefinition') {
                            throw new Error(`Unsupported definition type: ${definition.kind}`);
                        }

                        const model = GraphQLSerializer.deserializeModel(options, definition);

                        console.log(`[introspector-graphql] + + source: ${model.source}, model: ${model.name}, fields: ${model.fields.map(x => x.name).join(',')}`);

                        context.models.push(model);
                    }
                } catch (e) {
                    throw new Error('Error parsing graphql document: ' + e.toString());
                }
            }

            yield;
        };
    }

}