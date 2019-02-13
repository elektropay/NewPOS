import React from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { Layout, Menu, Breadcrumb, Icon, } from 'antd';
import './index.css'
import route from './route.js'
import Welcome from '../pages/welcome/welcome'
import PageFrame from '../components/pageFrame'
import { layout as i18n} from '../i18n'

const { Content, Sider } = Layout;
const SubMenu = Menu.SubMenu;

class App extends React.Component {
  state = {
    collapsed: false,
    breadcrumb: ["welcome"]
  };

  linkTo(pageId, parentId) {
    this.setState({
      breadcrumb: [i18n[parentId], i18n[pageId]]
    })
  }

  toWelcome() {
    this.setState({
      breadcrumb: ["welcome"]
    })
  }

  onCollapse = (collapsed) => {
    this.setState({ collapsed });
  }

  render() {
    return (
      <Router>
        <Layout style={{ minHeight: '100vh' }}>
          <Sider collapsible collapsed={this.state.collapsed} onCollapse={this.onCollapse} width="250px">
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
                              <Link to={item.url.indexOf(".html") > 0 ? `/oldpages/${item.url.substring(0, item.url.length-5)}` : item.url}>{i18n[item.id]}</Link>
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
            <Content style={{ margin: '0 16px' }}>
              <Breadcrumb style={{ margin: '16px 0' }}>
                {
                  this.state.breadcrumb.map(item => {
                    return (< Breadcrumb.Item > {item}</Breadcrumb.Item>)
                  })
                }
              </Breadcrumb>
              <div className="iframeCon">
                <Route exact path="/" component={Welcome} />
                {
                  route.map((items) => {
                    return items.children.map((item) => {
                      if (item.url.indexOf(".html")<0) {
                        console.log(item)
                        return (<Route path={item.url} component={item.component} />)
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