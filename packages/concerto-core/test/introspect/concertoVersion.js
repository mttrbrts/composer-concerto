/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const ModelFile = require('../../lib/introspect/modelfile');
const ModelManager = require('../../lib/modelmanager');
const fs = require('fs');
const path = require('path');

const chai = require('chai');
chai.should();
chai.use(require('chai-things'));

describe('ModelFile', () => {

    const versionMissing = fs.readFileSync(path.resolve(__dirname, '../data/model/carlease.cto'), 'utf8');
    const versionValid = fs.readFileSync(path.resolve(__dirname, '../data/model/versionValid.cto'), 'utf8');
    const versionInvalid = fs.readFileSync(path.resolve(__dirname, '../data/model/versionInvalid.cto'), 'utf8');

    let modelManager;

    beforeEach(() => {
        modelManager = new ModelManager();
    });

    afterEach(() => {
    });

    describe('#concertoVersion', () => {

        it('should throw when concerto version is not compatible with model', () => {
            (() => {
                new ModelFile(modelManager, versionInvalid);
            }).should.throw(/ModelFile expects Concerto version/);
        });

        it('should return when concerto version is compatible with model', () => {
            let mf = new ModelFile(modelManager, versionValid);
            mf.getConcertoVersion().should.equal('^1.0.0-alpha.0');
        });

        it('should return when model has no concerto version range', () => {
            let mf = new ModelFile(modelManager, versionMissing);
            (mf.getConcertoVersion() === null).should.equal(true);
        });
    });
});
