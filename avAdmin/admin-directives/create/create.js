/**
 * This file is part of admin-console.
 * Copyright (C) 2015-2016  Sequent Tech Inc <legal@sequentech.io>

 * admin-console is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License.

 * admin-console  is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.

 * You should have received a copy of the GNU Affero General Public License
 * along with admin-console.  If not, see <http://www.gnu.org/licenses/>.
**/

angular.module('avAdmin')
  .directive(
    'avAdminCreate',
    function(
      $q,
      Plugins,
      Authmethod,
      DraftElection,
      ElectionsApi,
      $state,
      $stateParams,
      $sanitize,
      $i18next,
      $filter,
      $modal,
      ConfigService,
      ElectionLimits,
      CheckerService,
      ElectionCreation,
      CsvLoad,
      MustExtraFieldsService)
    {
      /**
       * @returns true if the url with the specific title and url appears in the
       * urls list.
       */
      function hasUrl(urls, title, url)
      {
        var u = _.find(
          urls,
          function(urlObject)
          {
            return urlObject.title === title && urlObject.url === url;
          }
        );

        return !!u;
      }

      // we use it as something similar to a controller here
      function link(scope, element, attrs)
      {
        var adminId = ConfigService.freeAuthId;
        scope.creating = false;
        scope.log = '';
        scope.createElectionBool = true;
        scope.allowEditElectionJson = ConfigService.allowEditElectionJson;

        scope.actions = [
          {
            i18nString: 'editJson',
            iconClass: 'fa fa-pencil',
            actionFunc: function() { return scope.editJson(); },
            enableFunc: function() {
              return ConfigService.allowEditElectionJson;
            }
          },
          {
            i18nString: 'livePreview',
            iconClass: 'fa fa-eye',
            actionFunc: function() { return scope.openPreview(); },
            enableFunc: function() {
              return true;
            }
          },
        ];

        if (ElectionsApi.currentElections.length === 0 && !!ElectionsApi.currentElection) {
          scope.elections = [ElectionsApi.currentElection];
        } else {
          scope.elections = ElectionsApi.currentElections;
          ElectionsApi.currentElections = [];
        }

        function logInfo(text) {
          scope.log += "<p>" + $sanitize(text) + "</p>";
        }

        function logError(text) {
          scope.log += "<p class=\"text-brand-danger\">" + $sanitize(text) + "</p>";
        }
        function validateEmail(email) {
          var re = /^[^\s@]+@[^\s@.]+\.[^\s@.]+$/;
          return re.test(email);
        }

        /*
         * Checks elections for errors
         */
        var checks = [
          {
            check: "array-group-chain",
            prefix: "election-",
            append: {key: "eltitle", value: "$value.title"},
            checks: [
              {check: "is-array", key: "questions", postfix: "-questions"},
              {
                check: "array-length",
                key: "questions",
                min: 1,
                max: ElectionLimits.maxNumQuestions,
                postfix: "-questions"
              },

              // verify that when enable_checkable_lists is set, it's using a
              // valid layout
              {
                check: "lambda",
                key: "questions",
                validator: function (questions) 
                {
                  return _.every(
                    questions,
                    function (question)
                    {
                      if (
                        question && 
                        question.extra_options && 
                        question.extra_options.enable_checkable_lists &&
                        question.layout !== 'simultaneous-questions'
                      ) {
                        return false;
                      } else {
                        return true;
                      }
                    }
                  );
                },
                postfix: "-checkable-lists-invalid-layout"
              },

              // verify that when enable_checkable_lists is set, there's a list
              // answer for each category in the question.
              {
                check: "lambda",
                key: "questions",
                validator: function (questions) 
                {
                  return _.every(
                    questions,
                    function (question)
                    {
                      // The grunt uglifier seems to mess up with variable
                      // names so we just try to create a copy of the questions
                      // to see if that solves it.
                      var questionC = angular.copy(question);
                      if (
                        questionC && 
                        questionC.extra_options && 
                        questionC.extra_options.enable_checkable_lists
                      ) {
                        // getting category names from answers
                        var answerCategoryNames = _.unique(
                          _.pluck(
                            _.filter(
                              questionC.answers,
                              function (answer)
                              {
                                return (
                                  !!answer.category && 
                                  answer.category.length > 0 &&
                                  _.every(
                                    answer.urls,
                                    function (url)
                                    {
                                      return (
                                        url.url !== 'true' ||
                                        url.title !== 'isCategoryList'
                                      );
                                    }
                                  )
                                );
                              }
                            ),
                            'category'
                          )
                        );
                        // getting category answers
                        var categoryNames = _.unique(
                          _.pluck(
                            _.filter(
                              questionC.answers,
                              function (answer)
                              {
                                return _.some(
                                  answer.urls,
                                  function (url)
                                  {
                                    return (
                                      url.url === 'true' &&
                                      url.title === 'isCategoryList'
                                    );
                                  }
                                );
                              }
                            ),
                            'text'
                          )
                        );
                        answerCategoryNames.sort();
                        categoryNames.sort();

                        return (
                          JSON.stringify(categoryNames) ===JSON.stringify(answerCategoryNames)
                        );
                      } 
                      else 
                      {
                        return true;
                      }
                    }
                  );
                },
                postfix: "-checkable-lists-categories-mismatch"
              },

              {
                check: "array-length",
                key: "description",
                min: 0,
                max: ElectionLimits.maxLongStringLength,
                postfix: "-description"
              },
              {
                check: "array-length",
                key: "title",
                min: 0,
                max: ElectionLimits.maxLongStringLength,
                postfix: "-title"
              },
              {
                check: "is-string",
                key: "description",
                postfix: "-description"
              },
              {
                check: "lambda",
                key: "census",
                validator: function (census) {
                  var authAction = census.config['authentication-action'];
                  if (!authAction || authAction.mode !== 'go-to-url') {
                    return true;
                  }

                  var urlRe = /^(https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/;
                  return urlRe.test(authAction['mode-config'].url);
                },
                postfix: "-success-action-url-mode"
              },
              {
                check: "lambda",
                key: "census",
                validator: function (census) {
                  if (census.auth_method !== 'email' && census.auth_method !== 'email-otp') {
                    return true;
                  }

                  return census.config.msg.length > 0;
                },
                appendOnErrorLambda: function (census) {
                 return {
                  min: 1,
                  len: census.config.msg.length
                 };
                },
                postfix: "-min-email-msg"
              },
              {
                check: "lambda",
                key: "census",
                validator: function (census) {
                  if (census.auth_method !== 'email'  && census.auth_method !== 'email-otp') {
                    return true;
                  }

                  return census.config.msg.length <= 5000;
                },
                appendOnErrorLambda: function (census) {
                 return {
                  max: 5000,
                  len: census.config.msg.length
                 };
                },
                postfix: "-max-email-msg"
              },
              {
                check: "lambda",
                key: "census",
                validator: function (census) {
                  if (census.auth_method !== 'email'  && census.auth_method !== 'email-otp') {
                    return true;
                  }

                  return census.config.subject.length > 0;
                },
                appendOnErrorLambda: function (census) {
                 return {
                  min: 1,
                  len: census.config.subject.length
                 };
                },
                postfix: "-min-email-title"
              },
              {
                check: "lambda",
                key: "census",
                validator: function (census) {
                  if (census.auth_method !== 'email'  && census.auth_method !== 'email-otp') {
                    return true;
                  }

                  return census.config.subject.length <= 1024;
                },
                appendOnErrorLambda: function (census) {
                 return {
                  max: 1024,
                  len: census.config.subject.length
                 };
                },
                postfix: "-max-email-title"
              },
              {
                check: "lambda",
                key: "census",
                validator: function (census) {
                  if (census.auth_method !== 'sms' && census.auth_method !== 'sms-otp') {
                    return true;
                  }

                  return census.config.msg.length > 0;
                },
                appendOnErrorLambda: function (census) {
                 return {
                  min: 1,
                  len: census.config.msg.length
                 };
                },
                postfix: "-min-sms-msg"
              },
              {
                check: "lambda",
                key: "census",
                validator: function (census) {
                  if (census.auth_method !== 'sms') {
                    return true;
                  }

                  return census.config.msg.length <= 200;
                },
                appendOnErrorLambda: function (census) {
                 return {
                  max: 200,
                  len: census.config.msg.length
                 };
                },
                postfix: "-max-sms-msg"
              },
              {check: "is-string", key: "title", postfix: "-title"},
              {
                check: "array-key-group-chain",
                key: "questions",
                append: {key: "qtitle", value: "$value.title"},
                prefix: "question-",
                checks: [
                  {check: "is-int", key: "min", postfix: "-min"},
                  {check: "is-int", key: "max", postfix: "-max"},
                  {
                    check: "is-int",
                    key: "num_winners",
                    postfix: "-num-winners"
                  },
                  {
                    check: "is-array",
                    key: "answers",
                    postfix: "-answers"
                  },
                  {
                    check: "array-length",
                    key: "answers",
                    min: 1,
                    max: ElectionLimits.maxNumAnswers,
                    postfix: "-answers"
                  },

                  {
                    check: "lambda",
                    key: "answers",
                    validator: function (answers) 
                    {
                      var answerIds = _.pluck(answers, 'id');
                      var mappedAnswerIds = _.map(
                        answers,
                        function (answer, index) { return index; }
                      );
                      return (
                        JSON.stringify(answerIds) === JSON.stringify(mappedAnswerIds)
                      );
                    },
                    postfix: "-invalid-answer-ids"
                  },
                  {
                    check: "int-size",
                    key: "min",
                    min: 0,
                    max: "$value.max",
                    postfix: "-min"
                  },
                  {
                    check: "is-string",
                    key: "description",
                    postfix: "-description"
                  },
                  {
                    check: "array-length",
                    key: "description",
                    min: 0,
                    max: ElectionLimits.maxLongStringLength,
                    postfix: "-description"
                  },
                  {check: "is-string", key: "title", postfix: "-title"},
                  {
                    check: "array-length",
                    key: "title",
                    min: 0,
                    max: ElectionLimits.maxLongStringLength,
                    postfix: "-title"
                  },
                  {
                    check: "lambda",
                    validator: function (question) 
                    {
                      return (
                        Number.isInteger(question.max) &&
                        question.max >= question.min &&
                        (
                          question.max <= (
                            question.answers.length * (
                              (
                                question.extra_options &&
                                question.extra_options.cumulative_number_of_checkboxes
                              ) ?
                              question.extra_options.cumulative_number_of_checkboxes : 1
                            )
                          )
                        )
                      );
                    },
                    postfix: "-max"

                  },
                  {
                    check: "int-size",
                    key: "num_winners",
                    min: 1,
                    max: "$value.answers.length",
                    postfix: "-num-winners"
                  },
                  {
                      check: "array-key-group-chain",
                      key: "answers",
                      append: {key: "atext", value: "$value.text"},
                      prefix: "answer-",
                      checks: [
                        {
                          check: "is-string",
                          key: "text",
                          postfix: "-text"
                        },
                        {
                          check: "is-string",
                          key: "details",
                          postfix: "-details"
                        },
                        {
                          check: "is-string",
                          key: "category",
                          postfix: "-category"
                        },
                        {
                          check: "array-length",
                          key: "details",
                          min: 0,
                          max: ElectionLimits.maxLongStringLength,
                          postfix: "-details"
                        },
                        {
                          check: "lambda",
                          validator: function (answer) 
                          {
                            return (
                              hasUrl(answer.urls, 'isWriteIn', 'true') || 
                              answer.text.length > 0
                            );
                          },
                          appendOnErrorLambda: function (answer) {
                           return {
                            aid: answer.id
                           };
                          },
                          postfix: "-text"
                        },
                        {
                          check: "array-length",
                          key: "category",
                          min: 0,
                          max: ElectionLimits.maxShortStringLength,
                          postfix: "-category"
                        },
                      ]
                  }
                ]
              },
              {
                check: "object-key-chain",
                key: "census",
                prefix: "census-",
                append: {},
                checks: [
                  {
                    check: "is-array",
                    key: "admin_fields",
                    postfix: "-admin-fields"
                  },
                  {
                    check: "array-length",
                    key: "admin_fields",
                    min: 0,
                    max: ElectionLimits.maxNumQuestions,
                    postfix: "-admin-fields"
                  },
                  {
                    check: "lambda",
                    key: "admin_fields",
                    appendOnErrorLambda: function (admin_fields) {
                      var adminNames = [];
                      if (_.isArray(admin_fields)) {
                        _.each(
                          admin_fields,
                          function (field) {
                            if ('int' === field.type &&
                                !_.isNumber(field.value)) {
                              var field_name = field.name;
                              if (_.isString(field.label) &&
                                  0 < field.label.length) {
                                field_name = field.label;
                              }
                              adminNames.push(field_name);
                            }
                          });
                      }
                      return {"admin_names": adminNames.join(", ")};
                    },
                    validator: function (admin_fields) {
                      if (_.isArray(admin_fields)) {
                        return _.every(
                          admin_fields,
                          function (field) {
                            return ('int' !== field.type ||
                                     _.isNumber(field.value));
                          });
                      }
                      return true;
                    },
                    postfix: "-admin-fields-int-type-value"
                  },
                  {
                    check: "lambda",
                    key: "admin_fields",
                    appendOnErrorLambda: function (admin_fields) {
                      var adminNames = [];
                      if (_.isArray(admin_fields)) {
                        _.each(
                          admin_fields,
                          function (field) {
                            if ('email' === field.type &&
                                _.isString(field.value) &&
                                !validateEmail(field.value)) {
                              var field_name = field.name;
                              if (_.isString(field.label) &&
                                  0 < field.label.length) {
                                field_name = field.label;
                              }
                              adminNames.push(field_name);
                            }
                          });
                      }
                      return {"admin_names": adminNames.join(", ")};
                    },
                    validator: function (admin_fields) {
                      if (_.isArray(admin_fields)) {
                        return _.every(
                          admin_fields,
                          function (field) {
                            if ('email' === field.type &&
                                !_.isUndefined(field.value) &&
                                _.isString(field.value)) {
                              return validateEmail(field.value);
                            }
                            return true;
                          });
                      }
                      return true;
                    },
                    postfix: "-admin-fields-email-type-value"
                  },
                  {
                    check: "lambda",
                    key: "admin_fields",
                    appendOnErrorLambda: function (admin_fields) {
                      var adminNames = [];
                      if (_.isArray(admin_fields)) {
                        _.each(
                          admin_fields,
                          function (field) {
                            if ('text' === field.type &&
                                !_.isString(field.value)) {
                              var field_name = field.name;
                              if (_.isString(field.label) &&
                                  0 < field.label.length) {
                                field_name = field.label;
                              }
                              adminNames.push(field_name);
                            }
                          });
                      }
                      return {"admin_names": adminNames.join(", ")};
                    },
                    validator: function (admin_fields) {
                      if (_.isArray(admin_fields)) {
                        return _.every(
                          admin_fields,
                          function (field) {
                            return ('text' !== field.type ||
                                     _.isString(field.value));
                          });
                      }
                      return true;
                    },
                    postfix: "-admin-fields-string-type-value"
                  },
                  {
                    check: "lambda",
                    key: "admin_fields",
                    appendOnErrorLambda: function (admin_fields) {
                      var adminNames = [];
                      if (_.isArray(admin_fields)) {
                        _.each(
                          admin_fields,
                          function (field) {
                              if (_.isUndefined(field.value) ||
                                  (('text' === field.type ||
                                    'email' === field.type) &&
                                  _.isString(field.value) &&
                                  0 === field.value.length)) {
                              var field_name = field.name;
                              if (_.isString(field.label) &&
                                  0 < field.label.length) {
                                field_name = field.label;
                              }
                              adminNames.push(field_name);
                            }
                          });
                      }
                      return {"admin_names": adminNames.join(", ")};
                    },
                    validator: function (admin_fields) {
                        if (_.isArray(admin_fields)) {
                          return _.every(
                            admin_fields,
                            function (field) {
                              if (true === field.required) {
                                if (_.isUndefined(field.value) ||
                                     (('text' === field.type ||
                                       'email' === field.type) &&
                                       _.isString(field.value) &&
                                       0 === field.value.length)) {
                                  return false;
                                }
                              }
                              return true;
                            });
                        }
                        return true;
                    },
                    postfix: "-admin-fields-required-value"
                  },
                  {
                    check: "lambda",
                    key: "admin_fields",
                    append: {key: "max", value: ElectionLimits.maxLongStringLength},
                    appendOnErrorLambda: function (admin_fields) {
                      var adminNames = [];
                      if (_.isArray(admin_fields)) {
                        _.each(
                          admin_fields,
                          function (field) {
                              if ('text' === field.type &&
                                   _.isString(field.value) &&
                                   (field.value.length > ElectionLimits.maxLongStringLength)) {
                              var field_name = field.name;
                              if (_.isString(field.label) &&
                                  0 < field.label.length) {
                                field_name = field.label;
                              }
                              adminNames.push(field_name);
                            }
                          });
                      }
                      return {"admin_names": adminNames.join(", ")};
                    },
                    validator: function (admin_fields) {
                      if (_.isArray(admin_fields)) {
                        return _.every(
                          admin_fields,
                          function (field) {
                            if ('text' === field.type &&
                                _.isString(field.value)) {
                              return (field.value.length <= ElectionLimits.maxLongStringLength);
                            }
                            return true;
                          });
                      }
                      return true;
                    },
                    postfix: "-admin-fields-string-value-array-length"
                  },
                  {
                    check: "lambda",
                    key: "admin_fields",
                    append: {key: "max", value: ElectionLimits.maxLongStringLength},
                    appendOnErrorLambda: function (admin_fields) {
                      var adminNames = [];
                      if (_.isArray(admin_fields)) {
                        _.each(
                          admin_fields,
                          function (field) {
                              if ('email' === field.type &&
                                   _.isString(field.value) &&
                                   (field.value.length > ElectionLimits.maxLongStringLength)) {
                              var field_name = field.name;
                              if (_.isString(field.label) &&
                                  0 < field.label.length) {
                                field_name = field.label;
                              }
                              adminNames.push(field_name);
                            }
                          });
                      }
                      return {"admin_names": adminNames.join(", ")};
                    },
                    validator: function (admin_fields) {
                      if (_.isArray(admin_fields)) {
                        return _.every(
                          admin_fields,
                          function (field) {
                            if ('email' === field.type &&
                                _.isString(field.value)) {
                              return (field.value.length <= ElectionLimits.maxLongStringLength);
                            }
                            return true;
                          });
                      }
                      return true;
                    },
                    postfix: "-admin-fields-email-value-array-length"
                  },
                  {
                    check: "lambda",
                    key: "admin_fields",
                    appendOnErrorLambda: function (admin_fields) {
                      var adminNames = [];
                      if (_.isArray(admin_fields)) {
                        _.each(
                          admin_fields,
                          function (field) {
                              if ('int' === field.type &&
                                   !_.isUndefined(field.value) &&
                                   _.isNumber(field.value) &&
                                   !_.isUndefined(field.min) &&
                                   _.isNumber(field.min) &&
                                   field.min > field.value) {
                              var field_name = field.name;
                              if (_.isString(field.label) &&
                                  0 < field.label.length) {
                                field_name = field.label;
                              }
                              adminNames.push(field_name);
                            }
                          });
                      }
                      return {"admin_names": adminNames.join(", ")};
                    },
                    validator: function (admin_fields) {
                      if (_.isArray(admin_fields)) {
                        return _.every(
                          admin_fields,
                          function (field) {
                            if ('int' === field.type &&
                                !_.isUndefined(field.value) &&
                                _.isNumber(field.value) &&
                                !_.isUndefined(field.min) &&
                                _.isNumber(field.min)) {
                              return (field.min <= field.value);
                            }
                            return true;
                          });
                      }
                      return true;
                    },
                    postfix: "-admin-fields-int-min-value"
                  },
                  {
                    check: "lambda",
                    key: "admin_fields",
                    appendOnErrorLambda: function (admin_fields) {
                      var adminNames = [];
                      if (_.isArray(admin_fields)) {
                        _.each(
                          admin_fields,
                          function (field) {
                              if ('int' === field.type &&
                                   !_.isUndefined(field.value) &&
                                   _.isNumber(field.value) &&
                                   !_.isUndefined(field.max) &&
                                   _.isNumber(field.max) &&
                                   field.max < field.value) {
                              var field_name = field.name;
                              if (_.isString(field.label) &&
                                  0 < field.label.length) {
                                field_name = field.label;
                              }
                              adminNames.push(field_name);
                            }
                          });
                      }
                      return {"admin_names": adminNames.join(", ")};
                    },
                    validator: function (admin_fields) {
                      if (_.isArray(admin_fields)) {
                        return _.every(
                          admin_fields,
                          function (field) {
                            if ('int' === field.type &&
                                !_.isUndefined(field.value) &&
                                _.isNumber(field.value) &&
                                !_.isUndefined(field.max) &&
                                _.isNumber(field.max)) {
                              return (field.max >= field.value);
                            }
                            return true;
                          });
                      }
                      return true;
                    },
                    postfix: "-admin-fields-int-max-value"
                  },
                  {
                    check: "array-key-group-chain",
                    key: "admin_fields",
                    prefix: "admin-fields-",
                    append: {key: "fname", value: "$value.name"},
                    checks: [
                      {
                        check: "is-string-if-defined",
                        key: "placeholder",
                        postfix: "-placeholder"
                      },
                      {
                        check: "array-length-if-defined",
                        key: "placeholder",
                        min: 0,
                        max: ElectionLimits.maxLongStringLength,
                        postfix: "-placeholder"
                      },
                      {
                        check: "is-string",
                        key: "label",
                        postfix: "-label"
                      },
                      {
                        check: "array-length",
                        key: "label",
                        min: 0,
                        max: ElectionLimits.maxLongStringLength,
                        postfix: "-label"
                      },
                      {
                        check: "is-string-if-defined",
                        key: "description",
                        postfix: "-description"
                      },
                      {
                        check: "array-length-if-defined",
                        key: "description",
                        min: 0,
                        max: ElectionLimits.maxLongStringLength,
                        postfix: "-description"
                      },
                      {
                        check: "is-string",
                        key: "name",
                        postfix: "-name"
                      },
                      {
                        check: "array-length",
                        key: "name",
                        min: 0,
                        max: ElectionLimits.maxLongStringLength,
                        postfix: "-name"
                      },
                      {
                        check: "is-string",
                        key: "type",
                        postfix: "-type"
                      },
                      {
                        check: "array-length",
                        key: "type",
                        min: 0,
                        max: ElectionLimits.maxLongStringLength,
                        postfix: "-type"
                      },
                      {
                        check: "lambda",
                        key: "min",
                        validator: function (min) {
                          if (!_.isUndefined(min) && !_.isNumber(min)) {
                            return false;
                          }
                          return true;
                        },
                        postfix: "-min-number"
                      },
                      {
                        check: "lambda",
                        key: "max",
                        validator: function (max) {
                          if (!_.isUndefined(max) && !_.isNumber(max)) {
                            return false;
                          }
                          return true;
                        },
                        postfix: "-max-number"
                      },
                      {
                        check: "lambda",
                        key: "step",
                        validator: function (step) {
                          if (!_.isUndefined(step) && !_.isNumber(step)) {
                            return false;
                          }
                          return true;
                        },
                        postfix: "-step-number"
                      },
                      {
                        check: "lambda",
                        key: "required",
                        validator: function (required) {
                          if (!_.isUndefined(required) && !_.isBoolean(required)) {
                            return false;
                          }
                          return true;
                        },
                        postfix: "-required-boolean"
                      },
                      {
                        check: "lambda",
                        key: "private",
                        validator: function (_private) {
                          if (!_.isUndefined(_private) && !_.isBoolean(_private)) {
                            return false;
                          }
                          return true;
                        },
                        postfix: "-private-boolean"
                      }
                    ]
                  },
                ]
              },
            ]
          }
        ];

        Plugins.hook('election-create-add-checks', {'checks': checks, 'elections': scope.elections});
        scope.errors = [];
        CheckerService({
          checks: checks,
          data: scope.elections,
          onError: function (errorKey, errorData) {
            scope.errors.push({
              data: errorData,
              key: errorKey
            });
          }
        });

        function createAuthEvent(el) {
            console.log("creating auth event for election " + el.title);
            var deferred = $q.defer();
            // Creating the authentication
            logInfo($i18next('avAdmin.create.creating', {title: el.title}));

            var d = ElectionCreation.generateAuthEvent(el);

            Authmethod.createEvent(d)
                .then(
                  function onSuccess(response) {
                    el.id = response.data.id;
                    deferred.resolve(el);
                  },
                  deferred.reject
                );
            return deferred.promise;
        }

        function addCensus(el) {
            console.log("adding census for election " + el.title);
            var deferred = $q.defer();

            // Adding the census
            logInfo($i18next('avAdmin.create.census', {title: el.title, id: el.id}));

            var data = {
              election: el,
              error: function (errorMsg) {
                  scope.errors.push({
                    data: {message: $sanitize($sanitize)(errorMsg)},
                    key: "election-census-createel-unknown"
                  });
                },
              disableOk: false,
              cancel: function (error) {
                Plugins.hook('census-csv-load-error', error);
              },
              close: function () {}
            };
            CsvLoad.uploadUponElCreation(data)
                .then(function(data) {
                    deferred.resolve(el);
                }).catch(deferred.reject);

            return deferred.promise;
        }

        function setChildrenElectionInfo(el)
        {
          console.log("setting children election info for election " + el.title);
          var deferred = $q.defer();

          logInfo(
            $i18next(
              'avAdmin.create.setChildrenElectionInfo',
              {title: el.title, id: el.id}
            )
          );
          Authmethod
            .editChildrenParent(
              {
                parent_id: el.parent_id,
                children_election_info: el.children_election_info
              },
              el.id
            )
            .then(
              function(_data)
              {
                deferred.resolve(el);
              }
            )
            .catch(deferred.reject);
          return deferred.promise;
        }

        function addBallotBoxes(el)
        {
          // if the election has no ballot box, continue
          var deferred = $q.defer();
          if (!el.ballot_boxes || el.ballot_boxes.length === 0)
          {
            setTimeout(function() {deferred.resolve(el); }, 0);
            return deferred.promise;
          }
          console.log("adding ballot boxes for election " + el.title);

          logInfo(
            $i18next(
              'avAdmin.create.addBallotBoxes',
              {title: el.title, id: el.id}
            )
          );

          var numResolved = 0;
          _.each(
            el.ballot_boxes,
            function (ballot_box_name)
            {
              Authmethod
                .createBallotBox(
                  el.id,
                  ballot_box_name
                )
                .then(
                  function(_data)
                  {
                    numResolved += 1;
                    if (numResolved === el.ballot_boxes.length)
                    {
                      deferred.resolve(el);
                    }
                  }
                )
                .catch(deferred.reject);
            }
          );
          return deferred.promise;
        }

        function registerElection(el) {
            console.log("registering election " + el.title);
            var d = ElectionCreation.generateElection(el);

            var deferred = $q.defer();
            // Registering the election
            logInfo($i18next('avAdmin.create.reg', {title: d.title, id: d.id}));
            ElectionsApi.command(d, '', 'POST', d)
                .then(function(data) { deferred.resolve(d); })
                .catch(deferred.reject);
            return deferred.promise;
        }

        function createElection(el) {
            var deferred = $q.defer();
            if (scope.createElectionBool) {
              console.log("creating election " + el.title);
              Plugins.hook('election-create', {'el': el});
              if (typeof el.extra_data === 'object') {
                el.extra_data = JSON.stringify(el.extra_data);
              }
              // Creating the election
              logInfo($i18next('avAdmin.create.creatingEl', {title: el.title, id: el.id}));
              ElectionsApi.command(el, 'create', 'POST', {})
                .then(function(data) { deferred.resolve(el); })
                .catch(deferred.reject);
            } else {
              deferred.resolve(el);
            }
            return deferred.promise;
        }
        
        function waitForCreated(id, f) {
          console.log("waiting for election id = " + id);
          ElectionsApi.getElection(id, true)
            .then(function(el) {
                var deferred = $q.defer();
                if (scope.createElectionBool && el.status === 'created' ||
                  !scope.createElectionBool && el.status === 'registered')
                {
                  f();
                } else {
                  setTimeout(function() { waitForCreated(id, f); }, 5000);
                }
            });
        }

        function secondElectionsStage(electionIndex) 
        {
          var deferred = $q.defer();
          if (electionIndex === scope.elections.length) 
          {
            var el = scope.elections[0];
            scope.creating = false;
            $state.go("admin.dashboard", {id: el.id});
            return;
          }

          var promise = deferred.promise;
          promise = promise
            .then(setChildrenElectionInfo)
            .then(addBallotBoxes)
            .then(addCensus)
            .then(createElection)
            .then(function(election) {
              console.log("waiting for election " + election.title);
              waitForCreated(election.id, function () {
                DraftElection.eraseDraft();
                secondElectionsStage(electionIndex + 1);
              });
            })
            .catch(function(error) {
              scope.creating = false;
              scope.creating_text = '';
              logError(angular.toJson(error));
            });
          deferred.resolve(scope.elections[electionIndex]);
        }

        function addElection(electionIndex) 
        {
          var deferred = $q.defer();

          // After creating the auth events and registering all the elections 
          // in ballot_box, we proceed to:
          // - set children election info
          // - add census
          // - create election public keys
          if (electionIndex === scope.elections.length) {
            secondElectionsStage(0);
            return;
          }

          var promise = deferred.promise;
          promise = promise
            .then(createAuthEvent)
            .then(registerElection)
            .then(function(election) {
              addElection(electionIndex + 1);
            })
            .catch(function(error) {
              scope.creating = false;
              scope.creating_text = '';
              logError(angular.toJson(error));
            });
          deferred.resolve(scope.elections[electionIndex]);
        }

        function mapToBallotBox(election, electionId) {
          return {
            id: electionId,
            configuration:{
               id: electionId,
               layout: election.layout,
               director: election.director,
               authorities: election.authorities,
               title: election.title,
               description: election.election,
               questions: election.questions,
               presentation: election.presentation,
               extra_data: JSON.stringify(election.extra_data),
               tallyPipesConfig: JSON.stringify(election.tallyPipesConfig),
               ballotBoxesResultsConfig: "",
               virtual: false,
               tally_allowed: false,
               publicCandidates: true,
               virtualSubelections: [],
               logo_url: ""
            },
            state:"started",
            // always use the same public keys
            pks: JSON.stringify(election.questions.map(function (q) {
              return {
                q: '24792774508736884642868649594982829646677044143456685966902090450389126928108831401260556520412635107010557472033959413182721740344201744439332485685961403243832055703485006331622597516714353334475003356107214415133930521931501335636267863542365051534250347372371067531454567272385185891163945756520887249904654258635354225185183883072436706698802915430665330310171817147030511296815138402638418197652072758525915640803066679883309656829521003317945389314422254112846989412579196000319352105328237736727287933765675623872956765501985588170384171812463052893055840132089533980513123557770728491280124996262883108653723',
                p: '49585549017473769285737299189965659293354088286913371933804180900778253856217662802521113040825270214021114944067918826365443480688403488878664971371922806487664111406970012663245195033428706668950006712214428830267861043863002671272535727084730103068500694744742135062909134544770371782327891513041774499809308517270708450370367766144873413397605830861330660620343634294061022593630276805276836395304145517051831281606133359766619313659042006635890778628844508225693978825158392000638704210656475473454575867531351247745913531003971176340768343624926105786111680264179067961026247115541456982560249992525766217307447',
                y: '25233303610624276354982811986201834016697399044876854448496917180808794460600684041443897755355520203095802059616029587815193698920031231714345315925211168639624595654625128533802897292140868582328656520616332091010467955507834092620045939069623671407818190171090021825044623127204061232697474129851550188729946673890631720197446903235998242798036758238763406311552128366413931805575611209227161344639186615808279023879377699069225460149170905910146022296229949546176735955646970920639173343909852697354526383408023054713403757933275765703706664300550788437833505997522376371433614613665995482912523477014539823187236',
                g: '27257469383433468307851821232336029008797963446516266868278476598991619799718416119050669032044861635977216445034054414149795443466616532657735624478207460577590891079795564114912418442396707864995938563067755479563850474870766067031326511471051504594777928264027177308453446787478587442663554203039337902473879502917292403539820877956251471612701203572143972352943753791062696757791667318486190154610777475721752749567975013100844032853600120195534259802017090281900264646220781224136443700521419393245058421718455034330177739612895494553069450438317893406027741045575821283411891535713793639123109933196544017309147'
              };
            })),
            tallyPipesConfig: JSON.stringify(election.tallyPipesConfig),
            ballotBoxesResultsConfig: "",
            virtual: false,
            tallyAllowed: false,
            publicCandidates:true,
            logo_url: "",
            trusteeKeysState:[]
          };
        }

        function mapToAuthapi(election, electionId) {
          return {
            id: electionId,
            auth_method: election.authmethod,
            census: election.census.census,
            users: 0,
            has_ballot_boxes: election.has_ballot_boxes,
            tally_status: "notstarted",
            allow_public_census_query: false,
            created: "2022-12-05T15:22:34.862203%2B00:00",
            based_in: null,
            num_successful_logins_allowed: election.num_successful_logins_allowed,
            hide_default_login_lookup_field: false,
            parent_id: null,
            children_election_info: null,
            auth_method_config:{
               config:{
                  allow_user_resend: election.census.config.allow_user_resend
               }
            },
            openid_connect_providers:[
               
            ],
            support_otl_enabled: false,
            inside_authenticate_otl_period: false,
            extra_fields: election.extra_fields,
            admin_fields: election.admin_fields
          };
        }

        scope.openPreview = function()
        {
          var electionId = 123456789;
          var electionJson = {
            ballot_box: mapToBallotBox(scope.elections[0], electionId),
            authapi: mapToAuthapi(scope.elections[0], electionId)
          };
          electionJson.id = electionId;
          var previewElectionData = encodeURIComponent(JSON.stringify(electionJson));
          var url = window.location.origin +"/booth/" + electionId + "/preview-vote?preview-election=" + previewElectionData;
          window.open(url, '_blank');
          return true;
        };

        scope.editJson = function()
        {
          if(!ConfigService.allowEditElectionJson) {
            return;
          }
          // show the initial edit dialog
          $modal
            .open({
              templateUrl: "avAdmin/admin-directives/create/edit-election-json-modal.html",
              controller: "EditElectionJsonModal",
              size: 'lg',
              resolve: {
                electionJson: function () { return angular.toJson(scope.elections, true); }
              }
            })
            .result.then(
              function (data)
              {
                scope.elections = angular.fromJson(data.electionJson);

                scope.errors = [];
                CheckerService({
                  checks: checks,
                  data: scope.elections,
                  onError: function (errorKey, errorData) {
                    scope.errors.push({
                      data: $sanitize(errorData),
                      key: errorKey
                    });
                  }
                });
              }
            );
        };

        function createElections() {
            var deferred = $q.defer();
            addElection(0);
            var promise = deferred.promise;

            scope.creating = true;
        }

        if ($stateParams.autocreate === "true") {
            createElections();
        }

        function checkMustExtra() {
            var index = 0;
            for (; index < scope.elections.length; index++) {
              MustExtraFieldsService(scope.elections[index]);
            }
        }

        scope.$watch("elections", function (newVal, oldVal) {
          scope.$evalAsync(checkMustExtra);
        }, true);

        angular.extend(scope, {
          createElections: createElections,
        });
      }

      return {
        restrict: 'AE',
        scope: {
        },
        link: link,
        templateUrl: 'avAdmin/admin-directives/create/create.html'
      };
    });
