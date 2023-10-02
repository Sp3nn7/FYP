import { Container, Row, Col, Table } from "react-bootstrap";
import React, { useState } from 'react';
import SearchBar from "../components/SearchBar";
import RAWDATA from '../data/current_data.json';
import PriceCompVis from "../components/PriceCompVis";
import locdata from '../data/region_locs.json';
import { FaTrash } from 'react-icons/fa';

const dm = RAWDATA.datamap;
const check = dm.itemName.map((d, i)=>({"name":d,  "active":true}))
const defPCState = {shoppingList: [], activeLocation: {left:"VIC", right:"QLD"}}

function PriceComp({active, setActive}) {
  const shoppingList = active.shoppingList,
    activeLocation = active.activeLocation;
  const mapData =  buildMapData(active.shoppingList);
  const [zoomed, setZoomed] = useState([{k:1}, {k:2}]); // curr and prev zoom state

  const addItemToShoppingList = (itemName, quantity, ind) => {
    const newItem = {
      id: shoppingList.length + 1,
      name: itemName,
      quantity: quantity,
      itemIndex: ind
    };
    setActive({...active, shoppingList: [...active.shoppingList, newItem]});
  };

  const deleteItemFromShoppingList = (itemName) => {
    let newList = shoppingList.filter(item => item.name !== itemName);
    newList = newList.map((item, index) => ({
      ...item,
      id: index + 1
    }));
    setActive({...active, shoppingList: newList});
  };

  const addQuantityInShoppingList = (itemName) => {
    incrementItemQuantity(itemName);
};
  const minusQuantityInShoppingList = (itemName) => {
    decrementItemQuantity(itemName);
};

  const incrementItemQuantity = (itemName) => {
    let updatedList = shoppingList.map(item => {
      if (item.name === itemName) {
        return { ...item, quantity: item.quantity + 1 };
      } else {
        return item;
      }
    });
    updatedList = updatedList.map((item, index) => ({
      ...item,
      id: index + 1
    }));
    setActive({ ...active, shoppingList: updatedList });
  };

  const decrementItemQuantity = (itemName) => {
    let updatedList = shoppingList.map(item => {
      if (item.name === itemName) {
        return { ...item, quantity: item.quantity - 1 };
      } else {
        return item;
      }
    });
    updatedList = updatedList.map((item, index) => ({
      ...item,
      id: index + 1
    }));
    setActive({ ...active, shoppingList: updatedList });
  };

  const updateActive = (column, location) => {
    if (column === "left") {
      setActive({...active, activeLocation: {...activeLocation, left:location}})
    }
    if (column === "right") {
      setActive({...active, activeLocation: {...activeLocation, right:location}})
    }
  }

  const getPrice = (location, item) => {
    let locData = mapData.states[location]
    if (!locData) {
      locData = mapData.regions[location]
    }

    let price;
    if (item === "total") { // if item is null return total price
      price = locData.totalPrice;
    }
    else if (item !== null) {
      price = locData.items[item]["price"];
    }

    return price ? price.toFixed(2) : "n/a"
  }

  return (
<div className='page-body p-3' id="price-comp-page">
  <Container fluid>
    <Row style={{height:"100%"}}>
      <Col style={{height:"100%"}} xs={6} id="left-col">
        <SearchBar data={check} onAddItem={addItemToShoppingList} onDeleteItem = {deleteItemFromShoppingList} onAddQuantity={addQuantityInShoppingList} shoppingList={active.shoppingList}/>
        <Table responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Item</th>
              <th >Price <br/><span className="loc-header" id="leftLocHeader">({activeLocation.left})</span></th>
              <th >Price <br/><span className="loc-header" id="rightLocHeader">({activeLocation.right})</span></th>
              <th>Qty.</th>
            </tr>
          </thead>
          <tbody>
            {shoppingList.length > 0 ? shoppingList.map((item, i) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>${getPrice(activeLocation.left, i)}</td>
                    <td>${getPrice(activeLocation.right, i)}</td>
                    <td>{item.quantity}</td>
                    <td>
                    <button className="btn btn-Secondary btn-fixed" onClick={() => incrementItemQuantity(item.name)}>+</button>
                    </td>
                    {
                        item.quantity === 1 ?
                        <td>
                            <button className="btn btn-Secondary btn-fixed btn-delete" onClick={() => deleteItemFromShoppingList(item.name)}>×</button>
                        </td>
                        :
                        <td>
                            <button className="btn btn-Secondary btn-fixed" onClick={() => decrementItemQuantity(item.name)}>-</button>
                        </td>
                    }
                  </tr>
                )) :
                <tr key={0}>
                    <td></td>
                    <td></td>
                    <td>Left click area on map to view price data from there.</td>
                    <td>Right click area on map to view price data from there.</td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>}
          </tbody>
          {shoppingList.length > 0 ? <tbody><tr>
            <td></td>
            <td><b>Total:</b></td>
            <td><b>${getPrice(activeLocation.left, "total")}</b></td>
            <td><b>${getPrice(activeLocation.right, "total")}</b></td>
            <td>{}</td>
          </tr></tbody>  : ""}
          
        </Table>

        </Col>
        <Col style={{height:"100%"}} xs={6}><PriceCompVis data={mapData} setActive={updateActive} zoomed={zoomed} setZoomed={setZoomed}/></Col>
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
      "totalPrice":items.reduce((prev, item) => prev + (item.price ? item.price : 0) * item["quantity"], 0),
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

export {PriceComp, defPCState};