import React, {useState} from 'react'


const SearchBar = ({data, onAddItem, onDeleteItem}) => {
  const maxItems = 100; // number of items to display in search TODO: inform user
 const [searchInput, setSearchInput] = useState("");
 const [items, setItems] = useState(data.map(item => ({...item, active: false})));
  // Only rendering 100 items for faster load times
  // idea: only render 100 items on the list at a time

const handleChange = (e) => {
  e.preventDefault();
  setSearchInput(e.target.value);
};

//const onItemCheck = (e, target) => {
//  setItems(items.map(item => ({
//      ...item,
//      active: target.name == item.name? e.target.checked : item.active,
//    })))
//  }
const onItemCheck = (e, target) => {
    setItems(items.map((item, i) => {
        if (target.name == item.name) {
            if (e.target.checked) {
                onAddItem(item.name, 1, i);
            }
            else{
                onDeleteItem(item.name);
            }
            return {
                ...item,
                active: e.target.checked
            };
        }
        return item;
    }));
};
  
return <div>

<input
   type="search"
   placeholder="Search here"
   className="price-comp-search"
   onChange={handleChange}
   value={searchInput} />

{searchInput == "" ? <></> :
  <div className="search-container">
  <table>
    <tbody>
      <tr>
        <th></th>
        <th></th>
      </tr>
    {searchInput == ""? "" : items
      .filter((item) => searchInput.split(" ").reduce((acc, curr) => acc && item.name.match(RegExp(curr, "i")), true))
      .slice(1,maxItems)
      .map((item, _i) => {
      return (
        <tr key={item.name}>
          <td>{item.name}</td>
          <td><input
            type="checkbox"
            checked={item.active}
            className="form-check-input"
            id={item.name}
            onChange={(e) => onItemCheck(e, item)}/>
          </td>
        </tr>
      )
    })}
    </tbody>
    </table>
    </div>
}
</div>
};

export default SearchBar;