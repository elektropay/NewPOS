import React from 'react';
import "./deliveryArea.scss"
import { deliveryArea as i18n } from '../../i18n/index.js'
import { Layout, Spin, Icon, List, Button, Form, Input, message } from 'antd';

const { Header, Content } = Layout;

class deliveryAreaPage extends React.Component {
    state = {
        loading: true,
        editState: "wait",
        list: []
    }

    // 初始化时获取数据
    componentDidMount() {
        setTimeout(() => {
            this.setState({
                loading: false,
                list: [{
                    id: "1",
                    city: "Brooklyn",
                    state: "ZY",
                    zipCode: "11201"
                }, {
                    id: "2",
                    city: "New York",
                    state: "NY",
                    zipCode: "10013"
                }]
            });
        }, 200)
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
        this.setState({
            loading: true
        })
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                setTimeout(() => {
                    message.success(i18n.submitSuccess);
                    if (this.state.editState === "create") {
                        values.id = this.state.list.length + 1;
                        this.state.list.push(values)
                    } else {
                        let list = this.state.list.map((item) => {
                            if (item.id === values.id) {
                                return values;
                            }
                            return item;
                        })
                        this.setState({ list })
                    }
                    this.setState({
                        loading: false,
                        editState:"wait"
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
        this.setState({
            loading: true
        });

        setTimeout(() => {
            message.success(i18n.deleteSuccess);
            var index;
            for (var i = 0; i < this.state.list.length; i++) {
                if (this.state.list[i].id === item.id) {
                    index = i;
                }
            }
            this.state.list.splice(index, 1)
            this.setState({
                loading: false
            })
        }, 500)
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
            <div className="relativePage deliveryAreaPage">
                <div className="left">
                    <Layout className="listCon">
                        <Header className="listConHeader">{i18n.deliveryArea}</Header>
                        <Content className="listConContent">
                            <List
                                dataSource={this.state.list}
                                renderItem={item => (
                                    <List.Item
                                        onClick={this.editItem.bind(this, item)}
                                        actions={[<a><Icon onClick={(e) => this.deleteItem(e, item)} type="close-circle" theme="filled" /></a>]}>
                                        {item.city + ", " + item.state + " " + item.zipCode}
                                    </List.Item>
                                )}
                            />
                        </Content>
                    </Layout>
                </div>
                <div className="right">
                    <div style={{ display: this.state.editState === "wait" ? "block" : "none" }} className="editTip">
                        <div className="editTipCon">
                            <p>选择列表中的项目进行编辑，或者新建一个项目</p>
                            <Button className="editTipBtn" type="primary" onClick={this.createNew.bind(this)}>{i18n.new}</Button>
                        </div>
                    </div>
                    <div style={{ display: this.state.editState === "wait" ? "none" : "block", paddingTop: "30px" }}>
                        <Form onSubmit={this.handleSubmit}>
                            {getFieldDecorator('id')(<Input type="hidden" />)}
                            <Form.Item {...formItemLayout} label={i18n.city} >
                                {getFieldDecorator('city', {
                                    rules: [{ required: true, message: i18n.needCity }]
                                })(<Input />)}
                            </Form.Item>
                            <Form.Item {...formItemLayout} label={i18n.state} >
                                {getFieldDecorator('state', {
                                    rules: [{ required: true, message: i18n.needState }]
                                })(<Input />)}
                            </Form.Item>
                            <Form.Item {...formItemLayout} label={i18n.zipCode} >
                                {getFieldDecorator('zipCode', {
                                    rules: [{ required: true, message: i18n.needZipCode }]
                                })(<Input />)}
                            </Form.Item>
                            <Form.Item style={{ textAlign: "center", paddingTop: "30px" }}>
                                <Button className="formBtn" type="primary" htmlType="submit">{i18n.save}</Button>
                                <Button className="formBtn2" onClick={this.handleCancel.bind(this)}>{i18n.cancel}</Button>
                            </Form.Item>
                        </Form>
                    </div>
                </div>
                <div className="loadMask" style={{ display: this.state.loading ? "block" : "none" }}>
                    <Spin indicator={(<Icon type="loading" spin style={{ fontSize: '40px' }} />)} />
                </div>
            </div>
        )
    }
}

export default Form.create()(deliveryAreaPage)