import React from "react";
import InflationSwitch from "./InflationSwitch";
/**
 * List of food items that the user interacts with to visualise their chosen item.
 * @param {*} param0 
 * @returns 
 */
const CitySelector = ({state, update, updateInf}) => {
    return (
        <div className="city-selector" id="city-selector">
            {state.city.map((city, i) => 
                <div 
                    className={"city-selector-item"+(city.active?" active":"")}
                    style={city.active ? {"background":city.colour} : {"background":"white"}}
                    onClick={()=>update(i)}
                    key={city.name}>
                    {city.name}
                </div>)}
            <InflationSwitch inf={state.inflation} updateInf={updateInf}/>
        </div>
    )
}


export default CitySelector;