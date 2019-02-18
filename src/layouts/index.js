import React from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { Layout, Menu, Breadcrumb, Icon, Dropdown,message } from 'antd';
import './index.scss'
import route from './route.js'
import PageFrame from '../components/pageFrame'
import Welcome from '../pages/welcome/welcome'
import { layout as i18n } from '../i18n'

const { Content, Sider, Header } = Layout;
const SubMenu = Menu.SubMenu;
const dropMenu = (
  <Menu>
    <Menu.Item>nothing</Menu.Item>
  </Menu>
);
message.config({
  top: 10,
  duration: 2,
  maxCount: 3,
});

class App extends React.Component {
  state = {
    collapsed: false,
    breadcrumb: [""]
  };

  linkTo(pageId, parentId) {
    this.setState({
      breadcrumb: [i18n[parentId], i18n[pageId]]
    })
  }

  toWelcome() {
    this.setState({
      breadcrumb: [""]
    })
  }

  onCollapse = () => {
    this.setState({ collapsed: !this.state.collapsed });
  }

  render() {
    return (
      <Router>
        <Layout style={{ minHeight: '100vh' }}>
          <Sider trigger={null} collapsible collapsed={this.state.collapsed} width="250px" style={{boxShadow:"0 0 15px #999"}}>
            <div style={{ background: "#002140", paddingTop: "18px", height: "64px", overflow: "hidden" }} onClick={this.toWelcome.bind(this)}>
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
            <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
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
              <Header style={{ background: '#fff',boxShadow:"0 0 10px #ababab",padding:"0 10px 0 0" }}>
                <div className="collapseBtn" onClick={this.onCollapse}>
                  <Icon type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'} />
                </div>
                <Breadcrumb style={{display:"inline-block"}}>
                  {
                    this.state.breadcrumb.map(item => {
                      return (< Breadcrumb.Item key={item}> {item}</Breadcrumb.Item>)
                    })
                  }
                </Breadcrumb>
                <div style={{ float: "right" }}>
                  <Dropdown overlay={dropMenu}>
                    <div className="dropMenu">
                      <img alt="" src={require("../static/images/layout/user.png")} style={{width:"32px"}} />  
                      <span style={{ margin: "0 10px" }}>Admin</span>
                      <Icon type="down" />
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
              </div>
            </Content>
          </Layout>
        </Layout>
      </Router>
    );
  }
}

export default App;