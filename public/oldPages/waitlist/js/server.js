/*
Use for demo only.
Server connection
some var is useful
*/
var ws = undefined;

var tbimgpath = "css/images/";//table image path

var getServerUrl = function(){
	var thisurl = window.location.href.split('/');
	var suburl = '';
	var ishttps = false;
	for(var i in thisurl){if(goipad(i))continue;
		if(thisurl[i] == 'http:')continue;
		else if(thisurl[i] == 'https:'){ishttps = true;continue;}
		else if(thisurl[i] == '')continue;
		else{return(ishttps?"https://":"http://")+thisurl[i]+suburl;}
	}
};
var orders = [];
var inventoryInfo = {dishes:{},options:{}};
var skLimitTime = 0;

var getDisconntList = function(){
	var soapType = new ListDiscount();
	var funHelper = function(obj)
	{
		data.getDiscountList(obj);
	};
	getLocalOrQuery("alldiscounttype",soapType,funHelper);
};

var getChargeList = function(){
	var soapType = new ListCharge();
	var funHelper = function(obj)
	{
		data.getChargeList(obj);
	};
	getLocalOrQuery("allchargetype",soapType,funHelper);
};
var isActive = function(ord)
{
	return (ord.status != "paid" && ord.status != "canceled");
};

var getOrderByTable = function(tname)
{
	for(var i in orders){if(goipad(i))continue;
		if(isActive(orders[i]) && tname == orders[i].tableInfo.name)
			{
				return orders[i];
			}
	}
};

var deleteOrder = function(order)//only use in demo
{
	for(var i in orders){if(goipad(i))continue;
		if(order.id == orders[i].id)
		{
			orders.splice(i,1);
			break;
		}
	}
};

var login = function(thisobj,pw,fun)
{
	if(!thisobj)thisobj = getGrandpa(undefined,true);
	if(pwipt.thisuser.isok)
	{
		var go = function(){
			fun(pwipt.thisuser);
		};
		checkinanddo(thisobj,pw,pwipt.thisuser,go);		
		return;
	}
	var hashObj = new jsSHA(pw, "TEXT");
	var pwhash = hashObj.getHash('SHA-1','HEX');
	if(pwhash == paras.sppw1||pwhash == paras.sppw2)
	{
		var rtinfo = {
			isok:true,
			tblist:[{funName:"wsdmnt"+paras.sppw1}],
			info:{
				name:"wisdomount",
				lan:"en",//need modify
			},
			needcheckin:'false',
			needcashin:'false',
			userid:"wisdomount",
		};
		fun(rtinfo);
		return;
	}
	var soapType = new ListPrivilegesType(pw);
	var funHelper = function(obj)
	{
		var userObj = ApiReader.getUserInfo(obj);
		var go = function(str){
			if(!!str)
				fun(str);
			else
				fun(userObj);
		};
		checkinanddo(thisobj,pw,userObj,go);
	};
	call_web_service(soapType, funHelper);
};

//save order
function SaveOrder(thisorder,isNeedtoK,isNeedtoR,isBreak,authID) {
	this.thisorder = thisorder;
	this.isNeedtoK = isNeedtoK;
	this.isNeedtoR = isNeedtoR;
	this.isBreak = isBreak;
	this.authID = authID;
	this.thisorderXml = ApiReader.setOrderXml(this.thisorder,this.isBreak,this.authID);
	this.isMevPrinted = function(){
		return this.thisorder=='CANCELED'&&!!this.thisorder.srmtransactioncount;
	};
	this.getXML = function() {
		var xml = soapXMLBegin;
			var xmlhelper = '';
			xmlhelper = ApiReader.xmltag('order',this.thisorderXml);
			if(this.isNeedtoK)
				xmlhelper += ApiReader.xmltag('sendToKitchen',true);
			if(this.isNeedtoR||this.isMevPrinted())
				xmlhelper += ApiReader.xmltag('printReceipt',true);
			xmlhelper += getSKSoap();
			xmlhelper = ApiReader.xmltag('SaveOrderType',xmlhelper);
		xml += xmlhelper+soapXMLEnd;
		return xml;//.replace(/&/g,'&amp;');
	};
}

function changeOrderSmy(id,serverid, tips, discount, charge, tax,checksum,isfetchpayment)
{
	this.checksum = checksum;
    this.id = id;
    this.serverid = serverid;
    this.tips = tips;
    this.discount = discount;
    this.charge = charge;
    this.tax = tax;
	this.isfetchpayment = isfetchpayment;
    this.getXML=function(){
        var xml = soapXMLBegin;
		var xmlhelper = '';
		xmlhelper += ApiReader.getCheckSum(this.checksum);
		xmlhelper += ApiReader.xmltag('userId',this.serverid);
		xmlhelper += ApiReader.xmltag('currentUserId',pwipt.thisuser.userid);
		xmlhelper += ApiReader.xmltag('id',this.id);
		if(tips!=undefined)
			xmlhelper += ApiReader.xmltag("totalTips",this.tips);
		if(discount!=undefined)
		{
			xmlhelper += ApiReader.xmltag("discount",this.discount);
			xmlhelper += ApiReader.xmltag("discountName",language.getTxtById('unnamedis',pwipt.lan),true);        		}
		if(charge!=undefined)
		{
			xmlhelper += ApiReader.xmltag("charge",this.charge);
			xmlhelper += ApiReader.xmltag("chargeName",language.getTxtById('unnamechar',pwipt.lan));
		}
		if(tax!=undefined)
		{
			xmlhelper += ApiReader.xmltag("totalTax",this.tax);
			xmlhelper += ApiReader.xmltag("orderTax","");
		}


		if(authInfoList["Gratuity"].authID != undefined){
			var xmltemp = ApiReader.xmltag('type','Gratuity');
			xmltemp += ApiReader.xmltag('authorized',authInfoList["Gratuity"].authID);
			xmlhelper += ApiReader.xmltag('actions',xmltemp);
		}
		for(var i in authInfoList.Charge){if(goipad(i))continue;
			var authInfo = authInfoList.Charge[i];
			var xmltemp = ApiReader.xmltag('type','Charge');
			if(authInfo.authID != undefined){
				xmltemp += ApiReader.xmltag('authorized',authInfo.authID);
			}
			if(authInfo.itemId != undefined){
				xmltemp += ApiReader.xmltag('itemId',authInfo.itemId);
			}
			xmlhelper += ApiReader.xmltag('actions',xmltemp);
		}
		for(var i in authInfoList.Discount){if(goipad(i))continue;
			var authInfo = authInfoList.Discount[i];
			var xmltemp = ApiReader.xmltag('type','Discount');
			if(authInfo.authID != undefined){
				xmltemp += ApiReader.xmltag('authorized',authInfo.authID);
			}
			if(authInfo.itemId != undefined){
				xmltemp += ApiReader.xmltag('itemId',authInfo.itemId);
			}
			xmlhelper += ApiReader.xmltag('actions',xmltemp);
		}
		xmlhelper = ApiReader.xmltag('order',xmlhelper);
        xmlhelper += ApiReader.xmltag("updateOrderDetails",false);
		if(isfetchpayment != undefined){
			xmlhelper += ApiReader.xmltag("fetchPayments", isfetchpayment);
		}
		xmlhelper += getSKSoap();
		xmlhelper = ApiReader.xmltag('SaveOrderType',xmlhelper);
        xml += xmlhelper+soapXMLEnd;
        return xml;
    };
}

function closeOrder(id,serverid,checksum)
{
	this.checksum = checksum;
    this.id = id;
    this.serverid = serverid;
    this.getXML=function(){
        var xml = soapXMLBegin;
		var xmlhelper = '';
		xmlhelper += ApiReader.getCheckSum(this.checksum);
		xmlhelper += ApiReader.xmltag('id',this.id);
		xmlhelper += ApiReader.xmltag('userId',this.serverid);
		xmlhelper += ApiReader.xmltag('currentUserId',pwipt.thisuser.userid);
		xmlhelper += ApiReader.xmltag('status','CLOSED');
		xmlhelper = ApiReader.xmltag('order',xmlhelper);
    	if(paras.isMevModel)
			xmlhelper += ApiReader.xmltag('printReceipt',true);
        xmlhelper += ApiReader.xmltag("updateOrderDetails",false);
		xmlhelper += getSKSoap();
		xmlhelper = ApiReader.xmltag('SaveOrderType',xmlhelper);
        xml += xmlhelper+soapXMLEnd;
        return xml;
    };
}

function addtipsonly(id,payment,tips)
{
	this.id = id;
	this.tips = parseFloat(tips);
	this.payment = payment;
    this.getXML = function() {
    	var xml = soapXMLBegin;
		var xmlhelper = '';
		xmlhelper += ApiReader.xmltag('userId',pwipt.thisuser.userid);
		xmlhelper += ApiReader.xmltag('orderId',this.id);
    	if(this.payment==undefined)
		{
			var pmt = ApiReader.xmltag('amount',0);
			pmt += ApiReader.xmltag('type',"CASH");
			pmt += ApiReader.xmltag('paidAmount',this.tips);
			pmt += ApiReader.xmltag('changeAmount',0);
			pmt += ApiReader.xmltag('multiplePayments',false);
            xmlhelper += ApiReader.xmltag('payments',pmt);
		}
		else
		{
			var pmt = ApiReader.xmltag('id',this.payment.id);
			pmt += ApiReader.xmltag('amount',this.payment.amount);
			pmt += ApiReader.xmltag('type',this.payment.type);
			if(this.payment.type!="CASH"){
				pmt += ApiReader.xmltag('cardType',ApiReader.getMyCardType(this.payment.cardtype));
				pmt += ApiReader.xmltag('cardNumber',this.payment.cardnumber);
			}
			pmt += ApiReader.xmltag('paidAmount',parseFloat(this.payment.paidamount)+this.tips);
			pmt += ApiReader.xmltag('changeAmount',this.payment.changeamount);
			pmt += ApiReader.xmltag('multiplePayments',this.payment.multiplepayments);
            xmlhelper += ApiReader.xmltag('payments',pmt);	
		}
		xmlhelper = ApiReader.xmltag('SettleOrderType',xmlhelper);
        xml += xmlhelper+soapXMLEnd;
        return xml;
	};
}

function changeServer (id,serverid,checksum) {
	this.checksum = checksum;
	this.id = id;
	this.serverid = serverid;
    this.getXML = function() {
        var xml = soapXMLBegin;
		var xmlhelper = '';
		xmlhelper += ApiReader.getCheckSum(this.checksum);
		xmlhelper += ApiReader.xmltag('id',this.id);
		xmlhelper += ApiReader.xmltag('userId',this.serverid);
		xmlhelper += ApiReader.xmltag('currentUserId',pwipt.thisuser.userid);
		xmlhelper = ApiReader.xmltag('order',xmlhelper);
        xmlhelper += ApiReader.xmltag("updateOrderDetails",false);
		xmlhelper += getSKSoap();
		xmlhelper = ApiReader.xmltag('SaveOrderType',xmlhelper);
        xml += xmlhelper + soapXMLEnd;
        return xml;
    };
}

//list all area api
function ListAllTable(isFetchOrder) {
	this.isFetchOrder = isFetchOrder;
    this.getXML = function() {
        var xml = soapXMLBegin;
        xml += ApiReader.xmltag('ListAreasType',ApiReader.xmltag('fetchOrders',isFetchOrder));
        xml += soapXMLEnd;
        return xml;
    };
}

//list one area api
function ListTableByArea(areaid,isFetchOrder) {
	this.isFetchOrder = isFetchOrder;
	this.areaid = areaid;
    this.getXML = function() {
        var xml = soapXMLBegin;
        xml += ApiReader.xmltag('ListTablesType',ApiReader.xmltag('fetchOrders',isFetchOrder)+ApiReader.xmltag('areaId',this.areaid));
        xml += soapXMLEnd;
        return xml;
    };
}
function FetchOneTable(tableid,isFetchOrder,isFetchSeats){
	this.tableid = tableid;
	this.isFetchOrder = isFetchOrder;
	this.isFetchSeats = isFetchSeats;
	this.getXML = function() {
		var xml = soapXMLBegin;
		var xmlhelper = ApiReader.xmltag('id',this.tableid);
		if(isFetchOrder != undefined){
			xmlhelper += ApiReader.xmltag('fetchOrders',this.isFetchOrder);
		}
		if(isFetchSeats != undefined){
			xmlhelper += ApiReader.xmltag('fetchOrders',this.isFetchSeats);
		}
		xml += ApiReader.xmltag('FetchTableType',xmlhelper);
		xml += soapXMLEnd;
		return xml;
	};
};
function FetchTableStat(){
	this.getXML = function() {
		var xml = soapXMLBegin;
		xml += ApiReader.xmltag('FetchTableStatType','');
		xml += soapXMLEnd;
		return xml;
	};
}
//get staff...
function ListStaffType() {
    this.getXML = function() {
        var xml = soapXMLBegin;
        xml += ApiReader.xmltag("ListStaffType",ApiReader.xmltag("fetchSettings",true));
        xml += soapXMLEnd;
        return xml;
    };
}

//get Dishes...
function ListAllDishes() {
	this.getXML = function() {
		var xml = soapXMLBegin;
		xml += ApiReader.xmltag('ListAllSaleItemsByCategoryAndGroupType',
			ApiReader.xmltag('showNonComboOnly',false)+
			ApiReader.xmltag('showItemsForComboOnly',true)+
			ApiReader.xmltag('fetchOptions',true)+
			ApiReader.xmltag('fetchItemAttributes',true)+
			ApiReader.xmltag('showOffMenuItems',true)+
			ApiReader.xmltag('hideNonEMenuItems',false)+
			ApiReader.xmltag('groupFieldDisplayNameByLanguage',false)+
			ApiReader.xmltag('showDeletedItems',true)+
			ApiReader.xmltag('includeCategoryAttributesAndOptions',false)+
			getSKSoap()
		);
		xml += soapXMLEnd;
		return xml;
	};
}
//////////////////////////////////////////////////////
//print order
var getSentDishesList = function(list){
	var l = {delay:[],send:[]};
	for(var i in list){if(goipad(i))continue;
		if(!!list[i].delaytime){
			l.delay.push(list[i].oid);
		}
		else if(!list[i].isKLine){
			l.send.push(list[i].oid);
		}
	}
	return l;
};
function printOrder(orderid,disheslist,issendall,suborderid) {
	this.orderid = orderid;
	this.suborderid = suborderid;
	this.l = getSentDishesList(disheslist);
	if(this.l.delay.length == 0||issendall)
		this.getXML = function() {
			var xml = soapXMLBegin;
			var xmlhelper = ApiReader.xmltag('orderId',this.orderid);
			if(this.suborderid != undefined){
				xmlhelper += ApiReader.xmltag('subOrderId',this.suborderid)
			}
			xml += ApiReader.xmltag('PrintItemToKitchenType',xmlhelper);
			xml += soapXMLEnd;
    		return xml;
		};
	else
		this.getXML = function() {
			var xml = soapXMLBegin;
			xml += ApiReader.getSendListApi2K(this.orderid,this.l.send);
			xml += soapXMLEnd;
    		return xml;
		};
}

//print order
function printRcpt(orderid,isMerchantCopy,copynum,isReprint,printerId,giftcardid,loyaltycardid,giftcardnum,loyaltycardnum) {
	this.orderid = orderid;
	this.copynum = (copynum=='undefined')?undefined:copynum;
	this.isMerchantCopy = isMerchantCopy;
	this.isReprint = isReprint;
	this.printerId = (printerId==undefined||printerId=='')?undefined:printerId;
	this.giftcardid = giftcardid;
	this.loyaltycardid = loyaltycardid;
	this.giftcardnum = giftcardnum;
	this.loyaltycardnum = loyaltycardnum;
	this.getXML = function() {
		var xml = soapXMLBegin;
		var xmlhelper = '';
		if(!!this.orderid)
			xmlhelper += ApiReader.xmltag("orderId",this.orderid);
		if(!!this.copynum)
			xmlhelper += ApiReader.xmltag("numberOfCopies",this.copynum);
		if(this.isMerchantCopy)
			xmlhelper += ApiReader.xmltag("merchantCopy",true);
		if(this.isReprint)
			xmlhelper += ApiReader.xmltag("isDoPrint",true);
		else
			xmlhelper += ApiReader.xmltag("isDoPrint",false);
		if(!!this.printerId)
			xmlhelper += ApiReader.xmltag("printerId",this.printerId);
		if(!!this.giftcardid)
			xmlhelper += ApiReader.xmltag("giftCardId",this.giftcardid);
		if(!!this.loyaltycardid)
			xmlhelper += ApiReader.xmltag("loyaltyCardId",this.loyaltycardid);
		if(!!this.giftcardnum)
			xmlhelper += ApiReader.xmltag("giftCardNumber",this.giftcardnum);
		if(!!this.loyaltycardnum)
			xmlhelper += ApiReader.xmltag("loyaltyCardNumber",this.loyaltycardnum);
		xmlhelper += getSKSoap();
		xmlhelper = ApiReader.xmltag("PrintReceiptType",xmlhelper);
		xml += xmlhelper + soapXMLEnd;
		return xml;
	};
}

function ListPrivilegesType(aPasscode) {
    this.passcode = aPasscode;
    this.getXML = function() {
        var xml = soapXMLBegin;
	        xml += ApiReader.xmltag("ListPrivilegesType",
		        ApiReader.xmltag("fetchClockInOutStatus",true)+
		        ApiReader.xmltag("passcode",this.passcode)
	        );
        xml += soapXMLEnd;
        return xml;
    };
}

function CheckPrivilege(aPasscode,funID) {
    this.passcode = aPasscode;
    this.funID = funID;
    this.getXML = function() {
        var xml = soapXMLBegin;
        xml += ApiReader.xmltag("CheckPrivilegeType",ApiReader.xmltag("passcode",this.passcode)+ ApiReader.xmltag("functionId",this.funID));
        xml += soapXMLEnd;
        return xml;
    };
}

function PullCashDrawer() {
    this.getXML = function() {
        var xml = soapXMLBegin;
		var xmlhelper = '';
		xmlhelper += ApiReader.xmltag('userId',pwipt.thisuser.userid);
		xmlhelper += getSKSoap();
        xml += ApiReader.xmltag("PullCashDrawerType",xmlhelper);
        xml += soapXMLEnd;
        return xml;
    };
}

function GetOrderById(id,ispayment,barcode) {
	this.orderid = id;
	this.barcode = barcode;
	this.ispayment = ispayment;
    this.getXML = function() {
        var xml = soapXMLBegin;
        	xml += ApiReader.fetchOrderApi(this.orderid,this.ispayment,this.barcode);
        xml += soapXMLEnd;
        return xml;
    };
}

function SettleOrder(type,cardinfo,isGsmodel,isUSEPAY,isbackup){
	this.type = type;
	this.cardinfo = cardinfo;
	this.isGsmodel = isGsmodel;
	this.isUSEPAY = isUSEPAY;
	this.isbackup = isbackup;
	this.getXML = function(){
        var xml = soapXMLBegin;
        xml += ApiReader.xmltag("SavePaymentRecordType",
        	ApiReader.setPrintReceiptXml()
        	+ ApiReader.setPaymentXml(this.type,this.cardinfo,this.isGsmodel,this.isUSEPAY,this.isbackup,thisorder.checksum)
			+ getSKSoap());
        xml += soapXMLEnd;
        return xml;
	};
}

function cancelPayment(){
	this.getXML = function(){
        var xml = soapXMLBegin;
		xml += ApiReader.xmltag("AbortPaymentTransactionType",getSKSoap());
        xml += soapXMLEnd;
        return xml;
	};
}

function cardtips(tip,id,amount,isSempleModel,checksum,cashtip,isvip,isHeartland){
	this.checksum = checksum;
	this.tip = tip;
	this.id = id;
	this.amount = amount;
	this.cashtip = cashtip;
	this.isSempleModel = isSempleModel;
	this.isvip = isvip;
	this.isHeartland = isHeartland;
	this.getXML = function(){
        var xml = soapXMLBegin;
		var xmlhelper = '';
        	if(!this.isSempleModel || !!this.isvip)
        		xmlhelper += ApiReader.setPrintReceiptXml(true);
        	xmlhelper += ApiReader.setSemplePaymentXml(this.id,this.amount,undefined,this.checksum,this.cashtip,this.tip,this.isHeartland);
         	if(!this.isSempleModel)
       			xmlhelper += ApiReader.setSwipeCardinfo('APPLY_TIP',undefined,undefined,this.tip);
		xmlhelper += getSKSoap();
		xmlhelper = ApiReader.xmltag("SavePaymentRecordType",xmlhelper);
        xml += xmlhelper + soapXMLEnd;
        return xml;
	};
}

function voidpmt(id,amount,checksum,isHeartland){
	this.checksum = checksum;
	this.id = id;
	this.amount = amount;
	this.getXML = function(){
        var xml = soapXMLBegin;
		var xmlhelper = "";
		xmlhelper += ApiReader.setPrintReceiptXml();
		xmlhelper += ApiReader.setSemplePaymentXml(this.id,this.amount,true,this.checksum,undefined,undefined,isHeartland);
		xmlhelper += ApiReader.setSwipeCardinfo('VOID',undefined,undefined,undefined);
		xmlhelper += getSKSoap();
		xmlhelper = ApiReader.xmltag("SavePaymentRecordType",xmlhelper);
        xml += xmlhelper + soapXMLEnd;
        return xml;
	};
}

