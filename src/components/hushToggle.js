import React from "react";

function HushToggle({hush, onChange}){
    return (
        <div className="col-md-4">
            <div className="form-check">
                <input
                    className="form-check-input"
                    type="radio"
                    name="p1_mode"
                    id="p1_on"
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
                    name="p1_mode"
                    id="p1_hush"
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