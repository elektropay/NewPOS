import React from 'react';

class pageFrame extends React.Component {
    render(){
        return (
            <iframe name="mainFrame" title="mainFrame" src={this.props.location.pathname+".html"} id="mainFrame"></iframe>
        )
    }
}

export default pageFrame;