import React from "react";

function Transport({
    onPreprocess,
    onProcPlay,
    onPlay,
    onStop,
    disabled = false,
}){
    return (
        <div class="col-md-4">
            <nav class="d-grid gap-2">
                <button onClick={onPreprocess} disabled={disabled}>Preprocess</button>
                <button onClick={onProcPlay} disabled={disabled}>Proc & Play</button>
                <button onClick={onPlay} disabled={disabled}>Play</button>
                <button onClick={onStop} disabled={disabled}>Stop</button>
            </nav>
        </div>
    )
}

export default Transport;