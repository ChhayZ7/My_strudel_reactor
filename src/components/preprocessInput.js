import React from "react";

/**
 * A textarea input component used for editing the raw text
 * before preprocessing. Controlled via 'value' and 'onChange'.
 */


function PreprocessInput ({ value, onChange }){
    return (
        <div class="col-md-8"
            style={{ maxHeight: "50vh", overflowY: "auto"}}>
                <label>
                    Text to preprocess:
                </label>
                <textarea
                    id="proc"
                    class="form-control"
                    rows={15}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
        </div>
    );
}

export default PreprocessInput;