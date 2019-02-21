/**
 * 遮罩模块，通过 redux mask 控制显示隐藏
 * 默认嵌入在axios方法，有请求未返回时显示
 */
import React from 'react';
import { connect } from 'react-redux'
import { Spin, Icon } from 'antd'

const mapStateToProps = state => {
    return {
        show: state.mask.needMask > 0
    }
}

class mask extends React.Component {
    render() {
        return (
            <div className="loadMask" style={{ display: this.props.show?"block":"none"}}>
                <Spin indicator={(<Icon type="loading" spin style={{ fontSize: '40px' }} />)} />
            </div>
        )
    }
}

export default connect(mapStateToProps)(mask);