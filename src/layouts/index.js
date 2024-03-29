import React from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { Provider } from 'react-redux';
import { Layout, Menu, Breadcrumb, Icon, Dropdown, message } from 'antd';
import './index.scss'
import "../utils/storage"
import route from './route.js'
import PageFrame from '../components/pageFrame'
import Welcome from '../pages/welcome/welcome'
import { layout as i18n } from '../i18n'
import store from '../reducer'
import Mask from '../components/mask'

// 多语言配置
const languages = [{
  label: "English",
  key: "en"
}, {
  label: "中文",
  key: "zh-cn"
}, {
  label: "繁體中文",
  key: "zh-Hant"
}, {
  label: "español",
  key: "es"
}, {
  label: "한국어",
  key: "ko"
}, {
  label: "tiếng việt",
  key: "vi"
}]

// 解析路由，获取当前页面的菜单位置和面包屑文字
const path = window.location.pathname.split("/");
const pathname = path[path.length - 1];
let breadcrumb = [""], openKeys = [], defaultKey = [];
if (pathname !== "") {
  Object.keys(route).forEach((parentKey) => {
    const children = route[parentKey].children;
    Object.keys(children).forEach((subKey) => {
      if ((children[subKey].component && children[subKey].id === pathname) || (children[subKey].url && children[subKey].url === pathname + ".html")) {
        breadcrumb = [i18n[route[parentKey].id], i18n[children[subKey].id]]
        openKeys = [route[parentKey].id];
        defaultKey = [children[subKey].id]
      }
    })
  })
}

// 消息弹框默认配置
message.config({
  top: 120,
  duration: 2.5,
  maxCount: 3,
});

const { Content, Sider, Header } = Layout;
const SubMenu = Menu.SubMenu;

class App extends React.Component {
  state = {
    collapsed: false,
    breadcrumb,
    openKeys,
    defaultKey
  }

  onOpenChange = (openKeys) => {
    const latestOpenKey = openKeys.find(key => this.state.openKeys.indexOf(key) === -1);
    this.setState({
      openKeys: latestOpenKey ? [latestOpenKey] : [],
    });
  }

  // 用户名下拉菜单
  dropMenu = (
    <Menu>
      <Menu.Item>nothing</Menu.Item>
    </Menu>
  );

  languageMenu = (
    <Menu>
      {
        languages.map((item, index) => (
          < Menu.Item onClick={this.changeLanguage.bind(this, item.key)} key={index}>{item.label}</Menu.Item>
        ))
      }
    </Menu>
  )

  changeLanguage(locale) {
    if (window.storage.getItem("locale") !== locale) {
      window.storage.setItem("locale", locale);
      window.location.reload()
    }
  }

  linkTo(pageId, parentId) {
    this.setState({
      breadcrumb: [i18n[parentId], i18n[pageId]]
    })
  }

  // 点击logo触发的跳转
  toWelcome() {
    if (document.getElementsByClassName("ant-menu-item-selected") && document.getElementsByClassName("ant-menu-item-selected")[0]) {
      document.getElementsByClassName("ant-menu-item-selected")[0].classList.remove("ant-menu-item-selected");
    }
    this.setState({
      breadcrumb: [""],
      openKeys: [],
      defaultKey: []
    })
  }

  onCollapse = (e) => {
    e.stopPropagation(); 
    if (this.state.collapsed){
      this.setState({
        openKeys: this.state.oldOpen,
        collapsed: !this.state.collapsed
      });
    }else{
      this.setState({
        oldOpen:this.state.openKeys,
        openKeys: [],
        collapsed: !this.state.collapsed
      });
    }
  }

  render() {
    return (
      <Provider store={store}>
        <Router>
          <Layout style={{ minHeight: '100vh' }}>
            <Sider trigger={null} collapsible collapsed={this.state.collapsed} width="250px" style={{ boxShadow: "0 0 15px #999" }}>
              <div id="logo" style={{ background: "#002140", paddingTop: "18px", height: "64px", overflow: "hidden" }} onClick={this.toWelcome.bind(this)}>
                <Link to="/">
                  <div className="logo" style={{ display: this.state.collapsed ? "none" : "block" }}>
                    <img alt="Menusifu" src={require('../static/images/logo.png')} />
                    <span>POS Admin</span>
                  </div>
                  <div className="minLogo" style={{ display: this.state.collapsed ? "block" : "none" }}>
                    <img alt="Menusifu" src={require('../static/images/logo.png')} />
                  </div>
                </Link>
              </div>
              <Menu theme="dark" defaultSelectedKeys={this.state.defaultKey} mode="inline" openKeys={this.state.openKeys} onOpenChange={this.onOpenChange}>
                {
                  route.map((items) => {
                    return (
                      <SubMenu key={items.id} title={<span><Icon type={items.icon} /><span>{i18n[items.id]}</span></span>}>
                        {
                          items.children.map((item) => {
                            return (
                              <Menu.Item key={item.id} onClick={this.linkTo.bind(this, item.id, items.id)}>
                                <Link to={item.url && item.url.indexOf(".html") > 0 ? `/oldpages/${item.url.substring(0, item.url.length - 5)}` : '/' + item.id}>{i18n[item.id]}</Link>
                              </Menu.Item>
                            )
                          })
                        }
                      </SubMenu>
                    )
                  })
                }
              </Menu>
            </Sider>
            <Layout>
              <Content>
                <Header style={{ background: '#fff', boxShadow: "0 0 10px #ababab", padding: "0 15px 0 0" }}>
                  <div className="collapseBtn" onClick={this.onCollapse.bind(this)} style={{ display: "inline-block" }}>
                    <Icon type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'} />
                  </div>
                  <Breadcrumb style={{ display: "inline-block" }}>
                    {
                      this.state.breadcrumb.map(item => {
                        return (< Breadcrumb.Item key={item}> {item}</Breadcrumb.Item>)
                      })
                    }
                  </Breadcrumb>
                  <div style={{ float: "right" }}>
                    <Dropdown overlay={this.dropMenu} style={{ width: "100px" }}>
                      <div className="dropMenu">
                        <img alt="" src={require("../static/images/layout/user.png")} style={{ width: "32px" }} />
                        <span style={{ margin: "0 10px" }}>Admin</span>
                        <Icon type="down" />
                      </div>
                    </Dropdown>
                  </div>
                  <div style={{ float: "right" }}>
                    <Dropdown overlay={this.languageMenu} style={{ width: "60px" }}>
                      <div className="languageMenu">
                        <span>{i18n.language}</span>
                      </div>
                    </Dropdown>
                  </div>
                </Header>
                <div className="iframeCon">
                  <Route exact path="/" component={Welcome} />
                  {
                    route.map((items) => {
                      return items.children.map((item) => {
                        if (!item.url) {
                          return (<Route key={item.id} path={"/" + item.id} component={item.component} />)
                        }
                      });
                    })
                  }
                  <Route path="/oldPages" component={PageFrame} />
                  <Mask></Mask>
                </div>
              </Content>
            </Layout>
          </Layout>
        </Router>
      </Provider>
    );
  }
}

export default App;