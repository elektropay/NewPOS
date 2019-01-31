function loadLanguageForPages(langId) {
    for (var i = 0; i < uiContentList.length; i++) {
        var languageContent = uiContentList[i];
       
        var selector = util.isValidVariable(languageContent.elementSelector) ? languageContent.elementSelector : "#"　+ languageContent.elementId;
        var label = $(selector);
        if (typeof label != "undefined") {
            if (util.isValidVariable(languageContent[langId])) {
                label.text(languageContent[langId]);
            } else {
                label.text(languageContent[defaultLangId]);
            }
        }
    }
}

function getDataDisplayValue(data, fieldName, defaultDisplayValue) {
    var fieldDisplayNameGroupList = util.getElementsArray(data.fielddisplaynamegroup);
    for (var i = 0; i < fieldDisplayNameGroupList.length; i++) {
        var fieldDisplayNameGroup = fieldDisplayNameGroupList[i];
        if (fieldDisplayNameGroup.fieldname == fieldName) {
            var fieldDisplayNameList = util.getElementsArray(fieldDisplayNameGroup.fielddisplayname);
            for (var j = 0; j < fieldDisplayNameList.length; j++) {
                var fieldDisplayName = fieldDisplayNameList[j];
                if (fieldDisplayName.languagecode == systemLanguage.currentLangId) {
                    if (util.isValidVariable(fieldDisplayName.name)) {
                        return fieldDisplayName.name
                    }
                }
            }
        }
    }
    return defaultDisplayValue;
}

function getDataDisplayValueByElementId(id, langId, defaultDisplayValue) {
    for (var i = 0; i < uiContentList.length; i++) {
        var languageContent = uiContentList[i];
        if (id == languageContent.elementId && util.isValidVariable(languageContent[langId])) {
            return languageContent[langId];
        }
    }
    return defaultDisplayValue;
}

