
import ReactGA from 'react-ga'; // https://github.com/react-ga/react-ga
import React, { useEffect } from 'react';
import { trackPage } from './util'
import { getNewTokens } from './schwab'

import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';
import Container from "react-bootstrap/Container"
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Image from 'react-bootstrap/Image'
import { FeedbackForm, Donate } from './feedback'
import { OptionsWhatIf } from './optionswhatif'
import sheetsAddOnScreenshot from './sheetsaddonscreenshot.png'
import webAppScreenshot from './webappscreenshot.png'
import {
  Link,
  Switch,
  Route,
  NavLink, useLocation,
} from "react-router-dom";

const log = console.log
console.log(window.location.hostname)
const googleAnalyticsTrackingID = process.env.REACT_APP_GOOGLE_TRACKING_ID
if (googleAnalyticsTrackingID) {
  ReactGA.initialize(googleAnalyticsTrackingID);   // Add your tracking ID created from https://analytics.google.com/analytics/web/#home/
}

function setPageview(url: string) {
  log(url)
  trackPage(url)
  ReactGA.pageview(url)
}

function usePageViews() {
  let location = useLocation()

  useEffect(() => {
    setPageview(location.pathname)
  }, [location.pathname])
}

function App() {

  usePageViews()

  return <div className="App">

    < header className="App-header" >

      < Navbar bg="light" expand="sm" >
        <Navbar.Brand as={NavLink} to="/">
          <img src="../favicon.ico" width="30" height="30" className="d-inline-block align-top" alt="" />
          {' '}
          OptionsWhatIf
        </Navbar.Brand>
        <Nav >
          <Nav.Link as={NavLink} to="/about">About</Nav.Link>
          <Nav.Link as={NavLink} to="/aboutaddon">Sheets Add-On</Nav.Link>
          <Nav.Link as={NavLink} to="/feedback" activeClassName="navselected">Give Feedback</Nav.Link>
        </Nav>
      </Navbar >
    </header >
    <Switch>
      <Route path="/aboutaddon">
        <Container> <AboutSheetsAddon /> </Container>
      </Route>
      <Route path="/about">
        <Container> <AboutWebApp /> </Container>
      </Route>
      <Route path="/feedback">
        <Container>
          <Row style={{ alignItems: "flex-start" }}>
            <Col sm className="feedbackform">  <FeedbackForm /></Col>
            <Col sm='auto' className=" rounded donatebox">  <Donate /></Col>
          </Row>
        </Container>
      </Route>
      <Route path="/newauth">
        <NewAuth />
      </Route>
      <Route path="/">
        <OptionsWhatIf />
      </Route>
    </Switch>
  </div >

}

const handleSubmit = async (event: React.SyntheticEvent) => {
  console.log(`"handling form"  `)
  event.preventDefault();
  getNewTokens()
}


function NewAuth() {
  return (
    <form onSubmit={handleSubmit}  >
      <button type="submit" value="Submit" >
        Submit
        
      </button>
      <p />
    </form>
  )
}

function AboutSheetsAddon() {
  return (
    <div>
      <h3>OptionsWhatIf Google Sheets Add-On</h3>
      <p>A stock option tool for investors and speculators that shows possible outcomes for the stock options you select.. </p>

      <p>It can help guide your investment decisions by creating data sheets that show potential stock option profit and ROI at various price points.</p>
      <p>
        OptionsWhatIf is available as a Google Sheets add-on and can be obtained
        <a href="https://gsuite.google.com/marketplace/app/optionswhatif/381044359711?pann=cwsdp&hl=en" rel="noopener noreferrer" target="_blank"> here</a>.
      </p>
      <p>After installing the add-on in Sheets, select the Sheets menu option Add-ons.OptionsWhatIf.Start.</p>
      <p>Enter a stock symbol (US markets) and choose the desired option expiration dates and a new sheet will be inserted showing price data and potential
        profit and ROI at six different price points- price changes of 10%, 33%,50%, 66%, 90%, and 100%.
        Price data on a sheet can be updated by selecting the "Update prices" button on the sidebar. The mid point of the bid/ask is used as the option price. Profit is based on intrinsic value.</p>
      <Image src={sheetsAddOnScreenshot} alt='screenshot of Google Sheet' className="graphic" />
    </div>)
}

function AboutWebApp() {
  return (
    <div>
      <h3>OptionsWhatIf WebApp</h3>
      <p>A stock option tool for investors and speculators that shows possible outcomes for the stock options you select.. </p>

      <p>It can help guide your investment decisions by showing the potential stock option profit and ROI at various price points.</p>
      <p>
        The OptionsWhatIf Web App can be found
        <Link to="/"> here</Link>.
      </p>

      <p>Enter a stock symbol (US markets) and choose the desired option expiration dates and the page will show price data and potential
        profit and ROI at seven different price points- price changes of 0% 10%, 33%,50%, 66%, 90%, and 100%. You can edit the price points to see customized results.
        Price data can be updated by selecting the "Refresh" button. Checking "Auto Refresh" will upate the prices every second. The mid point of the bid/ask is used as the option price. Profit is based on intrinsic value.</p>
      <Image src={webAppScreenshot} alt='screenshot of Web App' className="graphic" />
    </div>)
}
export default App;
