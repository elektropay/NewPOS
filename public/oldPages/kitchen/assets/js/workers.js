(function() {
  var timeout=null;
  
  onload=function(arg){
  let xml='<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:app="http://ws.kpos.com/app"><soapenv:Header/><soapenv:Body><app:ClientInstanceLoginType><app:name>'+arg['key']+'</app:name><app:type>KITCHEN_DISPLAY</app:type></app:ClientInstanceLoginType></soapenv:Body></soapenv:Envelope>'
    let type="ClientInstanceLoginResponseType";
    let url="http://"+arg["url"]+"/kpos/ws/kposService";
   // 
  /*let sendData={"data":xml,"method":"POST"}
  let result= this.myService.soap(sendData,type);
     if(result["Result"]["successful"] !="true"){
       postMessage({"msg":result["Result"]["failureReason"]})
       }else{
        console.log("OK")
       }*/
        var xmlhttp = new XMLHttpRequest();
                     xmlhttp.open("POST", url, true);
                     xmlhttp.onreadystatechange = function () {
                          if (xmlhttp.readyState == 4) {
                              if (xmlhttp.status == 200) {
                                 if(xmlhttp.responseText.indexOf("<successful>true</successful>")){
                             
                                     postMessage(xmlhttp.responseText);
                                 }else{
                                    postMessage(false);
                                 }

                              }
                          }
                      };
                    xmlhttp.setRequestHeader('Content-Type', 'text/xml');
                    xmlhttp.send(xml);
          

     }
     
   onmessage = function (event) {
        onload(event.data)
        /*clearInterval(timeout);
        timeout=setInterval(function(){
          onload(event.data)
        }, 1000 * 5 * 60);*/
    };
})();