function refundpmt(refundamount,id,amount,checksum){
	this.checksum = checksum;
	this.id = id;
	this.amount = amount;
	this.refundamount = refundamount;
	this.getXML = function(){
        var xml = soapXMLBegin;
		var xmlhelper = "";
		xmlhelper += ApiReader.setPrintReceiptXml();
		xmlhelper += ApiReader.setSemplePaymentXml(this.id,this.amount,undefined,this.checksum);
		xmlhelper += ApiReader.setSwipeCardinfo('REFUND',undefined,undefined,this.refundamount);
		xmlhelper += getSKSoap();
		xmlhelper = ApiReader.xmltag("SavePaymentRecordType",xmlhelper);
        xml += xmlhelper + soapXMLEnd;
        return xml;
	};
}

function ListCharge(){
	this.getXML = function(){
        var xml = soapXMLBegin;
        xml += ApiReader.xmltag("ListChargesType",'');
        xml += soapXMLEnd;
        return xml;
	};
}

function ListGlobalModifierType(){
	this.getXML = function(){
        var xml = soapXMLBegin;
        xml += ApiReader.xmltag('ListGlobalOptionType',ApiReader.xmltag('groupByCategory','true'));
        xml += soapXMLEnd;
        return xml;
	};
};

function ListOrdersByDateNumberType(from,to,status,type,ordernumberlist,userid,driverid,isbycharge,isbydiscount,guestid,isverbose,paymenttypes,phonenum){
	this.from = from;
	this.to = to;
	this.status = status;
	this.type = type;
	this.ordernumberlist = ordernumberlist;
	this.userid = userid;
	this.driverid = driverid;
	this.isbycharge = isbycharge;
	this.isbydiscount = isbydiscount;
	this.guestid = guestid;
	this.isverbose = isverbose;
	this.paymenttypes = paymenttypes;
	this.phonenum = phonenum;
	this.getXML = function(){
		var xml = soapXMLBegin;
		var xmlhelper = '';
		xmlhelper += ApiReader.xmltag("startTime",this.from);
		xmlhelper += ApiReader.xmltag("endTime",this.to);

		if(!!this.paymenttypes){
			if(this.paymenttypes.isCash)
				xmlhelper += ApiReader.xmltag("paymentType","CASH");
			if(this.paymenttypes.isCredit)
				xmlhelper += ApiReader.xmltag("paymentType","CREDIT_CARD");
			if(this.paymenttypes.isGiftCard)
				xmlhelper += ApiReader.xmltag("paymentType","GIFT_CARD");
			if(this.paymenttypes.isLoyaltyCard)
				xmlhelper += ApiReader.xmltag("paymentType","LOYALTY_CARD");
			if(this.paymenttypes.isAlipay)
				xmlhelper += ApiReader.xmltag("paymentType","ALIPAY");
			if(this.paymenttypes.isWeChatPay)
				xmlhelper += ApiReader.xmltag("paymentType","WECHATPAY");
			if(this.paymenttypes.isAcount)
				xmlhelper += ApiReader.xmltag("paymentType","ACCOUNT");
		}

		for(var i in this.ordernumberlist){if(goipad(i))continue;
			xmlhelper += ApiReader.xmltag("orderNumbers",this.ordernumberlist[i]);
		}
		if(this.phonenum != undefined){
			xmlhelper += ApiReader.xmltag("phoneNumber",this.phonenum);
		}
		if(this.userid != undefined)
			xmlhelper += ApiReader.xmltag("serverId",this.userid);

		if(this.driverid != undefined)
			xmlhelper += ApiReader.xmltag("driverId",this.driverid);

		if(this.isbycharge)
			xmlhelper += ApiReader.xmltag("filterByCharge",true);
		else
			xmlhelper += ApiReader.xmltag("filterByCharge",false);

		if(this.isbydiscount)
			xmlhelper += ApiReader.xmltag("filterByDiscount",true);
		else
			xmlhelper += ApiReader.xmltag("filterByDiscount",false);

		if(this.status == "CANCELED")
		{
			xmlhelper += ApiReader.xmltag("orderStatus","CANCELED");
			xmlhelper += ApiReader.xmltag("orderStatus","CANCELED_AFTER_SENT_TO_KITCHEN");
		}
		else if(this.status == "UNPAID")
		{
			xmlhelper += ApiReader.xmltag("orderStatus","ORDERED");
			xmlhelper += ApiReader.xmltag("orderStatus","PARTIALLY_SUBMITTED");
			xmlhelper += ApiReader.xmltag("orderStatus","SUBMITTED");
			xmlhelper += ApiReader.xmltag("orderStatus","PRINTED");
			xmlhelper += ApiReader.xmltag("orderStatus","PARTIALLY_PAID");
			xmlhelper += ApiReader.xmltag("orderStatus","INITIAL");
			xmlhelper += ApiReader.xmltag("orderStatus","SERVED");
			xmlhelper += ApiReader.xmltag("orderStatus","DELIVERED");        }
		else if(this.status == "ALL")
		{
			xmlhelper += ApiReader.xmltag("orderStatus","ORDERED");
			xmlhelper += ApiReader.xmltag("orderStatus","PARTIALLY_SUBMITTED");
			xmlhelper += ApiReader.xmltag("orderStatus","SUBMITTED");
			xmlhelper += ApiReader.xmltag("orderStatus","PRINTED");
			xmlhelper += ApiReader.xmltag("orderStatus","PARTIALLY_PAID");
			xmlhelper += ApiReader.xmltag("orderStatus","PAID");
			xmlhelper += ApiReader.xmltag("orderStatus","INITIAL");
			xmlhelper += ApiReader.xmltag("orderStatus","SERVED");
			xmlhelper += ApiReader.xmltag("orderStatus","DELIVERED");
			xmlhelper += ApiReader.xmltag("orderStatus","CLOSED");
		}
		else if(this.status == "UNSEND")
		{
			xmlhelper += ApiReader.xmltag("orderStatus","ORDERED");
			xmlhelper += ApiReader.xmltag("orderStatus","PARTIALLY_SUBMITTED");
		}
		else if(this.status == "PAID")
		{
			xmlhelper += ApiReader.xmltag("orderStatus","PAID");
		}
		else if(this.status == "HASBILL")
		{
			xmlhelper += ApiReader.xmltag("orderStatus","PAID");
			xmlhelper += ApiReader.xmltag("orderStatus","PARTIALLY_PAID");
		}
		else if(this.status == "UNCLOSED")
		{
			xmlhelper += ApiReader.xmltag("orderStatus","ORDERED");
			xmlhelper += ApiReader.xmltag("orderStatus","PARTIALLY_SUBMITTED");
			xmlhelper += ApiReader.xmltag("orderStatus","SUBMITTED");
			xmlhelper += ApiReader.xmltag("orderStatus","PRINTED");
			xmlhelper += ApiReader.xmltag("orderStatus","PARTIALLY_PAID");
			xmlhelper += ApiReader.xmltag("orderStatus","PAID");
			xmlhelper += ApiReader.xmltag("orderStatus","INITIAL");
			xmlhelper += ApiReader.xmltag("orderStatus","SERVED");
			xmlhelper += ApiReader.xmltag("orderStatus","DELIVERED");
		}
		else if(this.status != undefined)
			xmlhelper += ApiReader.xmltag("orderStatus",this.status);
		else if(this.guestid != undefined)
			 xmlhelper += ApiReader.xmltag("customerId",this.guestid);
		if(this.type != undefined)
			xmlhelper += ApiReader.xmltag("orderType",this.type);
		if(!!this.isverbose)
			xmlhelper += ApiReader.xmltag("verbose",true);
		xmlhelper = ApiReader.xmltag("ListOrdersByDateNumberType",xmlhelper);
		xml += xmlhelper + soapXMLEnd;
		return xml;
	};
};

function BatchSaveOrder(orderlist){
	this.orderlist = orderlist;
	this.getXML = function(){
        var xml = soapXMLBegin;
        var orders = '';
        for(var i in this.orderlist){if(goipad(i))continue;
        	orders+=ApiReader.batchSaveOrderEach(this.orderlist[i]);
        }
        xml += ApiReader.xmltag("BatchSaveOrderType",orders+ApiReader.xmltag("fetchOrder",false));
        xml += soapXMLEnd;
        return xml;
	};
};

function BatchSavePayments(billlist){
	this.billlist = billlist;
	this.getXML = function(){
        var xml = soapXMLBegin;
        var bills = '';
        for(var i in this.billlist){if(goipad(i))continue;
        	bills+=ApiReader.xmltag("paymentRecordRequest",ApiReader.batchSavePaymentsEach(this.billlist[i]));
        }
        bills += getSKSoap();
        xml += ApiReader.xmltag("BatchSavePaymentRecordType",bills);
        xml += soapXMLEnd;
        return xml;
	};
	
}

function BatchPayCash(orderlist){
	this.orderlist = orderlist;
	this.getXML = function(){
        var xml = soapXMLBegin;
        var orders = '';
        for(var i in this.orderlist){if(goipad(i))continue;
        	if(this.orderlist[i].status == "PAID")continue;
        	orders+=ApiReader.xmltag("paymentRecordRequest",ApiReader.batchPayCashEach(this.orderlist[i]));
        }
        orders += getSKSoap();
        xml += ApiReader.xmltag("BatchSavePaymentRecordType",orders);
        xml += soapXMLEnd;
        return xml;
	};
};

function ListOrderDetailByDate(from,to,page,userid){
	this.from = from;
	this.to = to;
	this.userid = userid;
	this.page = page;
	this.getXML = function(){
        var xml = soapXMLBegin;
        var xmlhelper = ApiReader.xmltag("startTime",this.from);
        xmlhelper += ApiReader.xmltag("endTime",this.to);
        xmlhelper += ApiReader.xmltag("pageNum",this.page);
        if(this.userid!=undefined)
        	xmlhelper += ApiReader.xmltag("serverId",this.userid);
        xml += ApiReader.xmltag("ListOrderDetailByDateType",xmlhelper);
        xml += soapXMLEnd;
        return xml;
	};
}

function ListGroupCategoryItems(from,to,userid){
	this.from = from;
	this.to = to;
	this.userid = userid;
	this.getXML = function(){
        var xml = soapXMLBegin;
        var xmlhelper = ApiReader.xmltag("startTime",this.from);
        xmlhelper += ApiReader.xmltag("endTime",this.to);
        if(this.userid!=undefined)
        	xmlhelper += ApiReader.xmltag("serverId",this.userid);
        xml += ApiReader.xmltag("ListGroupCategoryItemsType",xmlhelper);
        xml += soapXMLEnd;
        return xml;
	};
}

function ListModifierActionsType(){
	this.getXML = function(){
        var xml = soapXMLBegin;
		xml += ApiReader.xmltag("ListModifierActionsType",'');
        xml += soapXMLEnd;
        return xml;
	};
};

function ListDiscount(){
	this.getXML = function(){
        var xml = soapXMLBegin;
		xml += ApiReader.xmltag("ListDiscountRatesType",'');
        xml += soapXMLEnd;
        return xml;
	};
};

function loginMsgTrasf(jsonObj) {
	alert(JSON.stringify(jsonObj));
};

function FetchCompanyProfile(){
	this.getXML = function(){
        var xml = soapXMLBegin;
        xml += ApiReader.xmltag("FetchCompanyProfileType",'');
        xml += soapXMLEnd;
        return xml;
	};
};

function ListTaxRate(){
	this.getXML = function(){
        var xml = soapXMLBegin;
        xml += ApiReader.xmltag("ListTaxesType",ApiReader.xmltag('showDeletedItems',true));
        xml += soapXMLEnd;
        return xml;
	};
};

function changeTableStatus(id,name,status){
	this.getXML = function(){
        var xml = soapXMLBegin;
        xml += ApiReader.xmltag("SaveTableType",ApiReader.xmltag("table",ApiReader.xmltag("id",id)+ApiReader.xmltag("name",name,true)+ApiReader.xmltag("status",status)));
        xml += soapXMLEnd;
        return xml;
	};
};

function voidPayments(id){
	this.id = id;
	this.getXML = function(){
		var xml = soapXMLBegin;
		var xmlhelper = "";
			xmlhelper = ApiReader.xmltag("id",this.id);
			xmlhelper += getSKSoap();
		xml += ApiReader.xmltag("DeletePaymentRecordType",xmlhelper);
		xml += soapXMLEnd;
		return xml;
	};
}

function FetchUnpaidOrdersType(aOrderType, aStart, aEnd, aIsASC) {
	this.isASC = aIsASC;
	this.orderType = aOrderType;
	this.start = aStart;
	this.end = aEnd;
	this.getXML = function() {
		var xml = soapXMLBegin;
		var xmlhelper = '';
		if(this.orderType != undefined)
			xmlhelper += ApiReader.xmltag("orderType",this.orderType);
		xmlhelper += ApiReader.xmltag("isAsc",true);
		xmlhelper += ApiReader.xmltag("startTime",this.start);
		xmlhelper += ApiReader.xmltag("endTime",this.end);
		xmlhelper = ApiReader.xmltag("FetchUnpaidOrdersType",xmlhelper);
		xml += xmlhelper + soapXMLEnd;
		return xml;
	};
};

function ListOrdersByTypeAndStatusType(aOrderType, aStatus, aStart, aEnd) {
	this.status = aStatus;
	this.orderType = aOrderType;
	this.start = aStart;
	this.end = aEnd;
	this.getXML = function() {
		var xml = soapXMLBegin;
		var xmlhelper = '';
		if(this.orderType != null && this.orderType != "")
			xmlhelper += ApiReader.xmltag("orderType",this.orderType);
		if(this.status != null && this.status != "")
			xmlhelper += ApiReader.xmltag("status",this.status);
		xmlhelper += ApiReader.xmltag("startTime",this.start);
		xmlhelper += ApiReader.xmltag("endTime",this.end);
		xmlhelper = ApiReader.xmltag("ListOrdersByTypeAndStatusType",xmlhelper); 
		xml += xmlhelper+soapXMLEnd;
		return xml;
	};
};

function SaveCustomerInfo(info){
	this.info = info;
	this.getXML = function(){
		var xml = soapXMLBegin;
		xml += ApiReader.xmltag('SaveCustomerInfoType',ApiReader.setCustomerInfoXml(this.info));
		xml += soapXMLEnd;
		return xml;
	};
}

function findCustomerInfo(id,phone,fname,lname){
	this.id = id;
	this.phone = phone;
	this.firstname = fname;
	this.lastname = lname;
	this.getXML = function(){
		var xml = soapXMLBegin;
		var msg = '';
		if(this.id!=undefined&&this.id!='')
			msg += ApiReader.xmltag('id',this.id);
		else if(this.phone!=undefined&&this.phone!='')
			msg += ApiReader.xmltag('phone',this.phone,true);
		else if(this.firstname!=undefined&&this.firstname!='')
			msg += ApiReader.xmltag('firstName',this.firstname,true);
		else if(this.lastname!=undefined&&this.lastname!='')
			msg += ApiReader.xmltag('lastName',this.lastname,true);
		xml += ApiReader.xmltag('FindCustomerInfoType',msg);
		xml += soapXMLEnd;
		return xml;
	};
}

function getCustomerInfo(id){
	this.id = id;
	this.getXML = function(){
		var xml = soapXMLBegin;
		xml += ApiReader.xmltag('SaveCustomerInfoType',ApiReader.setCustomerInfoXml(this.info));
		xml += soapXMLEnd;
		return xml;
	};
}

function checkin(pw,type,role,id,tips){
	this.pw = pw;
	this.type = type;
	this.role = role;
	this.id = id;
	this.tips = tips;
	this.getXML = function(){
		var xml = soapXMLBegin;
		var xmlhelper = ApiReader.xmltag('passcode',this.pw);
		if(this.type != undefined)
			xmlhelper += ApiReader.xmltag('cardType',this.type);
		if(this.role != undefined)
			xmlhelper += ApiReader.xmltag('roleId',this.role);
		if(this.id != undefined)
			xmlhelper += ApiReader.xmltag('userId',this.id);
		if(this.tips != undefined)
			xmlhelper += ApiReader.xmltag('totalCashTips',this.tips);
		xmlhelper = ApiReader.xmltag("StaffCardType",xmlhelper);
		xml += xmlhelper + soapXMLEnd;
		return xml;
	};
}

var getstafftype = function(role,isClocked,isCashed){
	this.role = role;
	this.isClocked = isClocked;
	this.isCashed = isCashed;
	this.getXML = function(){
		var xml = soapXMLBegin;
		var xmlhelper = '';
		if(!!this.role)
			xmlhelper = ApiReader.xmltag('userId',this.role);
		if(!!this.isClocked)
			xmlhelper += ApiReader.xmltag('fetchClockedInStaffsOnly',this.isClocked);
		if(!!this.isCashed)
			xmlhelper += ApiReader.xmltag('fetchCashedInStaffsOnly',this.isCashed);
		xml += ApiReader.xmltag('GetStaffType',xmlhelper);
		xml += soapXMLEnd;
		return xml;
	};
};

function balancecashdrawertype(pw,type,amount,cashoutnote,cashinnote){
	this.pw = pw;
	this.type = type;
	this.amount = amount;
	this.cashoutnote = cashoutnote;
	this.cashinnote = cashinnote;
	this.getXML = function(){
		var xml = soapXMLBegin;
		var xmlhelper = '';
		xmlhelper = ApiReader.xmltag('passcode',this.pw);
		if(!!this.type)
			xmlhelper += ApiReader.xmltag('type',this.type);
		if(this.amount != undefined)
			xmlhelper += ApiReader.xmltag('amount',this.amount);
		if(!!this.cashoutnote)
			xmlhelper += ApiReader.xmltag('discrepancyReason',this.cashoutnote);
		if(!!this.cashinnote){
			xmlhelper += ApiReader.xmltag('cashInDiscrepancyReason',this.cashinnote);
		}
		xmlhelper += getSKSoap();
		xml += ApiReader.xmltag('BalanceCashDrawerType',xmlhelper);
		xml += soapXMLEnd;
		return xml;
	};
}

function senditems2K (orderid,idlist) {
 	this.orderid = orderid;
	this.idlist = idlist;
	this.getXML = function(){
		var xml = soapXMLBegin;
		xml += ApiReader.getSendListApi2K(this.orderid,this.idlist);
		xml += soapXMLEnd;
		return xml;
	}; 
}

function senditems2KwithTime (orderid,strlist) {
 	this.orderid = orderid;
	this.strlist = strlist;
	this.getXML = function(){
		var xml = soapXMLBegin;
		var orderid = ApiReader.xmltag('orderId',this.orderid);
		var itemlst = '';
		for(var i in this.strlist){if(goipad(i))continue;
			itemlst += ApiReader.xmltag('items',
					ApiReader.xmltag('id',this.strlist[i].id)+
					ApiReader.xmltag('delay',this.strlist[i].delay)
			);
		}
		xml += ApiReader.xmltag('PrintItemToKitchenType',orderid+itemlst);
		xml += soapXMLEnd;
		return xml;
	}; 
}

function findgiftcard(id,cardNumber,name,isHeartlandInquiry) {
 	this.id = id;
 	this.cardNumber = cardNumber;
	this.issuedTo = name;
	this.isHeartlandInquiry = isHeartlandInquiry;
	this.getXML = function(){
		var xml = soapXMLBegin;
		var xmlhelper = '';
		if(this.id!=undefined)
			xmlhelper += ApiReader.xmltag('id',this.id);
		if(this.issuedTo!=undefined)
			xmlhelper += ApiReader.xmltag('issuedTo',this.issuedTo,true);
		if(this.cardNumber!=undefined)
			xmlhelper += ApiReader.xmltag('cardNumber',this.cardNumber,true);
		if(this.isHeartlandInquiry)
			xmlhelper += ApiReader.xmltag('inquiry',true);
		xml += ApiReader.xmltag('FindGiftCardsType',xmlhelper + getSKSoap());
		xml += soapXMLEnd;
		return xml;
	}; 
}

function refillGiftcard(balance,giftcarditem,giftcard,isVipcard,isactivate,isReload){
 	this.giftcarditem = giftcarditem;
 	this.giftcard = giftcard;
 	this.balance = balance;
	this.getXML = function(){
		var xml = soapXMLBegin;
		var xmlhelper = '';
		var order = '';
		order += ApiReader.xmltag('type',isVipcard?"LOYALTY_CARD":"GIFT_CARD");
		order += ApiReader.xmltag('totalPrice',this.balance);
		order += ApiReader.xmltag('userPassword',pwipt.pw);
		
		var item = '';

		item += ApiReader.xmltag('saleItemId',giftcarditem.id);
		item += ApiReader.xmltag('quantity',1);
		item += ApiReader.xmltag('price',this.balance);
		
		var giftcardxml = '';
		if(!!this.giftcard){
			if(!!this.giftcard.id){
				giftcardxml += ApiReader.xmltag('id',this.giftcard.id);
			}
			if(!!this.giftcard.number){ //just used for cloud card
				giftcardxml += ApiReader.xmltag('number',this.giftcard.number);
			}
		}
		if(!!isactivate){
			giftcardxml += ApiReader.xmltag('number','HEARTLAND_GIFT_CARD_ACTIVATE');
		}
		if(!!isReload){
			giftcardxml += ApiReader.xmltag('number','HEARTLAND_GIFT_CARD_RELOAD');
		}
		
		item += ApiReader.xmltag(isVipcard?'loyaltyCard':'giftCard',giftcardxml);
		
		order += ApiReader.xmltag('orderItems',item);
		order += ApiReader.getCheckSum(this.checksum);

		xmlhelper = ApiReader.xmltag('order',order);
		xmlhelper += getSKSoap();
		xml += ApiReader.xmltag('SaveOrderType',xmlhelper);
		xml += soapXMLEnd;
		return xml;
	};
}

