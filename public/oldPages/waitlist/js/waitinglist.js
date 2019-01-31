var soapXMLBegin = '<?xml version="1.0" encoding="UTF-8"?>' +
    '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:app="http://ws.kpos.com/app">' +
    '<soapenv:Header/><soapenv:Body>';
var soapXMLEnd = '</soapenv:Body></soapenv:Envelope>';
var paserXml = new XMLSerializer();
var servAddr = '';
var showList = false;
var clearClicked = false;
var timer1;
var timer2;
var gotResult;
var restaurantStartTime = '00:00:00';
var adultSelected;
var childSelected;
var deviceType;
var bodyHeight;
var androidPhoneInputTranslate = false;
var cancelClicked = false;
var textLicense = "1501272182842 false";
var enableTextMsg = false;
var textContent = "";
var restaurantName = '[restaurant name]';
var waitlistVersion = "20180302";
window.onload = function(){
    bodyHeight = document.body.clientHeight;
    servAddr = getServerUrl();
    setBackground();
    cssDisplay();
    getRestaurantStartTime();
    getMobileOperatingSystem();
    getTextLicense();
    //forbid touch move
    document.ontouchmove = function(e){e.preventDefault();}
    //set to full screen
    document.getElementById('fullscreenBtn').addEventListener("click", fullScreenHandler);
    if(deviceType == 'windows'){
        document.getElementById('fullscreenBtn').style.display = 'block';
    }
    document.getElementById('btn_c_waitingList_submit').onclick = function(){
        //document.getElementById('btn_c_waitingList_submit').src = 'addButtonAfter.png';
        var adultPartySize = document.getElementById('c_waitingList_adultPartySize').value.split(' ')[0];
        var childPartySize = document.getElementById('c_waitingList_childrentPartySize').value.split(' ')[0];
        var name = document.getElementById('c_waitingList_name').value;
        var phoneNumber = document.getElementById('areaCode').innerHTML + '' + extractPhoneNumber(document.getElementById('c_waitingList_phoneNumber').value);
        if(document.getElementById('c_waitingList_phoneNumber').value.length > 0){
            document.getElementById('nation_field').style.bottom = '0.5vw';
            concealWarningNoteIfShown(document.getElementById('c_waitingList_phoneNumber'));
        }
        
        var note = document.getElementById('c_waitingList_note').value;
        var xmlinfo = '';
        var xml = soapXMLBegin;

        var passCheck = inputValidation(adultPartySize,childPartySize,name,phoneNumber,note);


        //pass the validation check and send the request
        if(passCheck){
            /*construct the payload of post request*/

            //deal with date and time
            var myDate = new Date();
            var dateAndTime = formatTime(myDate);

            xmlinfo += xmltag('dateTime',dateAndTime);
            xmlinfo += xmltag('firstName',name);
            xmlinfo += xmltag('adult',adultPartySize);
            xmlinfo += xmltag('children',childPartySize);
            xmlinfo += xmltag('phoneNumber',phoneNumber);
            xmlinfo += xmltag('status','WAITING');
            xmlinfo += xmltag('notes',note,true);
            xml += xmltag("SaveWaitingListType",
                xmltag("waitingList",
                    xmlinfo
                )
            );
            xml += soapXMLEnd;
            $.ajax({
                url:servAddr+"/kpos/ws/kposService",
                type:'post',
                datatype:'text',
                data:xml,
                processData: false,
                contentType: "text/xml; charset=\"utf-8\"",
                success:function(doc){var responseText = paserXml.serializeToString(doc);onPostSuc(responseText,name, phoneNumber)},
                error: function(){onPostErr(name)},
                timeout: 120000
            });
        }
        // else{
        //     setTimeout(function(){document.getElementById('btn_c_waitingList_submit').src = 'getInLine.png';},200);
        // }
    }
    document.getElementById('c_waitingList_left').onclick = function(){

    }
    document.getElementById('btn_finish').onclick = function(){
        clearTimeout(timer1);
        document.getElementById('succeedBoard').style.display = 'none';
        clearInput();
        document.getElementById('right_content').style.display = 'block';
    }

    document.getElementById('btn_tryAgain').onclick = function(){
        clearTimeout(timer2);
        document.getElementById('failBoard').style.display = 'none';
        clearInput();
        document.getElementById('right_content').style.display = 'block';
    }

    var btns = document.getElementsByClassName('btn');
    for(var ij = 0; ij < btns.length; ij++)
    {
        btns[ij].addEventListener('touchstart',function(){},false);
    }

    $("#c_waitingList_adultPartySize").mobiscroll().scroller({
        onBeforeShow:function(inst){
            inputEffect(document.getElementById('c_waitingList_adultPartySize'));
        },
        onClose: function(valueText,btn,inst){
            setTimeout(function(){
                if(!cancelClicked) {
                    document.getElementById('c_waitingList_adultPartySize').value = valueText;
                }
                else {
                    cancelClicked = false;
                }
                if (document.getElementById('c_waitingList_adultPartySize').value.length > 0) {
                    concealWarningNoteIfShown(document.getElementById('c_waitingList_adultPartySize'));
                }
                inputOutEffect(document.getElementById('c_waitingList_adultPartySize'));
            },50);
        },
        onInit: function(inst){
            inst.clear();
        },
        buttons:['set',
            {
                text:'Cancel/取消',
                handler: function(event,inst){
                    cancelClicked = true;
                    var tmp =  document.getElementById('c_waitingList_adultPartySize').value;
                    inst.cancel();
                    setTimeout(function(){
                        document.getElementById('c_waitingList_adultPartySize').value = tmp;
                        inputOutEffect(document.getElementById('c_waitingList_adultPartySize'));
                    },60);
                }
            }],
        theme: 'ios7',
        lang: 'zh',
        cancelText:"Cancel/取消",
        setText:"Set/确定",
        display: 'bottom',
        rows:7,
        layout:'liquid',
        wheels: [
            [{
                keys:['1 person/1人','2 people/2人','3 people/3人','4 people/4人','5 people/5人','6 people/6人','7 people/7人','8 people/8人',
                    '9 people/9人','10 people/10人','11 people/11人','12 people/12人','13 people/13人','14 people/14人','15 people/15人','16 people/16人',
                    '17 people/17人','18 people/18人','19 people/19人','20 people/20人'],
                values:['1 person/1人','2 people/2人','3 people/3人','4 people/4人','5 people/5人','6 people/6人','7 people/7人','8 people/8人',
                    '9 people/9人','10 people/10人','11 people/11人','12 people/12人','13 people/13人','14 people/14人','15 people/15人','16 people/16人',
                    '17 people/17人','18 people/18人','19 people/19人','20 people/20人']
            }]
        ]
    });

    $("#c_waitingList_childrentPartySize").mobiscroll().scroller({
        onBeforeShow:function(inst){
            inputEffect(document.getElementById('c_waitingList_childrentPartySize'));
        },
        onInit: function(inst){
            inst.clear();
        },
        onClose: function(valueText,btn,inst){
            setTimeout(function(){
                if(!cancelClicked) {
                    if (valueText == '0')
                        document.getElementById('c_waitingList_childrentPartySize').value = '';
                    else
                        document.getElementById('c_waitingList_childrentPartySize').value = valueText;
                }
                else{
                    cancelClicked = false;
                }
                inputOutEffect(document.getElementById('c_waitingList_childrentPartySize'))
            },50);
        },
        buttons:['set',
            {
                text:'Cancel/取消',
                handler: function(event,inst){
                    cancelClicked = true;
                    var tmp =  document.getElementById('c_waitingList_childrentPartySize').value;
                    inst.cancel();
                    setTimeout(function(){
                        document.getElementById('c_waitingList_childrentPartySize').value = tmp;
                        inputOutEffect(document.getElementById('c_waitingList_childrentPartySize'));
                    },60);
                }
            }],
        theme: 'ios7',
        lang: 'zh',
        cancelText:"Cancel/取消",
		setText:"Set/确定",
        display: 'bottom',
        rows:7,
        layout:'liquid',
        wheels: [
            [{
                keys:['0 person/0人','1 person/1人','2 people/2人','3 people/3人','4 people/4人','5 people/5人','6 people/6人','7 people/7人','8 people/8人',
                    '9 people/9人','10 people/10人','11 people/11人','12 people/12人','13 people/13人','14 people/14人','15 people/15人','16 people/16人',
                    '17 people/17人','18 people/18人','19 people/19人','20 people/20人'],
                values:['0 person/0人','1 person/1人','2 people/2人','3 people/3人','4 people/4人','5 people/5人','6 people/6人','7 people/7人','8 people/8人',
                    '9 people/9人','10 people/10人','11 people/11人','12 people/12人','13 people/13人','14 people/14人','15 people/15人','16 people/16人',
                    '17 people/17人','18 people/18人','19 people/19人','20 people/20人']
            }]
        ]
    });
}

