(function () {

    'use strict';

    angular.module('gitApp', [])
        .config(function($interpolateProvider) {
            $interpolateProvider.startSymbol('//');
            $interpolateProvider.endSymbol('//');
        })
        .controller('gitController', ['$scope', '$http',
            function($scope, $http) {

                $scope.idle = true;
                $scope.processing = false;
                $scope.results = false;

                $scope.getResults = function() {
                    $scope.results = false;

                    // get the URL from the input
                    var userInput = $scope.path;

                    // fire the API request
                    $scope.idle = false;
                    $scope.processing = true;

                    $http.post('/analyze', {"path": userInput}).
                    success(function(response) {
                        $scope.processing = false;
                        $scope.results = true;
                        $scope.result = response;
                        console.log(response);
                        $scope.setPieChart(response.com_stats.com_per_author);
                        $scope.setBarChart(response.br_stats.branchCommits);
                    }).
                    error(function(error) {

                    });

                };

                $scope.setPieChart = function(com_auth){
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

                    $(window).scroll(function() {
                        var hT = $('#pieChart').offset().top,
                            hH = $('#pieChart').outerHeight(),
                            wH = $(window).height(),
                            wS = $(this).scrollTop();
                        if (wS > (hT+hH-wH)){
                            new d3pie("pieChart", pie);
                            $(window).off('scroll')
                        }
                    });
                }

                $scope.setBarChart = function(branch_commits){
                    AmCharts.lazyLoadMakeChart = AmCharts.makeChart;

                    // override makeChart function
                    AmCharts.makeChart = function(a, b, c) {

                      // set scroll events
                      jQuery(document).on('scroll load touchmove', handleScroll);
                      jQuery(window).on('load', handleScroll);

                      function handleScroll() {
                        var $ = jQuery;
                        if (true === b.lazyLoaded)
                          return;
                        var hT = $('#' + a).offset().top,
                          hH = $('#' + a).outerHeight() / 2,
                          wH = $(window).height(),
                          wS = $(window).scrollTop();
                        if (wS > (hT + hH - wH)) {
                          b.lazyLoaded = true;
                          AmCharts.lazyLoadMakeChart(a, b, c);
                          return;
                        }
                      }

                      // Return fake listener to avoid errors
                      return {
                        addListener: function() {}
                      };
                    };
                    var values = [];
                    var keys = Object.keys(branch_commits);
                    $.each(branch_commits, function( key, value ) {
                        values.push({"branch": key, "per": value});
                    });
                    var chart = AmCharts.makeChart( "chartdiv", {
                      "type": "serial",
                      "theme": "light",
                      "startEffect": "easeOutSine",
                      "dataProvider":values,

                      "valueAxes": [ {
                        "title": "Percentage of all commits",
                        "gridColor": "#FFFFFF",
                        "gridAlpha": 0.2,
                        "dashLength": 0
                      } ],
                      "gridAboveGraphs": true,
                      "startDuration": 1,
                      "graphs": [ {
                        "balloonText": "[[category]]: <b>[[value]]</b>",
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

                    });
                }

            }
        ]);

}());