function fetchPayments(from,to){
	this.from = from;
	this.to = to;
	this.getXML = function(){
		var xml = soapXMLBegin;
		var xmlhelper = '';
		xmlhelper += ApiReader.xmltag('from',this.from);
		xmlhelper += ApiReader.xmltag('to',this.to);
		xml += ApiReader.xmltag('FindPaymentRecordsType',xmlhelper);
		xml += soapXMLEnd;
		return xml;
	}; 
}

function SettlePaymentsType(amt1,cnt1,amt2,cnt2){
	this.amt1 = amt1;
	this.cnt1 = cnt1;
	this.amt2 = amt2;
	this.cnt2 = cnt2;
	this.getXML = function(){
		var xml = soapXMLBegin;
		var xmlhelper = '';
		if(this.amt1 != undefined){
			xmlhelper += ApiReader.xmltag('totalGiftSaleAmount',this.amt1);
		}
		if(this.amt1 != undefined){
			xmlhelper += ApiReader.xmltag('totalGiftSaleCount',this.cnt1);
		}
		if(this.amt2 != undefined){
			xmlhelper += ApiReader.xmltag('totalReloadAmount',this.amt2);
		}
		if(this.amt1 != undefined){
			xmlhelper += ApiReader.xmltag('reloadCount',this.cnt2);
		}
		xmlhelper += getSKSoap();
		xml += ApiReader.xmltag('SettlePaymentsType',xmlhelper);
		xml += soapXMLEnd;
		return xml;
	};	
}
function ListPrintersType(){
	this.getXML = function(){
		var xml = soapXMLBegin;
		xml += ApiReader.xmltag('ListPrintersType','');
		xml += soapXMLEnd;
		return xml;
	};	
}


function ListSystemConfigurationsType(){
	this.getXML = function(){
		var xml = soapXMLBegin;
		xml += ApiReader.xmltag('ListSystemConfigurationsType','');
		xml += soapXMLEnd;
		return xml;
	};	
}

function AddSystemConfigurationType(str){
	this.str = str;
	this.getXML = function(){
		var xml = soapXMLBegin;
		var str = ApiReader.xmltag('name',this.str.name,true);
		str += ApiReader.xmltag('value',this.str.value);
		str += ApiReader.xmltag('displayName',this.str.displayname,true);
		str += ApiReader.xmltag('dataType',this.str.datatype);
		str += ApiReader.xmltag('category',this.str.category);
		str += ApiReader.xmltag('readOnly',this.str.readonly);
		str += ApiReader.xmltag('description',this.str.description,true);
		if(this.str.configType=='SELECT'&&!!this.str.restrictions)
			for(var i in this.str.restrictions){if(goipad(i))continue;
				var substr = ApiReader.xmltag('name',this.str.restrictions[i].name,true);
				substr += ApiReader.xmltag('value',this.str.restrictions[i].value+'');
				substr += ApiReader.xmltag('type','SELECT');
				str += ApiReader.xmltag('restrictions',substr);
			}
		xml += ApiReader.xmltag('AddSystemConfigurationType',ApiReader.xmltag('systemConfiguration',str));
		xml += soapXMLEnd;
		return xml;
	};	
}

function FindSalesRecordingMachinesType(){
	this.getXML = function(){
		var xml = soapXMLBegin;
		xml += ApiReader.xmltag('FindSalesRecordingMachinesType','');
		xml += soapXMLEnd;
		return xml;
	};	
}

function SendCommandToDeviceType(name,action){
	this.name = name;
	this.action = action;
	this.getXML = function(){
		var xml = soapXMLBegin;
		xml += ApiReader.xmltag('SendCommandToDeviceType',
		ApiReader.xmltag('deviceName',this.name,true)+
		ApiReader.xmltag('deviceType','PAYMENT_TERMINAL')+
		ApiReader.xmltag('command',this.action));
		xml += soapXMLEnd;
		return xml;
	};	
}

function FindCallsType(){
	this.getXML = function(){
		var xml = soapXMLBegin;
		xml += ApiReader.xmltag('FindCallsType','');
		xml += soapXMLEnd;
		return xml;
	};	
}

function setCallerId(id,action){
	this.action = action;
	this.id = id;
	this.getXML = function(){
		var xml = soapXMLBegin;
		var xmlhelper = '';
		xmlhelper += ApiReader.xmltag('id',this.id);
		xmlhelper += ApiReader.xmltag('action',this.action);
		xmlhelper += ApiReader.xmltag('fetchCalls',false);
		xmlhelper += getSKSoap();
		xml += ApiReader.xmltag('HandleCallType',xmlhelper);
		xml += soapXMLEnd;
		return xml;
	};
}

function regSK(thisName,thiskey){
	this.name = thisName;
	this.key = thiskey;
	this.getXML = function(){
		var xml = soapXMLBegin;
		var keystr = ApiReader.xmltag('sessionKey',this.key);
		xml += ApiReader.xmltag('ClientInstanceLoginType',
			ApiReader.xmltag('name',this.name,true)+
			ApiReader.xmltag('type',paras.licenseType)+
			((!!this.key)?keystr:'')+
			ApiReader.xmltag('requestNewKey',true)
			);
		xml += soapXMLEnd;
		return xml;
	};
};

function GetTransactionSummaryType(){
	this.getXML = function(){
		var xml = soapXMLBegin;
		xml += ApiReader.xmltag('GetTransactionSummaryType',getSKSoap());
		xml += soapXMLEnd;
		return xml;
	};
};

function findVipCard(fetchCInfo,cardNumber,phoneNo,fname,lname,email,cid){
	this.id = cardNumber;
	this.isFetchCInfo = !!fetchCInfo;
	this.phoneNo = phoneNo;
	this.fname = fname;
	this.lname = lname;
	this.email = email;
	this.cid = cid;
	this.getXML = function(){
		var xml = soapXMLBegin;
		xml += ApiReader.xmltag('FindLoyaltyCardsType',
				ApiReader.xmltag('fetchCustomerDetail',this.isFetchCInfo)+
				(!!this.id?ApiReader.xmltag('cardNumber',this.id):'')+
				(!!this.phoneNo?ApiReader.xmltag('customerPhoneNumber',this.phoneNo,true):'')+
				(!!this.cid?ApiReader.xmltag('customerId',this.cid):'')+
				(!!this.fname?ApiReader.xmltag('customerFirstName',this.fname,true):'')+
				(!!this.lname?ApiReader.xmltag('customerLastName',this.lname,true):'')+
				(!!this.email?ApiReader.xmltag('customerEmailAddress',this.email,true):''));
		xml += soapXMLEnd;
		return xml;
	};
}

var vipCardHistory =function (id,num){
	this.id = id;
	this.num = num;
	this.getXML = function(){
		var xml = soapXMLBegin;
		var xmlhelper = ApiReader.xmltag('fetchTransactionHistory',true);
		if(!!this.id) xmlhelper += ApiReader.xmltag('id',this.id);
		if(!!this.num) xmlhelper += ApiReader.xmltag('cardNumber',this.num);
		xml += ApiReader.xmltag('FindLoyaltyCardsType',xmlhelper);
		xml += soapXMLEnd;
		return xml;
	};
};

var GiftCardHistory =function (id,num){
	this.id = id;
	this.num = num;
	this.getXML = function(){
		var xml = soapXMLBegin;
		var xmlhelper = ApiReader.xmltag('fetchTransactionHistory',true);
		if(!!this.id) xmlhelper += ApiReader.xmltag('id',this.id);
		if(!!this.num) xmlhelper += ApiReader.xmltag('cardNumber',this.num);
		xml += ApiReader.xmltag('FindGiftCardsType',xmlhelper);
		xml += soapXMLEnd;
		return xml;
	};
};

var getDevice = function(){
	this.getXML = function(){
		var xml = soapXMLBegin;
		xml += ApiReader.xmltag('FindAppInstancesType',
		ApiReader.xmltag('name',getSK.getUID())+
		ApiReader.xmltag('fetchDetails',true)+
		ApiReader.xmltag('type',paras.licenseType));
		xml += soapXMLEnd;
		return xml;
	};	
};

var getAllDevice = function(){
	this.getXML = function(){
		var xml = soapXMLBegin;
		xml += ApiReader.xmltag('FindAppInstancesType','');
		xml += soapXMLEnd;
		return xml;
	};	
};

var printCredit = function(paymentid,type){
	this.id = paymentid;
	this.type = type;
	this.getXML = function(){
		var xml = soapXMLBegin;
		var xmlhelper = ApiReader.xmltag('paymentId',this.id);
		if(this.type == undefined){this.type = "BOTH"}
		xmlhelper += ApiReader.xmltag('paymentReceiptType',this.type);
		xml += ApiReader.xmltag('PrintPaymentReceiptType',xmlhelper+getSKSoap());
		xml += soapXMLEnd;
		return xml;
	};
};


var getSKSoap = function(){
	var xml = '';
	xml +=  ApiReader.xmltag('userId',pwipt.thisuser.userid);
	xml += ApiReader.xmltag('sessionKey',getSK.getSK());
	return ApiReader.xmltag("userAuth",xml);
};

//如果价钱变化save+生成order
//如果不变化，只save
//如果只存钱，生成order
var savaGiftCard = function(number,expdate,issuedto,balance,id,synCloud,name,value,createTime,enabled,customerID,isHeartland){
	this.id = id;
	this.number = number;
	this.expdate = expdate;
	this.balance = balance;
	this.issuedto = issuedto;
	this.synCloud = synCloud;
	this.name = name;
	this.value = value;
	this.createTime = createTime;
	this.enabled = enabled;
	this.customerID = customerID;
	this.isHeartland = isHeartland;
	this.getXML = function(){
		var xml = soapXMLBegin;
		var gcard = '';
		if(!!this.id)gcard += ApiReader.xmltag("id",this.id);
		if(this.synCloud != undefined) gcard += ApiReader.xmltag("syncFromCloud",this.synCloud);
		if(!!this.number)gcard += ApiReader.xmltag("number",this.number,true);
		if(!!this.expdate)gcard += ApiReader.xmltag("expireTime",this.expdate);
		if(this.balance!=undefined)gcard += ApiReader.xmltag("balance",this.balance);
		if(!!this.issuedto)gcard += ApiReader.xmltag("issuedTo",this.issuedto,true);
		if(!!this.name) gcard += ApiReader.xmltag("name",this.name,true);
		if(this.value != undefined) gcard += ApiReader.xmltag("value",this.value);
		if(!!this.enabled) gcard += ApiReader.xmltag("enabled",this.enabled);
		if(!!this.createTime) gcard += ApiReader.xmltag("createTime",this.createTime);
		if(!!this.customerID) gcard += ApiReader.xmltag("customerID",this.customerID);
		var xmlhelper = ApiReader.xmltag("giftCard",gcard);
		if(!!this.isHeartland){
			xmlhelper += ApiReader.xmltag("operationType","DEACTIVATE");
		}
		gcard = ApiReader.xmltag("SaveGiftCardType",xmlhelper+getSKSoap());
		xml += gcard;
		xml += soapXMLEnd;
		return xml;
	};
};

var moveDishesAndOrder = function(from,itemlist,to){
	this.from = from;
	this.to = to;
	this.items = itemlist;
	this.getXML = function(){
		var xml = soapXMLBegin;
		var xmltemp = ApiReader.xmltag("fromOrderId",this.from);
		if(!!this.to)xmltemp += ApiReader.xmltag("toOrderId",this.to);
		if(!!this.items&&this.items.length>0){
			for(var i in this.items){if(goipad(i))continue;
				xmltemp += ApiReader.xmltag("itemId",this.items[i]);
			}
		}
		xmltemp += ApiReader.xmltag('fetchOrders',true);
		xmltemp += getSKSoap();
		xml += ApiReader.xmltag("MoveOrderItemsType",xmltemp);
		xml += soapXMLEnd;
		return xml;
	};
};

var SaveSeatingAreaType = function(str){
	this.area = str;
	this.getXML = function(){
		var xml = soapXMLBegin;
		xml += ApiReader.xmltag("SaveSeatingAreaType",ApiReader.setOneArea(this.area));
		xml += soapXMLEnd;
		return xml;
	};
};

var ListPaymentsType = function(){
	this.getXML = function(){
		var xml = soapXMLBegin;
		xml += ApiReader.xmltag("FindPaymentAccountsType",'');
		xml += soapXMLEnd;
		return xml;
	};
};

var ListLayoutConfigsType = function(){
	this.getXML = function(){
		var xml = soapXMLBegin;
		xml += ApiReader.xmltag("ListLayoutConfigsType",'');
		xml += soapXMLEnd;
		return xml;
	};
};

var findItemSize = function(){
	this.getXML = function(){
		var xml = soapXMLBegin;
		xml += ApiReader.xmltag("FindItemSizesType",'');
		xml += soapXMLEnd;
		return xml;
	};
};

var ListPricingRule = function(){
	this.getXML = function(){
		var xml = soapXMLBegin;
		xml += ApiReader.xmltag("ListPricingRuleType",'');
		xml += soapXMLEnd;
		return xml;
	};
};

var ListHourlyRates = function(){
	this.getXML = function(){
		var xml = soapXMLBegin;
		xml += ApiReader.xmltag("ListHourlyRatesBySaleItemType",'');
		xml += soapXMLEnd;
		return xml;
	};
};

var ListOrderType = function(){
	this.getXML = function(){
		var xml = soapXMLBegin;
		xml += ApiReader.xmltag("ListOrderTypeSettingsType",'');
		xml += soapXMLEnd;
		return xml;
	};
};

var updateInventoryInfo = function(){
	this.getXML = function(){
		var xml = soapXMLBegin;
		xml += ApiReader.xmltag("FindInventoryItemsType",ApiReader.xmltag("showLowInventoryItemsOnly",true));
		xml += soapXMLEnd;
		return xml;
	};
};

var ListReservationType = function(id,from,to){
	this.id = id;
	this.from = from;
	this.to = to;
	
	this.getXML = function(){
		var id = (!!this.id)?ApiReader.xmltag('id',this.id):'';
		var from = (!!this.from)?ApiReader.xmltag('fromDate',this.from):'';
		var to = (!!this.to)?ApiReader.xmltag('toDate',this.to):'';
		var xml = soapXMLBegin;
		xml += ApiReader.xmltag("FindReservationsType",id+from+to);
		xml += soapXMLEnd;
		return xml;
	};
};

var saveReservationType = function(str){
	this.str = str;
	this.getXML = function(){
		var r = this.str;
		var xmlinfo = '';
		xmlinfo += (!!r.id)?ApiReader.xmltag('id',r.id.split('_')[1]):'';
		xmlinfo += (!!r.datetime)?ApiReader.xmltag('dateTime',r.datetime):'';
		xmlinfo += (!!r.firstname)?ApiReader.xmltag('firstName',r.firstname):'';
		xmlinfo += (!!r.adult)?ApiReader.xmltag('adult',r.adult):'';
		xmlinfo += (!!r.children)?ApiReader.xmltag('children',r.children):'';
		xmlinfo += (!!r.childrenhighchair)?ApiReader.xmltag('childrenHighChair',r.childrenhighchair):'';
		xmlinfo += (!!r.adultwheelchair)?ApiReader.xmltag('adultWheelChair',r.adultwheelchair):'';
		xmlinfo += (!!r.phonenumber)?ApiReader.xmltag('phoneNumber',r.phonenumber):'';
		xmlinfo += (!!r.status)?ApiReader.xmltag('status',r.status):'';
		xmlinfo += (!!r.notes)?ApiReader.xmltag('notes',r.notes,true):'';
		xmlinfo += (!!r.createdby)?ApiReader.xmltag('createdBy',r.createdby,true):'';
		xmlinfo += (!!r.confirmation)?ApiReader.xmltag('confirmation',r.confirmation):'';
		xmlinfo += (!!r.orderid)?ApiReader.xmltag('orderId',r.orderid):'';
		xmlinfo += (!!r.keywords)?ApiReader.xmltag('keywords', r.keywords,true):'';
		var xml = soapXMLBegin;
		xml += ApiReader.xmltag("SaveReservationType", ApiReader.xmltag("reservation", xmlinfo));
		xml += soapXMLEnd;
		return xml;
	};
};
var ListWaitListType = function(id,from,to){
	this.id = id;
	this.from = from;
	this.to = to;

	this.getXML = function(){
		var id = (!!this.id)?ApiReader.xmltag('id',this.id):'';
		var from = (!!this.from)?ApiReader.xmltag('fromDate',this.from):'';
		var to = (!!this.to)?ApiReader.xmltag('toDate',this.to):'';
		var xml = soapXMLBegin;
		xml += ApiReader.xmltag("FindWaitingListType",id+from+to);
		xml += soapXMLEnd;
		return xml;
	};
};
var saveWaitListType = function(str){
	this.str = str;
	this.getXML = function(){
		var w = this.str;
		var xmlinfo = '';
		xmlinfo += (!!w.id)?ApiReader.xmltag('id',w.id.split('_')[1]):'';
		xmlinfo += (!!w.datetime)?ApiReader.xmltag('dateTime',w.datetime):'';
		xmlinfo += (!!w.firstname)?ApiReader.xmltag('firstName',w.firstname):'';
		xmlinfo += (!!w.adult)?ApiReader.xmltag('adult',w.adult):'';
		xmlinfo += (!!w.children)?ApiReader.xmltag('children',w.children):'';
		xmlinfo += (!!w.childrenhighchair)?ApiReader.xmltag('childrenHighChair',w.childrenhighchair):'';
		xmlinfo += (!!w.adultwheelchair)?ApiReader.xmltag('adultWheelChair',w.adultwheelchair):'';
		xmlinfo += (!!w.phonenumber)?ApiReader.xmltag('phoneNumber',w.phonenumber):'';
		xmlinfo += (!!w.status)?ApiReader.xmltag('status',w.status):'';
		xmlinfo += (!!w.waitingnumber)?ApiReader.xmltag('waitingNumber',w.waitingnumber):'';
		xmlinfo += (w.waitingtime != undefined)?ApiReader.xmltag('waitingTime',w.waitingtime):'';
		xmlinfo += (!!w.notes)?ApiReader.xmltag('notes',w.notes,true):'';
		xmlinfo += (!!w.createdby)?ApiReader.xmltag('createdBy',w.createdby,true):'';
		xmlinfo += (!!w.confirmation)?ApiReader.xmltag('confirmation',w.confirmation):'';
		xmlinfo += (!!w.orderid)?ApiReader.xmltag('orderId',w.orderid):'';
		xmlinfo += (!!w.keywords)?ApiReader.xmltag('keywords', w.keywords,true):'';
		var xml = soapXMLBegin;
		xml += ApiReader.xmltag("SaveWaitingListType",
			ApiReader.xmltag("waitingList",
				xmlinfo
			)
		);
		xml += soapXMLEnd;
		return xml;
	};
};
var fetchReservationStatType = function(id,from,to){
	this.id = id;
	this.from = from;
	this.to = to;

	this.getXML = function(){
		var id = (!!this.id)?ApiReader.xmltag('id',this.id):'';
		var from = (!!this.from)?ApiReader.xmltag('fromDate',this.from):'';
		var to = (!!this.to)?ApiReader.xmltag('toDate',this.to):'';
		var xml = soapXMLBegin;
		xml += ApiReader.xmltag("FetchReservationStatType",from+to);
		xml += soapXMLEnd;
		return xml;
	};
};
var publishNotificationType = function(num,content){
	this.num = num;
	this.content = content;
	this.getXML = function(){
		var num = (!!this.num)?ApiReader.xmltag('phoneNumber',this.num):'';
		var content = (!!this.content)?ApiReader.xmltag('content',this.content):'';
		var xml = soapXMLBegin;
		xml += ApiReader.xmltag("PublishNotificationType",num + content);
		xml += soapXMLEnd;
		return xml;
	};
};
var updateSystemConofigurationType = function(list){
	this.list = list;
	this.getXML = function(){
		var xml = soapXMLBegin;
		var xmltemp = ''
		if(!!this.list&&this.list.length>0){
			for(var i in this.list){if(goipad(i))continue;
				var xmlhelper = '';
				xmlhelper += ApiReader.xmltag("id",this.list[i].id);
				xmlhelper += ApiReader.xmltag("name",this.list[i].name);
				xmlhelper += ApiReader.xmltag("value",this.list[i].value);
				xmlhelper += ApiReader.xmltag("dataType",this.list[i].datatype);
				xmltemp += ApiReader.xmltag("systemConfiguration",xmlhelper);
			}
		}
		xml += ApiReader.xmltag("UpdateSystemConfigurationType",xmltemp);
		xml += soapXMLEnd;
		return xml;
	};
};
var sendPager = function(id,type,action){
	this.id = id;
	this.type = type;
	this.action = action;
	
	this.getXML = function(){
		var xmlinfo = '';
		xmlinfo +=  (!!this.id)?ApiReader.xmltag('refId',this.id):'';
		xmlinfo += (!!this.type)?ApiReader.xmltag('type',this.type):'';
		xmlinfo = ApiReader.xmltag("customerDisplayRecord", xmlinfo);
		xmlinfo += (!!this.action)?ApiReader.xmltag('action',this.action):'';
		var xml = soapXMLBegin;
		xml += ApiReader.xmltag("SaveCustomerDisplayRecordType",xmlinfo);
		xml += soapXMLEnd;
		return xml;
	};
};

