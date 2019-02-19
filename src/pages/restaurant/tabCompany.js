import React from 'react';
import { Spin, Button, Icon, Form, Select, Input, Row, Col, message } from 'antd'
import "./restaurant.scss"
import { restaurant as i18n } from '../../i18n/index.js'

const Option = Select.Option;

class tabCompany extends React.Component {
    state = {
        loading: true,
        data: {}
    }
    componentDidMount() {
        let data = { "id": 1, "merchantcode": 2020, "merchantgroupid": "dddd", "storeid": 33, "name": "Menusifu", "address1": "42-34 College Point Blvd", "city": "Flushing", "state": "NY", "zipcode": 11355, "telephone1": "888-809-8867", "fax": "rang", "email": "yangxiang@menusifu.com", "website": "www.baidu.com", "geocoordinate": "null,null", "appinfo": { "version": "1.8.0.4.83a9e76", "registered": "false", "licensestatus": "TRIAL", "licenseinfo": "POS License : 10, E-Menu License : 100, Tablet POS License : 10" }, "paymentserviceenabled": "false", "hours": { "id": 1, "name": "All Day", "description": "All Day", "from": "08:00", "to": "02:50", "systemgenerated": "false" }, "minamountforonlineorder": 0, "distancelimitforonlineorder": 0, "wechatqrcodeurl": "http://weixin.qq.com/r/mDqttSzEG3FkrWjW92_K", "timezoneoffset": 28800000, "reseller": "abcd", "menusifulogochecksum": "32037.17.3541.9961", "region": "NY", "connectedtocloudservice": "false", "appinstance": [{ "displayname": 11, "type": "POS", "inuse": "true" }, { "displayname": "QQ", "type": "POS", "inuse": "false" }, { "displayname": 22, "type": "POS", "inuse": "true" }] };
        this.setState({
            loading: false,
            data: data
        })
        // this.props.form.setFieldsValue(data)
    }
    handleSubmit(e) {
        e.preventDefault();
        this.setState({
            loading: true
        })
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                console.log(values)
                // 进行提交
            }
        });
    }
    handleActive() { }
    render() {
        const { getFieldDecorator } = this.props.form;

        return (
            <div className="tabCompany">

                <Form onSubmit={this.handleSubmit}>
                    {getFieldDecorator('id')(<Input type="hidden" />)}
                    <Row gutter={24}>
                        <Col span={12}>
                            <Form.Item label={i18n.restaurantName} >
                                {getFieldDecorator('name')(<Input />)}
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label={i18n.merchantId} >
                                {getFieldDecorator('merchantId')(<Input />)}
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
                            {getFieldDecorator('zipcode')(<Input />)}
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
                            {getFieldDecorator('licenseInfo')(
                                <Input />
                            )}
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
                <div className="loadMask" style={{ display: this.state.loading ? "block" : "none" }}>
                    <Spin indicator={(<Icon type="loading" spin style={{ fontSize: '40px' }} />)} />
                </div>
            </div>
        )
    }
}
export default Form.create()(tabCompany)