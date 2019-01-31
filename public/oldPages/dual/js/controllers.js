angular.module('dual.controllers', [])
    .directive('qrcode', ['$window', function($window) {
        var canvas2D = !!$window.CanvasRenderingContext2D,
            levels = {
                'L': 'Low',
                'M': 'Medium',
                'Q': 'Quartile',
                'H': 'High'
            },
            draw = function(context, qr, modules, tile) {
                for (var row = 0; row < modules; row++) {
                    for (var col = 0; col < modules; col++) {
                        var w = (Math.ceil((col + 1) * tile) - Math.floor(col * tile)),
                            h = (Math.ceil((row + 1) * tile) - Math.floor(row * tile));

                        context.fillStyle = qr.isDark(row, col) ? '#000' : '#fff';
                        context.fillRect(Math.round(col * tile),
                            Math.round(row * tile), w, h);
                    }
                }
            };

        return {
            restrict: 'E',
            template: '<canvas class="qrcode"></canvas>',
            link: function(scope, element, attrs) {
                var domElement = element[0],
                    $canvas = element.find('canvas'),
                    canvas = $canvas[0],
                    context = canvas2D ? canvas.getContext('2d') : null,
                    download = 'download' in attrs,
                    href = attrs.href,
                    link = download || href ? document.createElement('a') : '',
                    trim = /^\s+|\s+$/g,
                    error,
                    version,
                    errorCorrectionLevel,
                    data,
                    size,
                    modules,
                    tile,
                    qr,
                    $img,
                    setVersion = function(value) {
                        version = Math.max(1, Math.min(parseInt(value, 10), 40)) || 5;
                    },
                    setErrorCorrectionLevel = function(value) {
                        errorCorrectionLevel = value in levels ? value : 'M';
                    },
                    setData = function(value) {
                        if (!value) {
                            return;
                        }

                        data = value.replace(trim, '');
                        qr = qrcode(version, errorCorrectionLevel);
                        qr.addData(data);

                        try {
                            qr.make();
                        } catch (e) {
                            error = e.message;
                            return;
                        }

                        error = false;
                        modules = qr.getModuleCount();
                    },
                    setSize = function(value) {
                        size = parseInt(value, 10) || modules * 2;
                        tile = size / modules;
                        canvas.width = canvas.height = size;
                    },
                    render = function() {
                        if (!qr) {
                            return;
                        }

                        if (error) {
                            if (link) {
                                link.removeAttribute('download');
                                link.title = '';
                                link.href = '#_';
                            }
                            if (!canvas2D) {
                                domElement.innerHTML = '<img src width="' + size + '"' +
                                    'height="' + size + '"' +
                                    'class="qrcode">';
                            }
                            scope.$emit('qrcode:error', error);
                            return;
                        }

                        if (download) {
                            domElement.download = 'qrcode.png';
                            domElement.title = 'Download QR code';
                        }

                        if (canvas2D) {
                            draw(context, qr, modules, tile);

                            if (download) {
                                domElement.href = canvas.toDataURL('image/png');
                                return;
                            }
                        } else {
                            domElement.innerHTML = qr.createImgTag(tile, 0);
                            $img = element.find('img');
                            $img.addClass('qrcode');

                            if (download) {
                                domElement.href = $img[0].src;
                                return;
                            }
                        }

                        if (href) {
                            domElement.href = href;
                        }
                    };

                if (link) {
                    link.className = 'qrcode-link';
                    $canvas.wrap(link);
                    domElement = domElement.firstChild;
                }

                setVersion(attrs.version);
                setErrorCorrectionLevel(attrs.errorCorrectionLevel);
                setSize(attrs.size);

                attrs.$observe('version', function(value) {
                    if (!value) {
                        return;
                    }

                    setVersion(value);
                    setData(data);
                    setSize(size);
                    render();
                });

                attrs.$observe('errorCorrectionLevel', function(value) {
                    if (!value) {
                        return;
                    }

                    setErrorCorrectionLevel(value);
                    setData(data);
                    setSize(size);
                    render();
                });

                attrs.$observe('data', function(value) {
                    if (!value) {
                        return;
                    }

                    setData(value);
                    setSize(size);
                    render();
                });

                attrs.$observe('size', function(value) {
                    if (!value) {
                        return;
                    }

                    setSize(value);
                    render();
                });

                attrs.$observe('href', function(value) {
                    if (!value) {
                        return;
                    }

                    href = value;
                    render();
                });
            }
        };
    }])
    .filter('allTotal', function() {
        return function(total, scope, tip) {
            return parseFloat(total) + parseFloat(tip);
        }
    })
    .controller('IndexCtrl', function($scope, $stateParams, $q, $timeout, $rootScope, $ionicLoading, $window, $http, $state, $ionicScrollDelegate, $location, $ionicModal) {
        var url = $location.search();
        var ip = $location.host();
        var port = $location.port();
        var clientPort = url.port || "52222";
        var receiptIp = url.ip || "127.0.0.1";


        $rootScope.soapServiceURL = "http://" + ip + ":" + port + '/kpos/ws/kposService';
        $scope.photoUrl = "http://" + ip + ":" + port + '/kpos/';
        $rootScope.currentUrl = "http://127.0.0.1:" + clientPort + "/device/dualscreen/sub";
        var defaultPhotoUrl = "dual/img/default.jpg";
        $rootScope.returnUrl = "http://127.0.0.1:" + clientPort + "/device/dualscreen/main";
        $rootScope.backUrl = "http://" + ip + ":" + port + "/kpos/webapp/payment/upload/signature";
        $rootScope.emailURL = "http://" + ip + ":" + port + "/kpos/webapp/payment/email/receipt/orderandpayment";
        $rootScope.qrcode = "https://payment.menusifu.com/#/?params=";
        /*receiptIp="192.168.1.62";*/
        $rootScope.currentUrl = "http://" + receiptIp + ":" + clientPort + "/device/dualscreen/sub";
        $rootScope.returnUrl = "http://" + receiptIp + ":" + clientPort + "/device/dualscreen/main";
        //$rootScope.qrcode="http://nydev2.menusifu.com:16667/#/?params=";

        var cssHtml = "";
        var photoCount = 4;
        var cssList = [];
        var cssPhoto = [];
        var photoList = [];
        var displayTime = 3000;
        $scope.transitionEffect = "WIPE";
        var autoInt = 0;
        var autoSign = false;
        $rootScope.timer = null;
        $rootScope.tipSign = false;
        $rootScope.delayTimer = 2000;
        cssList[0] = '.sliderMenusifu--el.anim-4parts .part:before {content: "";display: block;position: absolute;background-position: center center;background-size: cover ;background-repeat: no-repeat;width: 200%;height: 200%;';
        cssList[1] = '.sliderMenusifu--el.anim-9parts .part:before {content: "";display: block;position: absolute;background-position: center center;background-size: cover;background-repeat: no-repeat;width: 300%;height: 300%;';
        cssList[2] = '.sliderMenusifu--el.anim-5parts .part:before { content: ""; display: block;  position: absolute;background-position: center center; background-size: cover;background-repeat: no-repeat;  top: 0;  width: 500%;height: 100%;';
        cssList[3] = '.sliderMenusifu--el.anim-3parts .part:before {content: "";display: block;position: absolute;background-position: center center;background-size: cover;background-repeat: no-repeat;width: 300%;height: 100%;';
        var dbList = [4];

        var tArray = new Array();
        var rows = 1;
        $rootScope.request = function(method, url, data, params, contentType) {
            var deferred = $q.defer();
            var currentUrl = url;
            $ionicLoading.show();
            data = data || {};
            params = params || {};
            var contentType = contentType || {
                'Content-Type': 'application/json; charset=UTF-8'
            };
            $http({
                method: method,
                url: currentUrl,
                headers: contentType,
                data: data,
                params: params,
            }).success(function(data) {
                deferred.resolve(data);
            }).error(function(err) {
                deferred.reject();
            }).finally(function() {
                $ionicLoading.hide();
            });
            return deferred.promise;
        }

        function gcd(a, b) {
            var minNum = Math.min(a, b),
                maxNum = Math.max(a, b),
                i = minNum,
                vper = 0;
            if (a === 0 || b === 0) {
                return maxNum;
            }

            for (; i <= maxNum; i++) {
                vper = minNum * i;
                if (vper % maxNum === 0) {
                    return vper;
                    break;
                }
            }
        }

        function gcds(arr) {

            var onum = 0,
                i = 0,
                len = arr.length,
                midNum = 0;
            for (; i < len; i++) {
                onum = Math.floor(arr[i]);
                midNum = gcd(midNum, onum);
            }
            return midNum;
        }
        (function() {

            var keyPaths = [];

            var saveKeyPath = function(path) {
                keyPaths.push({
                    sign: (path[0] === '+' || path[0] === '-') ? parseInt(path.shift() + 1) : 1,
                    path: path
                });
            };

            var valueOf = function(object, path) {
                var ptr = object;
                for (var i = 0, l = path.length; i < l; i++) ptr = ptr[path[i]];
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
                for (var i = 0, l = arguments.length; i < l; i++) {
                    switch (typeof(arguments[i])) {
                        case "object":
                            saveKeyPath(arguments[i]);
                            break;
                        case "string":
                            saveKeyPath(arguments[i].match(/[+-]|[^.]+/g));
                            break;
                    }
                }
                return this.sort(comparer);
            };

        })();
        $scope.gallery = {};
        $scope.gallery.photoList = [];
        $scope.restaurantInfo = {};
        /*var style0 = document.createElement('style');
        var style1 = document.createElement('style');  
        */
        $scope.createCss = function(n) {

            var cssHtml = tArray[n][0] + tArray[n][1] + tArray[n][2];
            createStyle(cssHtml + tArray[n][3]);



            autoInt = 0;
            if (autoSign == false) {
                $scope.autoPhoto();
            } else {
                $timeout($scope.autoPhoto, 0);
            }
        }
        var rowsCount = 0;
        $scope.autoPhoto = function() {
            autoSign = false
            autoInt++;
            if (autoInt > 4) {
                autoInt = 1;
                rowsCount++;
                if (rowsCount >= rows) {
                    rowsCount = 0
                };
                //alert(document.getElementsByTagName("STYLE").length);
                for (var i = 6; i < document.getElementsByTagName("STYLE").length; i++) {
                    document.getElementsByTagName('head')[0].removeChild(document.getElementsByTagName("STYLE")[i]);
                }

                autoSign = true;
                $scope.createCss(rowsCount);
            }
            if (autoSign == false) {
                document.getElementById("page" + autoInt).checked = true;
                $timeout($scope.autoPhoto, displayTime);
            }

        }
        $scope.getRestaurant = function() {
            var soapMessage = '<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:app="http://ws.kpos.com/app">' +
                '<soapenv:Header/><soapenv:Body><app:FetchCompanyProfileType></app:FetchCompanyProfileType></soapenv:Body></soapenv:Envelope>';
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
            xmlhttp.open("POST", $rootScope.soapServiceURL, false);
            xmlhttp.onreadystatechange = function() {
                if (xmlhttp.readyState == 4) {
                    var x2js = new X2JS();
                    var responseText = xmlhttp.responseText;
                    var jsonObj = x2js.xml_str2json(responseText);
                    $scope.restaurantInfo = jsonObj.Envelope.Body.FetchCompanyProfileResponseType.company;
                } else {
                    alert("error");
                }
            }
            try {
                xmlhttp.send(soapMessage);
            } catch (e) {
                alert("error");
            }
        }
        $scope.getConfig = function() {
            var soapMessage = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:app="http://ws.kpos.com/app">' +
                '<soapenv:Header/><soapenv:Body><app:ListSystemConfigurationsType>' +
                '<app:name>PAID_AMOUNT_CANNOT_GREATER_THAN_BILL</app:name><app:adminRequest>true</app:adminRequest>' +
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
            xmlhttp.open("POST", $rootScope.soapServiceURL, false);
            xmlhttp.onreadystatechange = function() {
                if (xmlhttp.readyState == 4) {
                    var x2js = new X2JS();
                    var responseText = xmlhttp.responseText;
                    var jsonObj = x2js.xml_str2json(responseText);

                    if (jsonObj.Envelope.Body.ListSystemConfigurationsResponseType.Result == "true") {
                        $rootScope.tipSign = jsonObj.Envelope.Body.ListSystemConfigurationsResponseType.systemConfiguration.value;
                    }
                } else {
                    alert("error");
                }
            }
            try {
                xmlhttp.send(soapMessage);
            } catch (e) {
                alert("error");
            }
        }


        $scope.callSOAPWS = function() {

            var soapXMLBegin = '<?xml version="1.0" encoding="UTF-8"?>' +
                '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:app="http://ws.kpos.com/app">' +
                '<soapenv:Header/><soapenv:Body><app:FindGalleryType><app:prepareFor>DUAL</app:prepareFor>';
            var soapXMLEnd = '</app:FindGalleryType></soapenv:Body></soapenv:Envelope>';
            var soapMessage = soapXMLBegin + soapXMLEnd;
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
            xmlhttp.open("POST", $rootScope.soapServiceURL, false);
            xmlhttp.onreadystatechange = function() {
                if (xmlhttp.readyState == 4) {
                    var x2js = new X2JS();
                    var responseText = xmlhttp.responseText;
                    var jsonObj = x2js.xml_str2json(responseText);


                    var gallery = jsonObj.Envelope.Body.FindGalleryResponseType.gallery;

                    if (gallery) {
                        if (gallery instanceof Array == false) {
                            photoList.push(gallery);
                        } else {
                            photoList = gallery;
                        }
                    } else {
                        gallery = {};
                        gallery.displayOrder = 0;
                        gallery.displayTime = 100000;
                        gallery.id = "1";
                        gallery.prepareFor = "DUAL";
                        gallery.thumbPath = defaultPhotoUrl;
                        gallery.transitionEffect = "WIPE";
                        photoList.push(gallery)
                    }




                    photoCount = photoList.length;

                    photoList.sortBy('displayOrder');
                    if (!!photoList[0]) {
                        displayTime = 1000 * photoList[0].displayTime;
                        $scope.transitionEffect = photoList[0].transitionEffect ? photoList[0].transitionEffect : "WIPE";
                    }
                    $scope.gallery.photoList = photoList;
                    /*$scope.transitionEffect="FADE";*/
                    if ($scope.transitionEffect == "FADE") {


                        displayTime = displayTime / 1000;
                        var cssHTML = "";
                        var len = $scope.gallery.photoList.length;
                        $scope.gallery.photoList[len] = $scope.gallery.photoList[0];

                        angular.forEach($scope.gallery.photoList, function(v, k) {

                            var delayTime = parseInt(displayTime) * k;


                            cssHTML += ".anim_fade_image" + k + "{-webkit-animation: fadeInOut ease-in-out " + displayTime + "s " + delayTime + "s alternate forwards;z-index:" + (len - k) + ";animation: fadeInOut ease-in-out " + displayTime + "s " + delayTime + "s alternate forwards;z-index:" + (len - k) + ";}";
                        })

                        createStyle(cssHTML);
                        
                        $timeout(function() {
                            fade(len);
                        }, 50)

                    } else {

                        if (photoCount == 0) {
                            photoCount[0] = 'background-image: url("' + $scope.photoUrl + photoList[i].thumbPath + '")}';
                            photoCount = 1;
                        }
                        dbList.push(photoCount);
                        var minMax = gcds(dbList);
                        rows = minMax / 4;
                        for (var i = 0; i < rows; i++) {
                            tArray[i] = new Array();
                            tArray[i][0] = cssList[0] + 'background-image: url("' + $scope.photoUrl + photoList[(i * 4) % photoCount].thumbPath + '")}';
                            tArray[i][1] = cssList[1] + 'background-image: url("' + $scope.photoUrl + photoList[(i * 4 + 1) % photoCount].thumbPath + '")}';
                            tArray[i][2] = cssList[2] + 'background-image: url("' + $scope.photoUrl + photoList[(i * 4 + 2) % photoCount].thumbPath + '")}';
                            tArray[i][3] = cssList[3] + 'background-image: url("' + $scope.photoUrl + photoList[(i * 4 + 3) % photoCount].thumbPath + '")}';

                        }
                        $scope.createCss(0);
                    }




                }
            }
            try {
                xmlhttp.send(soapMessage);
            } catch (e) {
                alert("error");
            }

        }
        $scope.callSOAPWS();
        $scope.getRestaurant();
        $scope.getConfig();
        $scope.dishes = [];
        $scope.receipt = {};
        $scope.firstLg="en";
        $scope.secondLg="zh-cn";
        $scope.id = -1;


        $rootScope.pay = {};
        $rootScope.pay.sign = false;
        $rootScope.welcome = false;

        var myWorker = new Worker("./js/worker.js");

        myWorker.onmessage = function(oEvent) {
            $ionicScrollDelegate.$getByHandle('small').scrollBottom(true);
            var d = oEvent.data;


            if (d.msg != "timeout" && d.msg != null) {
                $scope.welcome = true;
                var dataJson = JSON.parse(d.msg);
                $rootScope.pay = $rootScope.pay || {};
                $rootScope.pay.tipConfirm = true;
                switch (dataJson.type) {
                    case "order":
                        try {
                            $rootScope.addTipModal.hide();
                        } catch (ex) {}
                        $state.go('index', "");

                        $scope.receipt = angular.copy(dataJson.order.summary);
                        $scope.receipt.orderTips=$scope.receipt.ordertips;
                        $scope.dishes = angular.copy(dataJson.order.dishes);
                        $rootScope.pay.sign = false;
                        $rootScope.pay.total = 0;
                        $rootScope.pay.paid = 0;
                        $rootScope.pay.change = 0;
                        $rootScope.pay.orderTips = 0;
                        break;
                    case "change":
                        try {
                            $rootScope.addTipModal.hide();
                        } catch (ex) {}

                       
                        $rootScope.pay.total = dataJson.total;
                        $rootScope.pay.paid = dataJson.paid;
                        $rootScope.pay.change = dataJson.change;
                        $rootScope.pay.paymentId = dataJson.paymentId;
                       // $rootScope.pay.printerId = dataJson.printerId;
                        $rootScope.pay.orderId = dataJson.orderid;
                        $rootScope.pay.orderNumber = dataJson.ordernumber;
                        if (dataJson.isCDS) {
                            $state.go('receipt', "");
                        } else {
                            $rootScope.pay.sign = true;
                        }

                        break;
                    case "payment":
                        try {
                            $rootScope.addTipModal.hide();
                        } catch (ex) {}
  
                        $rootScope.pay.paymentType = dataJson.paymentType;
                        $rootScope.pay.total = dataJson.tt;
                        $rootScope.pay.paid = dataJson.paid;
                        $rootScope.pay.change = dataJson.change;
                        $rootScope.pay.paymentId = dataJson.paymentId;
                        $rootScope.pay.printerId = dataJson.printerId;
                        $rootScope.pay.orderId = dataJson.orderid;
                        $rootScope.pay.orderNumber = dataJson.ordernumber;



                        if (dataJson.paymentType == "CREDIT_CARD") {
                            $state.go('signature', "");

                        } else {

                            $state.go('receipt', "");

                        }


                        break;
                    case "settle":



                        $rootScope.tips = dataJson.tiplist;
                        $rootScope.pay.total = parseFloat(dataJson.total) || 0;
                        $rootScope.pay.orderTips = parseFloat(dataJson.ordertips) || 0;
                        $rootScope.pay.allTotal = ($rootScope.pay.total + $rootScope.pay.orderTips).toFixed(2);
                        $rootScope.pay.tip = $rootScope.pay.orderTips;
                        $rootScope.pay.orderId = dataJson.orderid;
                        $rootScope.pay.orderNumber = dataJson.ordernumber;
                        $rootScope.pay.merchantId = dataJson.merchantid;
                        $scope.receipt.orderTips=$rootScope.pay.orderTips;


                        $rootScope.tips[4] = {
                            "name": "No Tip",
                            "val": ""
                        };
                        $rootScope.tips[5] = {
                            "name": "Customize",
                            "val": ""
                        };

                        $rootScope.pay.qrcode = $rootScope.qrcode +
                            $rootScope.pay.merchantId + "|" +
                            $rootScope.pay.orderId + "|" +
                            $rootScope.pay.orderNumber +
                            "|" + $rootScope.pay.allTotal + "|" + $rootScope.pay.tip + "|" + $rootScope.tipSign;



                        if (dataJson.isCDS) {
                            $state.go('payment', "");


                        } else {
                            $rootScope.pay.sign = true;

                        }
                        break;
                    case "welcome":
                        try {
                            $rootScope.addTipModal.hide();
                        } catch (ex) {}
                        $state.go('index', "");

                        $scope.welcome = false;
                        $rootScope.pay.sign = false;
                        $rootScope.pay.total = 0;
                        $rootScope.pay.paid = 0;
                        $rootScope.pay.change = 0;

                        break;

                    case "process":

                        try {
                            $rootScope.addTipModal.hide();
                        } catch (ex) {}
                        if (dataJson.isCDS) {
                            $state.go('process', "");
                        }

                        break;

                }
                for(var v of $scope.dishes){
                     var k=0;
                     for(var i in v["name"]){
                          console.log(i)
                          if(k==0)$scope.firstLg=i;
                          if(k==1)$scope.secondLg=i;
                          k++;
                          
                     }
                     break;
                }
                $scope.$apply();
            }

        }
        myWorker.postMessage({
            "url": $rootScope.currentUrl,
            "delayTime": 800
        });

    })

    .controller('ThanksCtrl', function($scope, $stateParams, $rootScope, $state, $timeout, $window, $http, $ionicScrollDelegate, $location, $ionicModal) {

    })

    .controller('ProcessCtrl', function($scope, $stateParams, $rootScope, $state, $timeout, $window, $http, $ionicScrollDelegate, $location, $ionicModal) {


    })

    .controller('ReceiptCtrl', function($scope, $stateParams, $rootScope, $state, $timeout, $window, $http, $ionicScrollDelegate, $location, $ionicModal) {
        $scope.print = function() {
            $state.go("process", ""); 
           var soapOrderMessage = 
            '<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:app="http://ws.kpos.com/app"><soapenv:Header/>' +
                '<soapenv:Body><app:PrintReceiptType>' +
                '<app:orderId>' + $rootScope.pay.orderId + '</app:orderId><app:printerId>'+$rootScope.pay.printerId+'</app:printerId></app:PrintReceiptType></soapenv:Body></soapenv:Envelope>';
            
            var soapReceiptMessage = '<?xml version="1.0" encoding="UTF-8"?>'+
              '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:app="http://ws.kpos.com/app"><soapenv:Header/><soapenv:Body>'+
             '<app:PrintPaymentReceiptType><app:paymentId>' + $rootScope.pay.paymentId + 
             '</app:paymentId><app:printerId>'+$rootScope.pay.printerId+'</app:printerId>'+
             '</app:PrintPaymentReceiptType></soapenv:Body></soapenv:Envelope>';

            var parser;
            var xmlhttp = null;
            var xmlhttp2 = null;

            if (window.XMLHttpRequest) {
                xmlhttp = new XMLHttpRequest();
                 xmlhttp2 = new XMLHttpRequest();

            } else {
                try {
                    xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
                     xmlhttp2 = new ActiveXObject("Msxml2.XMLHTTP");
                } catch (e) {
                    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
                     xmlhttp2 = new ActiveXObject("Msxml2.XMLHTTP");
                }
            }
            xmlhttp.open("POST", $rootScope.soapServiceURL, false);
            xmlhttp.onreadystatechange = function() {
                if (xmlhttp.readyState == 4) {
                    var x2js = new X2JS();
                    var responseText = xmlhttp.responseText;
                    var jsonObj = x2js.xml_str2json(responseText);

                    if (jsonObj.Envelope.Body.PrintReceiptResponseType && jsonObj.Envelope.Body.PrintReceiptResponseType.Result 
                        && jsonObj.Envelope.Body.PrintReceiptResponseType.Result.successful == "true" 
                        && $rootScope.pay.paymentType != "CREDIT_CARD")$scope.noReceipt();
                    } 
            }
            try {xmlhttp.send(soapOrderMessage);} catch (e) {}
            
            if($rootScope.pay.paymentType == "CREDIT_CARD"){
                xmlhttp2.open("POST", $rootScope.soapServiceURL, false);
                xmlhttp2.onreadystatechange = function() {
                    if (xmlhttp2.readyState == 4) {
                       $scope.noReceipt();
                     }
                }
                try {xmlhttp2.send(soapReceiptMessage)}catch (e) {}
          }
           
        }
        $scope.email = function() {
            $state.go("process", "");
            var getRestaurant = '{"msg":"{\\"type\\":\\"\\"}"}';
            $rootScope.request("POST", $rootScope.returnUrl, getRestaurant).then(function(data) {
                $state.go("email", "");
            })
        }
        $scope.noReceipt = function() {

            $state.go("process", "");
            var getRestaurant = '{"msg":"{\\"type\\":\\"thanks\\"}"}';
            $rootScope.request("POST", $rootScope.returnUrl, getRestaurant).then(function(data) {
                $state.go("thanks", "");
            })

        }
    })

    .controller('EmailCtrl', function($scope, $stateParams, $rootScope, $state, $timeout, $window, $http, $ionicPopup, $ionicScrollDelegate, $location, $ionicModal) {
        $scope.keyBoard = [{
                key: '1',
                'width': 'keyAll'
            }, {
                key: '2',
                'width': 'keyAll'
            }, {
                key: '3',
                'width': 'keyAll'
            }, {
                key: '4',
                'width': 'keyAll'
            }, {
                key: '5',
                'width': 'keyAll'
            }, {
                key: '6',
                'width': 'keyAll'
            }, {
                key: '7',
                'width': 'keyAll'
            }, {
                key: '8',
                'width': 'keyAll'
            }, {
                key: '9',
                'width': 'keyAll'
            }, {
                key: '0',
                'width': 'keyAll'
            }, {
                key: 'q',
                'width': 'keyAll'
            }, {
                key: 'w',
                'width': 'keyAll'
            }, {
                key: 'e',
                'width': 'keyAll'
            }, {
                key: 'r',
                'width': 'keyAll'
            }, {
                key: 't',
                'width': 'keyAll'
            }, {
                key: 'y',
                'width': 'keyAll'
            }, {
                key: 'u',
                'width': 'keyAll'
            }, {
                key: 'i',
                'width': 'keyAll'
            }, {
                key: 'o',
                'width': 'keyAll'
            }, {
                key: 'p',
                'width': 'keyAll'
            }, {
                key: 'a',
                'width': 'keyAll'
            }, {
                key: 's',
                'width': 'keyAll'
            }, {
                key: 'd',
                'width': 'keyAll'
            }, {
                key: 'f',
                'width': 'keyBorder'
            }, {
                key: 'g',
                'width': 'keyAll'
            }, {
                key: 'h',
                'width': 'keyAll'
            }, {
                key: 'j',
                'width': 'keyAll'
            }, {
                key: 'k',
                'width': 'keyAll'
            }, {
                key: 'l',
                'width': 'keyAll'
            }, {
                key: 'z',
                'width': 'keyAll'
            }, {
                key: 'x',
                'width': 'keyAll'
            }, {
                key: 'c',
                'width': 'keyAll'
            }, {
                key: 'v',
                'width': 'keyAll'
            }, {
                key: 'b',
                'width': 'keyAll'
            }, {
                key: 'n',
                'width': 'keyAll'
            }, {
                key: 'm',
                'width': 'keyAll'
            }, {
                key: '-',
                'width': 'keyAll'
            }, {
                key: '_',
                'width': 'keyAll'
            }, {
                key: '@',
                'width': 'keyAll'
            }, {
                key: '.',
                'width': 'keyAll'
            },
            {
                key: '@gmail.com',
                'width': 'keyAll'
            },
            {
                key: '@hotmail.com',
                'width': 'keyAll'
            },
            {
                key: '@yahoo.com',
                'width': 'keyAll'
            },
            {
                key: '@qq.com',
                'width': 'keyAll'
            },
            {
                key: 'Clear',
                'width': 'keyAll'
            },
            {
                key: '✖',
                'width': 'keyAll'
            }
        ]
        $scope.email = "";

        var email = /^([\w-_]+(?:\.[\w-_]+)*)@((?:[a-z0-9]+(?:-[a-zA-Z0-9]+)*)+\.[a-z]{2,6})$/i;
        $scope.sendEmail = function(e) {
            if (!email.exec($scope.email)) {
                $ionicPopup.alert({
                    title: '<b>Alert Info</b>',
                    template: '<div style="color:red;font-weight:600;text-align:center;font-size:25px">Email is error!</div>'
                });
            } else {
                var getRestaurant = {
                    "paymentId": $rootScope.pay.paymentId,
                    "email": $scope.email
                }

                $rootScope.request("POST", $rootScope.emailURL, getRestaurant).then(function(data) {
                  var getRestaurant = '{"msg":"{\\"type\\":\\"thanks\\"}"}';
                    $rootScope.request("POST", $rootScope.returnUrl, getRestaurant).then(function(data) {
                        $scope.email="";
                        $state.go("thanks", "");
                    })
                })




            }
        }
        $scope.insertEmail = function(key) {
            if (key == "Clear") {
                $scope.email = "";
            } else if (key == "✖" && $scope.email.length >= 1) {
                $scope.email = $scope.email.substring(0, $scope.email.length - 1);
            } else if (key != "✖") {

                $scope.email += key;
            }

        }

    })


    .controller('PaymentCtrl', function($scope, $stateParams, $rootScope, $state, $timeout, $window, $http, $ionicScrollDelegate, $location, $ionicModal) {
        $scope.config = {};
        $scope.config.enable = true;
        $ionicModal.fromTemplateUrl('templates/addTipModal.html', {
            scope: $scope,
            animation: 'slide-in-up',
            backdropClickToClose: false
        }).then(function(modal) {
            $rootScope.addTipModal = modal;

        });

        $scope.addTip = function(item) {
            
             $scope.config.enable = true;
            if (item.name == "Customize") {

                var getRestaurant = '{"msg":"{\\"type\\":\\"\\"}"}';


                $rootScope.request("POST", $rootScope.returnUrl, getRestaurant).then(function(data) {
                    $state.go('customer', "");
                })
            } else {
                $scope.sendToPos(item);
                $rootScope.addTipModal.show();
                
            }
        }
        $scope.confirm = function() {
            $rootScope.pay.tipConfirm = true;
            var tempStr = JSON.stringify($rootScope.pay).replace(/"/g, '\\"');
            var getRestaurant = '{"msg":"' + tempStr + '"}';
        }
        $scope.sendToPos = function(item) {

            $rootScope.pay.tip = item.val ? item.val : 0;
            $rootScope.pay.orderTips=$rootScope.pay.tip;
            $rootScope.pay.allTotal = (parseFloat($rootScope.pay.total) + parseFloat($rootScope.pay.tip)).toFixed(2);
            $rootScope.pay.type = "retureTip";
            $rootScope.pay.tipConfirm = true;
            $rootScope.pay.paymentId = $rootScope.pay.paymentId ? "" + $rootScope.pay.paymentId : "";
            var tempStr = JSON.stringify($rootScope.pay).replace(/"/g, '\\"');
            var getRestaurant = '{"msg":"' + tempStr + '"}';
            $rootScope.pay.qrcode = $rootScope.qrcode +
                $rootScope.pay.merchantId + "|" +
                $rootScope.pay.orderId + "|" +
                $rootScope.pay.orderNumber +
                "|" + $rootScope.pay.allTotal + "|" + $rootScope.pay.tip + "|" + $rootScope.tipSign

            $rootScope.request("POST", $rootScope.returnUrl, getRestaurant).then(function(data) {})

        }

        $scope.closeAddTip = function() {
            $scope.addTipModal.hide();
        };


    })
    .controller('CustomerCtrl', function($scope, $rootScope, $stateParams, $rootScope, $timeout, $window, $http, $ionicScrollDelegate, $location, $ionicModal) {

        $rootScope.pay.tip = "";
        $scope.keyBoard = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", ".", "Back", "Del", "Next"];
        $scope.closeAddTip = function() {
            $rootScope.addTipModal.hide();
        };
        $scope.noTip = function() {
            $rootScope.addTipModal.show();
            //$ionicModal.fromTemplateUrl('templates/addTipModal.html', {scope: $scope,animation: 'slide-in-up'}).then(function(modal) {$rootScope.addTipModal = modal;$scope.addTipModal.show();});
            $rootScope.pay.type = "retureTip";
            $rootScope.pay.tip = "0";
            $rootScope.pay.allTotal = (parseFloat($rootScope.pay.total) + parseFloat($rootScope.pay.tip)).toFixed(2);
            var tempStr = JSON.stringify($rootScope.pay).replace(/"/g, '\\"');
            var getRestaurant = '{"msg":"' + tempStr + '"}';

            $rootScope.pay.qrcode = $rootScope.qrcode +
                $rootScope.pay.merchantId + "|" +
                $rootScope.pay.orderId + "|" +
                $rootScope.pay.orderNumber +
                "|" + $rootScope.pay.allTotal + "|" + $rootScope.pay.tip + "|" + $rootScope.tipSign;

            $rootScope.request("POST", $rootScope.returnUrl, getRestaurant).then(function(data) {
                $location.path("/payment");
            })
           


        }
        $scope.insertTip = function(ev) {

            var e = ev || window.event;

   
            if (e.target.innerText == "Next") {

                if ($rootScope.pay.tip == "." || $rootScope.pay.tip == "") {
                    $rootScope.pay.tip = 0;
                }
                $rootScope.pay.allTotal = (parseFloat($rootScope.pay.total) + parseFloat($rootScope.pay.tip)).toFixed(2);

                $rootScope.addTipModal.show();
                $rootScope.pay.type = "retureTip";
                var tempStr = JSON.stringify($rootScope.pay).replace(/"/g, '\\"');
                var getRestaurant = '{"msg":"' + tempStr + '"}';


                $rootScope.pay.qrcode = $rootScope.qrcode +
                    $rootScope.pay.merchantId + "|" +
                    $rootScope.pay.orderId + "|" +
                    $rootScope.pay.orderNumber +
                    "|" + $rootScope.pay.allTotal + "|" + $rootScope.pay.tip + "|" + $rootScope.tipSign;




                $rootScope.request("POST", $rootScope.returnUrl, getRestaurant).then(function(data) {
                    $location.path("/payment");
                })


            } else
            if (e.target.innerText == "Del") {
                if ($rootScope.pay.tip.length > 0) {
                    $rootScope.pay.tip = $rootScope.pay.tip.substring(0, $rootScope.pay.tip.length - 1);
                }

            } else if (e.target.innerText == "Back") {

                $location.path("/payment");
            } else if ($rootScope.pay.tip.length < 8) {
                if (e.target.innerText != ".") {
                    $rootScope.pay.tip += e.target.innerText;
                } else if (!($rootScope.pay.tip.indexOf(".") >= 0 && e.target.innerText == ".")) {
                    $rootScope.pay.tip += e.target.innerText;

                }


            }

            if (e && e.preventDefault) e.preventDefault();
            else returnValue = false;
        }
        $rootScope.pay.tipConfirm = true;



    })


    .controller('SignatureCtrl', function($scope, $rootScope, $stateParams, $state, $timeout, $window, $http, $ionicScrollDelegate, $location, $ionicModal) {
        var wrapper = document.getElementById("signature-pad"),

            canvas = document.getElementById("canvas"),
            signaturePad;
        $scope.cancel = function() {
            var getRestaurant = '{"msg":"{\\"type\\":\\"void\\"}"}';
            $rootScope.request("POST", $rootScope.returnUrl, getRestaurant).then(function(data) {

            })
        }

        $scope.$on("$ionicView.afterEnter", function(event, data) {
            /*$timeout.cancel($rootScope.timer);
             $rootScope.delayTimer=4000;*/
            // $rootScope.timer =$timeout($rootScope.getApiMenu,$rootScope.delayTimer);
            function resizeCanvas() {
                var ratio = Math.max(window.devicePixelRatio || 1, 1);
                canvas.width = canvas.offsetWidth * ratio;
                canvas.height = canvas.offsetHeight * ratio;
                canvas.getContext("2d").scale(ratio, ratio);
            }

            window.onresize = resizeCanvas;
            resizeCanvas();

            signaturePad = new SignaturePad(canvas);

            $scope.clear = function() {
                signaturePad.clear();
            }

            $scope.done = function() {
                if (signaturePad.isEmpty()) {
                    alert("Please provide signature first.");
                } else {
                    $state.go("process", "");
                    var backData = {
                        "paymentId": $rootScope.pay.paymentId,
                        "signature": signaturePad.toDataURL()
                    };
                    $rootScope.request("POST", $rootScope.backUrl, backData).then(function(data) {

                        var getRestaurant = '{"msg":"{\\"type\\":\\"finish\\"}"}';
                        $rootScope.request("POST", $rootScope.returnUrl, getRestaurant).then(function(data) {})
                    })
                    //$state.go("process",{args:{"name":"signature","signature":signaturePad.toDataURL()}});



                }
            }
        });


    })


function createStyle(cssHTML) {

    var style = document.createElement('style');
    style.type = 'text/css';

    var head = document.getElementsByTagName('head')[0];
    if (style.styleSheet) {
        style.styleSheet.cssText = cssHTML;

    } else {

        style.appendChild(document.createTextNode(cssHTML));

    }
    document.getElementsByTagName('head')[0].appendChild(style);
}

function fade(len) {


    var elementList = document.querySelectorAll(".efg");
    var e = elementList[elementList.length - 2];

    function whichTransitionEvent() {
        var t;
        var el = document.createElement('fakeelement');
        var transitions = {
            'animation': 'animationend',
            'webkitAnimation': 'webkitAnimationEnd',
            'transition': 'transitionend',
            'OTransition': 'oTransitionEnd',
            'MozTransition': 'transitionend',
            'WebkitTransition': 'webkitTransitionEnd',

        }
        for (t in transitions) {
            if (el.style[t] !== undefined) {
                return transitions[t];
            }
        }
    }
    var transitionEvent = whichTransitionEvent();

    transitionEvent && e.addEventListener(transitionEvent, function() {


        for (var i = 0; i < elementList.length; i++) {
            elementList[i].classList.toggle('anim_fade_image' + i);


        }
        window.setTimeout(function() {
            for (var i = 0; i < elementList.length; i++) {
                elementList[i].classList.toggle('anim_fade_image' + i);


            }

        }, 10)
    });

}