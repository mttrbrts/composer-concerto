import fs from 'fs';
import { Suite } from 'benchmark';
import { ModelLoader, Factory, Serializer, Concerto } from '@accordproject/concerto-core';
import { CodeGen } from '@accordproject/concerto-tools';
import { MetaModelUtil } from '@accordproject/concerto-metamodel';
import Ajv from 'ajv';

const suite = new Suite();

const ctoSource = ['./data/person.cto', './data/time@0.2.0.cto'];
const jsonSource = './data/person.json';

(async () => {
    const json = JSON.parse(fs.readFileSync(jsonSource, 'utf8'));

    const modelManager = await ModelLoader.loadModelManager(ctoSource, { offline: true });
    modelManager.addCTOModel(MetaModelUtil.metaModelCto, 'metamodel.cto');

    const visitor = new CodeGen.JSONSchemaVisitor();
    const jsonSchema = modelManager.accept(visitor, {});

    const concerto = new Concerto(modelManager);

    const factory = new Factory(modelManager);
    const serializer = new Serializer(factory, modelManager);

    const ajv = new Ajv();

    suite
        .add('Concerto: Functional API', () => {
            concerto.validate(json);
        })
        .add('Concerto: Serializer', () => {
            const serializationOptions = { validate: true, acceptResourcesForRelationships: false, utcOffset: 0 };
            serializer.fromJSON(json, serializationOptions);
        })
        .add('Concerto -> JSON Schema (ajv)', () => {
            const tempJsonSchema = modelManager.accept(visitor, {});
            ajv.validate(tempJsonSchema, json);
        })
        .add('ajv (native)', () => {
            ajv.validate(jsonSchema, json);
        })
        .on('cycle', (event: { target: any; }) => {
            const benchmark = event.target;

            console.log(benchmark.toString());
        })
        .on('complete', (event: { currentTarget: any; }) => {
            const suite = event.currentTarget;
            const fastestOption = suite.filter('fastest').map('name');

            console.log(`The fastest option is ${fastestOption}`);
        })
        .run();

})();