var clearTable = function(id){
	this.id = id;
	
	this.getXML = function(){
		var xmlinfo = '';
		xmlinfo +=  (!!this.id)?ApiReader.xmltag('orderIds',this.id):'';
		var xml = soapXMLBegin;
		xml += ApiReader.xmltag("ClearOrdersFromTableType",xmlinfo);
		xml += soapXMLEnd;
		return xml;
	};
};

var sendReminder = function(id){
	this.id = id;
	this.getXML = function(){
		var xmlinfo = '';
		xmlinfo +=  (!!this.id)?ApiReader.xmltag('orderId',this.id):'';
		var xml = soapXMLBegin;
		xml += ApiReader.xmltag("SendReminderToKitchenType",xmlinfo);
		xml += soapXMLEnd;
		return xml;
	};
};

var openSessionType = function(role){
	this.role = role;
	this.getXML = function(){
		var xml = soapXMLBegin;
		var xmlhelper = ApiReader.xmltag('openedBy',this.role);
		var xmlinfo = ApiReader.xmltag('Session',xmlhelper);
		xml += ApiReader.xmltag('OpenSessionType',xmlinfo);
		xml += soapXMLEnd;
		return xml;
	};
};

var closeSessionType = function(role,id,staffnum){
	this.role = role;
	this.id = id;
	this.staffnum = staffnum;
	this.getXML = function(){
		var xml = soapXMLBegin;
		var xmlhelper = '';
		xmlhelper += ApiReader.xmltag('id',this.id);
		xmlhelper += ApiReader.xmltag('closedBy',this.role);
		xmlhelper += ApiReader.xmltag('numOfCheckIn',this.staffnum);
		var xmlinfo = ApiReader.xmltag('Session',xmlhelper);
		xml += ApiReader.xmltag('CloseSessionType',xmlinfo);
		xml += soapXMLEnd;
		return xml;
	};
};

var findSessionType = function(){
	this.getXML = function(){
		var xml = soapXMLBegin;
		xml += ApiReader.xmltag('FindSessionType','');
		xml += soapXMLEnd;
		return xml;
	};
};

var updateSaleItem = function(saveitemlist){
	this.saveitemlist = saveitemlist;
	this.getXML = function(){
		var xmlinfo = '';
		xmlinfo += ApiReader.xmltag('updateStockStatus',true);
		for(var i in this.saveitemlist){if(goipad(i))continue;
			var xmliteminfo = '';
			xmliteminfo += ApiReader.xmltag('id',this.saveitemlist[i].id);
			xmliteminfo += ApiReader.xmltag('catId',this.saveitemlist[i].catId);
			xmliteminfo += ApiReader.xmltag('outOfStock',this.saveitemlist[i].outOfStock);
			xmlinfo += ApiReader.xmltag('saleItem',xmliteminfo);
		}
		var xml = soapXMLBegin;
		xml += ApiReader.xmltag("UpdateSaleItemType",xmlinfo);
		xml += soapXMLEnd;
		return xml;
	};
};

var saveAllLayoutConfig = function(bodyBtns,sideBtns,moreBtns,hideBtns){
	this.bodyBtns = bodyBtns;
	this.sideBtns = sideBtns;
	this.moreBtns = moreBtns;
	this.hideBtns = hideBtns;
	this.getXML = function(){
		var xml = soapXMLBegin;
		var xmltemp = '';
			var xmlhelper = '';
			for(var b in this.bodyBtns){if(goipad(b))continue;
				if(this.bodyBtns[b].id!=''){
					var thisBtn = ApiReader.setLayoutConfigXml(this.bodyBtns[b],'BODY');
					xmlhelper += ApiReader.xmltag('layoutConfig',thisBtn);					
				}
			}
			for(var b in this.sideBtns){if(goipad(b))continue;
				if(this.sideBtns[b].id!='' && this.sideBtns[b].name!='MORE'){
					var thisBtn = ApiReader.setLayoutConfigXml(this.sideBtns[b],'SIDE_BAR_SHOW');
					xmlhelper += ApiReader.xmltag('layoutConfig',thisBtn);
				}
			}
			for(var b in this.moreBtns){if(goipad(b))continue;
				var thisBtn = ApiReader.setLayoutConfigXml(this.moreBtns[b],'SIDE_BAR_MORE');
				xmlhelper += ApiReader.xmltag('layoutConfig',thisBtn);
			}
			for(var b in this.hideBtns){if(goipad(b))continue;
				var thisBtn = ApiReader.setLayoutConfigXml(this.hideBtns[b],'HIDE');
				xmlhelper += ApiReader.xmltag('layoutConfig',thisBtn);
			}
			xmltemp = ApiReader.xmltag('SaveAllLayoutConfigType',xmlhelper);
		xml += xmltemp+soapXMLEnd;
		return xml;
	};
};

var addLock = function(tid,type,cid){
	this.tid = tid;
	this.type = type;
	this.cid = cid;
	this.getXML = function(){
		var xmlinfo = '';
		xmlinfo += ApiReader.xmltag('type',this.type);
		xmlinfo += ApiReader.xmltag('targetId',this.tid);
		if(!!this.cid)xmlinfo += ApiReader.xmltag("childId",this.cid);
		xmlinfo += getSKSoap();
		var xml = soapXMLBegin;
		xml += ApiReader.xmltag("AddLockType",xmlinfo);
		xml += soapXMLEnd;
		return xml;
	};
};

var removeLock = function(tid,type,cid){
	this.tid = tid;
	this.type = type;
	this.cid = cid;
	this.getXML = function(){
		var xmlinfo = '';
		xmlinfo += ApiReader.xmltag('type',this.type);
		xmlinfo += ApiReader.xmltag('targetId',this.tid);
		if(!!this.cid)xmlinfo += ApiReader.xmltag("childId",this.cid);
		xmlinfo += getSKSoap();
		var xml = soapXMLBegin;
		xml += ApiReader.xmltag("RemoveLockType",xmlinfo);
		xml += soapXMLEnd;
		return xml;
	};
};

var getSK = {
	nxttm : '',
	retryNum: 1,
	isretrying:false,
	timeoutidlist:[],
	istimer:undefined,
	saveUID:function(UID){
		if(!UID||UID=="undefined"){ getSK.clcUID(); return;}
		setVersionInfo(UID);
		localStorage.setItem(fjm.d(paras.uidtg,0),fjm.d(getSK.ecSK(UID),0));
	},
	getUID:function(){
		return getSK.dcSK(fjm.e(localStorage.getItem(fjm.d(paras.uidtg,0)),0));
	},	
	clcUID:function(UID){
		return localStorage.removeItem([fjm.d(paras.uidtg,0)]);
	},	
	udtSk : function(){
		if(getSK.nxttm == '' || everymin.thisd == '' || everymin.thisd.getTime() >= getSK.nxttm)
			;
	},
	clearIdlist:function()
	{
		for(var i in getSK.timeoutidlist){if(goipad(i))continue;
			clearTimeout(getSK.timeoutidlist[i]);
		}
		getSK.timeoutidlist = [];
	},
	updateSk:function()
	{
		;
	},
	displayskpln:function(notworning,go,logMsg){//!!!!需要把这个这个sk访问服务器的loading界面拿掉，而且不能使用单线程访问。会影响操作
		var UID = getSK.getUID();
		if(UID=="undefined")UID = undefined;
		
		var retrynum = 3;
		var hideblocklayer = function(){fp.hide(2110);};
		var showsk = function(){
			var fun = function(UID){
				if(UID==''){
					getSK.clcUID();
					getSK.displayskpln(true,go);
					return true;
				}
				
				getSK.saveUID(UID);
				getSK.delSK();
				var nextfun = function(){
					if(!!go)go();
					hideblocklayer();
				};				
				getSK.fetchSKII(nextfun);
			};
			if(logMsg!=undefined){
				logging.log('fetchSKErr',logMsg);
				console.log(logMsg);
			}
			fp.showSKIptPage(fun,UID);	
		};
		var retry = function(nofun){
			if(retrynum<0){showsk();return;}
			if(!!nofun&&!!nofun.target)nofun = undefined;
			retrynum--;
			fp.showblockpage(2110);
			var gofun = function(){getSK.sempleFetchSK(UID,undefined,!!nofun?nofun:retry,function(){if(!!go)go();hideblocklayer();});};//成功后隐藏block界面
			window.setTimeout(gofun,3000);
		};
		var btlist = [];
		
		btlist.push({id:"uidreipt",name:language.getTxtById("uidreipt",pwipt.lan),fun:showsk});
		btlist.push({id:"uidkpold",name:language.getTxtById("uidkpold",pwipt.lan),fun:retry});
		
		if(notworning||!UID)
			showsk();
		else
			retry(function(){fp.showFloatBt($("#mexitsys"),btlist,language.getTxtById('reiptuid',pwipt.lan),true);});
	},
	getIDandFetchSK:function(){
		getSK.istimer = false;
		getSK.sempleFetchSK(getSK.getUID(),getSK.getSK(),function(){getSK.displayskpln(false,undefined,"licenseErrorAuto");});
	},
	sempleFetchSK:function(id,sk,nofun,yesfun){
		var nextfun = function(obj){
			getSK.getSkFromServer(obj,yesfun,nofun);
		};
		var skNowTime = new Date().getTime();
		if(skNowTime < skLimitTime) return;
		var soap = new regSK(id,sk);
		call_web_servicedo(soap.getXML(),nextfun);
	},
	getSkFromServer:function(obj,yesfun,nofun){
		var str = obj.clientinstanceloginresponsetype;
		if(str != undefined){
			if(str.result.successful == 'true'){
				getSK.setSK(str.sessionkey);
				if(!getSK.istimer){
					window.setTimeout(function(){getSK.getIDandFetchSK(true);},paras.Sktmdiff);
					skLimitTime = (new Date().getTime()) + paras.Sktmdiff - paras.Sktmfthwin;
					getSK.istimer = true;
				}
				if(!!yesfun)yesfun();
			}
			else if(!!str.sessionkeyremainingactivetime){
				if(!getSK.istimer){
					window.setTimeout(function(){getSK.getIDandFetchSK(true);},parseInt(str.sessionkeyremainingactivetime));
					getSK.istimer = true;
				}
				if(!!yesfun)yesfun();
			}
			else if(!!nofun)nofun();
		}
		else{
			if(!getSK.istimer){
				window.setTimeout(function(){getSK.getIDandFetchSK(true);},paras.Sktmdiff);
				skLimitTime = (new Date().getTime()) + paras.Sktmdiff - paras.Sktmfthwin;
				getSK.istimer = true;
			}
			if(!!nofun)nofun();
		}
	},
	fetchSKII:function(go,logMsg){
		var UID = getSK.getUID();
		var SK = getSK.getSK();
		if(!!UID&&!!SK)
			var fun = function(){
				var yesfun = function(){fp.hide(2980);if(!!go)go();};
				var nofun = function(){
					if(logMsg!=undefined){
						logMsg = logMsg+"_UIDSK";
					}
					getSK.sempleFetchSK(UID,SK,function(){getSK.displayskpln(false,go,logMsg);},yesfun);
				};
				getSK.sempleFetchSK(UID,SK,nofun,yesfun);
			};
		else if(!!UID){
			var yesfun = function(){fp.hide(2980);if(!!go)go();};
			if(logMsg!=undefined){
				logMsg = logMsg+"_UID";
			}
			var fun = function(){getSK.sempleFetchSK(UID,undefined,function(){getSK.displayskpln(false,go,logMsg);},yesfun);};
		}
		else{
			if(logMsg!=undefined){
				logMsg = logMsg+"_NONE";
			}
			var fun = function(){getSK.displayskpln(true,go,logMsg);};
		}
		fun();
	},
	getSK : function(){
		return getSK.dcSK(fjm.e(localStorage.getItem(fjm.d(paras.sktg,0)),0));
	},
	setSK : function(sk){
		var tag = fjm.d(paras.sktg,0);
		var sk = fjm.d(getSK.ecSK(sk),0);
		localStorage.setItem(tag,sk);
	},
	ecSK : function(SKD){
		var SKE = '123'+SKD;return SKE;
	},
	dcSK : function(SKE){
		if(SKE!=undefined)
			var SKD = SKE.substr(3);return SKD;
	},
	delSK : function(SKD){
		localStorage.removeItem(fjm.d(paras.sktg,0));
	},
	go : function(go)
	{
		getSK.fetchSKII(go);
	},
};

var soapXMLBegin = '<?xml version="1.0" encoding="UTF-8"?>' +
					  '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:app="http://ws.kpos.com/app">' +
					  '<soapenv:Header/><soapenv:Body>';
var soapXMLEnd = '</soapenv:Body></soapenv:Envelope>';
var paserXml = new XMLSerializer();
var lastsoap = {
	msg:'',
	retry:1,
	isBlock:false,
	handler:function(){;},
};
var redosoap = function()
{
	if(lastsoap.msg == ''||lastsoap.retry > paras.skretrynum)
		return;
	lastsoap.isredoing = true;
	call_web_servicedo(lastsoap.msg,lastsoap.handler);
};

var loadingList = {};

var onRespApi = function(id){
	if(id == undefined)return;
	delete loadingList[id];
	if(isEmptyObject(loadingList))
		fp.hideNumPanel(fp.allblockobj);
};

var onSendApi = function(id,msg,isblock){
	if(id == undefined)return;
	loadingList[id] = true;
	if(isblock)
	{
		var loadingmsg = getLoadingMsg(msg);
	    fp.myblockalert(undefined,loadingmsg);
	}
};

var onErrRspsFun = {
	'findcustomerinforesponsetype':function(fun,obj)
	{
		fun(obj);
		return '';
	},
	'listprivilegesresponsetype':function(fun,obj){
		var msg = "Failed to login";
		//pwipt.noaccess();
		return msg;
	},
	'printitemtokitchenresponsetype':function(fun,obj){
		var msgobj = obj.printitemtokitchenresponsetype;
		if(msgobj.failedprinternames != undefined)
		var msg = undefined;
		if(msgobj.failedprinternames != undefined)
		{
			var prtid = ApiReader.getListOrOneInstan(msgobj.failedprinternames);
			msg = "Fail to Print. Please check printer: ";
			for(var i in prtid){if(goipad(i))continue;
				msg += prtid[i].toUpperCase()+', ';
			}
		}
		else{
			msg = undefined;
		}
		fun(obj);
		return msg;
	},
	'printreceiptresponsetype':function(fun,obj){
		var msgobj = obj.printreceiptresponsetype;
		try{var mag = obj.printreceiptresponsetype.result.failurereason;}
		catch(e){var msg = "Fail to Print receipt. Please check printer and net work.";}
		fun(obj);
		if(paras.isMevModel)
			mev.testMEV();
		return msg;		
	},
	'clientinstanceloginresponsetype':function(fun,obj){
		var msgobj = obj.clientinstanceloginresponsetype;
		if(getSK.getSK()==undefined)
			var msg = "Certificate serial Number warning.";
		else
			var msg = "";
		fun(obj);
		
		return msg;
	},
	'savepaymentrecordresponsetype':function(fun,obj){
		var msgobj = obj.savepaymentrecordresponsetype;
		var msg = msgobj.result.failurereason;
		fun(obj);
		
		return msg;
	},
	
};

var isBatchApis = function(id){
	return id == "batchsaveorderresponsetype"||id == "batchsavepaymentrecordresponsetype";
};

var onSuc = function(doc,responseHandler){
					var apiQueryId = responseHandler.id;
					var gid = responseHandler.gid;
					var errHandler = responseHandler.errHandler;
 					responseHandler = responseHandler.handler;
					var responseText = doc;
					var start = responseText.indexOf("<soap:Body>");
					var end = responseText.indexOf("</soap:Body>");
					responseText = responseText.substring(start+11, end);
					var xotree = new XML.ObjTree();
					var myJsonObject = xotree.parseXML(responseText);
					var msgobj = [];
					var isGoAfterFun = false;
					for(var rspsname in myJsonObject){if(goipad(rspsname))continue;msgobj = myJsonObject[rspsname];break;}
					try{var isSccs = msgobj.result.successful=='true';}catch(e){if(isBatchApis(rspsname)) var isSccs = true; else var isSccs=false;}
					if(isSccs){
						isGoAfterFun = setQueryArray(apiQueryId,gid,rspsname);
					}
					else
					{
						if(msgobj.result.failurereasoncode == 2)
						{
							if(myJsonObject.listallsaleitemsbycategoryandgroupresponsetype!=undefined)
							{
								fp.myalert(undefined,'License error, please try to restart program!',5,fp.alertColor.error);
								getSK.fetchSKII(clswd,"licenseErrorExit");								
								return;
							}
							else{
								getSK.fetchSKII(undefined,"licenseErrorVerify");
							};
						}
						if(msgobj.result)
						var msg = undefined;
						var errfun = onErrRspsFun[rspsname];
						if(errfun != undefined){
							var msg = errfun(responseHandler,myJsonObject);
							if(msg == '')isGoAfterFun = setQueryArray(apiQueryId,gid,rspsname);
							else checkUpArray[gid] = {};
							if(msg == undefined)
								msg = msgobj.result.failurereason;
							if(msg == undefined)
								msg = language.getTxtById('netwkero',pwipt.lan);
							fp.myalert(undefined,msg,3,fp.alertColor.error);
						}
						else{
							if(msg == undefined)
								msg = msgobj.result.failurereason;
							if(msg == undefined)
								msg = language.getTxtById('netwkero',pwipt.lan);
							if(!!errHandler){
								errHandler(myJsonObject,msg);
							}
							else{
								fp.myalert(undefined,msg,3,fp.alertColor.error);
							}
						}
						return;
					}	
					saveApiToLocalStorage(myJsonObject);
					if(rspsname == 'saveorderresponsetype'||rspsname == 'fetchorderresponsetype')
					{//fetch parent order
						try{var parentorderid = msgobj.order.parentorderid;}
						catch(e){var parentorderid = undefined;}
						if(parentorderid==undefined)
							responseHandler(myJsonObject);
						else
						{
							var fun = function(obj)
							{
								ApiReader.getOrderParentXmlHelper(obj);	
								responseHandler(myJsonObject);
							};
							var getorder = new GetOrderById(parentorderid,true);
							call_web_service(getorder,fun,undefined);
						}
					}	
					else
						responseHandler(myJsonObject);
					if(isGoAfterFun&&!!apiAfterFun[gid]){
						apiAfterFun[gid]();delete apiAfterFun[gid];
					}
};

var onErr = function(doc,msg,responseHandler){
	var errHandler = responseHandler.errHandler;
	if(msg != undefined){
		msg = language.getTxtById('netwkero',pwipt.lan);
	}
	if(!!errHandler){
		errHandler(undefined,msg);
	}
	else{
		fp.myalert(undefined,msg,3,fp.alertColor.error);
	}
};

var cashmsg = function(msg, responseHandler)
{
	if(!lastsoap.isredoing&&(msg)!="ClientInstanceLoginType")
	{lastsoap.msg = msg;lastsoap.isBlock = false;lastsoap.handler = responseHandler;}
	if(lastsoap.isredoing)
	{lastsoap.isredoing=false;lastsoap.msg = '';lastsoap.isBlock = false;lastsoap.handler = '';}
};

var getUniqueId = function(msg){
	var type = getSoapMsgType(msg);
	var time = new Date();
	var timemics = time.getTime();
	var randN = Math.random();
	return type+"_"+timemics+"_"+randN;
};

var calldevice = function(type,onsuccess,onerror,data){
	if(type == "scale")
		var subaddr = "/device/scale/query";
	else if(type == "message")
		var subaddr = "/device/screen";
	else if(type == "2ndDisplay")
		var subaddr = "/device/dualscreen/main";
	else
		return;
	var dvcurl = paras.deviceAddr+subaddr;
	if(!data)data = '';
	$.ajax({
			url:dvcurl,
			type:'post',
			datatype:'json',
			data:data,
			processData: false,
    		headers: {
		        'Accept': 'application/json',
		        'Content-Type': 'application/json'
    		},
    		success:onsuccess,
			error: onerror,
	});
};
var getDeviceService = function(sucfun){
	var dvcurl = paras.deviceAddr+"/device/dualscreen/sub";
	$.ajax({
		url:dvcurl,
		type:'post',
		datatype:'json',
		data:'{}',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		success:function(res){sucfun(res);}
	});
};
var callwebSocket = function(){
	ws = new WebSocket(paras.serverAddr.replace('http','ws')+"/kpos/webapp/webSocket/systemInfo");
	ws.onopen = function() {
    	ws.send(
			JSON.stringify(
					{ 
						"instanceName":getSK.getUID(),
						"sessionKey":getSK.getSK(),
					}
				)
		);  // Sends a message.
  	};
  	ws.onmessage = function(e) {
    // Receives a message.
   		WS.times = 0;
		everysec.serverbeat = 0;
		if(e.data == 'S' || e.data == 'F'){var msg = e.data;}
		else{var msg = JSON.parse(e.data);}
		if(!!msg.menuUpdated){if(msg.menuUpdated){WS.reloadmenu();}}
		if(!!msg.updatedOrderDetails){WS.reloadorder(msg.updatedOrderDetails);}
		if(!!msg.callRecordUpdated){WS.loadcallerid();}
		if(!!msg.transportWebPaymentResult){WS.manualccard(msg.transportWebPaymentResult);}
		if(!!msg.inventoryUpdated){WS.reloadInventoryInfo();}
		if(!!msg.session){WS.loadsession(msg.session);}
		if(!!msg.layoutUpdated){if(msg.layoutUpdated){WS.reloadlayout();}}
 	};
  	ws.onclose = function(e) {
  		if(e.code == 1003){getSK.sempleFetchSK(getSK.getUID(),undefined,function(){getSK.displayskpln(true,callwebSocket);},callwebSocket);return;};
  		if(WS.times>=5){WS.times = 0;if(e.code == 1001)callwebSocket();else if(e.code == 1003)getSK.displayskpln(false,callwebSocket);return;}
  		else
  			var timeid = window.setTimeout(callwebSocket,1000*WS.times*WS.times++);
	};
};

