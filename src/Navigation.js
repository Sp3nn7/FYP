import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Link, useLocation } from 'react-router-dom';


function Navigation() {
  const location = useLocation();
  const keyMap = {'/price-comp':0, '/trend':1, '/about':2, '/':2}
  return (
    <Navbar>
      <Nav defaultActiveKey={keyMap[location.pathname]}>
        <Nav.Item >
          <Nav.Link eventKey={0} as={Link} to="/price-comp">Price Comparison</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey={1} as={Link} to="/trend">Trend</Nav.Link>
        </Nav.Item>
        <Nav.Item className="about-tab" >
          <Nav.Link eventKey={2} as={Link} to="/about">About</Nav.Link>
        </Nav.Item>
      </Nav>
    </Navbar>
        

  );
}
        {/* <Navbar.Collapse className="me-4 justify-content-end">
          <Nav className='ms-auto'>
            <Nav.Link href="/">About</Nav.Link>
          </Nav>
        </Navbar.Collapse> */}
export default Navigation;