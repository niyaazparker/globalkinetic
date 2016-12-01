window.onload = function() {
  var startPos;
  var geoOptions = {
    enableHighAccuracy: true
  }

  var geoSuccess = function(position) {
    startPos = position;
    document.getElementById('startLat').innerHTML = startPos.coords.latitude;
    document.getElementById('startLon').innerHTML = startPos.coords.longitude;
  };
  var geoError = function(error) {
    console.log('Error occurred. Error code: ' + error.code);
    // error.code can be:
    //   0: unknown error
    //   1: permission denied
    //   2: position unavailable (error response from location provider)
    //   3: timed out
  };

  navigator.geolocation.getCurrentPosition(geoSuccess, geoError, geoOptions);
};

var App = angular.module("weatherApp", ['ngRoute', 'ngAnimate', 'weatherControllers', 'weatherServices']);

App.config(['$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {
    $routeProvider.when('/', {
      templateUrl: 'js/views/weather.html',
      controller: 'GetWeatherCtrl'
    });
  }
])


var weatherControllers = angular.module("weatherControllers", []);
weatherControllers.controller("AppController", ['$route', '$routeParams', '$location',
  function($route, $routeParams, $location) {

  }
]);

weatherControllers.controller("GetWeatherCtrl", ['$scope', 'weatherApi',
  function($scope, weatherApi) {
    $scope.currentTime = moment().format('h:mm a');
    weatherApi.getLocation().then(function(res) {            
      weatherApi.getWeeklyWeather(res.data.city+","+res.data.country_code).then(function(response) {
        $scope.data = response.data;
        if ($scope.data.list.length) {
          $scope.data.list.forEach(function(i, v) {
            var date = moment(i.dt * 1000);
            i.dt = {
              day: date.format("ddd")
            };
            if (moment().format("d") == date.format("d")) {
              i.dt.today = true;
            }
          });
        }
      });
    });
  }
]);

var weatherServices = angular.module('weatherServices', []);

weatherServices.factory('weatherApi', ['myHttp',
  function(myHttp) {
    return {
      getLocation: function() {
        return myHttp.jsonp("http://ip-api.com/json/?callback=JSON_CALLBACK");
      },
      getWeeklyWeather: function(city) {        
        return myHttp.get('http://api.openweathermap.org/data/2.5/forecast/daily?q='+city+'&mode=json&units=metric');
      }
    }
  }
]);


weatherServices.factory('myHttp', ['$http', 'myCache',
  function($http, myCache) {

    var headers = {
      'cache': myCache,
      'dataType': 'json'
    };
    var APPID = "53f9d8e4213222cf517d86dc406d67fc";
    return {
      config: headers,
      get: function(url, success, fail) {
        return $http.get(url + "&APPID=" + APPID, this.config);
      },
      getLocal: function(url, success, fail) {
        return $http.get(url);
      },
      jsonp: function(url, success, fail) {
        return $http.jsonp(url, this.config);
      }
    };
  }
]);

weatherServices.factory('myCache', function($cacheFactory) {
  return $cacheFactory('myCache', {
    capacity: 100
  });
});

function JSON_CALLBACK(){
  
}