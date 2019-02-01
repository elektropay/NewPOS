import React from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { Layout, Menu, Breadcrumb, Icon, } from 'antd';
import './index.css'
import route from './route.js'

const { Content, Sider } = Layout;
const SubMenu = Menu.SubMenu;

class App extends React.Component {
  state = {
    collapsed: false,
    breadcrumb:[]
  };

  linkTo(page,parent) {
    if (document.getElementById("mainFrame").src.indexOf(page.url)<0){
      document.getElementById("mainFrame").src = "./oldPages/" + page.url;
    }
    this.setState({
      breadcrumb: [parent,page.c_name]
    })
  }

  onCollapse = (collapsed) => {
    this.setState({ collapsed });
  }

  render() {
    return (
      <Router>
        <Layout style={{ minHeight: '100vh' }}>
          <Sider collapsible collapsed={this.state.collapsed} onCollapse={this.onCollapse}>
            <div className="logo" style={{ display: this.state.collapsed ? "none" : "block" }}>
              <img alt="Menusifu" src={require('../static/images/logo.png')} />
            </div>
            <div className="minLogo" style={{ display: this.state.collapsed ? "block" : "none" }}>
              <img alt="Menusifu" src={require('../static/images/logo_min.png')} />
            </div>
            <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
              {
                route.map((items) => {
                  return (
                    <SubMenu key={items.id} title={<span><Icon type={items.icon} /><span>{items.c_name}</span></span>}>
                      {
                        items.children.map((item) => {
                          return (
                            <Menu.Item key={item.id} onClick={this.linkTo.bind(this, item,items.c_name)}>{item.c_name}</Menu.Item>
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
            <Content style={{ margin: '0 16px' }}>
              <Breadcrumb style={{ margin: '16px 0' }}>
                {
                  this.state.breadcrumb.map(item=>{
                    return (< Breadcrumb.Item > {item}</Breadcrumb.Item>)
                  })
              }
              </Breadcrumb>
              <div className="iframeCon">
                <iframe name="mainFrame" title="mainFrame" src="./oldPages/default.html" id="mainFrame"></iframe>
              </div>
            </Content>
          </Layout>
        </Layout>
      </Router>
    );
  }
}

export default App;