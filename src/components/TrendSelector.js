import React, { useState } from "react";

/**
 * List of food items that the user interacts with to visualise their chosen item.
 * @param {*} param0 
 * @returns 
 */
const TrendSelector = ({items, active, unit, update}) => {
    return (
        <div className="trend-selector" id="trend-selector">
            {items.map((item, i) => 
                <div 
                    className={"trend-selector-item"+(item==active?" active":"")}
                    data-testid={item}
                    onClick={()=>update(i)}
                    key={i}>
                    {item}
                    {item === active ? <div className='trend-selector-unit'> {unit}</div> : ''}
                </div>)}
        </div>
    )
}


export default TrendSelector;