function formatTime(myDate){
    var dateAndTime = '';
    dateAndTime = dateAndTime + myDate.getFullYear() + "-";
    var month = myDate.getMonth() + 1;
    if(month < 10 && month.toString().length == 1)
        dateAndTime +='0';
    dateAndTime = dateAndTime + month + "-";
    var day = myDate.getDate();
    if(day < 10 && day.toString().length == 1)
        dateAndTime+='0';
    dateAndTime = dateAndTime + day + " ";
    var hour = myDate.getHours();
    if(hour < 10 && hour.toString().length == 1)
        dateAndTime+='0';
    dateAndTime = dateAndTime + hour + ":";
    var minute = myDate.getMinutes();
    if(minute < 10 && minute.toString().length == 1)
        dateAndTime+='0';
    dateAndTime = dateAndTime + minute + ":";
    var second = myDate.getSeconds();
    if(second < 10 && second.toString().length == 1)
        dateAndTime+='0';
    dateAndTime = dateAndTime + second;
    return dateAndTime;
}

function xmltag(appname,msg,isTransfor){
    if(msg == undefined)
        return '';
    if(!!isTransfor){msg = charTrans(msg+'');}
    return '<app:'+appname+'>'+msg+'</app:'+appname+'>';
}

function charTrans(msg){
    return msg.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function getJsonFromSoap(responseText){
    var start = responseText.indexOf("<soap:Body>");
    var end = responseText.indexOf("</soap:Body>");
    responseText = responseText.substring(start+11,end);
    var xotree = new XML.ObjTree();
    var myJsonObject = xotree.parseXML(responseText);
    return myJsonObject;
}

function inputValidation(adultPartySize,childPartySize,name,phone_Number,note){
    var result = true;
    var phoneNumber = phone_Number.split(' ')[1];

    //deal with null input
    if(!adultPartySize){
        showWarningNote('c_waitingList_adultPartySize');
        result = false;
        shake(document.getElementById('adultLabel'),"left",function(){});
    }
    if(!name){
        showWarningNote('c_waitingList_name');
        result = false;
        shake(document.getElementById('nameLabel'),"left",function(){});
    }
    if(!phoneNumber){
        document.getElementById('nation_field').style.bottom = '2.5vw';
        showWarningNote('c_waitingList_phoneNumber');
        result = false;
        shake(document.getElementById('phoneLabel'),"left",function(){});
    }

    //name must contains at least one letter
    if(!!name){
        var reg = new RegExp('[a-zA-Z]+');
        if(!reg.test(name)){
            showWarningNote('c_waitingList_name');
            result = false;
            shake(document.getElementById('nameLabel'),"left",function(){});
        }
    }

    //phoneNumber should be 10 numbers(US) or 11 numbers(China)
    if(!!phoneNumber){
        var area_code = document.getElementById('areaCode').textContent;
        console.log(area_code);
        var reg;
        if(area_code == '+1 ') {
            reg = new RegExp('^[0-9]{10}$');
        }
        else if(area_code == '+86 '){
            reg = new RegExp('^[0-9]{11}$');
        }
        if (!reg.test(phoneNumber)) {
            document.getElementById('nation_field').style.bottom = '2.5vw';
            showWarningNote('c_waitingList_phoneNumber');
            result = false;
            shake(document.getElementById('phoneLabel'), "left", function () {
            });
        }
    }

    return result;
}

function showWarningNote(id){
    var elem = document.getElementById(id);
    //elem.style.borderColor = 'rgb(211,44,0)';
    var note = siblingElems(elem);
    note[note.length-1].style.display = 'block';
}

// function recoverDisplay(inputValue, id){
//  var elem = document.getElementById(id);
//  var note = siblingElems(elem)[1];
//  if(note.style.display == 'block'){
//      var sib = siblingElems(elem)[0];
//      elem.style.borderColor = '#F7BC30';
//      sib.style.color = '#F7BC30';
//      note.style.display = 'none';
//  }
// }

function onPostSuc(responseText,name, phoneNumber){
    //document.getElementById('btn_c_waitingList_submit').src = 'getInLine.png';
    var myJsonObject = getJsonFromSoap(responseText);
    // getWaitingPartyNo();
    //if successful
    if(myJsonObject.savewaitinglistresponsetype.result.successful){
        var thisWaitingNum = myJsonObject.savewaitinglistresponsetype.waitinglist.waitingnumber;
        document.getElementById('right_content').style.display = 'none';
        // document.getElementById('failBoard').style.display = 'none';
        document.getElementById('registeredCustomer').textContent = name + ",";
        // document.getElementById('registeredCustomer_wait').innerHTML = name + ",";
        document.getElementById('succeedBoard').style.display = 'block';
        document.getElementById('showTablesAhead').style.display = 'none';
        document.getElementById('showSuccess').style.display = 'block';
        document.getElementById('waitBoardBottom').style.display = 'none';
        document.getElementById('tablesAhead').innerHTML = myJsonObject.savewaitinglistresponsetype.waitinglist.numofbeforeparties;
        gotResult = true
        //show number of tables ahead
        setTimeout(function(){
            //console.log(gotResult);
            if(gotResult){
                var displaySuccess = document.getElementById('showSuccess');
                var displayTables = document.getElementById('showTablesAhead');
                displaySuccess.style.display = 'block';
                displayTables.style.transform = 'rotateY(-90deg)';
                displayTables.style.transition = '0.75s';
                displaySuccess.style.transform = 'rotateY(90deg)';
                displaySuccess.style.transition = '0.75s';
                setTimeout(twist,800);
            }
            else{
                document.getElementById('waitBoardBottom').style.display = 'block';
            }
        },1000);

        //5 mins later back to the register panel
        timer1 = setTimeout(function(){
            document.getElementById('succeedBoard').style.display = 'none';
            document.getElementById('waitBoardBottom').style.display = 'none';
            clearInput();
            document.getElementById('right_content').style.display = 'block';
        },300000);

        //if permitted, send notification
        if(enableTextMsg == "true"){
            if(thisWaitingNum != undefined){
                var thisTextContent = textContent + " Your waiting number is **" + thisWaitingNum + "**!";
            }
            else{
                var thisTextContent = textContent;
            }
            var textXML = getPublishNotificationType(phoneNumber,thisTextContent);
            $.ajax({
            url:servAddr+"/kpos/ws/kposService",
            type:'post',
            datatype:'text',
            data: textXML,
            processData: false,
            contentType: "text/xml; charset=\"utf-8\"",
            success:function(doc){var responseText = paserXml.serializeToString(doc);onSendTextPostSuc(responseText)},
            error: function(){onSendTextPostFail()},
            timeout: 120000
            });
        }
    }
    //if fail
    else{
        onPostErr(name);
    }
}

function checkTextLicense(){
    var licenseTime = textLicense.split(" ")[0];
    var curDate = new Date();
    if((curDate.getTime() - licenseTime)/3600000 >= 1){
        textLicense = getTextLicense();
        checkTextLicense();
    }
    else{
        return textLicense.split(" ")[1];
    }
}

function getTextLicense(){
    $.ajax({
            url:servAddr+"/kpos/ws/kposService",
            type:'post',
            datatype:'text',
            data: getListSystemConfigurationsType(),
            processData: false,
            contentType: "text/xml; charset=\"utf-8\"",
            success:function(doc){var responseText = paserXml.serializeToString(doc); onSystemInfoPostSuc(responseText)},
            error: function(){onSystemInfoPostFail()},
            timeout: 120000
    });
   /* var tmpDate = new Date();
    var result = '' + tmpDate.getTime() + ' ' + permit;
    return result;*/
}

function onSystemInfoPostSuc(responseText){
    var myJsonObject = getJsonFromSoap(responseText);
    myJsonObject.listsystemconfigurationsresponsetype.systemconfiguration.forEach(function(v){
	if(v.name == 'RESERVE_SUCCESS_NOTIFICATION'){
            textContent = v.value;
        }        
	if(v.name == 'ENABLE_TEXT_SERVICE'){
        enableTextMsg =  v.value;
        }
    });
}

function onSystemInfoPostFail(){
    getTextLicense();
}

function onSendTextPostSuc(responseText){
    console.log('successful sent');
}

function onSendTextPostFail(){
    console.log('sent failed')
}

/*function onSystemInfoPostSuc(responseText){
    var myJsonObject = getJsonFromSoap(responseText);
    console.log(myJsonObject);
}*/

function onSystemInfoPostFail(){

}

function getPublishNotificationType(num, content){
    if(!!num && !!content){
        num = xmltag('phoneNumber',num);
        content = xmltag('content',content);
        var xml = soapXMLBegin;
        xml += xmltag('PublishNotificationType',num+content);
        xml += soapXMLEnd;
        return xml;
    }
    return null;
}

function getListSystemConfigurationsType(){
    var xml = soapXMLBegin;
    xml += xmltag('ListSystemConfigurationsType','');
    xml += soapXMLEnd;
    return xml;
}
function twist(){
    document.getElementById('waitBoardBottom').style.display = 'block';
    var displayTables = document.getElementById('showTablesAhead');
    var displaySuccess = document.getElementById('showSuccess');
    displaySuccess.style.display = 'none'
    displayTables.style.display = 'block';
    $('#showTablesAhead').css('display');
    displayTables.style.transform = 'rotateY(0deg)';
    displayTables.style.transition = '0.75s';
    displaySuccess.style.transform = 'rotateY(0deg)';
    displaySuccess.style.transition = '0.75s';
}

function onPostErr(name){
    //document.getElementById('btn_c_waitingList_submit').src = 'getInLine.png';
    document.getElementById('right_content').style.display = 'none';
    document.getElementById('succeedBoard').style.display = 'none';
    document.getElementById('unregisteredCustomer').textContent = name + ",";
    document.getElementById('failBoard').style.display = 'block';
    //2 seconds later back to the register panel
    timer2 = setTimeout(function(){
        document.getElementById('failBoard').style.display = 'none';
        clearInput();
        document.getElementById('right_content').style.display = 'block';
    },300000);
}

function getWaitingPartyNo(){
    var toDate = new Date();
    var toTime = formatTime(toDate);
    var fromTime = toTime.split(' ')[0] + " " + restaurantStartTime;
    var waitlistRequest = soapXMLBegin;
    waitlistRequest = waitlistRequest + '<app:FindWaitingListType><app:fromDate>' + fromTime
        + '</app:fromDate><app:toDate>' + toTime + '</app:toDate></app:FindWaitingListType>';
    waitlistRequest += soapXMLEnd;
    console.log(waitlistRequest);

    $.ajax({
        url:servAddr+"/kpos/ws/kposService",
        type:'post',
        datatype:'text',
        data:waitlistRequest,
        processData: false,
        contentType: "text/xml; charset=\"utf-8\"",
        success:function(doc){var responseText = paserXml.serializeToString(doc); calAndSetThePartyNo(responseText)},
        error: function(){onGetPartyListErr()},
        timeout: 120000
    });
}

function calAndSetThePartyNo(responseText){
    var myJsonObject = getJsonFromSoap(responseText);
    var partyList = myJsonObject.findwaitinglistresponsetype.waitinglists;
    console.log(myJsonObject);
    var count = 0;
    if(partyList.length >= 2){
        partyList.forEach(function(v){
            if(v.status == 'WAITING')
                count++;
        })
    }
    if(count <= 1)
        count = 0;
    else
        count--;
    count += '';
    document.getElementById('tablesAhead').innerHTML = count;
    gotResult = true;
}

function onGetPartyListErr(){
    gotResult = false;
}

function clearInput(){
    var u = document.getElementsByClassName('input_Unit');
    [].forEach.call(u, function(v){
        if(v.value.length > 0){
            v.value = '';
            v.style.borderBottom = '1px solid';
            v.style.borderBottomColor = '#F7BC30';
            v.style.textIndent = '0px';
            v.style.color = '#F7BC30';

            var sib = siblingElems(v)[0];
            sib.style.transform = 'translateY(0px)';
            sib.style.fontSize = '2.5vw';
            sib.style.color = '#F7BC30';

        }
    });
    document.getElementById('nation_field').style.display = 'none';
    document.getElementById('tablesAhead').innerHTML = '';
}

function getServerUrl(){
    var thisurl = window.location.href.split('/');
    var suburl = '';
    var ishttps = false;
    for(var i in thisurl){
        if(thisurl[i] == 'http:')continue;
        else if(thisurl[i] == 'https:'){ishttps = true;continue;}
        else if(thisurl[i] == '')continue;
        else{return(ishttps?"https://":"http://")+thisurl[i]+suburl;}
    }
};

function setBackground(){
    var backgroundRequest = soapXMLBegin +
        '<app:FetchCompanyProfileType><app:fetchLicenseDetails>true</app:fetchLicenseDetails></app:FetchCompanyProfileType>' + soapXMLEnd;
    $.ajax({
        url:servAddr+"/kpos/ws/kposService",
        type:'post',
        datatype:'text',
        data:backgroundRequest,
        processData: false,
        contentType: "text/xml; charset=\"utf-8\"",
        success:function(doc){var responseText = paserXml.serializeToString(doc); backgroundPostSuc(responseText)},
        error: function(){backgroundPostErr()},
        timeout: 120000
    });
}

function backgroundPostSuc(responseText) {
    var myJsonObject = getJsonFromSoap(responseText);
    if (!!myJsonObject.fetchcompanyprofileresponsetype.company.coverimage){
        document.getElementById('background_body').style.backgroundImage = 'url(' + servAddr + '/kpos/' + myJsonObject.fetchcompanyprofileresponsetype.company.coverimage + ')';
        restaurantName = myJsonObject.fetchcompanyprofileresponsetype.company.name; 
        textContent = "Hey! Thank you for choosing " + restaurantName + " ! You have been added to the Waiting list. We will send you notifications when your table is ready. Thanks again!";
    
    }
    else
        backgroundPostErr();
}

function backgroundPostErr(){
    //set to default img when post request fail
    document.getElementById('background_body').style.backgroundImage = 'url(img/bgImage.jpg)';
}

function siblingElems(elem){
    var nodes=[ ];
    var _elem=elem;
    while((elem=elem.previousSibling)){
        if(elem.nodeType==1){
            nodes.push(elem);
        }
    }
    var elem=_elem;
    while((elem=elem.nextSibling)){
        if(elem.nodeType==1){
            nodes.push(elem);
        }
    }
    return nodes;
}

function extractPhoneNumber(fullStatement){
    var reg = new RegExp('-|\\)|\\(| ','g');
    return fullStatement.replace(reg,"");
}

function convertPhoneNumber(number){
    if(number.length<=3 || number.length > 10)
        return number;
    else if(number.length<=7){
        return number.substring(0,3)+'-'+number.substring(3,number.length);
    }
    else if(number.length>7){
        return '('+number.substring(0,3)+') '+number.substring(3,6)+'-'+number.substring(6,number.length);
    }
}

function cssDisplay(){

    // document.body.style.backgroundImage = 'url(bgImage.jpg)';
    // document.body.style.opacity = 1;

    //logo image
    document.getElementById('id_logo').src = 'img/restaurantlogo.png';

    //deal with input focus out event
    var inputUnit = document.getElementsByClassName('input_Unit');
    [].forEach.call(inputUnit,function(v){
        v.onfocus = function(){
            //adjust for screen of some brand
            // document.getElementById('status_sign').style.display = 'none';

            //prevent focus on the input area when selecting the nation flag
            if(v.id == 'c_waitingList_phoneNumber' && document.getElementById('nation').style.display == 'block'){
                document.activeElement.blur();
            }

            //prevent typing in character other than number
            if(v.id == 'c_waitingList_phoneNumber'){
                $("#c_waitingList_phoneNumber").bind('keypress',function(e){
                    if (e.which == 13){
                        document.activeElement.blur();
                    }
                });
                var old = v.value;
                document.getElementById(v.id).oninput = function(){

                    //if warning note shown, conceal it
                    concealWarningNoteIfShown(v);
                    document.getElementById('nation_field').style.bottom = '0.5vw';
                    //typing prevent
                    var text = extractPhoneNumber(v.value);
                    var len = text.length;
                    var i;
                    for(i=0; i < len; i++){
                        var char_code = text.charCodeAt(i);
                        if(char_code<48 || char_code>57){
                            document.getElementById(v.id).value = old;
                            return;
                        }
                    }
                    if(document.getElementById('areaCode').textContent == '+1 ') {
                        old = convertPhoneNumber(extractPhoneNumber(text));
                        document.getElementById(v.id).value = old;
                    }
                    $("#c_waitingList_phoneNumber").putCursorAtEnd();
                }
            }

            /*ALL INPUT FOR NAME AND NOTE ARE ALLOWED*/

            if(v.id == 'c_waitingList_name' || v.id == 'c_waitingList_note'){
                $("#"+v.id).bind('keypress',function(e){
                    if (e.which == 13){
                        document.activeElement.blur();
                    }
                });
                if(deviceType == 'Android'){
                    if(v.id == 'c_waitingList_name')
                        document.getElementById('right_content').style.transform = 'translateY(-'+bodyHeight*0.1+'px)';
                    else
                        document.getElementById('right_content').style.transform = 'translateY(-'+bodyHeight*0.3+'px)';
                    document.getElementById('right_content').style.trnsition = '0.1s';
                }
                var old = v.value;
                document.getElementById(v.id).oninput = function(){
                    if(v.id != 'c_waitingList_note')
                        concealWarningNoteIfShown(v);
                    //prevent typing in character other than letter
                    // var text = v.value+'';
                    // var len = text.length;
                    // var i;
                    // for(i=0; i < len; i++){
                    //          if(!(text.charCodeAt(i)>65&&text.charCodeAt(i)<90 || text.charCodeAt(i)>97&&text.charCodeAt(i)<122 || text.charCodeAt(i)==32)){
                    //          console.log('here');
                    //          document.getElementById(v.id).value = old;
                    //          return;
                    //          }
                    //          }
                    //      old = text;
                }
            }

            if(v.id == 'c_waitingList_name' || v.id == 'c_waitingList_note' || v.id == 'c_waitingList_phoneNumber') {
                sibs = siblingElems(v);
                var componentNumber;
                if(v.id == 'c_waitingList_name' || v.id == 'c_waitingList_phoneNumber')
                    componentNumber = sibs.length - 2;
                else
                    componentNumber = sibs.length - 1;
                sibs[componentNumber].style.display = 'block';
                sibs[componentNumber].onclick = function(){
                    clearClicked = true;
                }
                inputEffect(v);
            }



        }
        v.onblur = function(){
            var sibs = siblingElems(v);

            //document.getElementById('status_sign').style.display = 'block';
            //prevent focusing on input when choosing the nation flag
            if(v.id == 'c_waitingList_phoneNumber'){
                setTimeout(function(){
                    decideListDisplayOrClose(v);
                },200);
            }
            else if(v.id == 'c_waitingList_name' || v.id == 'c_waitingList_note'){
                setTimeout(function(){
                    decideClearClickedOrNot(v);
                },200);
            }
        }
    });

    document.getElementById('choose_background').onclick = function(){
        document.getElementById('choose_background').style.display = 'none';
        document.getElementById('nation').style.display = 'none';
        document.getElementById('listButton').src = 'img/downarrow.png';
        showList = false;
        $('#c_waitingList_phoneNumber').focus().select();
    }
    $('#nation_field').click(function(event){
        event.stopPropagation();
        showList = true;
        document.getElementById('choose_background').style.display = 'block';
        document.getElementById('nation').style.display = 'block';
        document.getElementById('listButton').src = 'img/uparrow.png';
    });

    document.getElementById('option_america').onclick = function(){
        document.getElementById('china_chosen').style.display = 'none';
        document.getElementById('america_chosen').style.display = 'block';
        document.getElementById('nation_field').style.display = 'none';
        document.getElementById('choose_background').style.display = 'none';
        document.getElementById('nation').style.display = 'none';
        document.getElementById('listButton').src = 'img/downarrow.png';
        document.getElementById('placeholder_nation').src = 'img/america.png';
        document.getElementById('areaCode').innerHTML = '+1 ';
        showList = false;
        document.getElementById('c_waitingList_phoneNumber').value = convertPhoneNumber(extractPhoneNumber(document.getElementById('c_waitingList_phoneNumber').value));
        $('#c_waitingList_phoneNumber').focus().select();
    }

    document.getElementById('option_china').onclick = function(){
        document.getElementById('china_chosen').style.display = 'block';
        document.getElementById('america_chosen').style.display = 'none';
        document.getElementById('nation_field').style.display = 'none';
        document.getElementById('choose_background').style.display = 'none';
        document.getElementById('nation').style.display = 'none';
        document.getElementById('listButton').src = 'img/downarrow.png';
        document.getElementById('placeholder_nation').src = 'img/china.jpg';
        document.getElementById('areaCode').innerHTML = '+86 ';
        showList = false;
        document.getElementById('c_waitingList_phoneNumber').value = extractPhoneNumber(document.getElementById('c_waitingList_phoneNumber').value);
        $('#c_waitingList_phoneNumber').focus().select();
    }
}

//if warning note shown, conceal it
function concealWarningNoteIfShown(v) {
    var sibLength = siblingElems(v).length;
    var sibElem = siblingElems(v);
    if (sibElem[sibLength - 1].style.display == 'block')
        sibElem[sibLength - 1].style.display = 'none';
}

function inputEffect(v) {
    if (v.value.length > 0) {
        v.style.cssText = 'border-bottom:2px solid;border-bottom-color:rgb(243,214,148);color:white;font-size:2.5vw'
        var sib = siblingElems(v)[0];
        sib.style.color = 'rgb(243,214,148)';

    }
    else {
        v.style.cssText = "font-size:2.5vw;border-bottom:2px solid;border-bottom-color:rgb(243,214,148);textIndent:0;color:#fff;"
        var sib = siblingElems(v)[0];
        sib.style.cssText = "font-size:1.67vw;color:rgb(243,214,148);transform:translateY(-2.5vw);";
    }
    if (v.id == 'c_waitingList_phoneNumber') {
        document.getElementById('nation_field').style.display = 'block';
        v.style.textIndent = '23%';
    }
}

function inputOutEffect(v){
    console.log('got u');
    if(v.value.length > 0){
        console.log('here');
        v.style.cssText = 'border-bottom:1px solid; color:white; border-bottom-color:#F7BC30;font-size:2.5vw;';
        var sib = siblingElems(v)[0];
        sib.style.color = '#F7BC30';

    }
    else{
        v.style.cssText = 'border-bottom: 1px solid; text-indent: 0px;';
        var sib = siblingElems(v)[0];
        sib.style.cssText = 'transform: translateY(0px); font-size:2.5vw;'

        // if(siblingElems(v).length == 2 && siblingElems(v)[1].style.display == 'block'){
        //     sib.style.color = 'rgb(211,44,0)';
        //     v.style.borderBottomColor = 'rgb(211,44,0)';
        // }
        // else{
        sib.style.color = '#F7BC30';
        v.style.borderBottomColor = '#F7BC30';
        //}
    }
}

function getRestaurantStartTime(){
    var startTimeRequest = soapXMLBegin +
        '<app:FetchRestaurantHoursType><app:id>1</app:id></app:FetchRestaurantHoursType>' + soapXMLEnd;
    $.ajax({
        url:servAddr+"/kpos/ws/kposService",
        type:'post',
        datatype:'text',
        data:startTimeRequest,
        processData: false,
        contentType: "text/xml; charset=\"utf-8\"",
        success:function(doc){var responseText = paserXml.serializeToString(doc); startTimePostSuc(responseText)},
        error: function(){startTimePostErr()},
        timeout: 120000
    });
}
function startTimePostSuc(responseText){
    var myJsonObject = getJsonFromSoap(responseText);
    if(!!myJsonObject.fetchrestauranthoursresponsetype.hours.from)
        restaurantStartTime = myJsonObject.fetchrestauranthoursresponsetype.hours.from+":00";

}

function startTimePostErr(){
    //getRestaurantStartTime();
}

function decideClearClickedOrNot(v) {
    if(clearClicked){
        v.value = '';
        $('#'+v.id).focus().select();
        console.log('asd');
        clearClicked = false;
    }
    else{
        var sibs = siblingElems(v);
        if(v.id == 'c_waitingList_note')
            sibs[sibs.length-1].style.display = 'none';
        if(v.id == 'c_waitingList_name')
            sibs[sibs.length-2].style.display = 'none';
        if (deviceType == 'Android' && v.id != 'c_waitingList_phoneNumber') {
            document.getElementById('right_content').style.transform = 'translateY(0px)';
            document.getElementById('right_content').style.trnsition = '0.1s';
        }
        document.activeElement.blur();
        inputOutEffect(v);
    }
}

function decideListDisplayOrClose(elem_event){
    if(clearClicked){
        decideClearClickedOrNot(elem_event);
        return;
    }
    if(!showList){
        var sibs = siblingElems(elem_event);
        sibs[sibs.length-2].style.display = 'none';
        if(elem_event.value.length > 0){
            // v.style.textIndent = '5px';
            elem_event.style.borderBottom = '1px solid';
            elem_event.style.borderBottomColor = '#F7BC30';
            elem_event.style.color = 'white';

            var sib = sibs[0];
            // sib.style.fontSize = '16px';
            // sib.style.transform = 'translateY(-20px)';
            sib.style.color = '#F7BC30';
            // console.log(document.getElementById)

        }
        else{
            elem_event.style.cssText = 'border-bottom:1px solid;border-bottom-color:#F7BC30;text-indent:0px;color:white';
            var sib = sibs[0];
            sib.style.cssText = 'transform:translateY(0px);font-size:2.5vw;color:#F7BC30';
            document.getElementById('nation_field').style.display = 'none';
        }
        document.activeElement.blur();
    }
}

function shake(elem){
    var count = 0;
    var timer = setInterval(function(){
        //console.log('there')
        if(count == 8){
            clearInterval(timer);
            elem.style.transition = '0.05s';
            elem.style.transform = 'translateX(0px)';
            return;
        }
        if(count % 2 == 1){
            elem.style.transition = '0.05s';
            elem.style.transform = 'translateX(10px)';

        }
        else{
            elem.style.transition = '0.05s';
            elem.style.transform = 'translateX(-10px)';
        }
        count++;
    },52);
}

var fullScreenHandler = function(e){
    toggleFullScreen();
    document.removeEventListener("click", fullScreenHandler);
}

function toggleFullScreen(){
    if(document.documentElement.requestFullscreen){
        document.documentElement.requestFullscreen();
    }
    else if(document.documentElement.webkitRequestFullscreen){
        document.documentElement.webkitRequestFullscreen();
    }
    else if(document.documentElement.mozRequestFullScreen){
        document.documentElement.mozRequestFullScreen();
    }
    else if(document.documentElement.msRequestFullscreen){
        document.documentElement.msRequestFullscreen();
    }
    document.getElementById('fullscreenBtn').style.display = 'none';
}

function getMobileOperatingSystem() {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;
    userAgent = userAgent.toLowerCase();
    // Windows Phone must come first because its UA also contains "Android"
    if (/windows/i.test(userAgent)) {
        deviceType = "windows";
    }
    else if (/android/i.test(userAgent)) {
        deviceType = "Android";
    }
    // iOS detection from: http://stackoverflow.com/a/9039885/177710
    else if (/iPad|iPhone|iPod|Mac/.test(userAgent) && !window.MSStream) {
        deviceType = "iOS";
    }
    else{
        deviceType = 'other';
    }

}

jQuery.fn.putCursorAtEnd = function() {

    return this.each(function() {

        // Cache references
        var $el = $(this),
            el = this;

        // Only focus if input isn't already
        if (!$el.is(":focus")) {
            $el.focus();
        }

        // If this function exists... (IE 9+)
        if (el.setSelectionRange) {

            // Double the length because Opera is inconsistent about whether a carriage return is one character or two.
            var len = $el.val().length * 2;

            // Timeout seems to be required for Blink
            setTimeout(function() {
                el.setSelectionRange(len, len);
            }, 1);

        } else {

            // As a fallback, replace the contents with itself
            // Doesn't work in Chrome, but Chrome supports setSelectionRange
            $el.val($el.val());

        }

        // Scroll to the bottom, in case we're in a tall textarea
        // (Necessary for Firefox and Chrome)
        this.scrollTop = 999999;

    });

};

