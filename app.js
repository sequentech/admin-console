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

window.avConfigData.base = '/admin';

angular.module(
  'agora-gui-admin',
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
  'avConfig',
  'avPluginsConfig',
  'jm.i18next',
  'avUi',
  'ngOnboarding',
  'avRegistration',
  'avTest',
  'avAdmin',
  'angularFileUpload',
  'dndLists',
  'angularLoad',
  'angular-date-picker-polyfill',
  'ng-autofocus',
  'LocalStorageModule',
  'agora-gui-common'
]);

angular.module('jm.i18next').config(function ($i18nextProvider, ConfigServiceProvider) {
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
    ConfigServiceProvider.i18nextInitOptions);
});

angular.module('agora-gui-admin').config(function($sceDelegateProvider, ConfigServiceProvider) {
  $sceDelegateProvider.resourceUrlWhitelist(ConfigServiceProvider.resourceUrlWhitelist);
});

angular.module('agora-gui-admin').config(
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
        url: '/new',
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
});

/**
 * Caching http response error to deauthenticate
 */
angular.module('agora-gui-admin').config(
  function($httpProvider) {
    $httpProvider.interceptors.push(function($q, $injector) {
      return {
        'responseError': function(rejection) {
            if (rejection.data && rejection.data.error_codename &&
              _.contains(
                ['expired_hmac_key', 'empty_hmac', 'invalid_hmac_userid'],
                rejection.data.error_codename))
            {
              $httpProvider.defaults.headers.common.Authorization = '';
              $injector.get('$state').go("admin.logout");
            }
            return $q.reject(rejection);
        }
      };
    });
  }
);

/**
 * Configure the prefix for
 */
angular.module('agora-gui-admin').config(
  function(localStorageServiceProvider)
  {
    localStorageServiceProvider.setPrefix('agora-gui-admin');
  }
);


/**
 * IF the cookie is there we make the autologin
 */
angular.module('agora-gui-admin').run(function($cookies, $http, Authmethod, ConfigService) {
    var adminId = ConfigService.freeAuthId + '';
    var postfix = "_authevent_" + adminId;
    if ($cookies["auth" + postfix]) {
        Authmethod.setAuth($cookies["auth" + postfix], $cookies["isAdmin" + postfix], adminId);
    }
});

angular.module('agora-gui-admin').run(function($http, $rootScope, ConfigService) {

  $rootScope.adminTitle = ConfigService.webTitle;
  $rootScope.safeApply = function(fn) {
    var phase = $rootScope.$$phase;
    if (phase === '$apply' || phase === '$digest') {
      if (fn && (typeof(fn) === 'function')) {
        fn();
      }
    } else {
      this.$apply(fn);
    }
  };

  $rootScope.$on('$stateChangeStart',
    function(event, toState, toParams, fromState, fromParams) {
      console.log("change start from " + fromState.name + " to " + toState.name);
      $("#angular-preloading").show();
    });
  $rootScope.$on('$stateChangeSuccess',
    function(event, toState, toParams, fromState, fromParams) {
      console.log("change success");
      $("#angular-preloading").hide();
      $(window).trigger("angular-state-change-success", [event, toState, toParams, fromState, fromParams]);
    });
});


/*
This directive allows us to pass a function in on an enter key to do what we want.
 */
angular.module('agora-gui-admin').directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });

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
angular.module('agora-gui-admin').filter('truncate', function () {
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
