/**
 * This file is part of admin-console.
 * Copyright (C) 2015-2020 Sequent Tech Inc <legal@sequentech.io>

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

window.SequentConfigData.base = '/admin';

angular.module(
  'admin-console',
  ['ui.bootstrap',
  'ui.utils',
  'ui.router',
  'ngAnimate',
  'ngResource',
  'ngCookies',
  'ipCookie',
  'ngSanitize',
  'infinite-scroll',
  'angularMoment',
  'SequentConfig',
  'SequentPluginsConfig',
  'jm.i18next',
  'avUi',
  'avRegistration',
  'avTest',
  'avAdmin',
  'angularFileUpload',
  'dndLists',
  'angularLoad',
  'angular-date-picker-polyfill',
  'ng-autofocus',
  'LocalStorageModule',
  'common-ui'
]);

/**
 * Configure i18next module
 */
angular
  .module('jm.i18next')
  .config(
    function ($i18nextProvider, ConfigServiceProvider)
    {
      // note that we do not send the language: by default, it will try the language
      // supported by the web browser
      $("#no-js").hide();

      $i18nextProvider.options = _.extend(
        {
          useCookie: true,
          useLocalStorage: false,
          fallbackLng: 'en',
          cookieName: 'lang',
          detectLngQS: 'lang',
          lngWhitelist: ['en', 'es', 'gl', 'ca'],
          resGetPath: '/admin/locales/__lng__.json',
          defaultLoadingValue: '' // ng-i18next option, *NOT* directly supported by i18next
        },
        ConfigServiceProvider.i18nextInitOptions
      );
    }
  );

/**
 * Configure sceDelegateProvider
 */
angular
  .module('admin-console')
  .config(
    function($sceDelegateProvider, ConfigServiceProvider)
    {
      $sceDelegateProvider
        .resourceUrlWhitelist(ConfigServiceProvider.resourceUrlWhitelist);
    }
  );

/**
 * Configure the available URLs
 */
angular
  .module('admin-console')
  .config(
    function(
      $stateProvider,
      $urlRouterProvider,
      $httpProvider,
      $locationProvider,
      ConfigServiceProvider)
    {
      // CSRF verification
      $httpProvider.defaults.xsrfCookieName = 'csrftoken';
      $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';

      $urlRouterProvider.otherwise(ConfigServiceProvider.defaultRoute);

      // use the HTML5 History API
      $locationProvider.html5Mode(ConfigServiceProvider.locationHtml5mode);

      /* App states and urls are defined here */
      // Admin interface
      $stateProvider
        .state('admin', {
          abstract: true,
          url: '/admin',
          template: '<div ui-view autoscroll></div>'
        })
        .state('admin.login', {
          url: '/login',
          templateUrl: 'avAdmin/admin-login-controller/admin-login-controller.html',
          controller: "AdminLoginController"
        })
        .state('admin.login_email', {
          url: '/login/:email',
          templateUrl: 'avAdmin/admin-login-controller/admin-login-controller.html',
          controller: "AdminLoginController"
        })
        .state('admin.signup', {
          url: '/signup',
          templateUrl: 'avAdmin/admin-signup-controller/admin-signup-controller.html',
          controller: "AdminSignUpController"
        })
        .state('admin.logout', {
          url: '/logout',
          controller: "LogoutController"
        })
        // admin directives using the admin controller
        .state('admin.new', {
          url: '/new/:draft',
          templateUrl: 'avAdmin/admin-controller/admin-controller.html',
          controller: 'AdminController'
        })
        .state('admin.tasks', {
          url: '/tasks',
          templateUrl: 'avAdmin/admin-controller/admin-controller.html',
          controller: 'AdminController'
        })
        .state('admin.elections', {
          url: '/elections',
          templateUrl: 'avAdmin/admin-controller/admin-controller.html',
          controller: 'AdminController'
        })
        .state('admin.import', {
          url: '/import',
          templateUrl: 'avAdmin/admin-controller/admin-controller.html',
          controller: 'AdminController'
        })
        .state('admin.basic', {
          url: '/basic/:id',
          templateUrl: 'avAdmin/admin-controller/admin-controller.html',
          controller: 'AdminController'
        })
        .state('admin.adminFields', {
          url: '/admin-fields/:id',
          templateUrl: 'avAdmin/admin-controller/admin-controller.html',
          controller: 'AdminController'
        })
        .state('admin.questions', {
          url: '/questions/:id',
          templateUrl: 'avAdmin/admin-controller/admin-controller.html',
          controller: 'AdminController'
        })
        .state('admin.census', {
          url: '/census/:id',
          templateUrl: 'avAdmin/admin-controller/admin-controller.html',
          controller: 'AdminController'
        })
        .state('admin.censusConfig', {
          url: '/census-config/:id',
          templateUrl: 'avAdmin/admin-controller/admin-controller.html',
          controller: 'AdminController'
        })
        .state('admin.successAction', {
          url: '/success-action/:id',
          templateUrl: 'avAdmin/admin-controller/admin-controller.html',
          controller: 'AdminController'
        })
        .state('admin.auth', {
          url: '/auth/:id',
          templateUrl: 'avAdmin/admin-controller/admin-controller.html',
          controller: 'AdminController'
        })
        .state('admin.activityLog', {
          url: '/activity/:id',
          templateUrl: 'avAdmin/admin-controller/admin-controller.html',
          params: {
            q: null
          },
          controller: 'AdminController'
        })
        .state('admin.tally', {
          url: '/tally/:id',
          templateUrl: 'avAdmin/admin-controller/admin-controller.html',
          controller: 'AdminController'
        })
        .state('admin.dashboard', {
          url: '/dashboard/:id',
          templateUrl: 'avAdmin/admin-controller/admin-controller.html',
          controller: 'AdminController'
        })
        .state('admin.account', {
          url: '/account',
          templateUrl: 'avAdmin/admin-controller/admin-controller.html',
          controller: 'AdminController'
        })
        .state('admin.billinfo', {
          url: '/billinfo',
          templateUrl: 'avAdmin/admin-controller/admin-controller.html',
          controller: 'AdminController'
        })
        .state('admin.billhistory', {
          url: '/billhistory',
          templateUrl: 'avAdmin/admin-controller/admin-controller.html',
          controller: 'AdminController'
        })
        .state('admin.ballotBox', {
          url: '/ballot-box/:id',
          templateUrl: 'avAdmin/admin-controller/admin-controller.html',
          controller: 'AdminController'
        })
        .state('admin.create', {
            url: '/create/:autocreate',
          templateUrl: 'avAdmin/admin-controller/admin-controller.html',
          controller: 'AdminController'
        });
      // END of Admin interface

      $stateProvider
        .state('unit-test-e2e', {
          url: '/unit-test-e2e',
          templateUrl: 'test/unit_test_e2e.html',
          controller: "UnitTestE2EController"
        });
    }
  );

