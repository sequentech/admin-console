/**
 * @description Service that manages the Admin Plugins extension points.
 *
 * These are the hooks called by agora-gui-admin:
 *
 * - Name: election-modified
 *
 *   Description: called by @a ElectionsApi.setCurrent service before the new
 *   election is set.
 *
 *   Input data: {
 *      // old election object (before setCurrent was called)
 *      "old": Election,
 *
 *      // old new election object that is going to be set
 *      "el": Election
 *   }
 *
 * - Name: send-auth-codes-steps
 *
 *   Description: called by @a SendMsg.calculateSteps service before calculating
 *   the number of steps of the send authentication codes dialog. It's a good
 *   way of modifying @a SendMsg.steps.extra.
 *
 *   Input data: {
 *      // current election object
 *      "el": Election,
 *
 *      // ids of the electorate to which the authentication message is going
 *      // to be set. Might be null if it's all the electorate.
 *      "user_ids": List[Integer]
 *   }
 *
 * - Name: send-auth-codes-confirm-extra
 *
 *   Description: called by @a SendMsg.confirmAuthCodesModal service before
 *   showing the @a SendAuthCodesModalConfirm window when sending authentication
 *   codes to the electorate. This hook allows to set some html to be shown in
 *   the modal window. Note that the html will not be trusted unless you
 *   explicitly make it trusted with @a $sce.
 *
 *   Input data: {
 *      // modifiable list of html strings to shown in the modal confirm window.
 *      // starts empty, but other hook handlers might modify it. It's used as
 *      // the hook's output.
 *      "html": []
 *   }
 *
 * - Name: send-auth-codes-confirm-close
 *
 *   Description: Called by @a .confirmAuthCodesModal service after
 *   closing the @a SendAuthCodesModalConfirm window to process the result of
 *   the modal (this result is the input of the hook) and decide what to do.
 *
 *   Input data: string
 *
 * - Name: send-auth-codes-pre
 *
 *   Description: Called by @a SendMsg.sendAuthCodes before sending auth codes.
 *   Used to decide whether or not to send them - if any hook handler returns
 *   a value interpretable as false, won't send it.
 *
 *   Input data: {
 *      // current election object
 *      "el": Election,
 *
 *      // ids of the electorate to which the authentication message is going
 *      // to be set. Might be null if it's all the electorate.
 *      "user_ids": List[Integer]
 *   }
 *
 * - Name: send-auth-codes-success
 *
 *   Description: Called by @a SendMsg.sendAuthCodes after sending auth codes
 *   when the sending was successful.
 *
 *   Input data: {
 *      // current election object
 *      "el": Election,
 *
 *      // ids of the electorate to which the authentication message is going
 *      // to be set. Might be null if it's all the electorate.
 *      "ids": List[Integer]
 *
 *      // response object from jquery
 *      "response": ResponseObject
 *   }
 *
 * - Name: send-auth-codes-error
 *
 *   Description: Called by @a SendMsg.sendAuthCodes after sending auth codes
 *   when the sending had an error.
 *
 *   Input data: {
 *      // current election object
 *      "el": Election,
 *
 *      // ids of the electorate to which the authentication message is going
 *      // to be set. Might be null if it's all the electorate.
 *      "ids": List[Integer]
 *
 *      // response object from jquery
 *      "response": ResponseObject
 *
 * - Name: add-to-census-pre
 *
 *   Description: Called by @a avAdminElcensus.censusCall just before adding
 *   some electors to the election. A hook handler can cancel the add to census
 *   action return a value interpretable as false.
 *
 *   // List of electors that are about to be added
 *   Input data: List[NewElectorMetadata]
 *
 * - Name: add-to-census-success
 *
 *   Description: Called by @a avAdminElcensus.censusCall after adding
 *   some electors to the election when the call to the API was successful.
 *   Allows the hook handler process the api result.
 *
 *   Input data: {
 *      // List of electors that are about to be added
 *      "data": List[NewElectorMetadata],
 *
 *      // response object from jquery
 *      "response": ResponseObject
 *   }
 *
 * - Name: add-to-census-error
 *
 *   Description: Called by @a avAdminElcensus.censusCall after adding
 *   some electors to the election when the call to the api produced an error.
 *   Allows the hook handler process the api result.
 *
 *   Input data: {
 *      // List of electors that are about to be added
 *      "data": List[NewElectorMetadata],
 *
 *      // response object from jquery
 *      "response": ResponseObject
 *   }
 */
