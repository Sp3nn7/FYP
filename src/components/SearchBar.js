import React, {useState} from 'react'


const SearchBar = ({data, onAddItem, onDeleteItem, onAddQuantity, shoppingList}) => {
  const maxItems = 100; // number of items to display in search TODO: inform user
 const [searchInput, setSearchInput] = useState("");
 const [items, setItems] = useState(data.map(item => ({...item, active: false})));
  // Only rendering 100 items for faster load times
  // idea: only render 100 items on the list at a time

const handleChange = (e) => {
  e.preventDefault();
  setSearchInput(e.target.value);
};

const handleAddButtonClick = (e, target) => {
    setItems(items.map((item, i) => {
        if (target.name === item.name) {
            const itemInList = shoppingList.find(currentItem => currentItem.name === target.name);
            if (itemInList) {
                onAddQuantity(item.name);
                return { ...item, active: true };  // Mark the item as added
            } else {
                onAddItem(item.name, 1, i);
                return { ...item, active: true };
            }
        }
        return item;
    }));
};

const handleDeleteButtonClick = (e, target) => {
    onDeleteItem(target.name);
    setItems(items.map(item => {
        if (item.name == target.name) {
            return { ...item, active: false };
        }
        return item;
    }));
};

const escChars = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

//const onItemCheck = (e, target) => {
//    setItems(items.map((item, i) => {
//        if (target.name == item.name) {
//            if (e.target.checked) {
//                onAddItem(item.name, 1, i);
//            }
//            else{
//                onDeleteItem(item.name);
//            }
//            return {
//                ...item,
//                active: e.target.checked
//            };
//        }
//        return item;
//    }));
//};
return <div>

<input
   type="search"
   placeholder="Search here"
   className="price-comp-search"
   onChange={handleChange}
   value={searchInput} 
   id = "search-bar"/>
{searchInput === "" ? <></> :
  <div className="search-container">
  <table>
    <tbody>
      <tr>
        <th></th>
        <th></th>
      </tr>
    {searchInput === ""? "" : items
      .filter((item) => searchInput.split(" ").reduce((acc, curr) => acc && item.name.match(RegExp(escChars(curr), "i")), true))
      .slice(1,maxItems)
      .map((item) => (
                  <tr key={item.name}>
                    <td>{item.name}</td>
                    <td>
                        { item.active && shoppingList.find(target => item.name === target.name) ?
                            <button
                                className="base-button delete-button"
                                onClick={(e) => handleDeleteButtonClick(e, item)}>
                                -
                            </button>
                            :
                            <button
                                className="base-button add-button"
                                onClick={(e) => handleAddButtonClick(e, item)}>
                                +
                            </button>
                        }
                    </td>
                  </tr>
                )
    )}
    </tbody>
    </table>
    </div>
}
</div>
};

export default SearchBar;