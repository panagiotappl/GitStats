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
                        $scope.setPieChart(response.com_stats.com_per_author);
                    }).
                    error(function(error) {

                    });

                };

                $scope.setPieChart = function(com_auth){
                    console.log(com_auth);
                    var values = [];
                    var keys = Object.keys(com_auth);
                    $.each( com_auth, function( key, value ) {


                        console.log(key);

                        values.push({"label": key, "value": value});

                    });
                    console.log(values);
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

            }
        ]);

}());