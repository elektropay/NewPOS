angular.module('dual.api', [])
.factory('frontApi',function($http,$q,$ionicPopup,$ionicLoading){
 return{
     request:function(method,url,data,params,contentType){
           
              var currentUrl=url
            
              data=data || {};
              params=params || {};
              var contentType= contentType || { 'Content-Type': 'application/json; charset=UTF-8'};
              
              $http({
                      method: method,
                      url: currentUrl,
                      headers: contentType,
                      data:data,
                      params:params,
                  }).success(function(data){
                    
                  }).error(function(err){
                    

                  }).finally(function() {
                   
        });
          
    }
}
})