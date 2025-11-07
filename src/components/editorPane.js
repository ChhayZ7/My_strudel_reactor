import React from "react";

// A simple pane to mount the code editor
function EditorPane({ mountRef}){
    return (
        <div style={{ maxHeight: "50vh", overflowY: "auto"}}>
            <div ref={mountRef}/>
        </div>
    )
}

export default EditorPane;