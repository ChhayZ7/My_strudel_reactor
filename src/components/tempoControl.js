import React, { useState, useCallback} from "react";

function TempoControl({ bpm, onBpmChange, disabled = false }){
    const [activeInput, setActiveInput] = useState('bpm');

    const cps = (bpm / 60/ 4).toFixed(3);

    const handleBpmChange = useCallback((e) => {
        const value = parseFloat(e.target.value);
        if(!isNaN(value) && value > 0){
            onBpmChange(value);
        }
    }, [onBpmChange]);

    // Handle CPS input change
    const handleCpsChange = useCallback((e) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value) && value > 0){
            onBpmChange(value * 60 * 4);
        }
    }, [onBpmChange]);

    // Increment/Decrement handlers
    const adjustBpm = useCallback((delta) => {
        const newBpm = Math.max(20, Math.min(300, bpm + delta));
        onBpmChange(newBpm);
    }, [bpm, onBpmChange]);
    return(
        <div>
            <div>
                <label>BPM</label>
                <div>
                    <button
                        className="btn btn-outline-warning btn-sm"
                        onClick={() => adjustBpm(-1)}
                        disabled={disabled || bpm <= 20}
                    >
                        -
                    </button>
                    <input
                        type="number"
                        className="form-control"
                        value={Math.round(bpm)}
                        onChange={handleBpmChange}
                        onFocus={() => setActiveInput('bpm')}
                        disabled={disabled}
                        min="20"
                        max="300"
                        step="1"
                    />
                    <button
                        className="btn btn-outline-success btn-sm"  
                        onClick={() => adjustBpm(1)}
                        disabled={disabled || bpm >= 300}
                    >
                        +
                    </button>
                </div>
            </div>

            <div>
                <label>CPS</label>
                <div>
                    <button
                        className="btn btn-outline-warning btn-sm"
                        onClick={() => adjustBpm(-60)}
                        disabled={disabled || bpm <= 20}
                    >
                        -
                    </button>
                    <input
                        type="number"
                        className="form-control"
                        value={cps}
                        onChange={handleCpsChange}
                        onFocus={() => setActiveInput('cps')}
                        disabled={disabled}
                        min="0.33"
                        max="5"
                        step="0.1"
                    />
                    <button
                        className="btn btn-outline-success btn-sm"  
                        onClick={() => adjustBpm(60)}
                        disabled={disabled || bpm >= 300}
                    >
                        +
                    </button>
                </div>
            </div>

            {/* Quick Preset Buttons */}
            <div>
                <button
                    className="btn btn-outline-primary btn-sm m-1"
                    onClick={() => onBpmChange(60)}
                    disabled={disabled}
                >
                    60 BPM
                </button>
                <button
                    className="btn btn-outline-primary btn-sm m-1"
                    onClick={() => onBpmChange(90)}
                    disabled={disabled}
                >
                    90 BPM
                </button>
                <button
                    className="btn btn-outline-primary btn-sm m-1"
                    onClick={() => onBpmChange(120)}
                    disabled={disabled}
                >
                    120 BPM
                </button>
                <button
                    className="btn btn-outline-primary btn-sm m-1"
                    onClick={() => onBpmChange(140)}
                    disabled={disabled}
                >
                    140 BPM
                </button>
                <button
                    className="btn btn-outline-primary btn-sm m-1"
                    onClick={() => onBpmChange(160)}
                    disabled={disabled}
                >
                    160 BPM
                </button>
            </div>

        </div>
    )
}

export default TempoControl;