// 欢迎页，默认显示
import React from 'react';
import {Tabs} from 'antd'
import "./restaurant.scss"
import { restaurant as i18n } from '../../i18n/index.js'
import TabCompany from './tabCompany'
import TabDataManagement from './tabDataManagement'
import TabOther from './tabOther'
import TabRestaurantHours from './tabRestaurantHours'

const TabPane = Tabs.TabPane;

export default class welcome extends React.Component {

    render() {
        return (
            <div className="restaurantPage">
                <Tabs defaultActiveKey="1">
                    <TabPane tab={i18n.company} key="1"><TabCompany/></TabPane>
                    <TabPane tab={i18n.restaurantHours} key="2"><TabRestaurantHours/></TabPane>
                    <TabPane tab={i18n.other} key="3"><TabOther/></TabPane>
                    <TabPane tab={i18n.dataManagement} key="4"><TabDataManagement/></TabPane>
                </Tabs>
            </div>
        )
    }
}
