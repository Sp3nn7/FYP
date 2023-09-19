import { Container, Row, Col, Table } from "react-bootstrap";
import React, { useState } from 'react';
import SearchBar from "../components/SearchBar";
import RAWDATA from '../data/current_data.json';
import PriceCompVis from "../components/PriceCompVis";
import locdata from '../data/region_locs.json';

const dm = RAWDATA.datamap;
const check = dm.itemName.map((d, i)=>({"name":d,  "active":true}))

function PriceComp() {
  // TODO: Implement state based approach to record state of shopping list/visualisation
  const [shoppingList, setShoppingList] = useState([]);
  const [mapData, setMapData] = useState(buildMapData(shoppingList))
  const [active, setActive] = useState({left:"VIC", right: "QLD"}) // column to display prices from
  const [zoomed, setZoomed] = useState(null)
  const [fontSize, setFontSize] = useState('1em')

  const addItemToShoppingList = (itemName, quantity, ind) => {
    const newItem = {
      id: shoppingList.length + 1,
      name: itemName,
      quantity: quantity,
      itemIndex: ind
    };
    setMapData(buildMapData([...shoppingList, newItem]))
    setShoppingList(prevList => [...prevList, newItem]);
  };

  const deleteItemFromShoppingList = (itemName) => {
    let newList = shoppingList.filter(item => item.name !== itemName);
    newList = newList.map((item, index) => ({
      ...item,
      id: index + 1
    }));
    setMapData(buildMapData([...newList]))
    setShoppingList(newList);
  };

  const updateZoom = (state) => {
    // dislay the default state values
    // everthing should still be built the same
    setZoomed(state)
  }

  const updateActive = (column, location) => {
    console.log(active)
    if (column === "left") {
      setActive({...active, left: location})
    }
    if (column === "right") {
      setActive({...active, right: location})
    }
  }

  const getPrice = (location, item) => {
    let locData = mapData.states[location]
    if (!locData) {
      locData = mapData.regions[location]
    }

    let price;
    if (item) {
      price = locData.items[item]["price"];
    }
    else { // if item is null return total price
      price = locData.items.totalPrice;
    }
    return price ? price.toFixed(2) : "n/a"
  }
  return (
<div className='page-body p-3'>
  <Container fluid>
    <Row style={{height:"100%"}}>
      <Col style={{height:"100%"}} xs={6}>
        <SearchBar data={check} onAddItem={addItemToShoppingList} onDeleteItem = {deleteItemFromShoppingList}/>
        <Table responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Item</th>
              <th>Price ({active.left})</th>
              <th>Price ({active.right})</th>
              <th>Qty.</th>
            </tr>
          </thead>
          <tbody>
            {shoppingList.map((item, i) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>{getPrice(active.left, i)}</td>
                    <td>{getPrice(active.right, i)}</td>
                    <td>{item.quantity}</td>
                  </tr>
                ))}
          </tbody>
          <tbody>
            <tr>
              <td></td>
              <td><b>Total:</b></td>
              <td><b>{getPrice(active.left, null)}</b></td>
              <td><b>{getPrice(active.right, null)}</b></td>
              <td>{}</td>
            </tr>
          </tbody>
        </Table>

        </Col>
        <Col style={{height:"100%"}} xs={6}><PriceCompVis data={mapData} setActive={updateActive} zoomed={zoomed} setZoomed={updateZoom}/></Col>
    </Row>
  </Container>
</div>
  );
}


/*
Proposed data format:
{
    "vic":{
        "prices":{
            "item1":1.21
            ...
        },
        "active":true, // hoveres
        "location": [12,56] // coords for svg
        "regions": {        // nested regions
            "region1" : {
                "prices":{
                    ...
                },
                "active":false,
                "location":[1,1]
            }
        }
    }
}
// RAWDATA.data[STATE/CITY][CATEGORY][region]
zoom refers to state zoomed in on. can be null
*/

const buildMapData = (shoppingList) => {
  const mapData = {"states":{}, "regions":{}}
  dm.state.forEach(function(state, i) {
    const items = getStatePrice(shoppingList, i)
    mapData.states[state] = ({
      "items":items, // place holder
      "active":state==="VIC",
      "location":locdata[state], //place holder
      "totalPrice":items.reduce((prev, item) => prev + (item.price ? item.price : 0), 0),
      "isLegit":!items.some(i => i.price === null)
    })

    dm.region[i].forEach((region, j) => {
      const items = getRegionPrice(shoppingList, i, j)
      mapData["regions"][region] = {
        "items":items,
        "active": j === 0 && i===0, // default first region
        "location": locdata[region],
        "totalPrice":items.reduce((prev, item) => prev + (item.price? item.price : 0), 0),
        "isLegit":!items.some(i => i.price === null)
      }
    })
  })
  return mapData
}

const getStatePrice = (shoppingList, stateInd) => {
  const stateData = RAWDATA.data[stateInd]
  return shoppingList.map((item, i) => {
    // filter out nulls
    const itemData = stateData[item.itemIndex].filter(i => i!==null)
    // Average over all regions. Maintain null value if all values are null
    const regionsSum = itemData.reduce((prev, curr) => prev === null ? curr : curr+prev, null)
    return ({...item,
      price: regionsSum === null ? null: (regionsSum/itemData.length)}
      ); 
    })
}

const getRegionPrice = (shoppingList, stateInd, regionIndex) => {
  const stateData = RAWDATA.data[stateInd]
  return shoppingList.map((item, i) => {
    const itemData = stateData[item.itemIndex]
    // Average over all regions. Maintain null value if all values are null
    return ({...item, price:itemData[regionIndex]})
  })
}

export default PriceComp;