/**
 * Caching http response error to deauthenticate
 */
angular
  .module('admin-console')
  .config(
    function($httpProvider)
    {
      $httpProvider
        .interceptors
        .push(
          function($q, $injector)
          {
            return {
              'responseError': function(rejection)
              {
                if (
                  rejection.data &&
                  rejection.data.error_codename &&
                  _.contains(
                    ['expired_hmac_key', 'empty_hmac', 'invalid_hmac_userid'],
                    rejection.data.error_codename)
                  )
                {
                  var authevent = $injector.get('Authmethod').getAuthevent();
                  var postfix = "_authevent_" + authevent;
                  var loginLocation = $injector.get('$location').url();
                  if (!["/admin/login", "/admin/logout"].includes(loginLocation)) {
                    $injector.get('$cookies').put("redirect" + postfix, loginLocation);
                  }
                  $httpProvider.defaults.headers.common.Authorization = '';
                  $injector.get('$state').go("admin.logout");
                }

                return $q.reject(rejection);
              }
            };
          }
        );
    }
  );

/**
 * Configure storage service prefix
 */
angular
  .module('admin-console')
  .config(
    function(localStorageServiceProvider)
    {
      localStorageServiceProvider.setPrefix('admin-console');
    }
  );


/**
 * If the cookie is there we make the autologin
 */
angular
  .module('admin-console')
  .run(
    function($cookies, $http, Authmethod, ConfigService)
    {
      var adminId = ConfigService.freeAuthId + '';
      var postfix = "_authevent_" + adminId;

      if ($cookies.get("auth" + postfix))
      {
          Authmethod
            .setAuth(
              $cookies.get("auth" + postfix),
              $cookies.get("isAdmin" + postfix),
              adminId
            );
      }
    }
  );

angular
  .module('admin-console')
  .run(
    function(
      $http, 
      $rootScope, 
      ConfigService,
      amMoment,
      $i18next,
      angularLoad
    ) {
      $rootScope.adminTitle = ConfigService.webTitle;
      $rootScope.safeApply = function(fn) 
      {
        var phase = $rootScope.$$phase;
        if (phase === '$apply' || phase === '$digest')
        {
          if (fn && (typeof(fn) === 'function'))
          {
            fn();
          }
        } else
        {
          this.$apply(fn);
        }
      };

      // async load moment i18n
      var lang = $i18next.options.lng;
      angularLoad
        .loadScript(ConfigService.base + '/locales/moment/' + lang + '.js')
        .then(function () {
          amMoment.changeLocale(lang);
        });

      $rootScope.$on(
        '$stateChangeStart',
        function(event, toState, toParams, fromState, fromParams)
        {
          console.log("change start from " + fromState.name + " to " + toState.name);
          $("#angular-preloading").show();
        });

      $rootScope.$on(
        '$stateChangeSuccess',
        function(event, toState, toParams, fromState, fromParams)
        {
          console.log("change success");
          $("#angular-preloading").hide();
          $(window)
            .trigger(
              "angular-state-change-success",
              [event, toState, toParams, fromState, fromParams]
            );
        });
    }
  );


/**
 * This directive allows us to pass a function in on an enter key to do what we want.
 */
angular
.module('admin-console')
.directive(
  'ngEnter',
  function ()
  {
    return function (scope, element, attrs)
    {
      element
        .bind(
          "keydown keypress",
          function (event)
          {
            if (event.which === 13)
            {
              scope.$apply(
                function ()
                {
                  scope.$eval(attrs.ngEnter);
                }
              );

              event.preventDefault();
            }
      });
    };
});

/**
 * Truncate Filter
 * @Param text
 * @Param length, default is 10
 * @Param end, default is "..."
 * @return string
 */
angular.module('admin-console').filter('truncate', function () {
        return function (text, length, end) {
            if (isNaN(length)) {
                length = 10;
            }

            if (end === undefined) {
                end = "...";
            }

            if (text.length <= length || text.length - end.length <= length) {
                return text;
            }
            else {
                return String(text).substring(0, length-end.length) + end;
            }

        };
    });
