var authUrl = 'http://localhost:55368/umbraco/oauth/token';
var apiBase = 'http://localhost:55368/umbraco/rest/v1/';

var ionicApp = angular.module('ionicApp', ['ionic', 'restangular']);

// Restangular configuration
ionicApp.config(function (RestangularProvider) {
    // Set the base url for your API endpoints
    RestangularProvider.setBaseUrl(apiBase);

    // You can set some default headers for calling the API
    RestangularProvider.setDefaultHeaders(
        { 'Accept': 'application/hal+json' },
        { 'Content-Type': 'application/hal+json' }
    );

    // Set an interceptor in order to parse the API response 
    // when getting a list of resources
    RestangularProvider.setResponseInterceptor(function (data, operation, what) {
        if (operation == 'getList') {
            resp = data._embedded[what];
            resp._links = data._links;
            return resp;
        }
        return data;
    });

    // Using self link for self reference resources
    RestangularProvider.setRestangularFields({
        selfLink: 'self.link'
    });
});

// My Controller - main
ionicApp.controller('MyCtrl', ['$scope', '$timeout', 'contentResource', 'authResource',
    function ($scope, $timeout, contentResource, authResource) {

        $scope.init = function () {

            // Get access token for back office user (can be different for different apps) - Temporary
            // Probably will be deprecated regarding to plans of changing the authentication method(s).
            // Remember to not expose user credentials in production apps!!! This is just PoC.
            var accessTokenResponse = authResource.getAccessToken('password', 'api', 'password');
            accessTokenResponse.then(function (response) {
                $scope.tokenResponse = response;

                console.log($scope.tokenResponse);

                $scope.loadRootItems();
            });
        };

        $scope.loadRootItems = function () {

            // Get root items with passed authorization details to authenticate the request
            var rootItems = contentResource.getRootItems($scope.tokenResponse.token_type + ' ' + $scope.tokenResponse.access_token);
            rootItems.then(function (response) {
                console.log(response);

                $scope.items = response;
            });

        };

        $scope.doRefresh = function () {

            console.log('Refreshing!');
            $timeout(function () {

                // Re-load root items
                $scope.loadRootItems();

                // Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');

            }, 1000);

        };

        $scope.init();

    }]);

// Authentication service
ionicApp.factory('authResource', function ($http) {

    var getAccessToken = function (grantType, username, password) {

        var postData = {
            grant_type: grantType,
            username: username,
            password: password
        };

        return $http.post(authUrl, postData, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            transformRequest: function (obj) {
                var str = [];
                for (var p in obj)
                    if (obj.hasOwnProperty(p)) str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            }
        }).then(function (response) {
            return response.data;
        });

    };

    return {
        getAccessToken: getAccessToken
    }
});

// Content service - very basic!
ionicApp.factory('contentResource', function ($http, Restangular) {

    var getRootItems = function (authorization) {

        return Restangular.all("content").getList({}, { 'Authorization': authorization });

    }

    return {
        getRootItems: getRootItems
    }

});