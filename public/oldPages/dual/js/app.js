// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('dual', ['ionic', 'dual.controllers'])

.run(function($ionicPlatform,$rootScope) {
  $rootScope.$on('$locationChangeStart', function() {
           try{
           $rootScope.URL=arguments[1]; 
         }catch(ex){}
           
          
            //CONFIG.currentURL=arguments;
            //
          //  alert(!Object.keys(CONFIG.info).length)
           // if(!Object.keys(CONFIG.info).length) $location.path("/index/home");
  });
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
   
  .state('index', {
    url: '/index',
        templateUrl: 'templates/index.html',
        controller: 'IndexCtrl'
   })
  .state('payment', {
    url: '/payment',
        templateUrl: 'templates/payment.html',
         controller: 'PaymentCtrl'  
   })
   .state('receipt', {
    url: '/receipt',
        templateUrl: 'templates/receipt.html',
         controller: 'ReceiptCtrl'  
   })
    .state('signature', {
    url: '/signature',
        templateUrl: 'templates/signature.html',
        controller: 'SignatureCtrl'   
   })
  .state('customer', {
    url: '/customer',
        templateUrl: 'templates/customer.html',
         controller: 'CustomerCtrl'   
       
   })
  .state('process', {
    url: '/process',
        templateUrl: 'templates/processing.html',
        controller: 'ProcessCtrl',
        params:{args:{}}
           
       
   })
   .state('thanks', {
    url: '/thanks',
        templateUrl: 'templates/thanks.html',
        controller: 'ThanksCtrl'
         
       
   })
    .state('email', {
    url: '/email',
        templateUrl: 'templates/email.html',
          controller: 'EmailCtrl'   
       
   });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/index');

});
 
/* 
 $state.go('producer', {producerId: producerId});

var producerId = $stateParams.producerId;

$broadcast会把事件广播给所有子controller，而$emit则会将事件冒泡传递给父controller，$on则是
.controller('innerCtrlA', ['$scope', '$rootScope', function($scope, $rootScope){
    $scope.change = function(){
        // 广播事件
        $rootScope.$broadcast('nameChanged', $scope.name);
    }
    $rootScope.$on('nameChanged', function(event, data){
        $scope.name = data;
    })
}])

.controller('innerCtrlB', ['$scope', '$rootScope', function($scope, $rootScope){
    $scope.change = function(){
        $rootScope.$broadcast('nameChanged', $scope.name);
    }
    // 监听事件
    $rootScope.$on('nameChanged', function(event, data){
        $scope.name = data;
    })
}])*/