angular.module('avAdmin')
    .factory('AdminPlugins', function() {
        var plugins = {};
        // TODO: What are plugins used for exactly? Please explain
        plugins.plugins = {list: []};

        // Signal storage
        plugins.signals = $.Callbacks("unique");

        /**
         * List of hooks handlers.
         *
         * A hook is a point of extension. Each time @a AdminPlugins.hook()
         * is called, all the hooks are called with the arguments given and in
         * list order, so that they can process the hook.
         *
         * To insert/delete/list hook handlers, access directly to
         * @a AdminPlugins.hooks.
         *
         * Each hook handler is a function that receives two arguments:
         * - hookname
         * - data
         *
         * A hook handler should return a value interpretable as a false
         * expression if it wants no other hook to process the call, or
         * anything else otherwise.
         *
         * Example hook handler:
         *
         * <code>
         *    var fooHookHandler = function(hookname, data) {
         *      if (hookname === "foo") {
         *         processFoo(data);
         *         return false;
         *      }
         *
         *      return true;
         *    };
         *
         *    // add the handler
         *    AdminPlugins.hooks.push(fooHookHandler);
         * </code>
         */
        plugins.hooks = [];

        /*
         * Adds a plugin.
         *
         * plugin format:
         * {
         *   name: 'test',
         *   directive: 'test', (optional, only if this link has a directive)
         *   head: true | false,
         *   link: ui-sref link,
         *   menu: html() | {icon: icon, text: text}
         * }
         */
        plugins.add = function(plugin) {
            plugins.plugins.list.push(plugin);
        };

        /*
         * Clears the plugins list.
         */
        plugins.clear = function() {
            plugins.plugins.list = [];
        };

        /**
         * Remove a plugin from the list.
         */
        plugins.remove = function(plugin) {
            // Implemented by creating a new list without the plugin of that
            // name
            var pluginList = plugins.plugins.list;
            plugins.plugins.list = [];
            pluginList.forEach(function(pluginFromList) {
                if (plugin.name !== pluginFromList.name) {
                    plugins.plugins.list.push(pluginFromList);
                }
            });
        };

        /**
         * Emits a signal by name.
         *
         * @data can be any object or even null.
         */
        plugins.emit = function(signalName, data) {
            plugins.signals.fire(signalName, data);
        };

        /**
         * Calls to a hook by name.
         *
         * Each function stored as a hook is called with the provided
         * @a hookname and @a data in the hook insertion order. When a hook
         * returns a value interpretable as false, no more hooks are called.
         *
         * @a data can be any object or even null.
         * @a hookname should be a string.
         *
         * @returns false if any of the hooks returns false, or true otherwise.
         */
        plugins.hook = function(hookname, data) {
            for (var i=0; i<plugins.hooks.length; i++) {
                var h = plugins.hooks[i];
                var ret = h(hookname, data);
                if (!ret) {
                    return false;
                }
            }
            return true;
        };

        return plugins;
    });

/**
 * Directive to include angular templates with directives from plugins into
 * the admin interface
 * This directive is based on the stackoverflow thread:
 * http://stackoverflow.com/questions/17417607/angular-ng-bind-html-unsafe-and-directive-within-it
 **/
angular.module('avAdmin')
.directive('avPluginHtml', function ($compile) {
    return function(scope, element, attrs) {
        scope.$watch(
            function(scope) {
                return scope.$eval(attrs.html);
            },
            function(value) {
                element.html(value);
                $compile(element.contents())(scope);
            }
        );
    };
});
