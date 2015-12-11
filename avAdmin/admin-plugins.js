angular.module('avAdmin')
    .factory('AdminPlugins', function() {
        var plugins = {};
        plugins.plugins = {list: []};
        plugins.signals = $.Callbacks("unique");
        plugins.hooks = [];

        plugins.add = function(p) {
            // plugin format
            // {
            //  name: 'test',
            //  directive: 'test', (optional, only if this link has a directive)
            //  head: true | false,
            //  link: ui-sref link,
            //  menu: html() | {icon: icon, text: text}
            // }
            plugins.plugins.list.push(p);
        };

        plugins.reload = function(np) {
            var ps = plugins.plugins.list;
            plugins.plugins.list = [];
            ps.forEach(function(p) {
                if (np.name === p.name) {
                    plugins.plugins.list.push(np);
                } else {
                    plugins.plugins.list.push(p);
                }
            });
        };

        plugins.clear = function() {
            plugins.plugins.list = [];
        };

        plugins.remove = function(np) {
            var ps = plugins.plugins.list;
            plugins.plugins.list = [];
            ps.forEach(function(p) {
                if (np.name !== p.name) {
                    plugins.plugins.list.push(p);
                }
            });
        };

        plugins.emit = function(signame, data) {
            plugins.signals.fire(signame, data);
        };

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

        $(document).ready(function() {
            plugins.emit('plugins-loaded', {msg: 'ok'});
            if (!plugins.hook('plugins-loaded', {msg: 'ok'})) {
                console.log("hook-loaded false");
            } else {
                console.log("hook-loaded true");
            }
        });

        window.plugins = plugins;

        return plugins;
    });
