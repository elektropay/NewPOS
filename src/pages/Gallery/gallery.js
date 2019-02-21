import React from 'react';
import "./gallery.scss"
import { galleryTransporter as i18n } from '../../i18n/index.js'
import { Menu ,Icon , Layout ,Slider, Select, Upload, Button,message} from 'antd';

// const { Header, Content } = Layout;
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const Option = Select.Option;
const { Content, Header } = Layout;

class CallDisplay extends React.Component {
    state = {
        Timeimage: 0,
        fileList: [],
        uploading: false,
        isCompanyCover:false,
        
    }

    componentWillMount(){
        this.setState({
            Timeimage: 5,
        })
    }
    onChange = (value) => {
        this.setState({
            Timeimage:value
        })
      }
      handleUpload = () => {
        const { fileList } = this.state;
        const formData = new FormData();
        fileList.forEach((file) => {
          formData.append('files[]', file);
        });
    
        this.setState({
          uploading: true,
        });
    
        setTimeout(()=>{
            this.setState({
                fileList: [],
                uploading: false,
              });
        },200
        )
        // // You can use any AJAX library you like
        // reqwest({
        //   url: '//jsonplaceholder.typicode.com/posts/',
        //   method: 'post',
        //   processData: false,
        //   data: formData,
        //   success: () => {
        //     this.setState({
        //       fileList: [],
        //       uploading: false,
        //     });
        //     message.success('upload successfully.');
        //   },
        //   error: () => {
        //     this.setState({
        //       uploading: false,
        //     });
        //     message.error('upload failed.');
        //   },
        // });
      }
    render(){
        const { uploading, fileList } = this.state;
        const props = {
          onRemove: (file) => {
            this.setState((state) => {
              const index = state.fileList.indexOf(file);
              const newFileList = state.fileList.slice();
              newFileList.splice(index, 1);
              return {
                fileList: newFileList,
              };
            });
          },
          beforeUpload: (file) => {
            this.setState(state => ({
              fileList: [...state.fileList, file],
            }));
            return false;
          },
          fileList,
        };
        return(
            <div style = {{display:'flex',alignItems:'stretch'}}>
                <div className = "leftView"  style = {{flex: 1,background:'#ffff',margin: '10px 25px 10px 10px'}}>
                    <div  className="editTip">
                            <div className="editTipCon">


                            </div>
                    </div>
                </div>
                <div className = "rightView" style = {{width:300,paddingTop: '30px'}}>
                    {!this.state.isCompanyCover&&<div >
                        <div>
                            {i18n.TimeImageToBeShow}
                            <Slider style ={{marginTop:'30px'}} min={0} max={20} defaultValue={this.state.Timeimage} onChange = {this.onChange}  />
                            {/* <div style={{marginLeft:'10px'}}>{this.state.Timeimage}</div> */}

                        </div>
                        <div style={{marginTop:'30px'}}>
                            {i18n.TransitionEffect}    
                            <Select defaultValue="Wipe" style={{ width: 120 ,marginLeft:'15px'}}>
                                <Option value="Wipe">Wipe</Option>
                                <Option value="Fade">Fade</Option>
                            </Select>
                        </div>
                    </div>}
                    <div style={{marginTop:this.state.isCompanyCover?'10px':'30px'}}>
                        <Upload {...props}>
                            <Button>
                                <Icon type="upload" /> {i18n.SelectFile}
                            </Button>
                        </Upload>
                        <Button
                            onClick={this.handleUpload}
                            disabled={fileList.length === 0}
                            loading={uploading}
                            style={{ marginTop: 16 }}
                            >
                            {i18n.UploadImage}
                        </Button>
                        <Button
                            onClick={this.handleUpload}
                            disabled={fileList.length === 0}
                            loading={uploading}
                            style={{ marginTop: 16 ,marginLeft:16 }}
                            >
                              {i18n.DeleteImage}
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

}

class DualDisplay extends CallDisplay {
    componentWillMount(){
        this.setState({
            Timeimage: 15,
        })
    }
    // render(){
    //     return(
    //         <div style={{display:'flex',justifyContent:'center',alignItems:'center'}}>
    //               Dual Display
    //         </div>
    //     )
    // }
    
}

class CompanyCover extends CallDisplay {

    componentWillMount(){
        this.setState({
            isCompanyCover: true,
        })
    }
        // render(){
        // return(
        //     <div style={{display:'flex',justifyContent:'center',alignItems:'center'}}>
        //           Company Cover
        //     </div>
        // )
    // }
}

class galleryPage extends React.Component {
    vm: galleryVM;
    state = {
        current: 'Call',
        callDisplayShow: true,
        dualDisplayoShow: false,
        companyCoverShow: false,
      }
    componentWillMount(){
        this.vm = new galleryVM();
    }
    handleClick = (e) => {
        console.log('click ', e);
        this.setState({
          current: e.key,
        });
      }
    changeView(key){
        switch (key){
            case 'Call':
            {
                this.setState({
                    callDisplayShow: true,
                    dualDisplayoShow: false,
                    companyCoverShow: false,
                })
            }
            break;
            case 'Dual':
            {
                this.setState({
                    callDisplayShow: false,
                    dualDisplayoShow: true,
                    companyCoverShow: false,
                })
            }
            break;
            case 'Company':
            {
                this.setState({
                    callDisplayShow: false,
                    dualDisplayoShow: false,
                    companyCoverShow: true,
                })
            }
            break;
            default: return;
        }
  

    }

    render() {

        return (
             <div> 

                    <Menu
                            onClick={this.handleClick}
                            selectedKeys={[this.state.current]}
                            mode="horizontal"
                            >
                            <Menu.Item key="Call" onClick ={()=>this.changeView("Call")} >
                            {i18n.CallDisplay}
                            </Menu.Item>
                            <Menu.Item key="Dual" onClick ={()=>this.changeView("Dual")}>
                            {i18n.DualDisplayo}
                            </Menu.Item>
                            <Menu.Item key="Company" onClick ={()=>this.changeView("Company")}>
                            {i18n.CompanyCover}
                            </Menu.Item>
                        </Menu>
                    <div style ={{height:'100%'}}>
                        {this.state.callDisplayShow&&<CallDisplay/>}
                        {this.state.dualDisplayoShow&&<DualDisplay/>}
                        {this.state.companyCoverShow&&<CompanyCover/>}
                    </div>



               </div>
        )
    }
}

class galleryVM {

}

export default galleryPage