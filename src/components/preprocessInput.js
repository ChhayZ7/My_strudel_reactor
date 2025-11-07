import React from "react";

/**
 * A textarea input component used for editing the raw text
 * before preprocessing. Controlled via 'value' and 'onChange'.
 */

function PreprocessInput ({ value, onChange }){
    return (
        <div>
                <label>
                    Text to preprocess:
                </label>
                <textarea
                    id="proc"
                    className="form-control"
                    rows={15}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
        </div>
    );
}

export default PreprocessInput;