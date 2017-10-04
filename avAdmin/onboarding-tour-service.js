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
    'OnboardingTourService',
    function()
    {
        return function (el)
        {
            var hopscotch = window.hopscotch;
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
                $(window).off("angular-state-change-success", stateCallback);
                console.log("stateCallBack, launching tour");
                var nextTour = autolaunchTour.tour;
                autolaunchTour.tour = autolaunchTour.state = null;
                setTimeout(
                    function () { hopscotch.startTour(nextTour); },
                    300);
            }
            $(window).on("angular-state-change-success", stateCallback);

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
                        title: "Help",
                        content: "If you need any further help, you can click here to get it. You can <strong>launch again the tour</strong> there too!",
                        target: "#navbar-collapse-1 .help-dropdown a",
                        highlightTarget: "#navbar-collapse-1 .help-dropdown a",
                        placement: "bottom"
                    },
                    {
                        title: "Assistance",
                        content: "If you have any question, we'll be glad to answer you quickly through the chat.",
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
                        title: "Test election",
                        content: "You have created a test election. Test elections have limited census size and a real election can only be created out of a successfully tallied test election.",
                        target: ".head-notification.warn-notification.ng-scope",
                        highlightTarget: ".head-notification.warn-notification.ng-scope",
                        placement: "bottom"
                    },
                    {
                        title: "Real election",
                        content: "Once this election is tallied, you will be able to create a real election clicking here.",
                        target: "button[ng-click='clickOnCreateRealElection()']",
                        highlightTarget: "button[ng-click='clickOnCreateRealElection()']",
                        placement: "top"
                    },
                    {
                        title: "Election status",
                        content: "This section shows you the state of the election and a button to move election to the next status.",
                        target: ".statusbar.row.text-center",
                        highlightTarget: ".statusbar.row.text-center",
                        placement: "bottom"
                    },
                    {
                        title: "Start the election",
                        content: "Click this button to start the election and send an authentication email to all census.",
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
                    hopscotch.startTour(helpTour);
                },
                onEnd: closeTour,
                onClose: function()
                {
                    closeTour();
                    hopscotch.startTour(helpTour);
                }
            };

            var tour = {
                id: "hello-hopscotch",
                steps: [
                    {
                        title: "Create an election",
                        content: "Start creating a test election clicking in the <strong>New Election</strong> button. <br><br>Or watch our intro video:<br/>VIDEO_HERE",
                        target: "a[ui-sref='admin.new()']",
                        highlightTarget: "a[ui-sref='admin.new()']",
                        placement: "right",
                        nextOnTargetClick: true,
                        showNextButton: false
                    },
                    {
                        title: "Change the title",
                        content: "Now you can edit all the details of the election, for example you could edit the election clicking title here.",
                        target: "[title='avAdmin.basic.title.label']",
                        highlightTarget: "[title='avAdmin.basic.title.label']",
                        placement: "bottom",
                        delay: 300
                    },
                    {
                        title: "Sidebar",
                        content: "You can personalize the election clicking through these sections.",
                        target: "ul[ng-if='current']",
                        highlightTarget: "ul[ng-if='current']",
                        placement: "right"
                    },
                    {
                        title: "Review election to create it",
                        content: "Once you are done, click the <strong>Create Election</strong> button to review and then create the election.",
                        target: "a[href='/admin/create/']",
                        highlightTarget: "a[href='/admin/create/']",
                        placement: "right",
                        nextOnTargetClick: true,
                        showNextButton: false
                    },
                    {
                        title: "Create the election",
                        content: "Click this button to create the election. <br><br>Note that the election won't be created until you do so, and for security reasons it won't be editable afterwards.",
                        target: "button[ng-click='createElections()']",
                        highlightTarget: "button[ng-click='createElections()']",
                        placement: "top",
                        nextOnTargetClick: true,
                        showNextButton: false,
                        delay: 300
                    },
                    {
                        title: "Create the election",
                        content: "<strong>Click this button</strong> to create the election. <br><br>Note that the election won't be created until you do so, and for security reasons it won't be editable afterwards.",
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
                    hopscotch.startTour(helpTour);
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
