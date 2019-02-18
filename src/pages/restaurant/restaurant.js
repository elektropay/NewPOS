// 欢迎页，默认显示
import React from 'react';
import "./restaurant.scss"
import { restaurant as i18n } from '../../i18n/index.js'

export default class welcome extends React.Component {
    render() {
        return (
            <div className="welcomePage">
                <p style={{ fontSize: "30px", textAlign: "center", paddingTop: "200px", letterSpacing: "4px" }}>{i18n.title}</p>
                <p style={{ textAlign: "center", lineHeight: "50px", fontSize: "20px", color: "rgb(186,187,193)" }}>{i18n.subTitle}</p>
                <img alt="" src={require("../../static/images/welcome/element1.png")} className="ele1" />
                <img alt="" src={require("../../static/images/welcome/element2.png")} className="ele2" />
                <img alt="" src={require("../../static/images/welcome/element3.png")} className="ele3" />
                <img alt="" src={require("../../static/images/welcome/element4.png")} className="ele4" />
                <img alt="" src={require("../../static/images/welcome/element1.png")} className="ele5" />
                <img alt="" src={require("../../static/images/welcome/welcome.png")} style={{ width: '100%', bottom: '10px', left: '0', right: '0' }} />
            </div>
        )
    }
}
