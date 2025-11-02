import React from "react";

function EditorPane({ mountRef}){
    return (
        <div className="col-md-8" style={{ maxHeight: "50vh", overflowY: "auto"}}>
            <div ref={mountRef}/>
        </div>
    )
}

export default EditorPane;