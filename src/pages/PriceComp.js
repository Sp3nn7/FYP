import { Container, Row, Col, Table } from "react-bootstrap";
import React, { useState } from 'react';
import SearchBar from "../components/SearchBar";
import RAWDATA from '../data/current_data.json';
import AusMap from "../data/au.svg"
//import ItemsManager from "../components/ItemsManager"

const dm = RAWDATA.datamap;
const check = dm.category.map((d, i)=>({"name":d, "unit": dm.unit[i], "price":RAWDATA.data[1][i].reduce((prev, curr)=>prev ? prev : curr, null),  "active":true}))
// RAWDATA.data[STATE/CITY][CATEGORY][region]
function PriceComp() {
  // TODO: Implement state based approach to record state of shopping list/visualisation
  const [shoppingList, setShoppingList] = useState([]);

  const addItemToShoppingList = (itemName, unit, price, quantity) => {
    const newItem = {
      id: shoppingList.length + 1,
      name: itemName,
      unit: unit,
      price: price,
      quantity: quantity
    };
  setShoppingList(prevList => [...prevList, newItem]);
  };

  const deleteItemFromShoppingList = (itemName) => {
    let newList = shoppingList.filter(item => item.name !== itemName);
    newList = newList.map((item, index) => ({
      ...item,
      id: index + 1
    }));
    setShoppingList(newList);
  };
  return (
<div className='page-body p-2'>
  <Container className='page-container'>
    <Row>
      <Col xs={6}>
        <SearchBar data={check} onAddItem={addItemToShoppingList} onDeleteItem = {deleteItemFromShoppingList}/>
        <Table responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Item</th>
              <th>Unit Size</th>
              <th>Price</th>
              <th>Qty.</th>
            </tr>
          </thead>
          <tbody>
            {shoppingList.map(item => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>{item.unit}</td>
                    <td>{item.price? "$"+item.price.toFixed(2) : "n/a"}</td>
                    <td>{item.quantity}</td>
                  </tr>
                ))}
          </tbody>
        </Table>

        </Col>
        <Col xs={6}><img src={AusMap} alt="React Logo" /></Col>
    </Row>
  </Container>
</div>
  );
}

export default PriceComp;