import React from 'react';
import { List,Layout,Spin, Button, Icon, Form, Select, Input, Row, Col, message } from 'antd'
import "./restaurant.scss"
import { restaurant as i18n } from '../../i18n/index.js'
import axios from '../../utils/axios';
import { connect } from 'react-redux';

const mapStateToProps = state => ({
    hours: state.restaurantHour
})

const mapDispatchToProps = dispatch => ({
    setHours: (param) => dispatch({
        type: "SET_HOURS",
        param
    })
})
const Option = Select.Option;
const { Header, Content } = Layout;

class tabRestaurantHours extends React.Component {
    state = {
        editState: "wait"
    }
    componentDidMount() {
        this.getRestaurantHour()
    }
    
    // 获取餐厅信息
    getRestaurantHour() {
        var response = [{
            id: 1,
            name: "All Day",
            description: "All Day",
            from: "08:00",
            to: "02:50",
            systemGenerated: "true"
        }, {
            id: 2,
            name: " Lunch ",
            description: "Lunch",
            from: "08:00",
            to: "13:50",
            systemGenerated: "false"
        }];
        this.props.setHours(response)
    }
    
    // 编辑
    editItem(item) {
        this.setState({
            editState: "edit"
        })
        this.props.form.setFieldsValue(item)
    }

    // 新建
    createNew() {
        this.setState({
            editState: "create"
        })
        this.props.form.setFieldsValue({
            city: "",
            state: "",
            zipCode: ""
        })
    }

    // 提交数据
    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                setTimeout(() => {
                    message.success(i18n.saveSuccess);
                    // ...
                    this.setState({
                        editState: "wait"
                    })
                }, 500)
            }
        });
    }

    // 取消编辑
    handleCancel = (e) => {
        this.setState({ editState: "wait" })
    }

    // 删除数据
    deleteItem = (e, item) => {
        e.stopPropagation();
        // ...
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 4 }
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 }
            }
        };
        return (
            <div className="relativePage tabRestaurantHours" style={{height:"calc(100vh - 220px)"}}>
                <div className="left">
                    <Layout className="listCon">
                        <Header className="listConHeader">{i18n.restaurantHours}</Header>
                        <Content className="listConContent">
                            <List
                                dataSource={this.props.hours}
                                renderItem={item => (
                                    <List.Item
                                        onClick={this.editItem.bind(this, item)}
                                        actions={[<a><Icon onClick={(e) => this.deleteItem(e, item)} type="close-circle" theme="filled" /></a>]}>
                                        {item.name}
                                    </List.Item>
                                )}
                            />
                        </Content>
                    </Layout>
                </div>
                <div className="right">
                    <div style={{ display: this.state.editState === "wait" ? "flex" : "none" }} className="editTip">
                        <div className="editTipCon">
                            <p>{i18n.editOrCreate}</p>
                            <Button className="editTipBtn" type="primary" onClick={this.createNew.bind(this)}>{i18n.new}</Button>
                        </div>
                    </div>
                    <div style={{ display: this.state.editState === "wait" ? "none" : "block", paddingTop: "30px" }}>
                        <Form onSubmit={this.handleSubmit}>
                            {getFieldDecorator('id')(<Input type="hidden" />)}
                            <Form.Item {...formItemLayout} label={i18n.name} >
                                {getFieldDecorator('name', {
                                    rules: [{ required: true, message: i18n.needName }]
                                })(<Input />)}
                            </Form.Item>
                            <Form.Item {...formItemLayout} label={i18n.from} >
                                {getFieldDecorator('state', {
                                    rules: [{ required: true, message: i18n.needTime }]
                                })(<Input />)}
                            </Form.Item>
                            <Form.Item {...formItemLayout} label={i18n.to} >
                                {getFieldDecorator('zipCode', {
                                    rules: [{ required: true, message: i18n.needTime }]
                                })(<Input />)}
                            </Form.Item>
                            <Form.Item {...formItemLayout} label={i18n.description} >
                                {getFieldDecorator('description')(<Input />)}
                            </Form.Item>
                            <Form.Item style={{ textAlign: "center", paddingTop: "30px" }}>
                                <Button className="formBtn" type="primary" htmlType="submit">{i18n.save}</Button>
                                <Button className="formBtn2" onClick={this.handleCancel.bind(this)}>{i18n.cancel}</Button>
                            </Form.Item>
                        </Form>
                    </div>
                </div>
            </div>
        )
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(tabRestaurantHours))