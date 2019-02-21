import React from 'react';
import { Button, Form, Select, Input, Row, Col, message } from 'antd'
import "./restaurant.scss"
import { restaurant as i18n } from '../../i18n/index.js'
import axios from '../../utils/axios';
import { connect } from 'react-redux';

const mapStateToProps = state => ({
    tax: state.hours
})
const Option = Select.Option;

class tabCompany extends React.Component {
    state = {
        appinfo: ""
    }
    componentDidMount() {
        this.getRestaurantInfo()
    }
    // 获取餐厅信息
    getRestaurantInfo(){
        setTimeout(() => {
            var response = {
                code: 0,
                info: "",
                data: {
                    "id": 1,
                    "merchantId": "111",
                    "merchantCode": 2020,
                    "merchantGroupId": "dddd",
                    "storeId": 33,
                    "name": "Menusifu",
                    "address1": "42-34 College Point Blvd",
                    "address2": "444-34 College Point",
                    "city": "Flushing",
                    "state": "NY",
                    "zipCode": 11355,
                    "telephone1": 8888098867,
                    "telephone2": 555888098867,
                    "fax": "rang",
                    "email": "yangxiang@menusifu.com",
                    "website": "www.baidu.com",
                    "geocoordinate": "null,null ",
                    "appinfo": {
                        "version": "1.8.0.4.83a9e76",
                        "registered": "false",
                        "licensestatus": "TRIAL",
                        "licenseinfo": "POS License : 10,E - Menu License: 100,Tablet POS License: 10 "
                    },
                    "hours": 1,
                    "timezoneoffset": 28800000,
                    "reseller": "abcd",
                    "region": "NY",
                    "appinstance": [{
                        "displayname": 11,
                        "type": "POS",
                        "inuse": "true"
                    },
                    {
                        "displayname": "QQ",
                        "type": "POS",
                        "inuse": "true"
                    },
                    {
                        "displayname": 22,
                        "type": "POS",
                        "inuse": "true"
                    }
                    ]
                }
            }
            if (response.code == 0) {
                this.setState({
                    appinfo: response.data.appinfo.licensestatus + ". " + response.data.appinfo.licenseinfo
                })
                this.props.form.setFieldsValue(response.data)
            } else {
                message.error(i18n.loadFail + response.info ? (i18n.colon + response.info) : "")
            }
        }, 200)
    }
    handleSubmit(e) {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log(values)
                // 进行提交
                axios.post("/api/saveCompanyProfile", values).then(() => {
                    message.success(i18n.saveSuccess)
                }, (err) => {
                    // err是自动生成的提示文本，也可以自定义提示内容
                    message.error(err)
                })
            }
        });
    }
    handleActive() { }
    render() {
        const { getFieldDecorator } = this.props.form;

        return (
            <div className="tabCompany">
                <Form onSubmit={this.handleSubmit.bind(this)}>
                    {getFieldDecorator('id')(<Input type="hidden" />)}
                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item label={i18n.restaurantName} >
                                {getFieldDecorator('name')(<Input />)}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={i18n.merchantId} >
                                {getFieldDecorator('merchantId')(<Input disabled />)}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={24}>
                        <Col span={8}>
                            <Form.Item label={i18n.phone + " 1"} >
                                {getFieldDecorator('telephone1')(<Input />)}
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label={i18n.phone + " 2"} >
                                {getFieldDecorator('telephone2')(<Input />)}
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item label={i18n.fax} >
                                {getFieldDecorator('fax')(<Input />)}
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={24}>
                        <Col span={12}><Form.Item label={i18n.website} >
                            {getFieldDecorator('website')(<Input />)}
                        </Form.Item></Col>
                        <Col span={12}><Form.Item label={i18n.email} >
                            {getFieldDecorator('email')(<Input />)}
                        </Form.Item></Col>
                    </Row>
                    <Row gutter={24}>
                        <Col span={8}><Form.Item label={i18n.merchantGroupId} >
                            {getFieldDecorator('merchantGroupId')(<Input />)}
                        </Form.Item></Col>
                        <Col span={8}><Form.Item label={i18n.storeId} >
                            {getFieldDecorator('storeId')(<Input />)}
                        </Form.Item></Col>
                        <Col span={8}><Form.Item label={i18n.merchantCode} >
                            {getFieldDecorator('merchantCode')(<Input />)}
                        </Form.Item></Col>
                    </Row>
                    <Row gutter={24}>
                        <Col span={12}><Form.Item label={i18n.address + " 1"} >
                            {getFieldDecorator('address1')(<Input />)}
                        </Form.Item></Col>
                        <Col span={12}><Form.Item label={i18n.address + " 2"} >
                            {getFieldDecorator('address2')(<Input />)}
                        </Form.Item></Col>
                    </Row>
                    <Row gutter={24}>
                        <Col span={8}><Form.Item label={i18n.city} >
                            {getFieldDecorator('city')(<Input />)}
                        </Form.Item></Col>
                        <Col span={8}><Form.Item label={i18n.state} >
                            {getFieldDecorator('state')(<Input />)}
                        </Form.Item></Col>
                        <Col span={8}><Form.Item label={i18n.zipCode} >
                            {getFieldDecorator('zipCode')(<Input />)}
                        </Form.Item></Col>
                    </Row>

                    <Row gutter={24}>
                        <Col span={12}><Form.Item label={i18n.hours} >
                            {getFieldDecorator('hours')(
                                <Select style={{ width: "100%" }} >
                                    <Option value="1" key="1">All Day: 08:00-02:50</Option>
                                    <Option value="2" key="2"> Lunch : 08:00-15:30</Option>
                                    <Option value="4" key="4">Dinner: 15:30-02:50</Option>
                                    <Option value="6" key="6">abcdefg: 02:00-08:00</Option>
                                </Select>
                            )}
                        </Form.Item></Col>
                        <Col span={12}><Form.Item label={i18n.licenseInfo} >
                            <Input disabled value={this.state.appinfo} />
                        </Form.Item></Col>
                    </Row>

                    <Row gutter={24}>
                        <Col span={12}><Form.Item label={i18n.reseller} >
                            {getFieldDecorator('reseller')(<Input />)}
                        </Form.Item></Col>
                        <Col span={12}><Form.Item label={i18n.region} >
                            {getFieldDecorator('region')(<Input />)}
                        </Form.Item></Col>
                    </Row>

                    <Form.Item style={{ textAlign: "center", paddingTop: "50px" }}>
                        <Button size="large" type="primary" htmlType="submit">{i18n.save}</Button>
                        <Button style={{ marginLeft: "100px" }} size="large" onClick={this.handleActive.bind(this)}>{i18n.activeRequest}</Button>
                    </Form.Item>
                </Form>
            </div>
        )
    }
}
export default connect(mapStateToProps)(Form.create()(tabCompany))