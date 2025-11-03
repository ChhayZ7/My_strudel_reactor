import React from "react";

function Transport({
    onPreprocess,
    onProcPlay,
    onPlay,
    onStop,
    disabled = false,
}){
    return (
            <nav class="d-grid gap-2">
                <button className="btn btn-outline-primary" onClick={onPreprocess} disabled={disabled}>Preprocess</button>
                <button className="btn btn-outline-primary" onClick={onProcPlay} disabled={disabled}>Proc & Play</button>
                <button className="btn btn-outline-primary" onClick={onPlay} disabled={disabled}>Play</button>
                <button className="btn btn-outline-primary" onClick={onStop} disabled={disabled}>Stop</button>
            </nav>
    )
}

export default Transport;