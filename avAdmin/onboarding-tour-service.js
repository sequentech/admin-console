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
  .factory(
    'OnboardingTourService',
    function($window)
    {
        return function (el)
        {
            var hopscotch = $window.hopscotch;
            var autolaunchTour = {
                state: null,
                tour:  null
            };

            function stateCallback(jQueryEvent, angularEvent, toState, toParams, fromState, fromParams)
            {
                console.log("stateCallBack, state=" + toState.name);
                if (!autolaunchTour.tour || !toState || !toState.name || toState.name !== autolaunchTour.state)
                {
                    console.log("stateCallBack, ignoring");
                    return;
                }
                $($window).off("angular-state-change-success", stateCallback);
                console.log("stateCallBack, launching tour");
                var nextTour = autolaunchTour.tour;
                autolaunchTour.tour = autolaunchTour.state = null;
                setTimeout(
                    function () { hopscotch.startTour(nextTour); },
                    300);
            }
            $($window).on("angular-state-change-success", stateCallback);

            function closeTour()
            {
                $(".onboarding-focus").removeClass("onboarding-focus");
                $("#onboarding-overlay").fadeOut({complete: function() { $(this).remove(); }});
            }

            function onStartTour()
            {
                console.log("onStart");
                $("#onboarding-css").remove();
                $('<style id="onboarding-css">' +
                '#onboarding-overlay {' +
                'position:absolute;' +
                'z-index: 99999;' +
                'top:0;' +
                'left:0;' +
                'width:100%;' +
                'height:1000%;' +
                'background-color:#000000;' +
                'opacity: 0.5;' +
                '}' +
                '.onboarding-focus {' +
                'z-index: 100000;' +
                'position: relative;' +
                '}' +
                '[av-admin-sidebar] li > a.onboarding-focus, ul[ng-if=\'current\'].onboarding-focus, .statusbar.row.text-center.onboarding-focus, .navbar-admin .navbar-nav>li>a {' +
                'background-color: white;' +
                '}' +
                '[av-admin-sidebar] li > a.onboarding-focus:hover {' +
                'background-color: #959292;' +
                '}' +
                '</style>').appendTo("body");
                $("#onboarding-overlay").remove();
                $('<div id="onboarding-overlay"></div>').hide().appendTo("body").fadeIn();
            }

            var helpTour = {
                id: "help-hopscotch",
                steps: [
                    {
                        title: $window.i18next.t("avAdmin.onboarding.help_tour.step0_help_title"),
                        content: $window.i18next.t("avAdmin.onboarding.help_tour.step0_help_content"),
                        target: "#navbar-collapse-1 .help-dropdown a",
                        highlightTarget: "#navbar-collapse-1 .help-dropdown a",
                        placement: "bottom"
                    },
                    {
                        title: $window.i18next.t("avAdmin.onboarding.help_tour.step1_chat_title"),
                        content: $window.i18next.t("avAdmin.onboarding.help_tour.step1_chat_content"),
                        target: ".zsiq_cnt",
                        highlightTarget: ".zsiq_cnt",
                        placement: "top",
                        xOffset: -50,
                        arrowOffset: "center"
                    }
                ],
                onStart: onStartTour,
                onStop: closeTour,
                onEnd: closeTour,
                onClose: closeTour
            };

            var dashboardTour = {
                id: "dashboard-hopscotch",
                steps: [
                    {
                        title: $window.i18next.t("avAdmin.onboarding.dashboard_tour.step2_status_title"),
                        content: $window.i18next.t("avAdmin.onboarding.dashboard_tour.step2_status_content"),
                        target: ".statusbar.row.text-center",
                        highlightTarget: ".statusbar.row.text-center",
                        placement: "bottom"
                    },
                    {
                        title: $window.i18next.t("avAdmin.onboarding.dashboard_tour.step3_start_title"),
                        content: $window.i18next.t("avAdmin.onboarding.dashboard_tour.step3_start_content"),
                        target: "button.actionbtn.btn.election-status-action-2",
                        highlightTarget: "button.actionbtn.btn.election-status-action-2",
                        placement: "top",
                        nextOnTargetClick: true,
                        showNextButton: false
                    }
                ],
                onStart: onStartTour,
                onStop: function()
                {
                    closeTour();
                    setTimeout(function () { hopscotch.startTour(helpTour); }, 300);
                },
                onEnd: closeTour,
                onClose: function()
                {
                    closeTour();
                    setTimeout(function () { hopscotch.startTour(helpTour); }, 300);
                }
            };

            var tour = {
                id: "hello-hopscotch",
                steps: [
                    {
                        title: $window.i18next.t("avAdmin.onboarding.hello_tour.step0_create_title"),
                        content: $window.i18next.t("avAdmin.onboarding.hello_tour.step0_create_content"),
                        target: "a[ui-sref='admin.new()']",
                        highlightTarget: "a[ui-sref='admin.new()']",
                        placement: "right",
                        width: 650,
                        nextOnTargetClick: true,
                        showNextButton: false
                    },
                    {
                        title: $window.i18next.t("avAdmin.onboarding.hello_tour.step1_change_title"),
                        content: $window.i18next.t("avAdmin.onboarding.hello_tour.step1_change_content"),
                        target: "[title='avAdmin.basic.title.label']",
                        highlightTarget: "[title='avAdmin.basic.title.label']",
                        placement: "bottom",
                        delay: 300
                    },
                    {
                        title: $window.i18next.t("avAdmin.onboarding.hello_tour.step2_sidebar_title"),
                        content: $window.i18next.t("avAdmin.onboarding.hello_tour.step2_sidebar_content"),
                        target: "ul[ng-if='current']",
                        highlightTarget: "ul[ng-if='current']",
                        placement: "right"
                    },
                    {
                        title: $window.i18next.t("avAdmin.onboarding.hello_tour.step3_review_title"),
                        content: $window.i18next.t("avAdmin.onboarding.hello_tour.step3_review_content"),
                        target: "a[href='/admin/create/']",
                        highlightTarget: "a[href='/admin/create/']",
                        placement: "right",
                        nextOnTargetClick: true,
                        showNextButton: false
                    },
                    {
                        title: $window.i18next.t("avAdmin.onboarding.hello_tour.step4_create2_title"),
                        content: $window.i18next.t("avAdmin.onboarding.hello_tour.step4_create2_content"),
                        target: "button[ng-click='createElections()']",
                        highlightTarget: "button[ng-click='createElections()']",
                        placement: "top",
                        nextOnTargetClick: true,
                        showNextButton: false,
                        delay: 300
                    }
                ],
                onStart: onStartTour,
                onStop: closeTour,
                onEnd: function()
                {
                    closeTour();
                    autolaunchTour.state = "admin.dashboard";
                    autolaunchTour.tour = dashboardTour;
                },
                onClose: function()
                {
                    closeTour();
                    setTimeout(function () { hopscotch.startTour(helpTour); }, 300);
                }
            };

            // Start the tour!
            hopscotch.listen(
                "show",
                function()
                {
                    console.log("hopscotch::show to highlight focus");
                    $(".onboarding-focus").removeClass("onboarding-focus");
                    $(hopscotch.getCurrTour().steps[hopscotch.getCurrStepNum()].highlightTarget).addClass("onboarding-focus");
                }
            );
            hopscotch.startTour(tour);
        };
    }
   );
