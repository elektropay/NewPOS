import React from 'react';
import { Spin, Button, Icon, Form, Select, Input, Row, Col, message } from 'antd'
import "./restaurant.scss"
import { restaurant as i18n } from '../../i18n/index.js'
import axios from '../../utils/axios';
import { connect } from 'react-redux';

const mapStateToProps = state => ({
    tax: state.hours
})

const mapDispatchToProps = dispatch => ({
    setHours: (param) => dispatch({
        type: "SET_HOURS",
        param
    })
})

const Option = Select.Option;

class tabCompany extends React.Component {
    state = {}
    componentDidMount() {
        this.getRestaurantHour()
    }
    // 获取餐厅信息
    getRestaurantHour() {
        setTimeout(() => {
            var response = {
                code: 0,
                info: "",
                data: {
                    
                }
            }
            if (response.code == 0) {} else {
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
            <div className="tabRestaurantHours">

            </div>
        )
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(tabCompany))