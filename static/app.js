(function () {

    'use strict';

    angular.module('gitApp', [])
        .config(function($interpolateProvider) {
            $interpolateProvider.startSymbol('//');
            $interpolateProvider.endSymbol('//');
        })
        .controller('gitController', ['$scope', '$http', '$location',  '$anchorScroll',
            function($scope, $http, $location, $anchorScroll) {

                $scope.idle = true;
                $scope.processing = false;
                $scope.results = false;

                $scope.getResults = function() {
                    $scope.results = false;
                    $scope.error = false;

                    // get the URL from the input
                    var userInput = $scope.path;

                    // fire the API request
                    $scope.idle = false;
                    $scope.processing = true;

                    $http.post('/analyze', {"path": userInput}).
                    then(function(response) {
                                                console.log(userInput);

                        console.log(response);
                        $scope.processing = false;
                        $scope.results = true;
                        $scope.result = response.data;
                        $scope.setcharts($scope.result.com_stats.com_per_author, $scope.result.br_stats.branchCommits, $scope.result.br_stats.branchCommitsR);
                        $scope.setCom_br_authL($scope.result.br_stats.com_br_authL);
                        $scope.setCom_br_authR($scope.result.br_stats.com_br_authR);
                        event.preventDefault();

                        $(document).ready(function() {
                            $('html, body').animate({
                                scrollTop: $('#general').offset().top
                            }, 900, function () {
                                window.location.hash = '#general';
                            });
                        });
                    }, function(error) {
                        console.log(userInput);
                        $scope.error = true;
                        $scope.processing = false;

                    });

                };

                $scope.setCom_br_authL = function(data){
                    $scope.com_br_authL = [];
                    var keys = Object.keys(data);
                    $.each(data, function( key, value ) {

                        for(var i = 0; i < value.length; i++){
                            var subvalue = [];
                            subvalue.push(key);
                            for(var j = 0; j < value[i].length; j++) {

                                subvalue.push(value[i][j]);
                            }
                            $scope.com_br_authL.push(subvalue);

                        }

                    });
                    console.log($scope.com_br_authL);
                }

                $scope.setCom_br_authR = function(data){
                    $scope.com_br_authR = [];
                    var keys = Object.keys(data);
                    $.each(data, function( key, value ) {

                        for(var i = 0; i < value.length; i++){
                            var subvalue = [];
                            subvalue.push(key);
                            for(var j = 0; j < value[i].length; j++) {

                                subvalue.push(value[i][j]);
                            }
                            $scope.com_br_authR.push(subvalue);

                        }

                    });
                    console.log($scope.com_br_authR);
                }
                $scope.setcharts = function(com_auth, branch_commits, branch_commitsR){
                    var values = [];
                    var keys = Object.keys(com_auth);
                    $.each( com_auth, function( key, value ) {
                        values.push({"label": key, "value": value});
                    });
                    var pie = {
                        "footer": {
                            "color": "#999999",
                            "fontSize": 10,
                            "font": "open sans",
                            "location": "bottom-left"
                        },
                        "size": {
                            "canvasWidth": 590,
                            "pieOuterRadius": "90%"
                        },
                        "data": {
                            "sortOrder": "value-desc",
                            "content": values
                        },
                        "labels": {
                            "outer": {
                                "pieDistance": 32
                            },
                            "inner": {
                                "hideWhenLessThanPercentage": 3
                            },
                            "mainLabel": {
                                "fontSize": 11
                            },
                            "percentage": {
                                "color": "#ffffff",
                                "decimalPlaces": 0
                            },
                            "value": {
                                "color": "#adadad",
                                "fontSize": 11
                            },
                            "lines": {
                                "enabled": true
                            },
                            "truncation": {
                                "enabled": true
                            }
                        },
                        "effects": {
                            "pullOutSegmentOnClick": {
                                "effect": "linear",
                                "speed": 400,
                                "size": 8
                            }
                        },
                        "misc": {
                            "gradient": {
                                "enabled": true,
                                "percentage": 100
                            }
                        }
                    };






                    var values2 = [];
                    var keys = Object.keys(branch_commits);
                    $.each(branch_commits, function( key, value ) {
                        values2.push({"branch": key, "per": value});
                    });
                    var chaaart =  {
                        "type": "serial",
                        "theme": "light",
                        "startEffect": "easeOutSine",
                        "dataProvider": values2,

                        "valueAxes": [ {
                            "title": "Percentage of all commits",
                            "gridColor": "#FFFFFF",
                            "gridAlpha": 0.2,
                            "dashLength": 0
                        } ],
                        "gridAboveGraphs": true,
                        "startDuration": 1,
                        "graphs": [ {

                            "fillAlphas": 0.8,
                            "fillColors": "teal",
                            "lineAlpha": 0.2,
                            "type": "column",
                            "valueField": "per"
                        } ],
                        "chartCursor": {
                            "categoryBalloonEnabled": false,
                            "cursorAlpha": 0,
                            "zoomable": false
                        },
                        "categoryField": "branch",
                        "categoryAxis": {
                            "gridPosition": "start",
                            "gridAlpha": 0,
                            "labelRotation": 45,
                            "tickPosition": "start",
                            "tickLength": 10
                        },
                        "export": {
                            "enabled": true
                        }

                    };

                    var values3 = [];
                    var keys = Object.keys(branch_commitsR);
                    $.each(branch_commitsR, function( key, value ) {
                        values3.push({"branch": key, "per": value});
                    });
                    var chaaart2 =  {
                        "type": "serial",
                        "theme": "light",
                        "startEffect": "easeOutSine",
                        "dataProvider": values3,

                        "valueAxes": [ {
                            "title": "Percentage of all commits",
                            "gridColor": "#FFFFFF",
                            "gridAlpha": 0.2,
                            "dashLength": 0
                        } ],
                        "gridAboveGraphs": true,
                        "startDuration": 1,
                        "graphs": [ {

                            "fillAlphas": 0.8,
                            "fillColors": "teal",
                            "lineAlpha": 0.2,
                            "type": "column",
                            "valueField": "per"
                        } ],
                        "chartCursor": {
                            "categoryBalloonEnabled": false,
                            "cursorAlpha": 0,
                            "zoomable": false
                        },
                        "categoryField": "branch",
                        "categoryAxis": {
                            "gridPosition": "start",
                            "gridAlpha": 0,
                            "labelRotation": 45,
                            "tickPosition": "start",
                            "tickLength": 10
                        },
                        "export": {
                            "enabled": true
                        }

                    };
                 //   chart.dataProvider = values;
                  //  chart.validateData();
                    var chart = undefined;
                    var chart2 = undefined;
                    var pie1 = undefined;
                    $(window).scroll(function() {
                        var hT1 = $('#pieChart').offset().top,
                            hH1 = $('#pieChart').outerHeight(),
                            wH = $(window).height(),
                            wS = $(this).scrollTop();

                         var hT2 = $('#chartdiv2').offset().top,
                            hH2 = $('#chartdiv2').outerHeight(),
                            wH = $(window).height(),
                            wS = $(this).scrollTop();

                        var hT = $('#chartdiv').offset().top,
                            hH = $('#chartdiv').outerHeight(),
                            wH = $(window).height(),
                            wS = $(this).scrollTop();
                        if (wS > (hT+hH-wH)){
                            if(chart == undefined)
                                chart = AmCharts.makeChart("chartdiv", chaaart);
                        }
                        if (wS > (hT1+hH1-wH)){
                            if(pie1 == undefined)
                                pie1 = new d3pie("pieChart", pie);
                        }
                        if (wS > (hT2+hH2-wH)){
                            if(chart2 == undefined)
                                chart2 = AmCharts.makeChart("chartdiv2", chaaart2);
                        }

                        if(chart != undefined && pie1 != undefined && chart2 != undefined)
                                $(window).off('scroll')


                    });


                };

            }
        ]);

}());