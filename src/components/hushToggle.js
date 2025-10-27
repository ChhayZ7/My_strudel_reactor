import React from "react";

function HushToggle({hush, onChange}){
    return (
        <div className="col-md-4">
            <div className="form-check">
                <input
                    className="form-check-input"
                    type="radio"
                    name="flexRadioDefault"
                    id="flexRadioDefault1"
                    onChange={() => onChange(false)}
                    checked={!hush}
                />
                <label className="form-check-label" htmlFor="p1_on">
                    p1: ON
                </label>
            </div>
            <div className="form-check">
                <input
                    className="form-check-input"
                    type="radio"
                    name="flexRadioDefault"
                    id="flexRadioDefault2"
                    onChange={() => onChange(true)}
                    checked={hush}
                />
                <label className="form-check-label" htmlFor="p1_hush">
                    p1: HUSH
                </label>
            </div>
        </div>
    )
}

export default HushToggle;