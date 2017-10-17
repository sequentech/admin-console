/**
 * This file is part of agora-gui-admin.
 * Copyright (C) 2015-2016  Agora Voting SL <agora@agoravoting.com>

 * agora-gui-admin is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License.

 * agora-gui-admin  is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.

 * You should have received a copy of the GNU Affero General Public License
 * along with agora-gui-admin.  If not, see <http://www.gnu.org/licenses/>.
**/

angular.module('avAdmin')
  .factory(
    'CsvLoad',
    function (
      $q,
      ConfigService,
      Plugins,
      Authmethod)
    {
      var csvLoadService = {};

      function calculateExportList(textarea) {
          var el = csvLoadService.scope.election;
          var cs;
          if (!el.id) {
            cs = el.census.voters;
          } else {
            cs = [];
          }

          var fields = el.census.extra_fields;

          var lines = textarea.split("\n");
          lines.forEach(function(l) {
              var lf = l.split(";");
              var nv = {};
              fields.forEach(function(f, i) { nv[f.name] = lf[i].trim(); });
              if (nv.tlf) {
                nv.tlf = nv.tlf.replace(" ", "");
              }
              if (nv.email) {
                nv.email = nv.email.replace(" ", "");
              }
              cs.push({selected: false, vote: false, username: "", metadata: nv});
          });

          if (!!el.id) {
            var csExport = _.map(cs, function (i) { return i.metadata; });
            return csExport;
          }
          return [];
      }

      csvLoadService.processCsv = function (scope) {
        if (!!scope.election.id) {
          csvLoadService.scope = scope;

          csvLoadService.scope.batchSize = ConfigService.censusImportBatch;
          // 0 to 100% (when finished)
          csvLoadService.scope.percent = 0;
          csvLoadService.scope.disableOk = false;

          csvLoadService.scope.exportList = calculateExportList(csvLoadService.scope.textarea);
          csvLoadService.scope.exportListIndex = 0;

          var pluginData = {
            html: [],
            scope: {},
            okhtml: [],
            processBatchPlugin: false,
            startClickedPlugin: false,
            election: csvLoadService.scope.election,
            exportList: csvLoadService.scope.exportList
          };
          Plugins.hook('census-csv-loading-modal', pluginData);
          csvLoadService.scope.exhtml = pluginData.html;
          csvLoadService.scope.okhtml = pluginData.okhtml;
          csvLoadService.scope = _.extend(csvLoadService.scope, pluginData.scope);
          csvLoadService.scope.startClickedPlugin = pluginData.startClickedPlugin;
          csvLoadService.scope.processBatchPlugin = pluginData.processBatchPlugin;
        } else {
          var el = csvLoadService.scope.election;
          var exportList = calculateExportList(csvLoadService.scope.textarea);
          el.census.voters.push.apply(exportList);
        }
      };

      function calcPercent (index) {
        return index*100.0/csvLoadService.scope.exportList.length;
      }

      function censusCall(id, csExport, opt) {
        var deferred = $q.defer();
        try {
          // this hook can avoid the addCensus call
          if (Plugins.hook('add-to-census-pre', csExport)) {
            Authmethod.addCensus(id, csExport, opt)
              .success(function(r) {
                Plugins.hook('add-to-census-success', {data: csExport, response: r});
                deferred.resolve();
              })
              .error(function(error) {
                csvLoadService.scope.error(error.error);
                Plugins.hook('add-to-census-error', {data: csExport, response: error});
                deferred.reject();
              });
          }
        } catch (error) {
          deferred.reject(error);
        }
        return deferred.promise;
      }

      function processBatch() {
        var deferred = $q.defer();
        try {
          var ret = {
            'percent': csvLoadService.scope.percent,
            'exportListIndex': csvLoadService.scope.exportListIndex,
            'calcPercent': calcPercent
          };
          if (csvLoadService.scope.exportList.length > csvLoadService.scope.exportListIndex) {
            var batch = [];
            if (0 === csvLoadService.scope.batchSize ||
                (csvLoadService.scope.exportList.length - csvLoadService.scope.exportListIndex) <= csvLoadService.scope.batchSize) {
               batch = csvLoadService.scope.exportList.slice(csvLoadService.scope.exportListIndex);
            } else {
               batch = csvLoadService.scope.exportList.slice(csvLoadService.scope.exportListIndex, csvLoadService.scope.exportListIndex + csvLoadService.scope.batchSize);
            }
            censusCall(csvLoadService.scope.election.id, batch, 'disabled')
              .then(function () {
                ret.exportListIndex = csvLoadService.scope.exportListIndex + batch.length;
                ret.percent = calcPercent(ret.exportListIndex);
                deferred.resolve(ret);
              })
              .catch(function () {
                deferred.reject(ret);
              });
          } else {
            deferred.resolve(ret);
          }
        } catch (error) {
          deferred.reject(error);
        }
        return deferred.promise;
      }

      function processBatchCaller() {
        var deferred = $q.defer();
        processBatch()
          .then(function (processed) {
            if (_.isFunction(csvLoadService.scope.processBatchPlugin)) {
              csvLoadService.scope.processBatchPlugin(processed)
                .then(function (ret) {
                  csvLoadService.scope.percent = ret.percent;
                  csvLoadService.scope.exportListIndex = ret.exportListIndex;
                  
                  if (csvLoadService.scope.percent < 100) {
                    processBatchCaller()
                      .then(deferred.resolve)
                      .catch(deferred.reject);
                    //setTimeout(processBatchCaller, 0);
                  } else  if (_.isFunction(csvLoadService.scope.close)) {
                    deferred.resolve();
                  }
                });
            } else {
              csvLoadService.scope.percent = processed.percent;
              csvLoadService.scope.exportListIndex = processed.exportListIndex;

              if (csvLoadService.scope.percent < 100) {
                processBatchCaller()
                  .then(deferred.resolve)
                  .catch(deferred.reject);
                //setTimeout(processBatchCaller, 0);
              } else  if (_.isFunction(csvLoadService.scope.close)) {
                deferred.resolve();
              }
            }
          })
          .catch(deferred.reject);
        return deferred.promise;
      }

      csvLoadService.uploadCSV = function () {
        var deferred = $q.defer();
        if (_.isFunction(csvLoadService.scope.startClickedPlugin)) {
          csvLoadService.scope.startClickedPlugin();
        }
        processBatchCaller()
          .then(function(data) {
              if (_.isFunction(csvLoadService.scope.close)) {
                csvLoadService.scope.close();
              }
              deferred.resolve();
          }).catch(function (error) {
            if (_.isFunction(csvLoadService.scope.cancel)) {
              csvLoadService.scope.cancel();
            }
            deferred.reject();
          });
        return deferred.promise;
      };
      
      csvLoadService.uploadUponElCreation = function (scope) {
        var deferred = $q.defer();
        if (0 === scope.election.census.voters.length) {
          deferred.resolve();
        } else {
          csvLoadService.scope = scope;

          csvLoadService.scope.batchSize = ConfigService.censusImportBatch;
          // 0 to 100% (when finished)
          csvLoadService.scope.percent = 0;
          csvLoadService.scope.disableOk = false;

          csvLoadService.scope.exportList = csvLoadService.scope.election.census.voters;
          csvLoadService.scope.exportListIndex = 0;

          var pluginData = {
            html: [],
            scope: {},
            okhtml: [],
            processBatchPlugin: false,
            startClickedPlugin: false,
            election: csvLoadService.scope.election,
            exportList: csvLoadService.scope.exportList
          };
          Plugins.hook('census-csv-loading-modal', pluginData);
          csvLoadService.scope.exhtml = pluginData.html;
          csvLoadService.scope.okhtml = pluginData.okhtml;
          csvLoadService.scope = _.extend(csvLoadService.scope, pluginData.scope);
          csvLoadService.scope.startClickedPlugin = pluginData.startClickedPlugin;
          csvLoadService.scope.processBatchPlugin = pluginData.processBatchPlugin;
          
          csvLoadService.uploadCSV()
            .then(deferred.resolve)
            .catch(deferred.reject);
        }
        return deferred.promise;
      };

      
      return csvLoadService;
    });
