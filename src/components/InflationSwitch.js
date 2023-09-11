import React from "react";

const InflationSwitch = ({inf, updateInf}) => {
    return (
            <div id="switchModel">
              <ul className="nav-switch">
                <li className="nav-switch__item">
                  <input
                    type="radio"
                    className="nav-switch__input sr-only"
                    id="raw-prices"
                    name="radioSwitch"
                    checked={!inf}
                    onChange={() => null}
                  />
                  <label htmlFor="raw-prices" className="nav-switch__label" onClick={()=>updateInf(false)}
                    >Raw Prices</label
                  >
                </li>

                <li className="nav-switch__item">
                  <input
                    type="radio"
                    className="nav-switch__input sr-only"
                    id="inf-adjusted"
                    name="radioSwitch"
                    checked={inf}
                    onChange={() => null}
                  />
                  <label htmlFor="inf-adjusted" className="nav-switch__label" onClick={()=>updateInf(true)}
                    >Inflation Adjusted</label
                  >
                  <div className="nav-switch__marker" aria-hidden="true"></div>
                </li>
              </ul>
            </div>
    )
}


export default InflationSwitch;

