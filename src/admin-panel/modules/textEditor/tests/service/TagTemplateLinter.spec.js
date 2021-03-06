/**
 * Copyright (C) 2015 Digimedia Sp. z.o.o. d/b/a Clearcode
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, either version 3 of the License, or (at your option) any
 * later version.
 *
 * This program is distrubuted in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

 /* global describe: false, beforeEach: false, inject: false, it: false, expect: false */
 'use strict';

describe('Unit: clearcode.tm.textEditor.TagTemplateLinter', () => {

    var TagTemplateLinter, LintingRulesService, htmlLinter, lintingRules, TagTemplateToJsConverter, htmlLintingResult, tagTemplateToJsConvertResult;

    beforeEach(module('clearcode.tm.textEditor', ($provide) => {

        lintingRules = [];

        LintingRulesService = {
            getLintingRules: jasmine.createSpy('getLintingRules').and.returnValue(lintingRules)
        };

        htmlLintingResult = [];

        htmlLinter = {
            lint: jasmine.createSpy('lint').and.returnValue(htmlLintingResult)
        };

        tagTemplateToJsConvertResult = [];

        TagTemplateToJsConverter = {
            convert: jasmine.createSpy('convert').and.returnValue(tagTemplateToJsConvertResult)
        };

        $provide.value('clearcode.tm.textEditor.LintingRules', LintingRulesService);
        $provide.value('clearcode.tm.textEditor.HTMLLinter', htmlLinter);
        $provide.value('clearcode.tm.textEditor.TagTemplateToJsConverter', TagTemplateToJsConverter);
    }));

    beforeEach(inject([

        'clearcode.tm.textEditor.TagTemplateLinter',

        (tagTemplateLinter) => {

          TagTemplateLinter = tagTemplateLinter;

        }
    ]));

    it('should be defined', () => {

        expect(TagTemplateLinter).toBeDefined();

    });

    describe('when calling wrapInHtmlTag', () => {

        it('should put provided string in head tag', () => {

            var text = 'Some text',
                wrappedText = TagTemplateLinter.wrapInHtmlTag(text),
                hasElement = wrappedText.indexOf('head');

            expect(hasElement).toBeTruthy()

        });

        it('should add doctype', () => {

            var text = 'Some text',
                wrappedText = TagTemplateLinter.wrapInHtmlTag(text),
                hasElement = wrappedText.indexOf('DOCTYPE HTML');

            expect(hasElement).toBeTruthy()

        });

        it('should put provided text', () => {

            var text = 'Some text',
                wrappedText = TagTemplateLinter.wrapInHtmlTag(text),
                hasElement = wrappedText.indexOf(text);

            expect(hasElement).toBeTruthy()

        });

        it('should close all tags to not cause errors', () => {

            var text = 'Some text',
                wrappedText = TagTemplateLinter.wrapInHtmlTag(text),
                hasCloseElementHead = wrappedText.indexOf('/head'),
                hasCloseElementHtml = wrappedText.indexOf('/html');

            expect(hasCloseElementHead).toBeTruthy()
            expect(hasCloseElementHtml).toBeTruthy()

        });

    });

    describe('when calling isHtmlError', () => {

        it('should return true if checking first line of HTML', () => {

            var error = {
                    line: 0
                },
                isHtmlError = TagTemplateLinter.isHtmlError(error, 3);

            expect(isHtmlError).toBeTruthy()

        });

        it('should return true if checking last line of HTML', () => {

            var error = {
                    line: 3
                },
                isHtmlError = TagTemplateLinter.isHtmlError(error, 3);

            expect(isHtmlError).toBeTruthy()

        });

        it('should return false for any line between opening and closing of head tag', () => {

            var error = {
                    line: 2
                },
                isHtmlError = TagTemplateLinter.isHtmlError(error, 3);

            expect(isHtmlError).toBeFalsy()

        });

    });

    describe('when calling mapToLintRepresentation', () => {


        var errorObject;

        beforeEach(() => {

            errorObject = {

                line: 4,
                message: 'Err001 some error',
                severity: 'error'
            };
        });

        it('should have correct line indices', () => {

            var lintResult = TagTemplateLinter.mapToLintRepresentation(errorObject);

            expect(lintResult.from.line).toBe(errorObject.line - 1)
            expect(lintResult.to.line).toBe(errorObject.line - 1)

        });

        it('should have zeroed character offset', () => {

            var lintResult = TagTemplateLinter.mapToLintRepresentation(errorObject);

            expect(lintResult.from.ch).toBe(0)
            expect(lintResult.to.ch).toBe(0)

        });

        it('should use provided message', () => {

            var lintResult = TagTemplateLinter.mapToLintRepresentation(errorObject);

            expect(lintResult.message).toBe(errorObject.message)

        });

        it('should use provided severity', () => {

            var lintResult = TagTemplateLinter.mapToLintRepresentation(errorObject);

            expect(lintResult.severity).toBe(errorObject.type)

        });

    });

    describe('when calling lint', () => {

        it('should call provided linter', () => {

            var lintText = 'aaa',
                lintResult = TagTemplateLinter.lint(lintText);

            expect(htmlLinter.lint).toHaveBeenCalled()

        });

        it('should get linting rules from LintingRules', () => {

            var lintText = 'aaa',
                lintResult = TagTemplateLinter.lint(lintText);

            expect(LintingRulesService.getLintingRules).toHaveBeenCalled()

        });

        it('should allow for extending of linting rules', () => {

            var lintText = 'aaa',
                lintRulesOverride = {
                    eqeqeq: false
                },
                lintResult = TagTemplateLinter.lint(lintText, lintRulesOverride);

            expect(htmlLinter.lint).toHaveBeenCalledWith(lintText, lintRulesOverride)

        });

    });

    describe('when calling filterOutHtmlErrors', () => {

        var errors;

        beforeEach(() => {

            errors = [{

                    line: 4,
                    message: 'JS'

                }, {

                    line: 0,
                    message: 'HTML'

                }];
        });

        it('should skip HTML errors', () => {

            var jsErrors = TagTemplateLinter.filterOutHtmlErrors(errors, 3);

            expect(jsErrors.length).toBe(1)

        });

        it('should return JS errors', () => {

            var jsErrors = TagTemplateLinter.filterOutHtmlErrors(errors, 3);

            expect(jsErrors.length).toBe(1)
            expect(jsErrors[0].message).toBe(errors[0].message)

        });

    });

    describe('when calling validate', () => {

        it('should return no errors if is deactivated', () => {

            var options = {
                  deactivate: true
                },
                lintResult = TagTemplateLinter.validate('', options);

            expect(lintResult.length).toBe(0);

        });

        it('should call convert method from TagTemplateToJsConverter with array of lines', () => {

            var text = 'aaa\nbbb';

            TagTemplateLinter.validate(text, {}, {});

            expect(TagTemplateToJsConverter.convert).toHaveBeenCalledWith(jasmine.any(Array), undefined);

        });

    });

});