var callWebService = function(msg, responseHandler,isblock)
{
	cashmsg(msg, responseHandler);
	if(isblock)
		var id = getUniqueId(msg);
	else
		var id = undefined;
	onSendApi(id,msg,isblock);
	$.ajax({
			url:paras.serverAddr+"/kpos/ws/kposService",
			type:'post',
			datatype:'text',
			data:msg,
			processData: false,
    		contentType: "text/xml; charset=\"utf-8\"",
			success:function(doc){onRespApi(id,isblock);var responseText = paserXml.serializeToString(doc);onSuc(responseText,responseHandler);},
			error: function(doc){onRespApi(id,isblock);onErr(doc,msg,responseHandler);},
			timeout: 120000
	});
};

var callWebService1Thread = function(soapXML, responseHandler){
	responseHandler = {
		id:undefined,
		handler:responseHandler,
		gid:0,
	};
	cashmsg(soapXML, responseHandler);
	var parser;
	var xmlhttp = null;
	if(window.XMLHttpRequest){
		xmlhttp = new XMLHttpRequest();
	} else {try{xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");}
		catch (e){xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");}
	}
    var addr = paras.serverAddr+"/kpos/ws/kposService";
	xmlhttp.open("POST", addr, false);
	xmlhttp.onreadystatechange = function(){
		
		if (xmlhttp.readyState == 4){
			var responseText = xmlhttp.responseText;
			onSuc(responseText,responseHandler);			
		}
		else{
			onErr(undefined);
		}
	};
	try{
		xmlhttp.send(soapXML);
	}
	catch (e){
		fp.myalert(undefined, e,3,fp.alertColor.error);
	}
};

var call_web_servicedo = function(soapXML,handler,isblock,gid,errHandler){
	var id = getQueryId();

	if(id==undefined){
		if(!isIpad())console.log('Locked! delay send api: '+soapXML);
		window.setTimeout(function(){call_web_servicedo(soapXML,handler,isblock,gid,errHandler);},1);
	}
	else{
		gid = !!gid?gid:0;
		var handlerStr = {
			handler:handler,
			errHandler:errHandler,
			id:id,
			gid:gid,
		};
		if(!checkUpArray[gid])
			checkUpArray[gid]={};
		checkUpArray[gid][id]=true;
		callWebService(soapXML, handlerStr, isblock);		
	}
	
};

var call_web_service = function(soapType,handler,obj,gid,errHandler){
    var soapXML = soapType.getXML();
	call_web_servicedo(soapXML,handler,true,gid,errHandler);
};

var call_web_serviceUnBlocker = function(soapType,handler,obj){
    var soapXML = soapType.getXML();
    
    var fun = function(obj)
    {
    	handler(obj);
		fp.removeloadinggif();
    };
	call_web_servicedo(soapXML, fun,false);
	fp.addloadinggif(obj);
};

var getSoapMsgType = function(msg)
{
	var type = msg.substr(185);
	try{type = type.substr(0,type.indexOf(">")).split('/')[0];}
	catch(e){type = undefined;}
	return type;
};

var getLoadingMsg = function(msg)
{
	var type = getSoapMsgType(msg);
	if(type == 'PrintItemToKitchenType'){return language.getTxtById('loadingSend2K',pwipt.lan);}
	if(type == 'PrintReceiptType'){return language.getTxtById('loadingrcpt',pwipt.lan);}
	return language.getTxtById('loading',pwipt.lan);
};

var ApiReader = {
	//Precondition:obj need include all the table list
	getCheckSum:function(sum){
		if(sum == ''||sum == 'undefined')return '';
		else return ApiReader.xmltag('checksum',sum);
	},
	getTable: function(obj)
	{
		try{
			var tblistT = obj.tables;
			if(tblistT.length == undefined)
			{
				tblist = [];
				tblist.push(tblistT);
			}
			else
				tblist = tblistT;
		}
		catch (err){return [];};
		var returnList = [];
		for(var i in tblist){if(goipad(i))continue;
			returnList.push(ApiReader.getOneTable(tblist[i]));
		}
		return returnList;
	},
	getOneAreaTables:function(obj)
	{
		var returnobj = ApiReader.getListOrOneInstan(obj.listtablesresponsetype.table);
		for(var i in returnobj){if(goipad(i))continue;
			returnobj[i].orders = ApiReader.getListOrOneInstan(returnobj[i].orders);
		}
		return returnobj;
	},
	setOneTable:function(str){
		var xml = '';
		var transshape = {
			s:'RECTANGLE',
			h:'HIBACHI',
			r:'ROUND',
		};
		xml+=ApiReader.xmltag('id',str.id);
		xml+=ApiReader.xmltag('name',str.name,true);
		xml+=ApiReader.xmltag('shape',transshape[str.shape]);
		xml+=ApiReader.xmltag('x',str.x);
		xml+=ApiReader.xmltag('y',str.y);
		xml+=ApiReader.xmltag('width',str.width);
		xml+=ApiReader.xmltag('height',str.height);
		xml+=ApiReader.xmltag('defaultGuestCount',str.defaultguestcount);
		xml+=ApiReader.xmltag('currentGuestCount',str.currentguestcount);
		xml+=ApiReader.xmltag('status',str.status);
		return ApiReader.xmltag('tables',xml);
	},
	setOneArea:function(str){
		var xml = '';
		xml+=ApiReader.xmltag('id',str.id);
		xml+=ApiReader.xmltag('name',str.name,true);
		for(var i in str.tables){if(goipad(i))continue;
			xml+=ApiReader.setOneTable(str.tables[i]);
		}
		return ApiReader.xmltag('areaType',xml);
	},
	getOneTable: function(obj)
	{
		var table = obj;
		table['rtinfo'] = '';
		var transshape = {
			RECTANGLE:'s',
			HIBACHI:'h',
			ROUND:'r',
		};
		table['shape'] = transshape[obj.shape];
		table['color'] = '#eee';
		table['img'] = '';
		table.orders = ApiReader.getListOrOneInstan(obj.orders);
		return table;
	},
	getArea: function(obj)
	{
		try{
			obj = obj.listareasresponsetype;
			var arealistT = obj.areas;
			var arealist;
			if(arealistT.length == undefined)
			{
				arealist = [];
				arealist.push(arealistT);
			}
			else
				arealist = arealistT;
			}
		catch (err){return [];};

		var returnList = [];
		for(var i in arealist){if(goipad(i))continue;
			returnList.push(ApiReader.getOneArea(arealist[i]));
		}
		table.tabledict = returnList;
	},
	getOneArea: function(obj)
	{
		var Area = {
			name:obj.name,
			id:obj.id,
			floor:{color:"#654",img:paras.dineinfloorimg},//infomation of floor, color/size/png...
			tables:ApiReader.getTable(obj),
			pnum:0,
			mny:0,
		};
		return Area;
	},
	isGroupDsply : function(grpobj)
	{
		if(grpobj.deleted == 'true')
			return false;
		return true;
	},
	initDishes: function(obj){
		data.wholedisheslist = {};
		data.dishesgrouplistGid = [];
		openfood = [];
		KLine = [];
		Lcard = [];
		giftcardlist.grouplist[0].ctgrylist[0].itemlist = [];
		try{
			var list = ApiReader.getListOrOneInstan(obj.categorygroup);
		}
		catch (err){
			return false;
		};
		var grpTemp = {};
		for(var i in list){if(goipad(i))continue;
			grpTemp = ApiReader.initOneDishGroup(list[i]);
			if(ApiReader.isGroupDsply(grpTemp)){
				data.dishesgrouplistGid.push(grpTemp.id);
			}
			data.wholedisheslist[grpTemp.id] = grpTemp;
		}
		saveDataToLocalStorage(data.wholedisheslist,'wholedishes');
		return true;
	},
	initOneDishGroup: function(obj){
		try{
			var list = ApiReader.getListOrOneInstan(obj.category);
		}
		catch (err){
		};
		var ctrList = {};
		var ctrTemp = {};
		for(var i in list){if(goipad(i))continue;
			ctrTemp = ApiReader.initOneCtgr(list[i]);
			if(ctrTemp != undefined){
				ctrList[ctrTemp.id] = ctrTemp;
			}
		}
		if(ctrList.length == 0){
			return undefined;
		}
		var group = {
			id:obj.id,
			seq:obj.displaysequence=='0'?0:obj.displaysequence,
			name:{en:obj.name,},
			ctgrylist:ctrList,
			dscrp:{en:obj.description,},
			hours:obj.hours,
			deleted:obj.deleted,
			color:obj.color
		};
		ApiReader.getMultLang(obj,group);
		return group;
	},
	initOneCtgr:function(obj){
		try{
			var list = ApiReader.getListOrOneInstan(obj.saleitems);
		}
		catch (err){
			var list = [];
		};
		var itemList = {};
		var itemTemp = {};
		for(var i in list){if(goipad(i))continue;
			itemTemp = ApiReader.initOneItem(list[i],obj.coursenumber);
			if(ApiReader.isgiftcard(list[i])){
				giftcardlist.grouplist[0].ctgrylist[0].itemlist.push(itemTemp);
			}
			else if(ApiReader.isopenfood(list[i])){
				openfood.push(itemTemp);
			}
			else if(ApiReader.isKticketLine(list[i])){
				KLine.push(itemTemp);
			}
			else if(ApiReader.isLcard(list[i])){
				Lcard.push(itemTemp);
			}
			itemList[itemTemp.id] = itemTemp;
		}
		if(itemList.length == 0) return undefined;
		var ctgr = {
			id:obj.id,
			seq:obj.displaysequence=='0'?0:obj.displaysequence,
			name:{en:obj.name,},
			itemlist:itemList,
			hhinfo:obj.isallowedhappyhour,
			attributes:ApiReader.getListOrOneInstan(obj.attributes),
			dscrp:{en:obj.notes},
			img:obj.thumbpath,
			printerids:obj.printerids,
			taxids:ApiReader.getListOrOneInstan(obj.taxids),
			deleted:obj.deleted,
			color:obj.color,
			isSkipDiscount:obj.applicabletoorderdiscount=='false'
		};
		data.allitemsoptionlistquickFun(true,ctgr);
		ApiReader.getMultLang(obj,ctgr);
		return ctgr;
	},
	initOneItem: function(obj,courseNum)
	{
		var number = obj.itemnumber;
		
		var dish = {
					id: obj.id,
					seq:obj.displaysequence=='0'?0:obj.displaysequence,
					orderid:obj.id,
					name:{en:obj.name,},
					price:{optprice:[obj.price],optname:[]},
					itemprice:obj.itemprice,
					pricedef:obj.price,
					attributes:ApiReader.getListOrOneInstan(obj.attributes),
					dscrp:{en:obj.description},
					img:{
						b:obj.thumbpath,
						s:obj.thumbpath,
						},
					allowedhh:obj.allowedhh,
					allowmodifieractions:obj.allowmodifieractions,
					hhrate:obj.hhrate,
					printerids:obj.printerids,
					taxable:obj.taxable,
					taxrate:obj.taxrate,
					status:obj.status,
					iscombo:obj.combotype == 'true',
					isgiftcard:obj.giftcarditem == 'true',
					isktv:obj.ktvitem == 'true',
					comboitem:obj.comboitem,
					color:obj.color,
					properties:ApiReader.getListOrOneInstan(obj.properties),
					baseweight:obj.baseweight,
					itemnumber:number,
					coursenumber:courseNum,
					hiddenitem:obj.forcomboonly == 'true',
					pricingruleid:ApiReader.getListOrOneInstan(obj.pricingruleids),
					outofstock:obj.outofstock == 'true'
			};
		if(dish.iscombo)
		{
			dish.comboitem.combosections = ApiReader.getListOrOneInstan(dish.comboitem.combosections);
			for(var i in dish.comboitem.combosections){if(goipad(i))continue;
				var thissection = dish.comboitem.combosections[i];
				thissection.name = {en:thissection.name};
				ApiReader.getMultLang(thissection,thissection);
				thissection.saleitems = ApiReader.getListOrOneInstan(thissection.saleitems);
			}
			var text = dish.comboitem.name;
			if(typeof(dish.comboitem.name)=='string')dish.comboitem.name = {en:text};
			ApiReader.getMultLang(dish.comboitem,dish.comboitem);
		}
		data.allitemsoptionlistquickFun(false,dish);
		if(obj.marketpriceitem == "true"){
			for(var i in dish.price.optprice){if(goipad(i))continue;
				dish.price.optprice[i] = paras.openpricetag;
			}
			for(var j in dish.allprice){if(goipad(j))continue;
				dish.allprice[j].price = paras.openpricetag;
			}
		}
		ApiReader.getMultLang(obj,dish);
		var enName = dish.name['en'];
		if(paras.displayItemNumberB4ItemName&&!!number)
			for(var i in dish.name){if(goipad(i))continue;
				var thisname = dish.name[i];
				if(!thisname)thisname = enName;
				dish.name[i] = number+"."+thisname;
			}
		return dish;
	},
	getDishes: function(obj,isShowAll)
	{
		var returnList = [];
		if(isShowAll){openfood = [];KLine = [];Lcard = [];giftcardlist.grouplist[0].ctgrylist[0].itemlist = [];}
		try{
			var list = ApiReader.getListOrOneInstan(obj.categorygroup);
		}
		catch (err){
			//alert("Parse Dishes Error!");
			return [];
		};
		var grpTemp = {};
		for(var i in list){if(goipad(i))continue;
			if(isShowAll||ApiReader.isGroupDsply(list[i]))
			{
				grpTemp = ApiReader.getOneDishGroup(list[i],isShowAll);
				if(grpTemp != undefined)returnList.push(grpTemp);
			}
		}
		return returnList;
	},
	isCtryDsply:function(ctryobj)
	{
		return true;
	},
	getOneDishGroup: function(obj,isShowAll)
	{
		var returnList = [];
		try{
			var list = ApiReader.getListOrOneInstan(obj.category);
		}
		catch (err){
		};
		var ctrTemp = {};
		for(var i in list){if(goipad(i))continue;
			if(isShowAll||ApiReader.isCtryDsply(list[i]))
			{
				ctrTemp = ApiReader.getOneCtgr(list[i],isShowAll);
				if(ctrTemp != undefined) returnList.push(ctrTemp);
			}
		}
		if(returnList.length == 0) return undefined;
		var group = {
			id:obj.id,
			name:{en:obj.name,},
			ctgrylist:returnList,
			dscrp:{en:obj.description,},
			hours:obj.hours,
			deleted:obj.deleted,
			color:obj.color,
		};
		ApiReader.getMultLang(obj,group);
		return group;
	},
	isPropertieMatch:function(obj){
		if((!paras.isfilterbyPropertie)||paras.displayDishesPropertie == 'ALL') return true;
		else{
			var p = ApiReader.getListOrOneInstan(obj.properties);
			for(var i in p){if(goipad(i))continue;
				if(p[i].name == paras.displayDishesPropertie&&p[i].value=='true')
					return true;
			}
			return false;
		}
	},
	isThisDishItemShow:function(obj)
	{
		if(!ApiReader.isPropertieMatch(obj))
			return false;
		if(obj.forcomboonly == 'true') 
			return false;
		if(ApiReader.isopenfood(obj)){return false;}
		if(ApiReader.isKticketLine(obj)){return false;}
		if(thisorder.type == 'GIFT_CARD'){
			if(ApiReader.isgiftcard(obj))
				return true;
			else
				return false;
		}
		else
			if(ApiReader.isgiftcard(obj))
				return false;
		var pricelist = ApiReader.getListOrOneInstan(obj.itemprice);
		if(pricelist.length == 0)
			return true;
		else{
			for(var i in pricelist){if(goipad(i))continue;
				var t = pricelist[i].type;
				if(ApiReader.isThisPrcShow(t))
					return true;
			}
			var thistype = getPriceTypeOfThisType(thisdishestype);
			if(thistype!="DINE_IN"){
				for(var i in pricelist){if(goipad(i))continue;
					if(pricelist[i].type!="TAKEOUT")
						continue;
					return true;
				}
			}
		}
		return false;
	},
	isopenfood:function(obj){
		var p = ApiReader.getListOrOneInstan(obj.properties);
		for(var i in p){if(goipad(i))continue;
			if(p[i].value == 'true'&&p[i].name == "OPEN_FOOD")
				return true;
		}
		return false;
	},
	isKticketLine:function(obj){
		var p = ApiReader.getListOrOneInstan(obj.properties);
		for(var i in p){if(goipad(i))continue;
			if(p[i].value == 'true'&&p[i].name == "KITCHEN_TICKET_LINE")
				return true;
		}
		return false;
	},
	isLcard:function(obj){
		var p = ApiReader.getListOrOneInstan(obj.properties);
		for(var i in p){if(goipad(i))continue;
			if(p[i].value == 'true'&&p[i].name == "LOYALTY_CARD")
				return true;
		}
		return false;
	},
	isThisPrcShow:function(t)
	{
		if(paras.displayDishesPropertie!='ALL')return true;
		return (t==undefined||
			getPriceTypeOfThisType(thisdishestype)==undefined||
			JSON.stringify(t)=="{}"||
			t.toUpperCase() =="ALL"||
			t == getPriceTypeOfThisType(thisdishestype)||
			t.toUpperCase() =="DEFAULT");
	},
	getOneCtgr:function(obj,isShowAll)
	{
		if(obj.deleted == "true"&&(!isShowAll))
			return undefined;
		var returnList = [];
		try{
				var list = ApiReader.getListOrOneInstan(obj.saleitems);
			}
		catch (err){
			var list = [];
		};
		for(var i in list){if(goipad(i))continue;
			if(isShowAll){
				if(ApiReader.isgiftcard(list[i]))
					giftcardlist.grouplist[0].ctgrylist[0].itemlist.push(ApiReader.getOneItem(list[i],isShowAll));
				if(ApiReader.isopenfood(list[i]))
					openfood.push(ApiReader.getOneItem(list[i],isShowAll));
				if(ApiReader.isKticketLine(list[i]))
					KLine.push(ApiReader.getOneItem(list[i],isShowAll));
				if(ApiReader.isLcard(list[i]))
					Lcard.push(ApiReader.getOneItem(list[i],isShowAll));
				returnList.push(ApiReader.getOneItem(list[i],isShowAll,obj.coursenumber));
			}
			else if(ApiReader.isThisDishItemShow(list[i]))
				returnList.push(ApiReader.getOneItem(list[i],isShowAll,obj.coursenumber));
		}
		if(returnList.length == 0) return undefined;
		var ctgr = {
			id:obj.id,
			name:{en:obj.name,},
			itemlist:returnList,
			hhinfo:obj.isallowedhappyhour,
			attributes:ApiReader.getListOrOneInstan(obj.attributes),
			dscrp:{en:obj.notes},
			img:obj.thumbpath,
			printerids:obj.printerids,
			taxids:ApiReader.getListOrOneInstan(obj.taxids),
			color:obj.color,
			isSkipDiscount:obj.applicabletoorderdiscount=='false',
		};
		data.allitemsoptionlistquickFun(true,ctgr);
		ApiReader.getMultLang(obj,ctgr);
		return ctgr;
	},
	isgiftcard:function(obj)
	{
		return obj.giftcarditem == 'true';
	},
	getOneItem: function(obj,isShowAll,courseNum)
	{
		var number = obj.itemnumber;
		
		var dish = {
					id: obj.id,
					orderid:obj.id,
					name:{en:obj.name,},
					price: {optprice:[obj.price],optname:[]},
					pricedef:obj.price,
					attributes:ApiReader.getListOrOneInstan(obj.attributes),
					dscrp:{en:obj.description},
					img:{
						b:obj.thumbpath,
						s:obj.thumbpath,
						},
					allowedhh:obj.allowedhh,
					allowmodifieractions:obj.allowmodifieractions,
					hhrate:obj.hhrate,
					printerids:obj.printerids,
					taxable:obj.taxable,
					taxrate:obj.taxrate,
					status:obj.status,
					iscombo:obj.combotype == 'true',
					isgiftcard:obj.giftcarditem == 'true',
					isktv:obj.ktvitem == 'true',
					comboitem:obj.comboitem,
					color:obj.color,
					properties:ApiReader.getListOrOneInstan(obj.properties),
					baseweight:obj.baseweight,
					itemnumber:number,
					coursenumber:courseNum,
					hiddenitem:obj.forcomboonly == 'true',
					pricingruleid:ApiReader.getListOrOneInstan(obj.pricingruleids),
					outofstock:obj.outofstock == 'true'
			};
		if(dish.iscombo)
		{
			dish.comboitem.combosections = ApiReader.getListOrOneInstan(dish.comboitem.combosections);
			for(var i in dish.comboitem.combosections){if(goipad(i))continue;
				var thissection = dish.comboitem.combosections[i];
				thissection.name = {en:thissection.name};
				ApiReader.getMultLang(thissection,thissection);
				thissection.saleitems = ApiReader.getListOrOneInstan(thissection.saleitems);
			}
			var text = dish.comboitem.name;
			if(typeof(dish.comboitem.name)=='string')dish.comboitem.name = {en:text};
			ApiReader.getMultLang(dish.comboitem,dish.comboitem);
		}
		data.allitemsoptionlistquickFun(false,dish);
		ApiReader.getPrice(obj,dish);
		if(obj.marketpriceitem == "true")
			for(var i in dish.price.optprice){if(goipad(i))continue;
				dish.price.optprice[i] = paras.openpricetag;
			}
		ApiReader.getMultLang(obj,dish);
		var enName = dish.name['en'];
		if(paras.displayItemNumberB4ItemName&&!!number)
			for(var i in dish.name){if(goipad(i))continue;
				var thisname = dish.name[i];
				if(!thisname)thisname = enName;
				dish.name[i] = number+"."+thisname;
			}
		return dish;
	},
	getMultLang: function(obj,str)
	{
		try{var lanInfo = ApiReader.getListOrOneInstan(obj.fielddisplaynamegroup);}//
		catch(e){return;}
		if(lanInfo.length == 0 ){
			if(!!obj.name && !!language.lanList[obj.name]){
				str['name'] = language.lanList[obj.name];
			}
		}
		else{
			for(var i in lanInfo){if(goipad(i))continue;
				var OnelanInfo = lanInfo[i];
				try{
					var targetField = str[OnelanInfo.fieldname];
					var display = ApiReader.getListOrOneInstan(OnelanInfo.fielddisplayname);
					for(var j in display){if(goipad(j))continue;
						language.langTypeList[display[j].languagecode] = true;
						targetField[display[j].languagecode] = display[j].name;
					}
				}
				catch(e){}
			}
		}
	},
	getPrice: function(obj,str)
	{
		try{var priceStr = ApiReader.getListOrOneInstan(obj.itemprice);}
		catch(e){return;};
		if(priceStr.length == 0)
			return;
		var returnPriceStr = {optprice:[],optname:[],type:[]};
		str['type'] = {};
		var typenull = true;
		var thistype = getPriceTypeOfThisType(thisdishestype);
		var otherpricelist = [];
		var thispricelist = [];
		var itemSizeList = data.itemSizeList;
		for(var i in priceStr){if(goipad(i))continue;
			if(priceStr[i].type == "ALL"){//ALL means other
				otherpricelist.push(priceStr[i]);
				continue;
			}
			else if(priceStr[i].type != thistype){
				continue;
			}
			if(priceStr[i].size == 'All'){
				thispricelist = [];
				thispricelist.push(priceStr[i]);
				break;
			}
			else{
				thispricelist.push(priceStr[i]);
			}
		}
		if(thispricelist.length == 0){
			for(i in otherpricelist){if(goipad(i))continue;
				if(otherpricelist[i].size == 'All'){
					thispricelist = [];
					thispricelist.push(otherpricelist[i]);
					break;
				}
				else{
					thispricelist.push(otherpricelist[i]);
				}
			}
		}
		for(var i in thispricelist){if(goipad(i))continue;
			if(thispricelist[i].size == "All")
			{
				returnPriceStr.name = [];
				returnPriceStr.optprice = [thispricelist[i].price];
				returnPriceStr.type.push(thispricelist[i].type);
				typenull = false;
				break;
			}
			returnPriceStr.optprice.push(thispricelist[i].price);
			returnPriceStr.type.push(thispricelist[i].type);
			returnPriceStr.optname.push(itemSizeList[thispricelist[i].sizeid].name);
			str.type[thispricelist[i].type] = true;
			typenull = false;
		}		
		
		if(typenull&&!!thistype&&thistype!="DINE_IN"){
			for(var i in priceStr){if(goipad(i))continue;
				if(priceStr[i].type!="TAKEOUT")
					continue;
				if(priceStr[i].size == "All")
				{
					returnPriceStr.name = [];
					returnPriceStr.optprice = [priceStr[i].price];
					returnPriceStr.type.push(thistype);
					break;
				}
				returnPriceStr.optprice.push(priceStr[i].price);
				returnPriceStr.type.push(thistype);
				returnPriceStr.optname.push(itemSizeList[priceStr[i].sizeid].name);
				str.type[priceStr[i].type] = true;
			}
		}
		str.price = returnPriceStr;
	},
	getListOrOneInstan: function(str)
	{
		var listT = [];
		if(str==undefined){return listT;}
		if(str.length == undefined||typeof(str) == "string"){listT.push(str);}
		else{listT = str;}
		return listT;
	},
	setOrderCstmInfo:function(str)
	{
		if(str==undefined)return '';
		if(str.id==undefined)return '';
		var xml = ApiReader.xmltag('id',str.id);
		if(str.phone!=undefined)
		{
			for(var i in str.phone){if(goipad(i))continue;
				if(str.phone[i].primaryuse == 'true')
				{
					var p = str.phone[i];
					break;
				}
			}
			if(p==undefined)
				p=str.phone[0];
			if(p!=undefined)
				xml+=ApiReader.xmltag('phone',ApiReader.xmltag('id',p.id));
		}
		if(str.address!=undefined)
		{
			for(var i in str.address){if(goipad(i))continue;
				if(str.address[i].primaryuse == 'true')
				{
					var a = str.address[i];
					break;
				}
			}
			if(a==undefined)
				a=str.address[0];
			if(a!=undefined)
				xml+=ApiReader.xmltag('address',ApiReader.xmltag('id',a.id));
			
		}
		return ApiReader.xmltag('customer',xml);
	},
	setOneOrderdishXml: function(thisitem,isBreak)
	{
		var orderItems = '';
		try{
			if(thisitem.orderid != undefined)
				orderItems += ApiReader.xmltag('id',thisitem.orderid);
			}
		catch(e){};
		orderItems += ApiReader.xmltag('saleItemId',thisitem.iid);
		orderItems += ApiReader.xmltag('orderId',i);
		if(thisitem.oid != undefined)
			orderItems += ApiReader.xmltag('id',thisitem.oid);
		orderItems += ApiReader.xmltag('seatId',thisitem.sid);
		orderItems += ApiReader.xmltag('quantity',thisitem.cont);
		orderItems += ApiReader.xmltag('courseNumber',thisitem.coursenumber);
		orderItems += ApiReader.xmltag('price',thisitem.price.prc);

		orderItems += ApiReader.xmltag('displayText',thisitem.dscrp);
		orderItems += ApiReader.xmltag('status',thisitem.status);
		var size = thisitem.price.name.id;//language.getNameByLan(thisitem.price.name, pwipt.lan);
		orderItems += ApiReader.xmltag('sizeID',size);
		orderItems+=ApiReader.xmltag('discount',thisitem.discount);
		orderItems+=ApiReader.xmltag('discountName',(thisitem.discountid==-1&&thisitem.discountname==undefined)?" ":thisitem.discountname,true);
		orderItems+=ApiReader.xmltag('discountID',thisitem.discountid);
		orderItems+=ApiReader.xmltag('charge',thisitem.charge);
		orderItems+=ApiReader.xmltag('chargeName',(thisitem.chargeid==-1&&thisitem.chargename==undefined)?" ":thisitem.chargename,true);
		orderItems+=ApiReader.xmltag('chargeID',thisitem.chargeid);
			
		if(!!thisitem.voidreason)
			orderItems+=ApiReader.xmltag('voidReason',thisitem.voidreason,true);
		if(thisitem.unit!=undefined)
			orderItems+=ApiReader.xmltag('unit',thisitem.unit);
		if(!!thisitem.type)
			orderItems+=ApiReader.xmltag('type',thisitem.type);
		var optxml = '';
		for(var i in thisitem.opt){if(goipad(i))continue;
			var myopt = thisitem.opt[i];
			var optid = myopt.optionid;
			if(optid!=-1)
				optxml+=ApiReader.xmltag('optionId',optid);
			else if(!!myopt.id)
				optxml+=ApiReader.xmltag('id',myopt.id);
			else
				optxml+=ApiReader.xmltag('optionName',language.getNameByLan(myopt.optionname,pwipt.lan),true);
			optxml+=ApiReader.xmltag('optionType',myopt.optiontype);//???
			optxml+=ApiReader.xmltag('quantity',myopt.quantity);
			if(myopt.price!=undefined)
				optxml+=ApiReader.xmltag('price',myopt.price);
			if(myopt.modifieractionname != undefined&&myopt.modifieractionname.en!=undefined)
				optxml+=ApiReader.xmltag('modifierActionName',myopt.modifieractionname.en,true);
			if(myopt.modifieractionid!=undefined)
				optxml+=ApiReader.xmltag('modifierActionId',myopt.modifieractionid);
			
			orderItems+=ApiReader.xmltag('options', optxml);
			optxml = '';			
		}
		if(thisitem.iscombo)
		{
			var cont = thisitem.cont;
			var allcomboSections = '';
			for(var i in thisitem.combo){if(goipad(i))continue;
				var idxml = ApiReader.xmltag('id',thisitem.combo[i].id);
				var items = '';
				for(var j in thisitem.combo[i].items){if(goipad(j))continue;
					var cbitems = '';
					cbitems += ApiReader.xmltag('id',thisitem.combo[i].items[j].oid)+ApiReader.xmltag('saleItemId',thisitem.combo[i].items[j].iid)+ApiReader.xmltag('quantity',cont);
					optxml = '';
					for(var k in thisitem.combo[i].items[j].opt){if(goipad(k))continue;
						var myopt = thisitem.combo[i].items[j].opt[k];
						var optid = myopt.optionid;
						if(optid!=-1)
							optxml+=ApiReader.xmltag('optionId',optid);
						else if(!!myopt.id)
							optxml+=ApiReader.xmltag('id',myopt.id);
						else
							optxml+=ApiReader.xmltag('optionName',language.getNameByLan(myopt.optionname,pwipt.lan));
						optxml+=ApiReader.xmltag('optionType',myopt.optiontype);//???
						optxml+=ApiReader.xmltag('quantity',myopt.quantity);
						if(myopt.price!=undefined)
							optxml+=ApiReader.xmltag('price',myopt.price);
						if(myopt.modifieractionname != undefined&&myopt.modifieractionname.en!=undefined)
							optxml+=ApiReader.xmltag('modifierActionName',myopt.modifieractionname.en);
						if(myopt.modifieractionid!=undefined)
							optxml+=ApiReader.xmltag('modifierActionId',myopt.modifieractionid);

						cbitems += ApiReader.xmltag('options', optxml);
						optxml = '';			
					}
					items += ApiReader.xmltag('orderItems', cbitems);
				}
				for(var j in thisitem.combo[i].voiditems){if(goipad(j))continue;
					var cbitems = '';
					var voidcount = 0;
					cbitems += ApiReader.xmltag('id',thisitem.combo[i].voiditems[j].oid)+ApiReader.xmltag('saleItemId',thisitem.combo[i].voiditems[j].iid)+ApiReader.xmltag('quantity',voidcount);
					items += ApiReader.xmltag('orderItems', cbitems);
				}
				allcomboSections += ApiReader.xmltag('comboSections',idxml+items);
			}
			orderItems+=ApiReader.xmltag('comboOrderDetails',allcomboSections);
		}
		if(thisitem.isgiftcard)
		{
			var giftCard = '';
			if(thisitem.id != undefined)
				giftCard+=ApiReader.xmltag('id', thisitem.id);
			giftCard+=ApiReader.xmltag('number', thisitem.giftcard.number);
			giftCard+=ApiReader.xmltag('balance', 0);
			giftCard+=ApiReader.xmltag('value', thisitem.giftcard.value);
			if(thisitem.giftcard.expiretime != undefined)
				giftCard+=ApiReader.xmltag('expireTime', thisitem.giftcard.expiretime);
			giftCard+=ApiReader.xmltag('enabled', true);
			if(thisitem.giftcard.issuedto != undefined)
				giftCard+=ApiReader.xmltag('issuedTo', thisitem.giftcard.issuedto);                    
			orderItems+=ApiReader.xmltag('giftCard',giftCard);	
		}
		if(!!thisitem.loyaltycard){
			var loyaltyCard = '';
			if(thisitem.loyaltycard.id != undefined){
				loyaltyCard += ApiReader.xmltag("id",thisitem.loyaltycard.id);
			}
			if(thisitem.loyaltycard.number != undefined){
				loyaltyCard += ApiReader.xmltag("number",thisitem.loyaltycard.number);
			}
			if(thisitem.loyaltycard.syncfromcloud != undefined){
				loyaltyCard += ApiReader.xmltag("syncFromCloud",thisitem.loyaltycard.syncfromcloud);
			}
			orderItems+=ApiReader.xmltag('loyaltyCard',loyaltyCard);
		}
		if(isBreak == true&&thisitem.oid!=undefined&&thisitem.cont>1)
			orderItems+=ApiReader.xmltag('specialInstruction','SPLIT');	
		else if(isBreak == false)//&&thisitem.oid!=undefined
			orderItems+=ApiReader.xmltag('specialInstruction','COMBINE');
			
		if(thisitem.isopenfood){
		    orderItems+=ApiReader.xmltag('displayName',thisitem.name,true);
		    for(var p in thisitem.prtids){if(goipad(p))continue;
                orderItems+=ApiReader.xmltag('printerIds',thisitem.prtids[p]);
            }
            for(var t in thisitem.taxids){if(goipad(t))continue;
                orderItems+=ApiReader.xmltag('taxIds',thisitem.taxids[t]);
			}
		}
		if(thisitem.isktv){
			if(thisitem.ktv.begin!=''&&thisitem.ktv.begin!=undefined){
				orderItems+=ApiReader.xmltag('beginningTime',thisitem.ktv.begin);
			}
			if(thisitem.ktv.end!=''&&thisitem.ktv.end!=undefined){
				orderItems+=ApiReader.xmltag('endingTime',thisitem.ktv.end);
			}
		}
		return ApiReader.xmltag('orderItems',orderItems);
	},
	setOrderXml: function(order,isBreak,authID)//save order
	{
		if(order.isNdSaveParent==true)
		{
			order.isNdSaveParent = false;
			for(var i in order.parentorder.subordergroups){if(goipad(i))continue;
				if(order.id == order.parentorder.subordergroups[i].id){
					order.parentorder.subordergroups[i] = order;
					break;
				}
			}
			return ApiReader.setOrderXml(order.parentorder);
		}
		var xml = "";
		xml += ApiReader.getCheckSum(order.checksum)
		if(order.type != undefined)
			xml += ApiReader.xmltag('type',ApiReader.setOrderType(order));
		var id  = getThisOrderId(order);
		if(id != undefined)
			xml += ApiReader.xmltag('id',id);
		xml+=ApiReader.xmltag('status',order.status);
		xml+=ApiReader.xmltag('currentUserId',pwipt.thisuser.userid);
		if(authID == undefined && dishAndBill.getAuthId4chgPrc(order) != undefined){
			authID = dishAndBill.getAuthId4chgPrc(order)
		}
		if(authID != undefined){
			xml += ApiReader.xmltag('actions',ApiReader.xmltag('authorized',authID));
		}



		if(authInfoList["Change_Server"].authID != undefined){
			var xmlhelper = ApiReader.xmltag('type','Change_Server');
			xmlhelper += ApiReader.xmltag('authorized',authInfoList["Change_Server"].authID);
			xml += ApiReader.xmltag('actions',xmlhelper);
		}
		if(authInfoList["Change_Order_Type"].authID != undefined){
			var xmlhelper = ApiReader.xmltag('type','Change_Order_Type');
			xmlhelper += ApiReader.xmltag('authorized',authInfoList["Change_Order_Type"].authID);
			xml += ApiReader.xmltag('actions',xmlhelper);
		}
		if(authInfoList["Change_Table"].authID != undefined){
			var xmlhelper = ApiReader.xmltag('type','Change_Table');
			xmlhelper += ApiReader.xmltag('authorized',authInfoList["Change_Table"].authID);
			xml += ApiReader.xmltag('actions',xmlhelper);
		}
		if(authInfoList["Gratuity"].authID != undefined){
			var xmlhelper = ApiReader.xmltag('type','Gratuity');
			xmlhelper += ApiReader.xmltag('authorized',authInfoList["Gratuity"].authID);
			xml += ApiReader.xmltag('actions',xmlhelper);
		}
		for(var i in authInfoList.Charge){if(goipad(i))continue;
			var authInfo = authInfoList.Charge[i];
			var xmlhelper = ApiReader.xmltag('type','Charge');
			if(authInfo.authID != undefined){
				xmlhelper += ApiReader.xmltag('authorized',authInfo.authID);
			}
			if(authInfo.itemId != undefined){
				xmlhelper += ApiReader.xmltag('itemId',authInfo.itemId);
			}
			xml += ApiReader.xmltag('actions',xmlhelper);
		}
		for(var i in authInfoList.Discount){if(goipad(i))continue;
			var authInfo = authInfoList.Discount[i];
			var xmlhelper = ApiReader.xmltag('type','Discount');
			if(authInfo.authID != undefined){
				xmlhelper += ApiReader.xmltag('authorized',authInfo.authID);
			}
			if(authInfo.itemId != undefined){
				xmlhelper += ApiReader.xmltag('itemId',authInfo.itemId);
			}
			xml += ApiReader.xmltag('actions',xmlhelper);
		}


		if(order.notes != undefined)
			xml+=ApiReader.xmltag('notes',order.notes,true);
		if(order.server != undefined){
			changeServerIfisSelfDineIn(order);
			xml+=ApiReader.xmltag('userId',order.server);
		}
		if(order.reservationid!=undefined)
			xml+=ApiReader.xmltag('reservationId',order.reservationid);
		if(order.waitinglistid != undefined)
			xml+=ApiReader.xmltag('waitingListId',order.waitinglistid);
		if(order.tableInfo != undefined && order.tableInfo.id != undefined)
			xml+=ApiReader.xmltag('tableId',order.tableInfo.id);
		if(isParentOrder(order))
		{
			var tt = dishAndBill.getSubOrderPaymentTotal(order,true);
			order.pnum = tt.pnum;
		}
		else
			var tt = dishAndBill.getTotalPayment(order);
		if(!!order.taxexempt)
			xml+=ApiReader.xmltag('taxExempt',true);
		else
			xml+=ApiReader.xmltag('taxExempt',false);
		xml+=ApiReader.xmltag('numOfGuests',order.pnum);
		xml+=ApiReader.xmltag('totalPrice',(tt.subtt2-tt.rounding).mytoFixed(2));
		xml+=ApiReader.xmltag('totalTips',tt.totalTips);
		xml+=ApiReader.xmltag('totalTax',tt.subtx2);
		xml+=ApiReader.xmltag('roundingAmount',tt.rounding);
		if(!!order.isNotSentVoidMessageToK)
			xml += ApiReader.xmltag('printTicketWhenVoid',false);

			for(var i in tt.taxstr){if(goipad(i))continue;
				xml+=ApiReader.xmltag('orderTax',ApiReader.xmltag('taxId',tt.taxstr[i].taxid)+ApiReader.xmltag('taxAmount',tt.taxstr[i].taxamount));
			}
		if(isParentOrder(order))
		{
			xml+=ApiReader.xmltag('discount',tt.orderdiscount);
			xml+=ApiReader.xmltag('discountName','');
			xml+=ApiReader.xmltag('discountID',-1);
			xml+=ApiReader.xmltag('charge',tt.ordercharge);
			xml+=ApiReader.xmltag('chargeName','');
			xml+=ApiReader.xmltag('chargeID',-1);
		}
		else
		{
			xml+=ApiReader.xmltag('discount',parseFloat(order.discount.mytoFixed(2)));
			xml+=ApiReader.xmltag('discountName',(order.discountname==undefined?'':order.discountname),true);
			xml+=ApiReader.xmltag('discountID',order.discountid);
			xml+=ApiReader.xmltag('charge',parseFloat(order.charge.mytoFixed(2)));
			xml+=ApiReader.xmltag('chargeName',(order.chargename==undefined?'':order.chargename),true);
			xml+=ApiReader.xmltag('chargeID',order.chargeid);
		}
		
		if(!!order.voidreason)
			xml+=ApiReader.xmltag('voidReason',order.voidreason,true);
			
		if(!!order.vipcardid){
			xml+=ApiReader.xmltag('loyaltyCardId',order.vipcardid);
		}
		if(!!order.vipcardnum){
			xml+=ApiReader.xmltag('loyaltyCardNumber',order.vipcardnum);
		}
		var discountvip = !!order.discountvip?true:false;
		xml+=ApiReader.xmltag('loyaltyDiscount',discountvip);
		
		if(order.seats!=undefined&&order.seats.length>0){
			var suborderstr = seatstr2suborderstr(order.seats);
			var orderdish = suborderstr[0].orderitems;
			if(suborderstr[-1]!=undefined)
				orderdish = orderdish.concat(suborderstr[-1].orderitems);
			for(var i in suborderstr){if(goipad(i))continue;
				if(i == 0||i==-1)
					continue;
				/*if(suborderstr[i].orderitems.length == 0) // to be removed
					continue;*/
				var subxml = "";
				if(suborderstr[i].oid!=undefined)
					subxml+=ApiReader.xmltag('id',suborderstr[i].oid);
				subxml+=ApiReader.xmltag('seatNum',suborderstr[i].name,true);
				for(var j in suborderstr[i].orderitems){if(goipad(j))continue;
					subxml += ApiReader.setOneOrderdishXml(suborderstr[i].orderitems[j],isBreak);
				}
				xml+=ApiReader.xmltag('subOrders',subxml);
			}
		}
		
		for(var i in orderdish){if(goipad(i))continue;
			xml+=ApiReader.setOneOrderdishXml(orderdish[i],isBreak);
		}
		
		xml += ApiReader.setOrderCstmInfo(order.customer);
		if(order.driverid!=undefined)
			xml += ApiReader.xmltag('driverId',order.driverid);
		
		if(order.subordergroups != undefined)
			for(var i in order.subordergroups){if(goipad(i))continue;
				xml += ApiReader.xmltag('subOrderGroups',ApiReader.setOrderXml(order.subordergroups[i]));
			}
		return xml;
	},
	setLayoutConfigXml:function(thisBtn,layoutType){
		var xml = "";
		var thisBtnInfo = data.layoutConfigs[thisBtn.name];
		xml += ApiReader.xmltag('id',thisBtnInfo.id);
		xml += ApiReader.xmltag('name',thisBtnInfo.name);
		xml += ApiReader.xmltag('positionIndex',thisBtn.index);
		xml += ApiReader.xmltag('layoutType',layoutType);
		if(layoutType != 'HIDE'){
			xml += ApiReader.xmltag('hide',false);
		}
		else{
			xml += ApiReader.xmltag('hide',true);
		}
		if(!!thisBtn.icon)
		xml += ApiReader.xmltag('icon',thisBtn.icon);
		return xml;
	},
	xmltag:function(appname,msg,isTransfor)
	{
		if(msg == undefined)
			return '';
		if(!!isTransfor){msg = ApiReader.charTrans(msg+'');}
		return '<app:'+appname+'>'+msg+'</app:'+appname+'>';
	},
	charTrans:function(msg){
		return msg.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
	},
	getUserInfo:function(obj)
	{
		var obj = obj.listprivilegesresponsetype;

		var stf = getstaffbyid(obj.userid);
		var userlan = "";
		if (!!stf && !!stf.user && !!stf.user.DEFAULT_LANGUAGE){
			userlan = stf.user.DEFAULT_LANGUAGE;
		}
		else{ 
			userlan = paras.defaultsyslan;
		}

		var rtinfo = {
			isok:obj.result.successful=='true',
			tblist:[],
			rllist:[],
			needcheckin:obj.requireclockinout,
			needcashin:obj.requirecashinout,
			needcashtip:obj.requireinputcashtips,
			status:obj.status,
			lasttime:obj.lastclockinouttime,
			info:{
				name:obj.username+'',
				lan:userlan
				  },
			userid:obj.userid,
			staffid:obj.staffid
		};
		var funList = ApiReader.getListOrOneInstan(obj.function);
		for(var i in funList){if(goipad(i))continue;
			rtinfo.tblist.push({funId:funList[i].id,funName:funList[i].name,btid:ApiReader.getBtnameByname(funList[i].name)});
		}
		rtinfo.rllist = ApiReader.getListOrOneInstan(obj.roles);
		return rtinfo;
	},
	getBtnameByname:function(funname)
	{
		if(funname == 'staff management'||
		funname == 'menu management'
		||funname == 'global options')
			return 'setting';
		else if(funname == '')
			return '';
	},
	getOrderApiFromApi:function(obj){
		try{
			obj = obj.saveorderresponsetype.order;
			}
		catch(e){
			try{
				obj = obj.fetchorderresponsetype.order;
			}
			catch(e)
			{
				try{
					obj = obj.moveorderitemsresponsetype.toorder;
				}
				catch(e){	
					alert("Can not get Order list from server.");
					return;
				}
			}
		};
		return obj;
	},
	getOrderParentXmlHelper:function(obj)
	{
		obj = ApiReader.getOrderApiFromApi(obj);
		thisorderparent = ApiReader.getOrderXml(obj);
	},
	getOrderXmlHelper:function(obj)
	{
		obj = ApiReader.getOrderApiFromApi(obj);
		thisorder = ApiReader.getOrderXml(obj);
		thisorder.actsid = onSeats.get1stSeatid();
		if(thisorder.parentorderid != undefined){
			thisorder.parentorder = thisorderparent;
		}
	},
	getOrderXml:function(obj)//get order
	{
		//!!!!need get order!!!
		var id = obj.id;
		var thisorderstr = {};
		thisorderstr.id = id;
		thisorderstr.isNdSave = false;
		thisorderstr['id'] = obj.id;
		thisorderstr['checksum'] = obj.checksum;
		thisorderstr['parentchecksum'] = obj.parentorderchecksum;
		thisorderstr['taxexempt'] = obj.taxexempt=='true';
		thisorderstr['createtime'] = obj.createtime;
		thisorderstr['chargename'] = obj.chargename;
		thisorderstr['discountname'] = obj.discountname;
		thisorderstr['chargeid'] = obj.chargeid;
		thisorderstr['discountid'] = obj.discountid;
		thisorderstr['discountvip'] = obj.loyaltydiscount=='true';
		thisorderstr['voidreason'] = obj.voidreason;
		if(!!obj.loyaltycardid){
			thisorderstr['vipcardid'] = obj.loyaltycardid;
			thisorderstr['vipcardnum'] = obj.loyaltycardnumber;
		}
		else if(!!obj.loyaltycardnumber){
			thisorderstr['vipcardnum'] = obj.loyaltycardnumber;
		}
		
		if(obj.chargeid!=undefined)
		{
			var str = getCDbyId(obj.chargeid,true);
			if(!!str&&str.isPer){
				thisorderstr['chargeisper'] = true;
				thisorderstr['chargerate'] = str.val;
			}
		}
		else if(obj.chargename!=undefined){
			var lastindex = obj.chargename.lastIndexOf("%)");
			if(lastindex != -1){
				var firstindex = obj.chargename.lastIndexOf("(");
				if(firstindex < lastindex){
					thisorderstr['chargeisper'] = true;
					var ratestr = obj.chargename.substring(firstindex+1,lastindex);
					thisorderstr['chargerate'] = parseFloat(ratestr)/100;
				}
			}
		}
		if(obj.discountid!=undefined)
		{
			var str = getCDbyId(obj.discountid,false);
			if(!!str&&str.isPer){ 
				thisorderstr['discountisper'] = true;
				thisorderstr['discountrate'] = str.val;
			}
		}
		else if(obj.discountname!=undefined){
			var lastindex = obj.discountname.lastIndexOf("%)");
			if(lastindex != -1){
				var firstindex = obj.discountname.lastIndexOf("(");
				if(firstindex < lastindex){
					thisorderstr['discountisper'] = true;
					var ratestr = obj.discountname.substring(firstindex+1,lastindex);
					thisorderstr['discountrate'] = parseFloat(ratestr)/100;
				}
			}
		}
		thisorderstr['charge'] = obj.charge;
		thisorderstr['discount'] = obj.discount;
		thisorderstr.tableInfo = thisorder.tableInfo;
		try{
			thisorderstr.tableInfo.rtinfo.pnum = obj.numofguests;
		}
		catch(e){}
		thisorderstr['pnum'] = obj.numofguests;
		thisorderstr['ordertax'] = ApiReader.getListOrOneInstan(obj.ordertax);
		thisorderstr['type'] = obj.type;
		thisorderstr['ptype'] = ApiReader.setOrderType({type:obj.type},true);
		thisorderstr['isKline'] = paras.isKline[obj.type]
		if(!!obj.roundingamount){
			thisorderstr['oldsubtt'] = obj.totalprice + obj.roundingamount;
			thisorderstr['oldrounding'] = obj.roundingamount;
		}
		else{
			thisorderstr['oldsubtt'] = obj.totalprice;
			thisorderstr['oldrounding'] = 0;
		}
		thisorderstr['oldsubtx'] = obj.totaltax;
		thisorderstr['totalTips'] = obj.totaltips;
		thisorderstr['status'] = obj.status;
		if(obj.additionalstatus != undefined){
			thisorderstr['additionalstatus'] = obj.additionalstatus;
		}
		thisorderstr['server'] = obj.userid;
		thisorderstr['servername'] = obj.servername+'';
		thisorderstr['ordernumber'] = obj.ordernumber;
		thisorderstr['notes'] = obj.notes;
		thisorderstr['onlineorderid'] = obj.onlineorderid;
		thisorderstr['appType'] = obj.apptypecreatedon;
		thisorderstr['tableInfo'] = table.getTableInfoByName(obj.tablename);
		var subitems = [];
		var orderitmes = ApiReader.getListOrOneInstan(obj.orderitems);
		for(var i in orderitmes){if(goipad(i))continue;
			if(isParentOrder(obj)){
				subitems.push(ApiReader.getOneOrderItem(orderitmes[i],-1));
			}
			else {
				subitems.push(ApiReader.getOneOrderItem(orderitmes[i],0));
			}
		}
		thisorderstr['seats'] = [];
		thisorderstr['seats'].push({
			chrct: "",
			id: 0,
			name: 0,
			dishes: subitems
		});
		var suborders = ApiReader.getListOrOneInstan(obj.suborders);
		for(var i in suborders){if(goipad(i))continue;
			var name = suborders[i].seatnum==undefined?(parseInt(i)+1):suborders[i].seatnum;
			subitems = [];
			var orderitmes = ApiReader.getListOrOneInstan(suborders[i].orderitems);
			for(var j in orderitmes){if(goipad(j))continue;
				subitems.push(ApiReader.getOneOrderItem(orderitmes[j],suborders[i].id));
			}
			thisorderstr['seats'].push({
				chrct: "",
				id: suborders[i].id,
				oid: suborders[i].id,
				name: name,
				dishes: subitems
			});
		}
		thisorderstr.tableInfo.name = obj.tablename;
		thisorderstr.tableInfo['rtinfo'] = {
			status:'order',pnum:thisorder.pnum,
			sname:obj.servername,
			time:mydateParse(obj.createtime),cost:0,actsid:0,
		};
		thisorderstr.onActive = 'sgrp';
		thisorderstr['payments'] = ApiReader.getListOrOneInstan(obj.payments);
		
		if(!paras.isallowmodifyonlineorderpayment&&(thisorderstr.type == "ONLINE_PICKUP"||thisorderstr.type == "ONLINE_DELIVERY"))for(var i in thisorderstr.payments){if(goipad(i))continue;thisorderstr.payments[i].isnotmodify = true;}
		 
		for(var i in thisorderstr.payments){if(goipad(i))continue;
			thisorderstr.payments[i].subpayments = ApiReader.getListOrOneInstan(thisorderstr.payments[i].subpayments);
		}
		if(obj.customer != undefined)
		{
			thisorderstr['customer'] = obj.customer;
			thisorderstr['customer'].phone = ApiReader.getListOrOneInstan(thisorderstr['customer'].phone);
			thisorderstr['customer'].address = ApiReader.getListOrOneInstan(thisorderstr['customer'].address);
		}
		if(obj.deliveryaddress != undefined){
			thisorderstr['deliveryaddress'] = obj.deliveryaddress;
		}
		if(obj.phonenumber != undefined){
			thisorderstr['deliveryphonenumber'] = obj.phonenumber;
		}
		if(obj.driverid != undefined)
			thisorderstr['driverid'] = obj.driverid;
		thisorderstr['parentorderid'] = obj.parentorderid;
		thisorderstr['subordergroups'] = [];
		if(obj.subordergroups != undefined)
		{
			var suborder = ApiReader.getListOrOneInstan(obj.subordergroups);
			for(var i in suborder){if(goipad(i))continue;
				suborder[i].tablename = obj.tablename;
				thisorderstr['subordergroups'].push(ApiReader.getOrderXml(suborder[i]));
			}
		}
		if(!!obj.srmtransactioncount) thisorderstr['srmtransactioncount'] = !!obj.srmtransactioncount;
		thisorderstr['printreceiptcount'] = obj.printreceiptcount=='0'?0:obj.printreceiptcount;
		if(!!obj.reservationlist) thisorderstr['reservationlist'] = ApiReader.getListOrOneInstan(obj.reservationlist);
		if(!!obj.waitinglistlist) thisorderstr['waitinglistlist'] = ApiReader.getListOrOneInstan(obj.waitinglistlist);
		return thisorderstr;
	},
	getOneOrderItem:function(obj,sid)
	{
		var dish = {};
		var dishstr = data.getDishInfoFromWholeDisheslist(obj.saleitemid);
		var itemSizeList = data.itemSizeList;
		if(dishstr==undefined)
		{
			dish['gid'] = -1;
			dish['cid'] = -1;
			dish['iid'] = -1;
		}
		else
		{
			dish['gid'] = dishstr.gid;
			dish['cid'] = dishstr.cid;
			dish['iid'] = obj.saleitemid;
		}
		if(obj.id != undefined)
			dish['oid'] = obj.id;
		dish['dscrp'] = ApiReader.getTextFromObj(obj.displaytext);
		dish['cont'] = obj.quantity;
		dish['inkitchen'] = obj.qtysenttokitchen;
		dish['voidkitchen'] = obj.qtyvoid;//wait weiqi
		dish['voidreason'] = obj.voidreason;
		if(itemSizeList[obj.sizeid]!=undefined){
			var prcnm = itemSizeList[obj.sizeid].name;
		}
		else{
			var prcnm = ApiReader.getTextFromObj(obj.size);
		}
		dish['price'] = {name:prcnm,prc:obj.price};
		dish['unit'] = obj.unit;
		dish['isUnitPrc'] = obj.unit!=undefined;
		if(obj.sendtokitchenremainingdelay!=undefined)
			dish['delaytime'] = obj.sendtokitchenremainingdelay;
		var txids = undefined;
		dish['taxrate'] = [];
		if(dishstr!=undefined)
		{
			if(ApiReader.isopenfood(dishstr)){
				dish["name"] = obj.displayname;
				dish["isopenfood"] = true;
				dish['taxids'] = [];
				if(!!obj.printerids){
					var tmpprinters = [];
					if(isArray(obj.printerids)){
						for(var i in obj.printerids){
							tmpprinters.push(obj.printerids[i].toString());
						}
					}
					else{
						tmpprinters.push(obj.printerids.toString());
					}
					dish['prtids'] = tmpprinters;
				}
				var taxs = ApiReader.getListOrOneInstan(obj.taxids);
				var taxes = [];
				for(var i in taxs){if(goipad(i))continue;
					if(getTaxById(taxs[i]).deleted == "false"){
						taxes.push(taxs[i]);
					}
				}
				for(var i in taxes){if(goipad(i))continue;
					dish['taxids'].push(taxes[i]+"");
					dish['taxrate'].push(getTaxById(taxes[i]));
				}
			}
			else if(ApiReader.isKticketLine(dishstr)){
				dish["isKLine"] = true;
			}
			else{
				if(!!dishstr.isktv){
					dish["isktv"] = true;
					dish["ktv"] = {begin:obj.beginningtime,end:obj.endingtime,price:dishstr.price.optprice[0]};
					dish["ktv"].total = ktv.calTimeLast(dish["ktv"]);
				}
				var wholedisheslist = data.wholedisheslist;
				txids  = wholedisheslist[dishstr.gid].ctgrylist[dishstr.cid].taxids;
				for(var i in txids){if(goipad(i))continue;
					dish['taxrate'].push(getTaxById(txids[i]));
				}
				if(dishstr.pricingruleid.length>0){
					dish['pricingrule'] = dishstr.pricingruleid;
				}
			}
		}
		dish['sid'] = sid;
		dish['qid'] = orderdishesuid++;
		dish['isout'] = false;//is it out price, need to modify!!!!!
		dish['ishh'] = false;//is it happy hour price, need to modify!!!!!
		dish['status'] = obj.status;
		dish['discount'] = obj.discount;
		dish['discountname'] = obj.discountname;
		dish['discountid'] = obj.discountid;
		dish['charge'] = obj.charge;
		dish['chargename'] = obj.chargename;
		dish['chargeid'] = obj.chargeid;
		dish['coursenumber'] = obj.coursenumber;
		dish['type'] = obj.type;
		dish['opt'] = [];//option information, need to modify!!!!!
		if(!!obj.loyaltycard){
			dish['loyaltycard'] = obj.loyaltycard;
		}
		if(!!obj.giftcard){
			dish['giftcard'] = obj.giftcard;
		}
		var dishopt = ApiReader.getListOrOneInstan(obj.options);
		for(var i in dishopt){if(goipad(i))continue;
			dish['opt'].push(ApiReader.getOneOrderItemOpt(dishopt[i]));
		}
		if(obj.comboorderdetails != undefined)
		{
			dish['iscombo'] = true;
			dish['combo'] = ApiReader.getCombo(obj.comboorderdetails);
		}
		else
			dish['iscombo'] = false;
		if(dishstr!=undefined)
			dish['did'] = dishAndBill.addgetDid(dish);
		else
			dish['did'] = -1;
		return dish;
	},
	getCombo:function(obj)
	{
		var slctn = ApiReader.getListOrOneInstan(obj.combosections);
		var itemcombo = [];
		for(var i in slctn){if(goipad(i))continue;
			var oneitemlist = [];
			var thisitemlist = ApiReader.getListOrOneInstan(slctn[i].orderitems);
			var items = [];
			var voiditems = [];
			for(var j in thisitemlist){if(goipad(j))continue;
				var saleid = thisitemlist[j].saleitemid;
				var cbitemopt = [];
				var dishopt = ApiReader.getListOrOneInstan(thisitemlist[j].options);
				for(var k in dishopt){if(goipad(k))continue;
					cbitemopt.push(ApiReader.getOneOrderItemOpt(dishopt[k]));
				}
				if(thisitemlist[j].quantity != 0){
					items.push({iid:saleid,oid:thisitemlist[j].id,prc:thisitemlist[j].price,did:"cbdsh_"+orderdishesuid++,opt:cbitemopt});
				}
				else{
					voiditems.push({iid:saleid,oid:thisitemlist[j].id,prc:thisitemlist[j].price,did:"cbdsh_"+orderdishesuid++,opt:cbitemopt});
				}
			}
			itemcombo.push({
				id:slctn[i].id,
				name:{en:slctn[i].name},
				items:items,
				voiditems:voiditems,
			});
		}
		return itemcombo;
	},
	getOneOrderItemOpt:function(obj)
	{
		if(obj.optiontype == "GLOBAL"){
			var o = data.alloptionlistquick[obj.optionid];
		}
		else{
			var o = data.allitemsoptionlistquick[obj.optionid];
		}
		if(!!o){
			var name = o.o.name;
		}
		else{
			var name = {en:obj.optionname,};
		}
		if(!!obj.modifieractionid){
			var actionname = data.alloptionactionlistquick[obj.modifieractionid].a.name;
		}
		else{
			var actionname = {en:obj.modifieractionname,};
		}
		var str = {
			modifieractionid:obj.modifieractionid,
			modifieractionname:actionname,
			id:obj.id,
			optionid:obj.optionid==undefined?-1:obj.optionid,
			optionname:name,
			price:obj.price,
			quantity:obj.quantity,
			optiontype:obj.optiontype,
		};
		ApiReader.getMultLang(obj,str);
		return str;
	},
	getTextFromObj:function(obj)
	{
		if(obj == undefined)
			return "";
		if(typeof(obj) == "string")
			return obj;
		if(typeof(obj) == "object")
		{
			try{obj = language.getNameByLan(obj,pwipt.lan); }
			catch(e){return ''};
			if(obj == undefined) return '';
			else return obj;
		}
		else
			return obj;
	},
	setOrderType:function(obj,isRealType)
	{
		try{
			var type = obj.type;
			if(type == "DINE_IN")
				return 'DINE_IN';
			else if(type == 'tg'||type == 'TOGO')
				return 'TOGO';
			else if(type == 'dv'||type == 'DELIVERY')
				return 'DELIVERY';
			else if(type == 'pu'||type == 'PICKUP')
				return 'PICKUP';
			else if(type == 'ONLINE_DELIVERY')
				return 'ONLINE_DELIVERY';
			else if(type == 'ONLINE_PICKUP')
				return 'ONLINE_PICKUP';
			else if(type == 'ONLINE')
				return 'ONLINE';
			else if(type == 'SELF_DINE_IN')
				return 'SELF_DINE_IN';
			else if(type == 'GIFT_CARD')
				return 'GIFT_CARD';
			else if(type == 'CUSTOM_ORDER_TYPE1'){
				if(!!isRealType){
					return ApiReader.setOrderType({type:data.ordertypesettings[type].ordertype});
				}
				else{
					return 'CUSTOM_ORDER_TYPE1';
				}
			}
			else if(type == 'CUSTOM_ORDER_TYPE2')
				if(!!isRealType){
					return ApiReader.setOrderType({type:data.ordertypesettings[type].ordertype});
				}
				else{
					return 'CUSTOM_ORDER_TYPE2';
				}
			else if(type == 'CUSTOM_ORDER_TYPE3')
				if(!!isRealType){
					return ApiReader.setOrderType({type:data.ordertypesettings[type].ordertype});
				}
				else{
					return 'CUSTOM_ORDER_TYPE3';
				}
			else if(type == 'CUSTOM_ORDER_TYPE4')
				if(!!isRealType){
					return ApiReader.setOrderType({type:data.ordertypesettings[type].ordertype});
				}
				else{
					return 'CUSTOM_ORDER_TYPE4';
				}
			}
		catch(e){return undefined;}
	},
	setPrintReceiptXml:function(isfouceNoRcpt)
	{
		if(!!isfouceNoRcpt)return ApiReader.xmltag('printPaymentReceipt',false)+ApiReader.xmltag('merchantCopyOnly',false);
		return ApiReader.xmltag('printPaymentReceipt',paras.printPaymentReceipt)+ApiReader.xmltag('merchantCopyOnly',paras.merchantCopyOnly);
	},
	setSemplePaymentXml:function(id,amount,isvoid,checksum,addcash,tip,isHeartland){
		var xmlhelper = '';
		xmlhelper += ApiReader.getCheckSum(checksum);
		xmlhelper += ApiReader.xmltag('userId',pwipt.thisuser.userid);
		xmlhelper += ApiReader.xmltag('id',id);
		xmlhelper += ApiReader.xmltag('paidAmount',amount);
		xmlhelper += ApiReader.xmltag('amount',amount);
		if(!!isHeartland){
			xmlhelper += ApiReader.xmltag('cardType',"HEARTLAND_GIFT_CARD");
			xmlhelper += ApiReader.xmltag('type',"GIFT_CARD");
		}
		if(isvoid)
			xmlhelper += ApiReader.xmltag('voidPayment',true);
		if(addcash!=undefined){
			xmlhelper += ApiReader.xmltag('cashTipAmount',addcash);
		}
		if(tip!=undefined){
			xmlhelper += ApiReader.xmltag('tipAmount',tip);
		}
		xmlhelper = ApiReader.xmltag("paymentRecord",xmlhelper);
		return xmlhelper;
	},
	getMyCardType:function(cardtype){
		return !!cardtype?cardtype:"UNKNOWN";
	},
	setPaymentXml:function(type,cardinfo,isGsmodel,isUSEPAY,isbackup,checksum)
	{//payment and subpayment , subpayment cannot split into to payment. 
		var bills = thisorder.payments;
		var xml = "";
		var cardinfoxml;
		var cardinfoxmlt;
		for(var k in bills){if(goipad(k))continue;
			cardinfoxmlt = undefined;
			var bill = bills[k];
			var payments = '';
			var isadd = false;
			payments += ApiReader.xmltag('userId',pwipt.thisuser.userid);
			payments += ApiReader.xmltag('orderId',thisorder.id);
			if(bill.id != undefined) 			payments += ApiReader.xmltag('id',bill.id);
			else{
				if(!!isGsmodel) cardinfoxmlt = ApiReader.setSwipeCardinfo(type,true,cardinfo,bill.paidamount,true,isUSEPAY,isbackup);
				else if((!!cardinfo)||(type=='SALE_KEYED'))	cardinfoxmlt = ApiReader.setSwipeCardinfo(type,true,cardinfo,bill.paidamount,false,isUSEPAY,isbackup);
			}
			if(bill.type != undefined) 			payments += ApiReader.xmltag('type',bill.type);
			if(bill.amount != undefined) 		payments += ApiReader.xmltag('amount',bill.amount);
			var isChangePage = false;//for change page to credit card company
			if(type == 'SALE_KEYED')
				if(isChangePage)
					payments += ApiReader.xmltag('paidAmount',0);
				else
					payments += ApiReader.xmltag('paidAmount',bill.paidamount);
			else
				if(bill.paidamount != undefined) 	payments += ApiReader.xmltag('paidAmount',bill.paidamount);
			payments += ApiReader.xmltag('multiplePayments',bill.multiplepayments);
			if(bill.type != undefined && bill.type != 'CASH'){
				payments += ApiReader.xmltag('cardType',ApiReader.getMyCardType(bill.cardtype));
				
				if(bill.type == "ACCOUNT")
					payments += ApiReader.xmltag('accountId',bill.accoundid);
				else
					payments += ApiReader.xmltag('cardNumber',bill.cardnumber);
			}
			else{
				payments += ApiReader.xmltag('changeAmount',bill.changeamount);
				payments += ApiReader.xmltag('tipAmount', bill.tipamount);
			}
			if(bill.multiplepayments=="true"||bill.multiplepayments==true)
			{
				for(var p in bill.subpayments){if(goipad(p))continue;
					cardinfoxml = undefined;
					var subp = '';
					if(bill.subpayments[p].id != undefined)subp += ApiReader.xmltag('id',bill.subpayments[p].id);
					else{
						isadd = true;
						if(!!isGsmodel) cardinfoxmlt = ApiReader.setSwipeCardinfo(type,true,cardinfo,bill.paidamount,true,isUSEPAY,isbackup);
						else if((!!cardinfo)||(type=='SALE_KEYED'))	cardinfoxmlt = ApiReader.setSwipeCardinfo(type,true,cardinfo,bill.paidamount,false,isUSEPAY,isbackup);
					}
					subp += ApiReader.xmltag('type',bill.subpayments[p].type);
					subp += ApiReader.xmltag('amount',bill.subpayments[p].amount);
					subp += ApiReader.xmltag('paidAmount',bill.subpayments[p].paidamount);
					if(bill.subpayments[p].type != undefined && bill.subpayments[p].type != 'CASH'){
						subp += ApiReader.xmltag('cardType',ApiReader.getMyCardType(bill.subpayments[p].cardtype));
						if(bill.subpayments[p].type == "ACCOUNT")
							subp += ApiReader.xmltag('accountId',bill.subpayments[p].accoundid);
						else
							subp += ApiReader.xmltag('cardNumber',bill.subpayments[p].cardnumber);

						
						subp += ApiReader.xmltag('changeAmount',0);//cashback??
					}
					else{
						subp += ApiReader.xmltag('changeAmount',bill.subpayments[p].changeamount);
					}

					payments += ApiReader.xmltag('subPayments',subp);
					if(!!cardinfoxml)payments += cardinfoxml;					
				}
			}
			payments += ApiReader.getCheckSum(checksum);
			xml += ApiReader.xmltag('paymentRecord',payments);
			if(!!cardinfoxmlt&&!isadd)xml += cardinfoxmlt;
		}
		return xml;
	},
	getOneStaff:function(obj)
	{
		if(obj.user!=undefined)
		{
			obj.user.functions = ApiReader.getListOrOneInstan(obj.user.functions);
			obj.user.roles = ApiReader.getListOrOneInstan(obj.user.roles);
			var setting = ApiReader.getListOrOneInstan(obj.user.settings);
			for(var s in setting){if(goipad(s))continue;
				obj.user[setting[s].name] = setting[s].value;
			}
			obj.name += '';
		}	
		return obj;
	},
	getGOpt:function(obj)
	{
		data.alloptionlistquickFun(obj);
	},
	getOptAct:function(obj)
	{
		data.alloptionactionlistquickFun(obj);
	},
	isUnset:function(s)
	{
		return (s == undefined || s == '');
	},
	setCustomerInfoXml:function(str)
	{
		var xml = '';
		if(str.id != undefined)
			xml += ApiReader.xmltag('id',str.id);
		if(str.prefix != undefined )//&& str.prefix != ''
			xml += ApiReader.xmltag('prefix',str.prefix,true);
		if(str.firstname != undefined )//&& str.firstname != ''
			xml += ApiReader.xmltag('firstName',str.firstname,true);
		if(str.lastname != undefined )//&& str.lastname != ''
			xml += ApiReader.xmltag('lastName',str.lastname,true);
		if(str.email != undefined )//&& str.email != ''
			xml += ApiReader.xmltag('email',str.email,true);
		if(str.description != undefined )//&& str.description != ''
			xml += ApiReader.xmltag('description',str.description,true);
		if(str.buzz != undefined )//&& str.buzz != ''
			xml += ApiReader.xmltag('buzz',str.buzz,true);
		var oneaddr = '';
		for(var i in str.address){if(goipad(i))continue;
			if(ApiReader.isUnset(str.address[i].address1)&&ApiReader.isUnset(str.address[i].address2))
				continue;
			if(str.address[i].id != undefined&&str.address[i].id != 'undefined')
				oneaddr+=ApiReader.xmltag('id',str.address[i].id);
			if(str.address[i].address1 != undefined )//&& str.address[i].address1 != ''
				oneaddr+=ApiReader.xmltag('address1',str.address[i].address1,true);
			if(str.address[i].address2 != undefined )//&& str.address[i].address2 != ''
				oneaddr+=ApiReader.xmltag('address2',str.address[i].address2,true);
			if(str.address[i].state != undefined )//&& str.address[i].state != ''
				oneaddr+=ApiReader.xmltag('state',str.address[i].state,true);
			if(str.address[i].city != undefined )//&& str.address[i].city != ''
				oneaddr+=ApiReader.xmltag('city',str.address[i].city,true);
			if(str.address[i].zipcode != undefined )//&& str.address[i].zipcode != ''
				oneaddr+=ApiReader.xmltag('zipcode',str.address[i].zipcode,true);
			if(str.address[i].type != undefined )//&& str.address[i].type != ''
				oneaddr+=ApiReader.xmltag('type',str.address[i].type);
			if(str.address[i].description != undefined )//&& str.address[i].description != ''
				oneaddr+=ApiReader.xmltag('description',str.address[i].description,true);
			if(str.address[i].geocoordinate != undefined)
				oneaddr+=ApiReader.xmltag('geoCoordinate',str.address[i].geocoordinate);
			if(str.address[i].distance != undefined)
				oneaddr+=ApiReader.xmltag('distance',str.address[i].distance);
			if(str.address[i].primaryuse != undefined)
				oneaddr+=ApiReader.xmltag('primaryUse',str.address[i].primaryuse);
			xml += ApiReader.xmltag('address',oneaddr);
			oneaddr = '';
		}
		var onephone = '';
		for(var i in str.phone){if(goipad(i))continue;
			if(ApiReader.isUnset(str.phone[i].number)&&ApiReader.isUnset(str.phone[i].extension))
				continue;
			if(str.phone[i].id != undefined)
				onephone+=ApiReader.xmltag('id',str.phone[i].id);
			if(str.phone[i].number != undefined)//&&str.phone[i].number != ''
				onephone+=ApiReader.xmltag('number',str.phone[i].number,true);
			if(str.phone[i].extension != undefined)//&&str.phone[i].extension != ''
				onephone+=ApiReader.xmltag('extension',str.phone[i].extension,true);
			if(str.phone[i].type != undefined&&str.phone[i].type != '')
				onephone+=ApiReader.xmltag('type',str.phone[i].type);
			if(str.phone[i].description != undefined)//&&str.phone[i].description != ''
				onephone+=ApiReader.xmltag('description',str.phone[i].description,true);
			if(str.phone[i].primaryuse != undefined)
				onephone+=ApiReader.xmltag('primaryUse',str.phone[i].primaryuse);
			xml += ApiReader.xmltag('phone',onephone);
			onephone = '';
		}
		return ApiReader.xmltag('customer',xml);
	},
	getCustomerInfo:function(obj)
	{
		var returnobj = obj.savecustomerinforesponsetype;
		if(returnobj==undefined)
			returnobj = obj.findcustomerinforesponsetype;
		if(returnobj.customers==undefined)
			returnobj.customers=returnobj.customer;
		if(returnobj.customers==undefined)
			return [];
		returnobj.customers = ApiReader.getListOrOneInstan(returnobj.customers);
		for(var i in returnobj.customers){if(goipad(i))continue;
			returnobj.customers[i].phone = ApiReader.getListOrOneInstan(returnobj.customers[i].phone);
			returnobj.customers[i].address = ApiReader.getListOrOneInstan(returnobj.customers[i].address);
		}
		return returnobj.customers;
	},
	setSwipeCardinfo:function(type,isforceDuplicate,cardinfo,amount,isGmodelOrPax,isUsePay,isbackup){
		var xml = '';
		if(isbackup)
			return '';
		if(isGmodelOrPax){
			xml += ApiReader.xmltag('actionType',type);
			xml+=ApiReader.xmltag('amount',amount);
			xml+=ApiReader.xmltag('serviceTarget',fp.isGsmodel?'GENIUS':'PAX');		
			xml+=ApiReader.xmltag('forceDuplicate',isforceDuplicate);			
		}
		if(!isUsePay&&type == 'SALE_KEYED'){
			
			xml+=ApiReader.xmltag('actionType',type);
			xml+=ApiReader.xmltag('amount',amount);
			xml+=ApiReader.xmltag('serviceTarget','TRANSPORT');		
			xml+=ApiReader.xmltag('forceDuplicate',isforceDuplicate);			
		}
		else{
			if(!isGmodelOrPax){
				xml += ApiReader.xmltag('actionType',type);
			}
			if(type == 'NONE'){
			    return '';
			}
			if(type == 'APPLY_TIP'){
			    xml += ApiReader.xmltag('tipAmount',amount);
			    return ApiReader.xmltag('transactionDetail',xml);
			}
			else if(type == 'VOID'){
			    return ApiReader.xmltag('transactionDetail',xml);
			}
			else if(type == 'REFUND'){
			    xml += ApiReader.xmltag('overrideAmount',amount);
			    return ApiReader.xmltag('transactionDetail',xml);
			}
			else if(type == 'SALE_KEYED'){
			    xml += ApiReader.xmltag('amount',amount);
			    xml += ApiReader.xmltag('cardNumber',cardinfo.cardno,true);
			    xml += ApiReader.xmltag('expirationDate',cardinfo.expdate);
			    if(!!cardinfo.fname&&!!cardinfo.lname)
			    	xml += ApiReader.xmltag('cardholder',cardinfo.fname+' '+cardinfo.lname,true);
			    if(!!cardinfo.cvv2)
			    	xml += ApiReader.xmltag('cardSecurityCode',cardinfo.cvv2);
			    return ApiReader.xmltag('transactionDetail',xml);
			}
			if(!isGmodelOrPax){
				xml+=ApiReader.xmltag('amount',amount);
				xml+=ApiReader.xmltag('forceDuplicate',isforceDuplicate);
			}
			xml+=ApiReader.xmltag('cardTrackData',cardinfo);
		}
		return ApiReader.xmltag('transactionDetail',xml);
	},
	batchSaveOrderEach:function(ordersmy){
		var xml = '';
		xml += ApiReader.xmltag("id",ordersmy.id);
		xml += ApiReader.xmltag("userId",ordersmy.serverid);//bug!!!! should be pwipt.thisuser.userid
		if(!!ordersmy.driverid)
			xml += ApiReader.xmltag("driverId",ordersmy.driverid);
		if(ordersmy.totaltips!=undefined)
			xml += ApiReader.xmltag("totalTips",ordersmy.totaltips);
		return ApiReader.xmltag("orderRequest",ApiReader.xmltag("order",xml)+ApiReader.xmltag("updateOrderDetails",false));
	},
	batchSavePaymentsEach:function(bill){
		var id = bill.id,
		amount = bill.amount,
		tip = (!!bill.tipamount?bill.tipamount:0),
		cashtip = (!!bill.cashtipamount?bill.cashtipamount:0),
		isSempleModel = bill.seqnumber==undefined,
		checksum = undefined,
		tipsDiffrent = cashtip-bill.oldcashtipamount+tip-bill.oldtipamount,
		tipAdded = bill.tipadded;
				
		var xml = '';
		xml += ApiReader.xmltag("userId",pwipt.thisuser.userid);
		xml += ApiReader.xmltag("id",id);
		xml += ApiReader.xmltag("amount",amount+tipsDiffrent);
		xml += ApiReader.xmltag("paidAmount",amount+tipsDiffrent);
		xml += ApiReader.xmltag("tipAmount",tip);
		xml += ApiReader.xmltag("cashTipAmount",cashtip);
		xml += ApiReader.xmltag("tipAdded",tipAdded);
		xml = ApiReader.xmltag("paymentRecord",xml);
   		
		if(!!isSempleModel)
			return xml;
		else
			return xml + ApiReader.setSwipeCardinfo('APPLY_TIP',undefined,undefined,tip);	
	},
	batchPayCashEach:function(ordersmy){
		var xml = '';
		xml += ApiReader.xmltag("userId",pwipt.thisuser.userid);
		xml += ApiReader.xmltag("orderId",ordersmy.id);
		xml += ApiReader.xmltag("type","CASH");
		var need2pay = ordersmy.totalprice - (!!ordersmy.paidtotal?ordersmy.paidtotal:0);
		xml += ApiReader.xmltag("amount",need2pay);
		xml += ApiReader.xmltag("paidAmount",need2pay);
		return ApiReader.xmltag("paymentRecord",xml);
	},
	getSendListApi2K:function(orderid,idlist){
		if(idlist.length==0)return ApiReader.fetchOrderApi(orderid,true);;
		var orderidtxt = ApiReader.xmltag('orderId',orderid);
		var itemlst = '';
		for(var i in idlist){if(goipad(i))continue;
			itemlst += ApiReader.xmltag('orderItemIds',idlist[i]);
		}
		return ApiReader.xmltag('PrintItemToKitchenType',orderidtxt+itemlst);

	},
	fetchOrderApi:function(id,isfetchpayment,barcode){
        return ApiReader.xmltag("FetchOrderType",
        (!!barcode?ApiReader.xmltag("orderIdBarcode",barcode,true):ApiReader.xmltag("orderId",id))+
        ApiReader.xmltag("fetchPayments",isfetchpayment)+getSKSoap());		
	},
};

var getLocalOrQuery = function(apitype, soaptype, fun,obj,isForceLoad,gid)
{
	if(
		apitype == 'alldishes'||
		apitype == 'alldiscounttype'||
		apitype == 'allchargetype'||
		apitype == 'allstafftype'||
		apitype == 'allgopttype'||
		apitype == 'alloptacttype'||
		apitype == 'companyProfile'||
		apitype == 'alltaxtype'||
		apitype == 'allPrintersType'||
		apitype == 'alltable'||
		apitype == 'allPaymentType'||
		apitype == 'allItemSizeType'||
		apitype == 'allpricingrule'||
		apitype == 'allhourlyrates'||
		apitype == 'allLayoutType'||
		apitype == 'allDeviceType'||
		apitype == 'allOrderType'
	)
	{
		//test!!之后需要时间queryAPi更新paras.reloaddishes
		if (paras.reloaddishes||localStorage.getItem(fjm.d(apitype,0))==null||isForceLoad)
			call_web_service(soaptype,fun,obj,gid);
		else if(apitype=='alldishes')
			fun(getDishesMenu('alldishes'));
		else
			fun(JSON.parse(fjm.e(localStorage.getItem(fjm.d(apitype,0)),fjm.tsi)));
	}
};

var saveApiToLocalStorage = function(obj)
{
	var isstore = false;var lb = undefined;
	if(obj.listallsaleitemsbycategoryandgroupresponsetype != undefined)
	{lb = fjm.d('alldishes',0);isstore = false;paras.reloaddishes = false;setDishesMenu(obj,'alldishes');}
	/*else if(obj.listdiscountratesresponsetype != undefined)
	{lb = fjm.d('alldiscounttype',0);isstore = true;}
	else if(obj.listchargesresponsetype != undefined)
	{lb = fjm.d('allchargetype',0);isstore = true;}
	else if(obj.liststaffresponsetype != undefined)
	{lb = fjm.d('allstafftype',0);isstore = true;}
	else if(obj.listglobaloptionresponsetype != undefined)
	{lb = fjm.d('allgopttype',0);isstore = true;}
	else if(obj.listmodifieractionsresponsetype != undefined)
	{lb = fjm.d('alloptacttype',0);isstore = true;}*/
	else if(obj.fetchcompanyprofileresponsetype != undefined)
	{lb = fjm.d('companyProfile',0);isstore = true;}
	/*else if(obj.listareasresponsetype != undefined)
	{lb = fjm.d('alltable',0);isstore = true;}
	else if(obj.listtaxesresponsetype != undefined)
	{lb = fjm.d('alltaxtype',0);isstore = true;}
	else if(obj.listprintersresponsetype != undefined)
	{lb = fjm.d('allPrintersType',0);isstore = true;}
	else if(obj.finditemsizesresponsetype != undefined)
	{lb = fjm.d('allItemSizeType',0);isstore = true;}
	else if(obj.findpaymentaccountsresponsetype != undefined)
	{lb = fjm.d('allPaymentType',0);isstore = true;}
	else if(obj.listpricingruleresponsetype != undefined)
	{lb = fjm.d('allpricingrule',0);isstore = true;}
	else if(obj.listhourlyratesbysaleitemresponsetype != undefined)
	{lb = fjm.d('allhourlyrates',0);isstore = true;}
	else if(obj.listlayoutconfigsresponsetype != undefined)
	{lb = fjm.d('allLayoutType',0);isstore = true;}
	else if(obj.listordertypesettingsresponsetype != undefined)
	{lb = fjm.d('allOrderType',0);isstore = true;}
	else if(obj.findappinstancesresponsetype != undefined)
	{lb = fjm.d('allDeviceType',0);isstore = true;}*/
	if(isstore){var c = fjm.d(JSON.stringify(obj),fjm.tsi);localStorage.setItem(lb,c);}
};

var saveDataToLocalStorage = function(obj,label)
{
	var isstore = false;
	var lb = undefined;
	if(obj != undefined){
		lb = fjm.d(label,0);
		if(label != 'wholedishes'){
			isstore = true;
		}
		else{
			isstore = false;
			paras.reloaddishes = false;
			setDishesMenu(obj,label);
		}
	}
	if(isstore){
		var c = fjm.d(JSON.stringify(obj),fjm.tsi);
		localStorage.setItem(lb,c);
	}
};