uiContentList = [
	{
		elementSelector	: '.detail-input-from',
		'en'			: 'From',
		'zh-cn'			: '从',
		'zh-Hant'		: '從',
	},
	{
		elementSelector	: '.detail-input-to',
		'en'			: 'To',
		'zh-cn'			: '到',
		'zh-Hant'		: '到',
	},
	{
		elementSelector	: '.printer-label',
		'en'			: 'Report Printer',
		'zh-cn'			: '报表打印机',
		'zh-Hant'		: '報表打印機',
	},
    {
        elementSelector	: '.menu-label',
        'en'			: 'Menu Select',
        'zh-cn'			: '菜单选择',
        'zh-Hant'		: '菜單選擇',
    },
	{
		elementSelector	: '.export-type-label',
		'en'			: 'Export Type',
		'zh-cn'			: '导出类型',
		'zh-Hant'		: '導出類型',
	},
	{
		elementSelector	: '.order-type-label',
		'en'			: 'Order Type',
		'zh-cn'			: '单类型',
		'zh-Hant'		: '單類型',
	},
	{
		elementSelector	: '.payment-terminal-label',
		'en'			: 'Payment Terminals',
		'zh-cn'			: '支付终端',
		'zh-Hant'		: '支付終端',
	},
	{
		elementSelector	: '.export-type-label',
		'en'			: 'Export Type',
		'zh-cn'			: '导出类型',
		'zh-Hant'		: '導出類型',
	},
	{
		elementSelector	: '.export-type-label',
		'en'			: 'Export Type',
		'zh-cn'			: '导出类型',
		'zh-Hant'		: '導出類型',
	},
	{
		elementSelector	: '.btn-run-report',
		'en'			: 'Run',
		'zh-cn'			: '显示报表',
		'zh-Hant'		: '顯示報表',
	},
	{
		elementSelector	: '.btn-print-report',
		'en'			: 'Print',
		'zh-cn'			: '打印报表',
		'zh-Hant'		: '打印報表',
	},
	{
		elementSelector	: '.btn-export-report',
		'en'			: 'Export',
		'zh-cn'			: '导出报表',
		'zh-Hant'		: '導出報表',
	},
	{
		elementSelector	: '.staff-label',
		'en'			: 'Staff',
		'zh-cn'			: '员工',
		'zh-Hant'		: '員工',
	},
	{	
		elementSelector	: '.hour-label',
		'en'			: 'Hour',
		'zh-cn'			: '时间段',
		'zh-Hant'		: '時間段'
	},
	{	
		elementSelector	: '.area-label',
		'en'			: 'Area',
		'zh-cn'			: '区域',
		'zh-Hant'		: '區域'
	},
	{
		elementSelector	: '.orderType-label',
		'en'			: 'Order Type',
		'zh-cn'			: '订单类型',
		'zh-Hant'		: '訂單類型'
	},
	{	
		elementId		: 'label-onlineOrderMenu',
		'en'			: 'Online Menu Only',
		'zh-cn'			: '只显示网上订餐菜单',
		'zh-Hant'		: '隻顯示網上訂餐菜單'
	},
	{	
		elementId		: 'label-report-type-settle-choice',
		'en'			: 'Settle Batch',
		'zh-cn'			: '信用卡结账',
		'zh-Hant'		: '信用卡結賬'
	},
	{	
		elementId		: 'label-formerEmployee',
		'en'			: 'Former Employee',
		'zh-cn'			: '过去员工',
		'zh-Hant'		: '過去員工'
	},
	{	
		elementId		: 'label-showOrderSummaryCheckbox',
		'en'			: 'Include Order Details',
		'zh-cn'			: '包含订单详情',
		'zh-Hant'		: '包含訂單詳情'
	},
	{	
		elementId		: 'label-showTipsTotalCheckbox',
		'en'			: 'Include Tips Amount',
		'zh-cn'			: '包含小费信息',
		'zh-Hant'		: '包含小費信息'
	},
	{	
		elementId		: 'label-driverIds',
		'en'			: 'Driver',
		'zh-cn'			: '外送人员',
		'zh-Hant'		: '外送人員'
	},
	{	
		elementId		: 'all-page',
		'en'			: 'All Payment',
		'zh-cn'			: '所有支付',
		'zh-Hant'		: '所有支付'
	},
	{	
		elementId		: 'batch-page',
		'en'			: 'Batch',
		'zh-cn'			: '批次资料',
		'zh-Hant'		: '批次資料'
	},
	{	
		elementId		: 'cash-page',
		'en'			: 'Cash',
		'zh-cn'			: '现金',
		'zh-Hant'		: '現金'
	},
	{	
		elementId		: 'cashIO-page',
		'en'			: 'Cash In/Out',
		'zh-cn'			: '收银轧账',
		'zh-Hant'		: '收銀軋賬'
	},
	{	
		elementId		: 'category-page',
		'en'			: 'Category',
		'zh-cn'			: '类',
		'zh-Hant'		: '類'
	},
	{	
		elementId		: 'charge-page',
		'en'			: 'Charge',
		'zh-cn'			: '增收费用',
		'zh-Hant'		: '增收費用'
	},
	{	
		elementId		: 'credit-page',
		'en'			: 'Credit',
		'zh-cn'			: '信用',
		'zh-Hant'		: '信用'
	},
	{	
		elementId		: 'customer-wait-time-page',
		'en'			: 'Customer Waiting Time',
		'zh-cn'			: '客户等待时间报表',
		'zh-Hant'		: '客戶等待時間報表'
	},
	{	
		elementId		: 'delivery-page',
		'en'			: 'Delivery',
		'zh-cn'			: '外送',
		'zh-Hant'		: '外送'
	},
	{	
		elementId		: 'discount-page',
		'en'			: 'Discount',
		'zh-cn'			: '打折',
		'zh-Hant'		: '打折'
	},
	{	
		elementId		: 'gift-card-page',
		'en'			: 'Gift Card',
		'zh-cn'			: '礼品卡',
		'zh-Hant'		: '禮品卡'
	},
	{	
		elementId		: 'loyalty-card-page',
		'en'			: 'Loyalty Card',
		'zh-cn'			: '会员卡',
		'zh-Hant'		: '會員卡'
	},
	{	
		elementId		: 'menu-page',
		'en'			: 'Menu',
		'zh-cn'			: '菜单',
		'zh-Hant'		: '菜單'
	},
	{	
		elementId		: 'other-page',
		'en'			: 'Other',
		'zh-cn'			: '其它',
		'zh-Hant'		: '其它'
	},
	{	
		elementId		: 'purchase-order-page',
		'en'			: 'Purchase Order',
		'zh-cn'			: '采购订单',
		'zh-Hant'		: '採購訂單'
	},
	{	
		elementId		: 'register-activity-page',
		'en'			: 'Cash Register Activity',
		'zh-cn'			: '现金活动',
		'zh-Hant'		: '現金活動'
	},
	{	
		elementId		: 'staff-page',
		'en'			: 'Staff',
		'zh-cn'			: '员工',
		'zh-Hant'		: '員工'
	},
	{	
		elementId		: 'void-credit-page',
		'en'			: 'Void Credit',
		'zh-cn'			: '删信用单',
		'zh-Hant'		: '刪信用單'
	},
	{	
		elementId		: 'void-order-page',
		'en'			: 'Void Order',
		'zh-cn'			: '删单',
		'zh-Hant'		: '刪單'
	},
	{	
		elementId		: 'overview-page',
		'en'			: 'Overview',
		'zh-cn'			: '概观',
		'zh-Hant'		: '概觀'
	},
	{	
		elementId		: 'daily-page',
		'en'			: 'Daily',
		'zh-cn'			: '每日',
		'zh-Hant'		: '每日'
	},
	{	
		elementId		: 'hourly-page',
		'en'			: 'Hourly',
		'zh-cn'			: '每时',
		'zh-Hant'		: '每時'
	},
	{	
		elementId		: 'ali-pay-page',
		'en'			: 'Ali Pay',
		'zh-cn'			: '支付宝',
		'zh-Hant'		: '支付寶'
	},
	{	
		elementId		: 'wechat-pay-page',
		'en'			: 'WeChat Pay',
		'zh-cn'			: '微信支付',
		'zh-Hant'		: '微信支付'
	},
	{	
		elementId		: 'print-preview',
		'en'			: 'Print Preview',
		'zh-cn'			: '打印预览',
		'zh-Hant'		: '打印預覽'
	},
    {
        elementId		: 'label-combineLinkedItem',
        'en'			: 'Combine linked item',
        'zh-cn'			: '合并关联菜',
        'zh-Hant'		: '合並關聯菜'
    },
    {
        elementId		: 'label-combineLinkedItem2',
        'en'			: 'Combine linked item',
        'zh-cn'			: '合并关联菜',
        'zh-Hant'		: '合並關聯菜'
    },
    {
        elementId		: 'label-combineSubItem',
        'en'			: 'Combine sub item',
        'zh-cn'			: '合并套餐子菜',
        'zh-Hant'		: '合並套餐子菜'
    },
	{
		elementId		: 'label-showStaffAttendanceCheckbox',
		'en'			: 'Attendance Record',
		'zh-cn'			: '出勤记录',
		'zh-Hant'		: '出勤記錄'
	},
	{	
		elementId		: 'label-showPaidOutDetailsCheckbox',
		'en'			: 'Paid Out Detail',
		'zh-cn'			: '出纳记录',
		'zh-Hant'		: '出納記錄'
	},
    {
        elementId		: 'label-chartType-pie',
        'en'			: 'Pie Chart',
        'zh-cn'			: '饼图',
        'zh-Hant'		: '餅圖'
    },
    {
        elementId		: 'label-chartType-bar',
        'en'			: 'Histogram',
        'zh-cn'			: '柱状图',
        'zh-Hant'		: '柱狀圖'
    },
    {
        elementId		: 'label-analysis-quantity',
        'en'			: 'Quantity',
        'zh-cn'			: '数量',
        'zh-Hant'		: '數量'
    },
    {
        elementId		: 'label-analysis-price',
        'en'			: 'Price',
        'zh-cn'			: '价格',
        'zh-Hant'		: '價格'
    },
	{	
		elementId		: 'label-useAttendanceCheckbox',
		'en'			: 'Last Clock In',
		'zh-cn'			: '按打卡时间显示',
		'zh-Hant'		: '按打卡時間顯示'
	},
	{	
		elementId		: 'total-sales-box',
		'en'			: 'Net Sales',
		'zh-cn'			: '税前营业额',
		'zh-Hant'		: '稅前營業額'
	},
	{	
		elementId		: 'avg-sales-box',
		'en'			: 'Average Sales Per Order',
		'zh-cn'			: '平均销售每单',
		'zh-Hant'		: '平均銷售每單'
	},
	{	
		elementId		: 'total-tips-box',
		'en'			: 'Total Tips',
		'zh-cn'			: '小费合计',
		'zh-Hant'		: '小費合計'
	},
	{	
		elementId		: 'total-void-box',
		'en'			: 'Total Void',
		'zh-cn'			: '作废单/退菜合计',
		'zh-Hant'		: '作廢單/退菜合計'
	},
	{	
		elementId		: 'report-header-tag',
		'en'			: ' REPORT',
		'zh-cn'			: ' 报表',
		'zh-Hant'		: ' 報表'
	},
	{	
		elementId		: 'overview-page-tag',
		'en'			: ' Overview',
		'zh-cn'			: ' 概观',
		'zh-Hant'		: ' 概觀'
	},
	{	
		elementId		: 'operation-page-tag',
		'en'			: ' Operation',
		'zh-cn'			: ' 运营',
		'zh-Hant'		: ' 運營'
	},
	{	
		elementId		: 'staff-page-tag',
		'en'			: ' Staff',
		'zh-cn'			: ' 员工',
		'zh-Hant'		: ' 員工'
	},
	{	
		elementId		: 'payment-page-tag',
		'en'			: ' Payment',
		'zh-cn'			: ' 付款',
		'zh-Hant'		: ' 付款'
	},
	{	
		elementId		: 'cash-flow-page-tag',
		'en'			: ' Cash Flow',
		'zh-cn'			: ' 资金流动',
		'zh-Hant'		: ' 資金流動'
	},
	{	
		elementId		: 'other-page-tag',
		'en'			: '   Other',
		'zh-cn'			: '   其他',
		'zh-Hant'		: '   其他'
	},
	{	
		elementId		: 'all-page-header',
		'en'			: 'All Payment',
		'zh-cn'			: '所有支付',
		'zh-Hant'		: '所有支付'
	},
	{	
		elementId		: 'batch-page-header',
		'en'			: 'Batch',
		'zh-cn'			: '批次资料',
		'zh-Hant'		: '批次資料'
	},
	{	
		elementId		: 'cash-page-header',
		'en'			: 'Cash',
		'zh-cn'			: '现金',
		'zh-Hant'		: '現金'
	},
	{	
		elementId		: 'cashIO-page-header',
		'en'			: 'Cash In/Out',
		'zh-cn'			: '收银轧账',
		'zh-Hant'		: '收銀軋賬'
	},
	{	
		elementId		: 'category-page-header',
		'en'			: 'Category',
		'zh-cn'			: '类',
		'zh-Hant'		: '類'
	},
	{	
		elementId		: 'charge-page-header',
		'en'			: 'Charge',
		'zh-cn'			: '增收费用',
		'zh-Hant'		: '增收費用'
	},
	{	
		elementId		: 'credit-page-header',
		'en'			: 'Credit',
		'zh-cn'			: '信用',
		'zh-Hant'		: '信用'
	},
	{	
		elementId		: 'customer-wait-time-page-header',
		'en'			: 'Customer Waiting Time',
		'zh-cn'			: '客户等待时间报表',
		'zh-Hant'		: '客戶等待時間報表'
	},
	{	
		elementId		: 'delivery-page-header',
		'en'			: 'Delivery',
		'zh-cn'			: '外送',
		'zh-Hant'		: '外送'
	},
	{	
		elementId		: 'discount-page-header',
		'en'			: 'Discount',
		'zh-cn'			: '打折',
		'zh-Hant'		: '打折'
	},
	{	
		elementId		: 'gift-card-page-header',
		'en'			: 'Gift Card',
		'zh-cn'			: '礼品卡',
		'zh-Hant'		: '禮品卡'
	},
	{	
		elementId		: 'loyalty-card-page-header',
		'en'			: 'Loyalty Card',
		'zh-cn'			: '会员卡',
		'zh-Hant'		: '會員卡'
	},
	{	
		elementId		: 'menu-page-header',
		'en'			: 'Menu',
		'zh-cn'			: '菜单',
		'zh-Hant'		: '菜單'
	},
	{	
		elementId		: 'other-page-header',
		'en'			: 'Other',
		'zh-cn'			: '其它',
		'zh-Hant'		: '其它'
	},
	{	
		elementId		: 'purchase-order-page-header',
		'en'			: 'Purchase Order',
		'zh-cn'			: '采购订单',
		'zh-Hant'		: '採購訂單'
	},
	{	
		elementId		: 'register-activity-page-header',
		'en'			: 'Cash Register Activity',
		'zh-cn'			: '现金活动',
		'zh-Hant'		: '現金活動'
	},
	{	
		elementId		: 'staff-page-header',
		'en'			: 'Staff',
		'zh-cn'			: '员工',
		'zh-Hant'		: '員工'
	},
	{	
		elementId		: 'void-credit-page-header',
		'en'			: 'Void Credit',
		'zh-cn'			: '删信用单',
		'zh-Hant'		: '刪信用單'
	},
	{	
		elementId		: 'void-order-page-header',
		'en'			: 'Void Order',
		'zh-cn'			: '删单',
		'zh-Hant'		: '刪單'
	},
	{	
		elementId		: 'overview-page-header',
		'en'			: 'Overview',
		'zh-cn'			: '概观',
		'zh-Hant'		: '概觀'
	},
	{	
		elementId		: 'daily-page-header',
		'en'			: 'Daily',
		'zh-cn'			: '每日',
		'zh-Hant'		: '每日'
	},
	{	
		elementId		: 'hourly-page-header',
		'en'			: 'Hourly',
		'zh-cn'			: '每时',
		'zh-Hant'		: '每時'
	},
	{	
		elementId		: 'weChatPay-page-header',
		'en'			: 'WeChat Pay',
		'zh-cn'			: '微信付款',
		'zh-Hant'		: '微信付款'
	},
	{	
		elementId		: 'aliPay-page-header',
		'en'			: 'Ali Pay',
		'zh-cn'			: '阿里付款',
		'zh-Hant'		: '阿里付款'
	},
	{	
		elementId		: 'sale-by-period-label',
		'en'			: 'Sales By Period',
		'zh-cn'			: '销售按小时',
		'zh-Hant'		: '銷售按小時'
	},
	{	
		elementId		: 'sale-breakdown-label',
		'en'			: 'Sales Breakdown',
		'zh-cn'			: '销售明细',
		'zh-Hant'		: '銷售明細'
	},
	{	
		elementId		: 'top-selling-items-labe',
		'en'			: 'Top Five Selling Items',
		'zh-cn'			: '五大畅销的物品',
		'zh-Hant'		: '五大暢銷的物品'
	},
	{	
		elementId		: 'business-data-label',
		'en'			: 'Business Data',
		'zh-cn'			: '业务数据',
		'zh-Hant'		: '業務數據'
	},
	{	
		elementId		: 'staff-attendance-label',
		'en'			: 'Staff Attendance',
		'zh-cn'			: '员工考勤',
		'zh-Hant'		: '員工考勤'
	},
	{	
		elementId		: 'order-summary-label',
		'en'			: 'Order Summary',
		'zh-cn'			: '订单汇总',
		'zh-Hant'		: '訂單匯總'
	},
	{	
		elementId		: 'total-sale-data',
		'en'			: 'Grand Total',
		'zh-cn'			: '税后营业额',
		'zh-Hant'		: '稅後營業額'
	},
	{	
		elementId		: 'subtotal-sale-data',
		'en'			: 'Net Sales',
		'zh-cn'			: '税前营业额',
		'zh-Hant'		: '稅前營業額'
	},
	{	
		elementId		: 'share-tip-data',
		'en'			: 'Share Tips',
		'zh-cn'			: '分享小费',
		'zh-Hant'		: '分享小費'
	},
	{	
		elementId		: 'void-total-data',
		'en'			: 'Void Total',
		'zh-cn'			: '作废单/退菜合计',
		'zh-Hant'		: '作廢單/退菜合計'
	},
	{	
		elementId		: 'paid-out-total-data',
		'en'			: 'Paid Out Total',
		'zh-cn'			: '支付合计',
		'zh-Hant'		: '支付合計'
	},
	{	
		elementId		: 'transaction-fee-data',
		'en'			: 'Transaction Fee',
		'zh-cn'			: '手续费',
		'zh-Hant'		: '手續費'
	},
	{	
		elementId		: 'charge-total-data',
		'en'			: 'Charge Total',
		'zh-cn'			: '加收总额',
		'zh-Hant'		: '加收總額'
	},
	{	
		elementId		: 'tip-total-data',
		'en'			: 'Tips Total',
		'zh-cn'			: '小费合计',
		'zh-Hant'		: '小費合計'
	},
	{	
		elementId		: 'gift-card-sale-total-data',
		'en'			: 'Gift Card Deposit',
		'zh-cn'			: '礼品卡充值',
		'zh-Hant'		: '禮品卡充值'
	},
	{	
		elementId		: 'discount-total-data',
		'en'			: 'Discount Total',
		'zh-cn'			: '折扣总额',
		'zh-Hant'		: '折扣總額'
	},
	{	
		elementId		: 'tax-total-data',
		'en'			: 'Tax Total',
		'zh-cn'			: '总税额',
		'zh-Hant'		: '總稅額'
	},
	{	
		elementId		: 'loyalty-card-sale-total-data',
		'en'			: 'Loyalty Card Deposit',
		'zh-cn'			: '会员卡充值',
		'zh-Hant'		: '會員卡充值'
	},
	{	
		elementId		: 'daily-bar-graph-label',
		'en'			: 'Total Sales',
		'zh-cn'			: '总销售',
		'zh-Hant'		: '總銷售'
	},
	{	
		elementId		: 'daily-sales-data-table',
		'en'			: 'Daily Sales',
		'zh-cn'			: '每天销售',
		'zh-Hant'		: '每天銷售'
	},
	{	
		elementId		: 'hourly-sale-data-table',
		'en'			: 'Hourly Sales',
		'zh-cn'			: '每时销售',
		'zh-Hant'		: '每時銷售'
	},
	{	
		elementId		: 'hourly-sale-heat-map-graph',
		'en'			: 'Hourly Sales Heat Map',
		'zh-cn'			: '每时销售热图',
		'zh-Hant'		: '每時銷售熱圖'
	},
	{	
		elementId		: 'label-printSpreadsheetCheckbox',
		'en'			: 'Print Empty Spreadsheet On Page Footer',
		'zh-cn'			: '在页脚打印空的表格',
		'zh-Hant'		: '在頁腳打印空的表格'
	},
	{
		elementSelector	: '.loading-sign',
		'en'			: ' Please wait, Loading... ',
		'zh-cn'			: ' 请稍候， 加载中... ',
		'zh-Hant'		: ' 請稍候， 加載中... '
	},
	{
		elementSelector	: '.alert-sign-text-1',
		'en'			: 'Please select time range and press ',
		'zh-cn'			: '请选择时间段后点击 ',
		'zh-Hant'		: '請選擇時間段後點擊 ',
	},
	{
		elementSelector	: '.alert-sign-text-2',
		'en'			: ' button',
		'zh-cn'			: ' 按钮',
		'zh-Hant'		: ' 按鈕',
	},
	{	
		elementId		: 'paid-total-data',
		'en'			: 'Paid Total',
		'zh-cn'			: '实收金额',
		'zh-Hant'		: '實收金額'
	},
	{	
		elementId		: 'order-count-data',
		'en'			: '# of Orders',
		'zh-cn'			: '订单总数',
		'zh-Hant'		: '訂單總數'
	},
	{	
		elementId		: 'expected-cash-data',
		'en'			: 'Expected Cash In Drawer',
		'zh-cn'			: '预计钱箱现金',
		'zh-Hant'		: '預計錢箱現金'
	},
	{	
		elementId		: 'num-of-void-data',
		'en'			: '# of Void',
		'zh-cn'			: '作废单数',
		'zh-Hant'		: '作廢單數'
	},
	{
		elementId		: 'label-userFilterOptions-staff',
		'en'			: 'Staff',
		'zh-cn'			: '启台',
		'zh-Hant'		: '啟台'
	},
	{
		elementId		: 'label-userFilterOptions-drivers',
		'en'			: 'Drivers',
		'zh-cn'			: '司机',
		'zh-Hant'		: '司机'
	},
	{	
        elementId		: 'attendanceEditRecord-page',
        'en'			: 'Attendance Edit Record',
        'zh-cn'			: '出勤修改记录',
        'zh-Hant'		: '出勤修改記錄'
    },
    {	
        elementId		: 'attendanceEditRecord-page-header',
        'en'			: 'Attendance Edit Record',
        'zh-cn'			: '出勤修改记录',
        'zh-Hant'		: '出勤修改記錄'
    },
    {	
        elementId		: 'attendance-edit-record-data-table',
        'en'			: 'Attendance Edit Record',
        'zh-cn'			: '出勤修改记录',
        'zh-Hant'		: '出勤修改记录'
    },
    {	
        elementId		: 'cashTip-page-header',
        'en'			: 'Cash Tip',
        'zh-cn'			: '现金小费',
        'zh-Hant'		: '現金小費'
    },
    {	
        elementId		: 'cash-tip-page',
        'en'			: 'Cash Tip',
        'zh-cn'			: '现金小费',
        'zh-Hant'		: '現金小費'
    }, 
    {
    	elementId 		: 'audit-page-header',
    	'en'			: 'Audit',
    	'zh-cn'			: '审核',
    	'zh-Hant'		: '審核'
    }, 
    {
    	elementId 		: 'audit-page',
    	'en'			: 'Audit',
    	'zh-cn'			: '审核',
    	'zh-Hant'		: '審核'
    },
    {
    	elementId 		: 'order-rounding-page',
    	'en'			: 'Order Rounding',
    	'zh-cn'			: '订单金额舍入详情',
    	'zh-Hant'		: '訂單金額舍入詳情'
    },
	{
		elementId		: 'order-rounding-page-header',
		'en'			: 'Order Amount Rounding Details',
		'zh-cn'			: '订单金额舍入详情',
		'zh-Hant'		: '訂單金額舍入詳情'
    },
    {
        elementId		: 'category-data-table',
        'en'			: 'Net Sales Drilldown',
        'zh-cn'			: '税前营业额细分',
        'zh-Hant'		: '稅前營業額細分'
    },
    {
        elementId		: 'category-table-name',
        'en'			: 'Name',
        'zh-cn'			: '菜名',
        'zh-Hant'		: '菜名'
    },
    {
        elementId		: 'category-table-quantity',
        'en'			: 'Quantity',
        'zh-cn'			: '数量',
        'zh-Hant'		: '數量'
    },
    {
        elementId		: 'category-table-quantity-percentage',
        'en'			: '% of Quantity Sold',
        'zh-cn'			: '销售数量百分比',
        'zh-Hant'		: '銷售數量百分比'
    },
    {
        elementId		: 'category-table-netsale',
        'en'			: 'Net Sales',
        'zh-cn'			: '税前营业额',
        'zh-Hant'		: '税前营业额'
    },
    {
        elementId		: 'category-table-netsale-percentage',
        'en'			: '% of Net Sales',
        'zh-cn'			: '税前营业额百分比',
        'zh-Hant'		: '税前营业额百分比'
    },
    {
        elementId		: 'category-top-ten-sales',
        'en'			: 'Top Ten Selling Items',
        'zh-cn'			: '十大畅销的物品',
        'zh-Hant'		: '十大暢銷的物品'
	},
    {
        elementId		: 'overview-table-number',
        'en'			: 'No.',
        'zh-cn'			: '单号',
        'zh-Hant'		: '單號'
	},
    {
        elementId		: 'overview-table-time',
        'en'			: 'Time',
        'zh-cn'			: '时间',
        'zh-Hant'		: '時間'
	},
    {
        elementId		: 'overview-table-type',
        'en'			: 'Type',
        'zh-cn'			: '类型',
        'zh-Hant'		: '類型'
	},
    {
        elementId		: 'overview-table-grantotal',
        'en'			: 'Grand Total',
        'zh-cn'			: '税后营业额',
        'zh-Hant'		: '稅後營業額'
	},
    {
        elementId		: 'overview-table-subtotal',
        'en'			: 'Net Sales',
        'zh-cn'			: '税前营业额',
        'zh-Hant'		: '稅前營業額'
	},
    {
        elementId		: 'overview-table-tax',
        'en'			: 'Tax',
        'zh-cn'			: '税',
        'zh-Hant'		: '稅'
	},
    {
        elementId		: 'overview-table-tips',
        'en'			: 'Tips',
        'zh-cn'			: '小费',
        'zh-Hant'		: '小費'
	},
    {
        elementId		: 'overview-table-charge',
        'en'			: 'Charge',
        'zh-cn'			: '加收',
        'zh-Hant'		: '加收'
	},
    {
        elementId		: 'overview-table-discount',
        'en'			: 'Discount',
        'zh-cn'			: '折扣',
        'zh-Hant'		: '折扣'
	},
    {
        elementId		: 'overview-table-status',
        'en'			: 'Status',
        'zh-cn'			: '状态',
        'zh-Hant'		: '狀態'
	},
    {
        elementId		: 'daily-table-date',
        'en'			: 'Date',
        'zh-cn'			: '日期',
        'zh-Hant'		: '日期'
	},
    {
        elementId		: 'daily-table-order',
        'en'			: '# of Orders',
        'zh-cn'			: '订单总数',
        'zh-Hant'		: '訂單總數'
	},
    {
        elementId		: 'daily-table-gross-total',
        'en'			: 'Gross Total',
        'zh-cn'			: '销售总额',
        'zh-Hant'		: '銷售總額'
	},
    {
        elementId		: 'daily-table-discount',
        'en'			: 'Discount',
        'zh-cn'			: '总折扣',
        'zh-Hant'		: '總折扣'
	},
    {
        elementId		: 'daily-table-net-sales',
        'en'			: 'Net Sales',
        'zh-cn'			: '税前营业额',
        'zh-Hant'		: '稅前營業額'
	},
    {
        elementId		: 'daily-table-tax',
        'en'			: 'Tax',
        'zh-cn'			: '税',
        'zh-Hant'		: '稅'
	},
    {
        elementId		: 'daily-table-grand-total',
        'en'			: 'Grand Total',
        'zh-cn'			: '税后营业额',
        'zh-Hant'		: '稅後營業額'
	},
    {
        elementId		: 'daily-table-tips',
        'en'			: 'Tips',
        'zh-cn'			: '小费合计',
        'zh-Hant'		: '小費合計'
	},
    {
        elementId		: 'daily-table-account-receivable',
        'en'			: 'Account Receivable',
        'zh-cn'			: '应收金额',
        'zh-Hant'		: '應收金額'
	},
    {
        elementId		: 'daily-table-cash',
        'en'			: 'Cash',
        'zh-cn'			: '现金',
        'zh-Hant'		: '現金'
	},
    {
        elementId		: 'daily-table-credit',
        'en'			: 'Credit',
        'zh-cn'			: '信用卡',
        'zh-Hant'		: '信用卡'
	},
    {
        elementId		: 'daily-table-void',
        'en'			: 'Void',
        'zh-cn'			: '作废单/退菜合计',
        'zh-Hant'		: '作廢單/退菜合計'
	},
    {
        elementId		: 'daily-table-gift-card',
        'en'			: 'Gift Card Deposit',
        'zh-cn'			: '礼品卡充值',
        'zh-Hant'		: '禮品卡充值'
	},
    {
        elementId		: 'daily-table-loyalty-card',
        'en'			: 'Loyalty Card Deposit',
        'zh-cn'			: '会员卡充值',
        'zh-Hant'		: '會員卡充值'
	},
    {
        elementId		: 'hourly-table-date',
        'en'			: 'Date',
        'zh-cn'			: '日期',
        'zh-Hant'		: '日期'
	},
    {
        elementId		: 'hourly-table-gross-sales',
        'en'			: 'Gross Sales',
        'zh-cn'			: '销售总额',
        'zh-Hant'		: '銷售總額'
	},
    {
        elementId		: 'hourly-table-discount',
        'en'			: 'Discount',
        'zh-cn'			: '总折扣',
        'zh-Hant'		: '總折扣'
	},
    {
        elementId		: 'hourly-table-net-sales',
        'en'			: 'Net Sales',
        'zh-cn'			: '税前营业额',
        'zh-Hant'		: '稅前營業額'
	},
    {
        elementId		: 'hourly-table-grand-total',
        'en'			: 'Grand Total',
        'zh-cn'			: '税后营业额',
        'zh-Hant'		: '稅後營業額'
	},
    {
        elementId		: 'hourly-table-num-of-order',
        'en'			: '# of Orders',
        'zh-cn'			: '订单总数',
        'zh-Hant'		: '訂單總數'
	},
    {
        elementId		: 'hourly-table-avg-per-order',
        'en'			: 'Avg Sales Per Order',
        'zh-cn'			: '每单平均消费',
        'zh-Hant'		: '每單平均消費'
	},
    {
        elementId		: 'hourly-table-num-of-guests',
        'en'			: '# of Guests',
        'zh-cn'			: '客人数',
        'zh-Hant'		: '客人數'
	},
    {
        elementId		: 'hourly-table-avg-per-guests',
        'en'			: 'Avg Sales Per Guests',
        'zh-cn'			: '人均消费',
        'zh-Hant'		: '人均消費'
	},
    {
        elementId		: 'hourly-table-percentage-of-sales',
        'en'			: 'Percentage of Sales',
        'zh-cn'			: '销售百分比',
        'zh-Hant'		: '銷售百分比'
	},
    {
        elementId		: 'hourly-table-occupancy-rate',
        'en'			: 'Occupancy Rate',
        'zh-cn'			: '上座率',
        'zh-Hant'		: '上座率'
	},
    {
        elementId		: 'att-edit-table-login-time',
        'en'			: 'Original Login Time',
        'zh-cn'			: '原始登录时间',
        'zh-Hant'		: '原始登錄時間'
	},
    {
        elementId		: 'att-edit-table-employee',
        'en'			: 'Employee',
        'zh-cn'			: '雇员',
        'zh-Hant'		: '僱員'
	},
    {
        elementId		: 'att-edit-table-description',
        'en'			: 'Description',
        'zh-cn'			: '描述',
        'zh-Hant'		: '描述'
	},
    {
        elementId		: 'att-edit-table-reason',
        'en'			: 'Reason',
        'zh-cn'			: '原因',
        'zh-Hant'		: '原因'
	},
    {
        elementId		: 'att-edit-table-updated-by',
        'en'			: 'Updated By',
        'zh-cn'			: '更新者',
        'zh-Hant'		: '更新者'
	},
    {
        elementId		: 'att-edit-table-edit-date',
        'en'			: 'Edit Date',
        'zh-cn'			: '编辑日期',
        'zh-Hant'		: '編輯日期'
	},
    {
        elementId		: 'audit-table-date',
        'en'			: 'Date',
        'zh-cn'			: '日期',
        'zh-Hant'		: '日期'
	},
    {
        elementId		: 'audit-table-num',
        'en'			: 'No.',
        'zh-cn'			: '单号',
        'zh-Hant'		: '單號'
	},
    {
        elementId		: 'audit-table-action',
        'en'			: 'Action',
        'zh-cn'			: '操作',
        'zh-Hant'		: '操作'
	},
    {
        elementId		: 'audit-table-result',
        'en'			: 'Result',
        'zh-cn'			: '结果',
        'zh-Hant'		: '結果'
	},
    {
        elementId		: 'audit-table-by',
        'en'			: 'By',
        'zh-cn'			: '操作人',
        'zh-Hant'		: '操作人'
	},
    {
        elementId		: 'audit-table-authorized-by',
        'en'			: 'Authorized By',
        'zh-cn'			: '授权人',
        'zh-Hant'		: '授權人'
	},
    {
        elementId		: 'audit-table-device',
        'en'			: 'Device',
        'zh-cn'			: '终端',
        'zh-Hant'		: '終端'
	},
    {
        elementId		: 'audit-table-detail',
        'en'			: 'Detail',
        'zh-cn'			: '详情',
        'zh-Hant'		: '詳情'
	},
	{
        elementId 		: 'systemSettingAudit-page',
        'en'			: 'System Setting Audit',
        'zh-cn'			: '系统设置审核',
        'zh-Hant'		: '系統設置審核'
    },
    {
        elementId 		: 'systemSettingAudit-page-header',
        'en'			: 'System Setting Audit',
        'zh-cn'			: '系统设置审核',
        'zh-Hant'		: '系統設置審核'
    },
    {
     elementId		: 'audit-table-group',
     'en'			: 'Group',
     'zh-cn'		: '范围',
     'zh-Hant'		: '範圍'
    },
    {
     elementId		: 'audit-table-category',
     'en'			: 'Category',
     'zh-cn'		: '类别',
     'zh-Hant'		: '類別'
    },
    {
     elementId		: 'customer-wait-time-page-header',
     'en'			: 'Customer Wait Time ',
     'zh-cn'		: '顾客等待时间',
     'zh-Hant'		: '顧客等待時間'
    },
    {
     elementId		: 'label-customerWaitTimeThreshold',
     'en'			: 'Customer wait time threshold (min)',
     'zh-cn'		: '顾客等待时间阈值（分钟）',
     'zh-Hant'		: '顧客等待時間閾值（分鐘）'
          },
    {
     elementId		: 'customer-wait-time-graph-label',
     'en'			: 'Customer Wait Time ',
     'zh-cn'		: '顾客等待时间 ',
     'zh-Hant'		: '顧客等待時間 '
    },
    {
     elementId		: 'customer-wait-time-zoomed-in-graph-label',
     'en'			: 'Zoomed In Details',
     'zh-cn'		: '更多细节',
     'zh-Hant'		: '更多細節'
    },{
    elementId		: 'daily-table-order-customer-number',
        'en'		: '# of Customer',
        'zh-cn'		: '总顾客数',
        'zh-Hant'	: '總顧客數'
    },
	{
        elementId	: 'tipOut-page',
        'en'		: 'Tip Out',
        'zh-cn'		: '小费支出',
        'zh-Hant'	: '小費支出'
    },
    {
        elementId	: 'tipOut-page-header',
        'en'		: 'Tip Out',
        'zh-cn'		: '小费支出',
        'zh-Hant'	: '小費支出'
    },
    {
        elementId   : 'levelUpPay-page-header',
        'en'		: 'LevelUp Pay',
        'zh-cn'		: 'LevelUp支付',
        'zh-Hant'	: 'LevelUp支付'
    },
    {
        elementId	: 'levelup-pay-page',
        'en'		: 'LevelUp Pay',
        'zh-cn'		: 'LevelUp支付',
        'zh-Hant'	: 'LevelUp支付'
    },
    {
        elementId	: 'label-showEmployeeTipOutDetails',
        'en'		: 'Employee Tip out Details',
        'zh-cn'		: '员工小费分配详情',
        'zh-Hant'	: '員工小費分配詳情'
    }
];