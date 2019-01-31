(function() {
	var  jsonPar={};
		
	var id=-1;

    function getApiMenu(){
	xhr = new XMLHttpRequest();

xhr.open("POST", jsonPar.url, true);
xhr.setRequestHeader("Content-type", "application/json");
xhr.onreadystatechange = function () { 

	if (xhr.readyState === 4) {  
        if (xhr.status === 200) {  
          		var obj=JSON.parse(xhr.responseText);
           		 if(id != obj.id){
			            	id=obj.id || -1;	
			            	postMessage(obj);
			    }
			    setTimeout(getApiMenu, jsonPar.delayTime);
        } else {  
          setTimeout(getApiMenu, jsonPar.delayTime);
        }  
    }  

}
var data = JSON.stringify({"id":-1});
xhr.send(data);

}

 onmessage = function (oEvent) {
			   jsonPar=oEvent.data;
			   getApiMenu();
			       
	};
})();
/*(function() {
	var  jsonPar={};
		
	var id=-1;

    function getApiMenu(){
			 	 
				fetch(jsonPar.url, {
			    method: "POST",
			    headers: {
			        'Content-Type': 'application/json; charset=UTF-8'
			    },
			  
			    body: JSON.stringify({"id":-1})
			}).then(function(res) {
			     if (res.ok) {
			        res.json().then(function(obj) {
			            if(id != obj.id){
			            	id=obj.id || -1;	
			            	postMessage(obj);
			            }
			            })
			     }
			})
		
             setTimeout(getApiMenu, jsonPar.delayTime);
			
}

   
	 onmessage = function (oEvent) {
			   jsonPar=oEvent.data;
			   getApiMenu();
			       
	};
})();*/