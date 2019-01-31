
angular.module('starter.controllers', [])
.controller('IndexCtrl', function($scope,$location, $stateParams,$timeout,$ionicLoading,$interval,$window,$http,$ionicScrollDelegate) {
var headHeight=60;
var headCount=10;
//00,01,10,11
$scope.orderItems={};
$scope.orderItemsLen={};
$scope.orderItemsShow={};
$scope.orderItemsShow["A"]=false;
$scope.orderItems["A"]=[];
$scope.orderItemsLen["A"]=10;
$scope.orderItemsShow["B"]=false;
$scope.orderItems["B"]=[];
$scope.orderItemsLen["B"]=10;
var ip=$location.host();
var port=$location.port();
$scope.photoUrl="http://"+ip+":"+port+"/kpos/";
var soapServiceURL = "http://"+ip+":"+port+"/kpos/ws/kposService";
var defaultPhotoUrl="http://"+ip+":"+port+"/kpos/call/img/default.jpg";
var wsuri = "ws://"+ip+":"+port+"/kpos/webapp/webSocket/systemInfo";

$scope.videolists=[];
$scope.videosLen=0;
$scope.payCount=0;
$scope.prints=[];
$scope.printlength=2;
$scope.styleMarginA="";
$scope.styleMarginB="";
$scope.lastStrA={};
$scope.lastStrB={};
$scope.showMode="IMAGE_AND_ORDER_NUMBER";
$scope.showName=["Ready","Ready"];
$scope.firstNo=[{"A":""},{"B":""}];
$scope.isClose=false;
$window.addEventListener("message", function(event){
        if(event.data=="CLOSE"){event.source.postMessage("finish","*");document.querySelector(".close").style.display="block"}
}, false);
$scope.lastStringA=function(list){
    var lastStr={},
    hideString={};
    /*if($scope.showMode !="SHOW_KITCHEN_STATUS" ){
        for(var i=list.length-1;i>0;i--){

           if(list[i].status=="NOT_READY"){
              list.splice(i,1);
           }
        }
    }*/
    for(var i=0;i<list.length;i++){
        var len=list[i].name.toString().length;
        var j=parseInt(i/5);
        if(!lastStr[j]){lastStr[j]=list[i].name}
        if(!!lastStr[j] && lastStr[j].toString().length<len){
          lastStr[j]=list[i].name;  
        }
     }
    var len=Object.keys(lastStr).length-1;
    hideString["key"]=len;
    hideString["value"]="";
     for(var i=0;i<len;i++){
         hideString["value"]+=lastStr[i];
     }
     $scope.styleMarginA=2*len+"vw";
     $scope.lastStrA=hideString;
      $scope.showNum("A");
}

$scope.lastStringB=function(list){
    var lastStr={},
    hideString={};
    /*if($scope.showMode !="SHOW_KITCHEN_STATUS" ){
        for(var i=list.length-1;i>0;i--){
          
           if(list[i].status=="NOT_READY"){
              list.splice(i,1);
           }
        }
    }*/
    for(var i=0;i<list.length;i++){
        var len=list[i].name.toString().length;
        var j=parseInt(i/5);
        if(!lastStr[j]){lastStr[j]=list[i].name}
        if(!!lastStr[j] && lastStr[j].toString().length<len){
          lastStr[j]=list[i].name;  
        }
     }
    var len=Object.keys(lastStr).length-1;
    hideString["key"]=len;
    hideString["value"]="";
     for(var i=0;i<len;i++){
         hideString["value"]+=lastStr[i];
     }
     $scope.styleMarginB=2*len+"vw";
     $scope.lastStrB=hideString;
     $scope.showNum("B");
}


$scope.play=function() {
 if($scope.payCount>=$scope.videolists.length)$scope.payCount=0;
    document._video.src = $scope.photoUrl+"img/gallery/gallery/videos/"+$scope.videolists[$scope.payCount].title;
    document._video.load();
    document._video.play();
   $scope.payCount++;

  
    
}
$scope.videos=function(){
$http({
                     method: "GET",
                    url: $scope.photoUrl+"img/gallery/gallery/videos/video.json?="+new Date().getTime(),
                     headers: { 'Content-Type': 'application/json; charset=UTF-8'},
                      data:{}
                  }).success(function(data){
                     $scope.videolists=data;
                     $scope.videosLen=$scope.videolists.length;
                     $scope.videolists.length=$scope.videosLen-1;
                     if($scope.videolists.length>0){
                      document._video = document.getElementById("video");
                        document.getElementById("video").addEventListener("ended", $scope.play);
                        $timeout(function(){$scope.play(0)},100);
                        
                     }else{
                       document.getElementById("video").style.display="none";
                      $scope.callSOAPWS(); 
                     }
                      
                  }).error(function(err){
                    
                        document.getElementById("video").style.display="none";
                        $scope.callSOAPWS(); 
                  }).finally(function() {
                 
        });  
}
var cssHtml="";
$scope.photoCount=4;
var cssList=[];
var cssPhoto=[];
var photoList=[];
var displayTime=3000;
var autoInt=0;
var autoSign=false;
var htmlLoad="<style>.loadbox {"
  +"background: #f1f1f1;"
    +"font-family: 'Roboto', sans-serif;"
    +"position: absolute;"
    +"top: 0;"
    +"right: 0;"
    +"left: 0;"
    +"bottom: 0;"
   +"}"
   +".loading-bro {margin: 50px auto;width: 150px;}"
   +".loading-bro > h1 {"
   +"text-align: center;"
   +"font-size: 2.5em;"
   +"margin-bottom: 1em;"
   +"font-weight: 300;"
   +"color: #8E8E8E;"
 +"}"
 +"#load {width: 150px;animation: loading 3s linear infinite;}"
 +"#load #loading-inner {"
   +"stroke-dashoffset: 0;"
   +"stroke-dasharray: 300;"
   +"stroke-width: 10;"
   +"stroke-miterlimit: 10;"
   +"stroke-linecap: round;"
   +"animation: loading-circle 2s linear infinite;"
   +"stroke: #51BBA7;"
   +"fill: transparent;"
 +"}"
 
 +"@keyframes loading {0% {transform: rotate(0)}"
 +"100% {transform: rotate(360deg)}}"
 
 +"@keyframes loading-circle {"
 +"0% {stroke-dashoffset: 0;}"
 +"100% {stroke-dashoffset: -600;}}"
 +"</style>"
 
 +"<div class='loadbox'>"
   +"<div class='loading-bro'>"
  +"<h1>Loading</h1>"
  +"<svg id='load' x='0px' y='0px' viewBox='0 0 150 150'>"
    +"<circle id='loading-inner' cx='75' cy='75' r='60'/>"
+"</svg>"
+"</div></div><img id='none'  onload='window.location.href=\""+$scope.photoUrl+"call\"'>"



$scope.writeHtml=function(){
  
   document.write(htmlLoad);

  img = document.getElementById("none");
  $interval($scope.checkedServer,5000);
}
$scope.checkedServer=function(){
 
    img.src=$scope.photoUrl+"call/img/Logo_EN.png?"+new Date().getTime();
  
 
}
$scope.requestServer=function(xml,type,method){
   return  new Promise(function(resolve,reject){

       var method=method || true;
       var parser;
       var xmlhttp = null;
      if(window.XMLHttpRequest) {
           xmlhttp = new XMLHttpRequest();
      } else {
          try{ xmlhttp = new ActiveXObject("Msxml2.XMLHTTP"); }catch (e){xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");}
      }
        
      xmlhttp.open("POST", soapServiceURL, method);
    xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4) {
              var x2js = new X2JS();
                    var responseText = xmlhttp.responseText;
                    
                     var jsonObj = x2js.xml_str2json(responseText);
                       
                       if(xmlhttp.status==200 &&  jsonObj.Envelope.Body[type].Result.successful){
                        resolve(jsonObj.Envelope.Body[type]);
                      }else{
                        
                        reject(xmlhttp.responseText);
                      }
                    }
    }
     try{xmlhttp.send(xml);}catch(e){console.log(e);reject(e);};
   })
}

$scope.uniqueArray=function(array,id){
var r = [];
for(var i = 0, l = array.length; i < l; i++) {
for(var j = i + 1; j < l; j++)
if(!id){if (array[i] === array[j]) j = ++i;}
else{if (array[i][id] === array[j][id]) j = ++i; }
r.push(array[i]);
}
return r;
}
$scope.printsName=function(){
  
  $ionicLoading.show();
  var soapXMLBegin = '<?xml version="1.0" encoding="UTF-8"?>' +
            '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:app="http://ws.kpos.com/app">' +
            '<soapenv:Header/><soapenv:Body><app:ListPrintersType>';
var soapXMLEnd = '</app:ListPrintersType></soapenv:Body></soapenv:Envelope>';
var soapMessage =soapXMLBegin+soapXMLEnd;
var p1=$scope.requestServer(soapMessage,"ListPrintersResponseType",true);
 p1.then(function(value){

    angular.forEach(value.printers, function(value, key) {
      if(!!value.kitchenName){
                this.push(value);  
             }
      }, $scope.prints);
     $scope.prints=$scope.uniqueArray($scope.prints,"kitchenName");
    for(var i=0;i<$scope.showName.length;i++){
            if($scope.prints[i]){
              $scope.showName[i]=$scope.prints[i].kitchenName || $scope.showName[i];  

            }
            
        }
       
                         $scope.callNumber();
                         $ionicLoading.hide();
               
         



      
     
}).catch(function(error){
     $ionicLoading.show();
    console.error(error);
});


}

var NullJson={"name":"","status":""};
var status="";
$scope.transitionEffect="WIPE";
$scope.preOrderItems=[];
cssList[0]='.sliderMenusifu--el.anim-4parts .part:before {content: "";display: block;position: absolute;background-position: center center;background-size: cover ;background-repeat: no-repeat;width: 200%;height: 200%;';
cssList[1]='.sliderMenusifu--el.anim-9parts .part:before {content: "";display: block;position: absolute;background-position: center center;background-size: cover;background-repeat: no-repeat;width: 300%;height: 300%;';
cssList[2]='.sliderMenusifu--el.anim-5parts .part:before { content: ""; display: block;  position: absolute;background-position: center center; background-size: cover;background-repeat: no-repeat;  top: 0;  width: 500%;height: 100%;';
cssList[3]='.sliderMenusifu--el.anim-3parts .part:before {content: "";display: block;position: absolute;background-position: center center;background-size: cover;background-repeat: no-repeat;width: 300%;height: 100%;';


var dbList = [4];
var tArray = new Array();   
var rows=1;
function gcd(a,b){
          var minNum = Math.min(a,b),maxNum = Math.max(a,b),i=minNum,vper=0;
          if(a ===0 || b===0){
              return maxNum;
          }
  
         for(;i<=maxNum;i++){
             vper = minNum * i;
             if(vper % maxNum === 0){
                 return vper;
                 break;
             }
         }
     }
function gcds(arr){
                            
         var onum = 0,i = 0,len = arr.length,midNum = 0;
        for(;i<len;i++){
             onum = Math.floor(arr[i]);
             midNum = gcd(midNum,onum);
         }
         return midNum;
    }
  (function(){

  var keyPaths = [];

  var saveKeyPath = function(path) {
    keyPaths.push({
      sign: (path[0] === '+' || path[0] === '-')? parseInt(path.shift()+1) : 1,
      path: path
    });
  };

  var valueOf = function(object, path) {
    var ptr = object;
    for (var i=0,l=path.length; i<l; i++) ptr = ptr[path[i]];
    return ptr;
  };

  var comparer = function(a, b) {
    for (var i = 0, l = keyPaths.length; i < l; i++) {
      aVal = valueOf(a, keyPaths[i].path);
      bVal = valueOf(b, keyPaths[i].path);
      if (aVal > bVal) return keyPaths[i].sign;
      if (aVal < bVal) return -keyPaths[i].sign;
    }
    return 0;
  };

  Array.prototype.sortBy = function() {
    keyPaths = [];
    for (var i=0,l=arguments.length; i<l; i++) {
      switch (typeof(arguments[i])) {
        case "object": saveKeyPath(arguments[i]); break;
        case "string": saveKeyPath(arguments[i].match(/[+-]|[^.]+/g)); break;
      }
    }
    return this.sort(comparer);
  };

})();

$scope.gallery={};
$scope.gallery.photoList=[];
var style0 = document.createElement('style');
var style1 = document.createElement('style');  

$scope.createCss=function(n){
style0 = document.createElement('style');
style0.type = 'text/css';
style1 = document.createElement('style');
style1.type = 'text/css';
var cssHtml=tArray[n][0]+tArray[n][1]+tArray[n][2];
head = document.getElementsByTagName('head')[0];
if(style0.styleSheet){
style0.styleSheet.cssText = cssHtml;
style1.styleSheet.cssText=tArray[n][3];
}else{
style0.appendChild(document.createTextNode(cssHtml));
style1.appendChild(document.createTextNode(tArray[n][3]));
}

document.getElementsByTagName('head')[0].appendChild(style0); 
setTimeout(function(){ document.getElementsByTagName('HEAD')[0].appendChild(style1); },1500);
autoInt=0;
if(autoSign==false){
$scope.autoPhoto();}else{
   $timeout($scope.autoPhoto,0);
}
}
var rowsCount=0;
$scope.autoPhoto=function(){
autoSign=false
autoInt++;
if(autoInt>4 ){
    autoInt=1;
    rowsCount++;
    if(rowsCount>=rows){rowsCount=0};
if(document.getElementsByTagName('head')[0].getElementsByTagName('style').length>=10){
       document.getElementsByTagName('head')[0].removeChild(document.getElementsByTagName('head')[0].getElementsByTagName('style')[5]);  
       document.getElementsByTagName('head')[0].removeChild(document.getElementsByTagName('head')[0].getElementsByTagName('style')[6]);  
    }
       autoSign=true;
      $scope.createCss(rowsCount);

    

 }
 if(autoSign==false){
    document.getElementById("page"+autoInt).checked=true;
    $timeout($scope.autoPhoto,displayTime);
 }

}

$scope.callSOAPWS=function()
{
var soapXMLBegin = '<?xml version="1.0" encoding="UTF-8"?>' +
            '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:app="http://ws.kpos.com/app">' +
            '<soapenv:Header/><soapenv:Body><app:FindGalleryType><app:prepareFor>CALL</app:prepareFor>';
var soapXMLEnd = '</app:FindGalleryType></soapenv:Body></soapenv:Envelope>';

var soapMessage =soapXMLBegin+soapXMLEnd;
var parser;
  var xmlhttp = null;
  if(window.XMLHttpRequest) {
    xmlhttp = new XMLHttpRequest();
  } else {
   try
    { xmlhttp = new ActiveXObject("Msxml2.XMLHTTP"); }
    catch (e)
    {xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");}
  }
  xmlhttp.open("POST", soapServiceURL, false);
  xmlhttp.onreadystatechange = function() {
 if (xmlhttp.readyState == 4) {
var x2js = new X2JS();
    var responseText = xmlhttp.responseText;
    var jsonObj = x2js.xml_str2json(responseText);
    var gallery=jsonObj.Envelope.Body.FindGalleryResponseType.gallery || [];
     if(gallery instanceof Array==false){
      photoList.push(gallery);
    }else{
      photoList=gallery;
    }
     $scope.photoCount=photoList.length;
     
     if($scope.photoCount>0){
    photoList.sortBy('displayOrder');
    if (photoList[0]) {
          displayTime = 1000 * photoList[0].displayTime;
            if(displayTime>0){
            $scope.transitionEffect = photoList[0].transitionEffect ? photoList[0].transitionEffect : "WIPE";
            }else{
              $scope.transitionEffect="FADE";
            }
                        
    }
     $scope.gallery.photoList=photoList;

      if($scope.transitionEffect =="FADE"){

         
        displayTime=displayTime/1000;
               var cssHTML="";
          var len=$scope.gallery.photoList.length;
          $scope.gallery.photoList[len]=$scope.gallery.photoList[0];
           angular.forEach($scope.gallery.photoList,function(v,k){
                 var delayTime=parseInt(displayTime)*k;
                 cssHTML+=".anim_fade_image"+k+"{animation: fadeInOut ease-in-out "+displayTime+"s "+delayTime+"s alternate forwards;z-index:"+(len-k)+";-webkit-animation: fadeInOut ease-in-out "+displayTime+"s "+delayTime+"s alternate forwards;z-index:"+(len-k)+";}";
          })
       
       if (displayTime > 0) {
                  createStyle(cssHTML);
                   $timeout(function() {
                         fade(len);
                   }, 50)
          }

      }else{
        
              
             dbList.push($scope.photoCount);
             var minMax=gcds(dbList);
              rows=minMax/4;
             for(var i=0;i<rows;i++){
            tArray[i]=new Array();   
              tArray[i][0]=cssList[0]+'background-image: url("'+$scope.photoUrl+photoList[(i*4)%$scope.photoCount].thumbPath+'")}';
              tArray[i][1]=cssList[1]+'background-image: url("'+$scope.photoUrl+photoList[(i*4+1)%$scope.photoCount].thumbPath+'")}';
              tArray[i][2]=cssList[2]+'background-image: url("'+$scope.photoUrl+photoList[(i*4+2)%$scope.photoCount].thumbPath+'")}';
              tArray[i][3]=cssList[3]+'background-image: url("'+$scope.photoUrl+photoList[(i*4+3)%$scope.photoCount].thumbPath+'")}';
              
              }
                 $scope.createCss(0);
      }

   
       
   }
  }
  }
  try{
  xmlhttp.send(soapMessage);
}catch(e){
alert("error");
}

}




var sock = null;
        $scope.onload = function() {

            console.log("onload");

            sock = new WebSocket(wsuri);

            sock.onopen = function() {
                console.log("connected to " + wsuri);
        sock.send('{"instanceName":"SERVER" , "sessionKey":"QlK4V79OeJjyaxb1y2rl"}');
        console.log("send");
 

            }

            sock.onclose = function(e) {
               console.log("connection closed (" + e.code + ")");
			         $scope.writeHtml();
			   
            }

            sock.onmessage = function(e) {
          var d= JSON.parse(e.data);

          if(!!d.customerDisplayRecordUpdated){
                     $timeout(function() {
                      $scope.callNumber();
                       },0);
                    
              }
            }
        };

        function send() {
            var msg = document.getElementById('message').value;
            sock.send(msg);
        };
      

$scope.showNum=function(n){
    $timeout(function() {
       var ele=document.querySelector("."+n+"-item");
      
         if(ele){
            var v=$scope.orderItems[n][0];
             if(!v || ($scope.firstNo[n]==v.name)){
              return;
             }else{
              $scope.firstNo[n]=v.name; 
             }
             

            if(v && v.status=="READY"){
                 if(v.numOfTimesCalled==1){
                            ele.classList.add("NEW");
                           }else{
                            ele.classList.add("REOPEN");
                           }
              (function(e) {
                      $timeout(function() {
                          
                           ele.classList.remove("NEW");
                           ele.classList.remove("REOPEN");
                      }, 2000);
                  })(ele)
              }
         }
       
        
       },10);
       
    
}
$scope.callNumber=function()
{
  $scope.orderItems["A"]=[];
  $scope.orderItems["B"]=[];
var soapXMLBegin = '<?xml version="1.0" encoding="UTF-8"?>' +
            '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:app="http://ws.kpos.com/app">' +
            '<soapenv:Header/><soapenv:Body><app:FindCustomerDisplayRecordsType>';
var soapXMLEnd = '</app:FindCustomerDisplayRecordsType></soapenv:Body></soapenv:Envelope>';
var soapMessage =soapXMLBegin+soapXMLEnd;
var parser;
  var xmlhttp = null;
  if(window.XMLHttpRequest) {
    xmlhttp = new XMLHttpRequest();
  } else {
   
    try
    {
      xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
    }
    catch (e)
    {
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
  }
  xmlhttp.open("POST", soapServiceURL, false);
  xmlhttp.onreadystatechange = function() {

    if (xmlhttp.readyState == 4) {
  

   var x2js = new X2JS();
    var responseText = xmlhttp.responseText;
    
    var jsonObj = x2js.xml_str2json(responseText);
   
   var customerDisplayRecords=jsonObj.Envelope.Body.FindCustomerDisplayRecordsResponseType.customerDisplayRecords || [];
    
           var tempList=[];
           if(customerDisplayRecords instanceof Array==false){
              tempList.push(customerDisplayRecords);
            }else{
             tempList=customerDisplayRecords;
            }
           }
   
           if($scope.showMode=='MULTI_KITCHEN' &&  $scope.prints.length>=2){
             angular.forEach(tempList,function(v,k){
                   if(!!$scope.prints[0].kitchenName &&(v.otherInfo.indexOf($scope.prints[0].kitchenName)>=0 || v.otherInfo=="")){
                     $scope.orderItems["A"].push(v);
                   }

                   if(v.otherInfo.indexOf($scope.prints[1].kitchenName)>=0 && v.otherInfo !=""){
                    $scope.orderItems["B"].push(v);
                   }
                   
            })
             $scope.lastStringA($scope.orderItems["A"]);
             $scope.lastStringB($scope.orderItems["B"]);
           }else if($scope.showMode=='SHOW_KITCHEN_STATUS'){

                $scope.orderItems["A"]=[];
                $scope.orderItems["B"]=[];
                
                 angular.forEach(tempList,function(v,k){
                  if(v.status=="NOT_READY"){
                    $scope.orderItems["A"].push(v);
                  }else if(v.status=="READY"){
                   $scope.orderItems["B"].push(v);
                  }
                   
                   
            })
            
             $scope.lastStringA($scope.orderItems["A"]);
             $scope.lastStringB($scope.orderItems["B"])
           }else{
            $scope.orderItems["A"]=tempList;
            $scope.lastStringA($scope.orderItems["A"]);
           }
            }
          try{
          xmlhttp.send(soapMessage);
        }catch(e){
               
        }

}
  $scope.getConfig = function() {
            var soapMessage = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:app="http://ws.kpos.com/app">' +
                '<soapenv:Header/><soapenv:Body><app:ListSystemConfigurationsType>' +
                '<app:name>CUSTOMER_ORDER_NUMBER_DISPLAY_MODE</app:name><app:adminRequest>true</app:adminRequest>' +
                '</app:ListSystemConfigurationsType></soapenv:Body></soapenv:Envelope>';
            var parser;
            var xmlhttp = null;
            if (window.XMLHttpRequest) {
                xmlhttp = new XMLHttpRequest();
            } else {
                try {
                    xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
                } catch (e) {
                    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
                }
            }
            xmlhttp.open("POST", soapServiceURL, false);
            xmlhttp.onreadystatechange = function() {

				if (xmlhttp.readyState == 4) {
                    var x2js = new X2JS();
                    var responseText = xmlhttp.responseText;
                    var jsonObj = x2js.xml_str2json(responseText);
                   
				
                   if (jsonObj.Envelope.Body.ListSystemConfigurationsResponseType.Result.successful == "true") {
                   $scope.showMode = jsonObj.Envelope.Body.ListSystemConfigurationsResponseType.systemConfiguration.value || $scope.showMode;
                    
                    if($scope.showMode=='IMAGE_AND_ORDER_NUMBER'){

                    $scope.callSOAPWS();
                    $scope.callNumber();
                    }else 
                    if($scope.showMode=='SHOW_KITCHEN_STATUS'){
                      $scope.showName[0]="Preparing";
                      $scope.callNumber();
                    }else if($scope.showMode=='MULTI_KITCHEN'){
                      $scope.printsName();
                    }else{
                      $scope.callNumber();
                    }
                 
                    }else{
					          	$scope.callSOAPWS();
                      $scope.callNumber();
				          	}
                } else {
                    alert("Server is error!")
					
                }
            }
            try {
                xmlhttp.send(soapMessage);
            } catch (e) {
					     alert("Server is error!")
            }
        }

  $scope.$on("$ionicView.enter", function(event, data){
    $scope.getConfig();
      //
    $scope.onload();
    setTime();
});
})


var visibleY = function(el){
    var top = el.getBoundingClientRect().top, rect, el = el.parentNode;
    do {
        rect = el.getBoundingClientRect();
        if (top <= rect.bottom === false)
            return false;
        el = el.parentNode;
    } while (el != document.body);
   
    return top <= document.documentElement.clientHeight;
};

function getCurrentStyle(ele,attr){
if(document.defaultView){
var style = document.defaultView.getComputedStyle(ele,null);
return style ? style.getPropertyValue(attr): null; 
}else{
return ele.currentStyle[attr];
}
}


function setTime(){
      var day="";
      var month="";
      var ampm="";
      var ampmhour="";
      var myweekday="";
      var year="";
   var myHours="";
   var myMinutes="";
   var mySeconds="";
      mydate=new Date();
      myweekday=mydate.getDay();
      mymonth=parseInt(mydate.getMonth()+1)<10?"0"+(mydate.getMonth()+1):mydate.getMonth()+1;
      myday= mydate.getDate();
      myyear= mydate.getYear();
   myHours = mydate.getHours();
      myMinutes = parseInt(mydate.getMinutes())<10?"0"+mydate.getMinutes():mydate.getMinutes();
      mySeconds = parseInt(mydate.getSeconds())<10?"0"+mydate.getSeconds():mydate.getSeconds();
      year=(myyear > 200) ? myyear : 1900 + myyear;
      if(myweekday == 0)
      weekday=" Sunday ";
      else if(myweekday == 1)
      weekday=" Monday ";
      else if(myweekday == 2)
      weekday=" Tuesday ";
      else if(myweekday == 3)
      weekday=" Wednesday ";
      else if(myweekday == 4)
      weekday=" Thursday ";
      else if(myweekday == 5)
      weekday=" Friday ";
      else if(myweekday == 6)
      weekday=" Saturday ";
	  try{
     document.querySelector("#datetime").innerHTML=myHours+":"+myMinutes+":"+mySeconds+"&nbsp;&nbsp;&nbsp;&nbsp;"+year+"."+mymonth+"."+myday;
	  }catch(ex){}
     setTimeout("setTime()",1000);
  }
function nodeXY(e){
  var node=document.getElementById(e);
    var xy={};
     xy.x=0;
     xy.y=0;
     if(!!node){
     xy.x=!!node.offsetLeft?node.offsetLeft:0;
     xy.y=!!node.offsetTop?node.offsetTop:0;
    
    while ((node = node.offsetParent)) {
      xy.x += !!node.offsetLeft?node.offsetLeft:0;
      xy.y += !!node.offsetTop?node.offsetTop:0;
    }
  }
    return xy;
}

      function createStyle(cssHTML){
      
    var style = document.createElement('style');
    style.type = 'text/css';

    var head = document.getElementsByTagName('head')[0];
    if(style.styleSheet){
    style.styleSheet.cssText = cssHTML;

    }else{
      
    style.appendChild(document.createTextNode(cssHTML));

    }
    document.getElementsByTagName('head')[0].appendChild(style); 
 }

 function fade(len) {
   
     var  elementList = document.querySelectorAll(".efg");

     var e=elementList[elementList.length-2];
    
    function whichTransitionEvent(){
       var t;
       var el = document.createElement('fakeelement');
       var transitions = {
         'animation':'animationend',
         'webkitAnimation':'webkitAnimationEnd',
         'transition':'transitionend',
         'OTransition':'oTransitionEnd',
         'MozTransition':'transitionend',
         'WebkitTransition':'webkitTransitionEnd',
         
       }
       for(t in transitions){
           if( el.style[t] !== undefined ){
               return transitions[t];
           }
       }
   }
window.setTimeout(function(){   

   var transitionEvent = whichTransitionEvent();
     //   window.setTimeout(function(){   
        
         transitionEvent && e.addEventListener(transitionEvent, function() {
             for(var i=0;i<elementList.length;i++){
                    elementList[i].classList.toggle('anim_fade_image'+i);
                     
                   
                  }
           window.setTimeout(function(){
             for(var i=0;i<elementList.length;i++){
                    elementList[i].classList.toggle('anim_fade_image'+i);
                     
                  }
             
            },10)
              });},1000);
         
  }
   