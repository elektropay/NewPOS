// 静态页面用url标记地址
// route组件用component引入

import restaurant from '../pages/restaurant/restaurant'
import deliveryArea from '../pages/deliveryArea/deliveryArea'

export default [
    {
        id: "Restaurant",
        icon: "shop",
        children: [{
            id: "Restaurant1",
            // url: "company.html"
            component: restaurant
        }, {
            id: "Staff",
            url: "staff.html"
        }, {
            id: "Table",
            url: "tables.html"
        }, {
            id: "Delivery",
            component: deliveryArea
        }, {
            id: "Gallery",
            url: "gallery.html"
        }, {
            id: "Analysis",
            url: "report.html"
        }]
    }, {
        id: "Menu",
        icon: "snippets",
        children: [{
            id: "Menu1",
            url: "menu/index.html"
        }, {
            id: "Modifier",
            url: "globalOptions.html"
        }, {
            id: "Item",
            url: "itemSize.html"
        }, {
            id: "Course",
            url: "course.html"
        }, {
            id: "Promotion",
            url: "promotionStrategy.html"
        }, {
            id: "TimeBase",
            url: "hourlyRate.html"
        }, {
            id: "Order",
            url: "orderTypeSetting.html"
        }]
    }, {
        id: "Inventory",
        icon: "database",
        children: [{
            id: "Items",
            url: "inventoryItem.html"
        }, {
            id: "Channel",
            url: "inventoryInfo.html"
        }, {
            id: "Management",
            url: "inventoryManagement.html"
        }]
    }, {
        id: "PriceAndPayment",
        icon: "dollar",
        children: [{
            id: "Tax",
            url: "tax.html"
        }, {
            id: "Discount",
            url: "discount.html"
        }, {
            id: "Charge",
            url: "charge.html"
        }, {
            id: "Payment",
            url: "paymentAccount.html"
        }, {
            id: "Cash",
            url: "cashRegisterActivity.html"
        }]
    }, {
        id: "System",
        icon: "setting",
        children: [{
            id: "Setting",
            url: "settings.html"
        }, {
            id: "Printer",
            url: "printers.html"
        }, {
            id: "Print",
            url: "printingSetup.html"
        }, {
            id: "Language",
            url: "language.html"
        }, {
            id: "Partner",
            url: "partnerIntegration.html"
        }]
    }, {
        id: "Customer",
        icon: "team",
        children: [{
            id: "Gift",
            url: "giftCard.html"
        }, {
            id: "Loyalty",
            url: "loyaltyCard.html"
        }, {
            id: "Customer1",
            url: "customer.html"
        }]
    }
]