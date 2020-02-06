import React from 'react';
//import logo from './logo.svg';
import './app.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from "react-bootstrap/Container"
//import Button from "react-bootstrap/Button";
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
//import TabPane from 'react-bootstrap/TabPane'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Image from 'react-bootstrap/Image'
import {FeedbackForm, Donate} from './feedback'
import screenshot from './screenshot5.png'

console.log(window.location.hostname)



function About() {
  return (
    <div>
      <p>A stock option tool for investors and speculators.</p>

      <p>It can help guide your investment decisions by creating data sheets that show potential stock option profit and ROI at various price points.</p>
      <p>
        OptionsWhatIf is a Google Sheets add-on and can be obtained
    <a href="https://chrome.google.com/webstore/detail/optionswhatif/inmobffdcfobiomlacdnmffnpeeoomlm?authuser=0"> here</a>.
     </p>

      <p>Enter a stock symbol (US markets) and choose the desired option expiration dates and a new sheet will be inserted showing potential profit and ROI at six different price points.
        The new sheet will contain price data for the options and six columns that show profit and ROI for price changes of 10%, 33%,50%, 66%, 90%, and 100%.
  Price data on a sheet can be updated by selecting the "Update prices" button on the sidebar. The mid point of the bid/ask is used as the option price. Profit is based on instrinsic value.</p>
<Image src={screenshot}   alt='screenshot of Google Sheet' className = "graphic"/>
    </div>)
}



class App extends React.Component {
 tabKeys = ['About', 'Feedback']
  state = { activeTab: this.tabKeys[0] }
 
  componentDidMount() {
    // allow deep links for tabs
    let url = window.location.href.replace(/\/$/, "");

    if (window.location.hash) {
      const hash = url.split("#");
      //$('#myTab a[href="#' + hash[1] + '"]').tab("show");
      this.setState({ activeTab: hash[1] })
      url = window.location.href.replace(/\/#/, "#");
      window.history.replaceState(null, null, url);

    }
  }

  render() {
    return <div className="App">

      < header className="App-header" >
    
        < Navbar bg="light" expand="sm" >
          <Navbar.Brand href={this.tabKeys[0]}>
            <img
              src="../favicon.ico"
              width="30"
              height="30"
              className="d-inline-block align-top"
              alt=""
            />{' '}
            OptionsWhatIf</Navbar.Brand>

          <Tab.Container id="left-tabs-example" activeKey={this.state.activeTab} onSelect={this.handleSelect}>

            <Nav variant="tabs">
              <Nav.Item>
                <Nav.Link eventKey={this.tabKeys[0]}>About</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey={this.tabKeys[1]}>Give Feedback</Nav.Link>
              </Nav.Item>
            </Nav>


          </Tab.Container>
        </Navbar >

      </header >

      <Tabs activeKey={this.state.activeTab} onSelect={this.handleSelect}>
        <Tab eventKey={this.tabKeys[0]}>
          <Container>
            <About></About>
          </Container>
        </Tab>
        <Tab eventKey={this.tabKeys[1]}>
        
          <Container>
          <Row  style = {{alignItems:"flex-start"}}>
            <Col sm >  <FeedbackForm /></Col>
            <Col sm='auto' className = " rounded doubleb">  <Donate/></Col>
          </Row>
          
          </Container>
         
        </Tab>

      </Tabs>


    </div >

  }
//className = "align-items-start"
  handleSelect = (selectedTab) => {
    // The active tab must be set into the state so that
    // the Tabs component knows about the change and re-renders.
    this.setState({
      activeTab: selectedTab
    });
  }
}

export default App;
