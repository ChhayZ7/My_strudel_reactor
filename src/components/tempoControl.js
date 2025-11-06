import React, { useState, useCallback, useEffect} from "react";

function TempoControl({ bpm, onBpmChange, disabled = false }){
    const [activeInput, setActiveInput] = useState('bpm');

    const [localBpm, setLocalBpm] = useState(bpm);

    // Update local values when prop changes
    useEffect(() => {
        setLocalBpm(bpm);
    }, [bpm]);

    // Handle BPM input change
       const handleBpmInputChange = useCallback((e) => {
        setLocalBpm(e.target.value);
    }, []);

    // Apply BPM change
    const applyBpmChange = useCallback(() => {
        const value = parseFloat(localBpm);
        if (!isNaN(value) && value >= 20 && value <= 300) {
            onBpmChange(value);
        } else {
            setLocalBpm(bpm); // Reset to current bpm if invalid
            alert("Please enter a BPM value between 20 and 300."); // To be change to a modal
        }
    }, [localBpm, onBpmChange, bpm]);
    
    // Increment/Decrement handlers
    const adjustBpm = useCallback((delta) => {
        const newBpm = Math.max(20, Math.min(300, bpm + delta));
        onBpmChange(newBpm);
    }, [bpm, onBpmChange]);
    return(
        <div className="tempo-control-wrapper">
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
                        value={localBpm}
                        onChange={handleBpmInputChange}
                        onFocus={() => setActiveInput('bpm')}
                        onKeyDown={(e) => e.key === 'Enter' && applyBpmChange()}
                        disabled={disabled}
                        step="1"
                    />
                    <button
                        className="btn btn-outline-success btn-sm"  
                        onClick={() => adjustBpm(1)}
                        disabled={disabled || bpm >= 300}
                    >
                        +
                    </button>
                    <button
                        className="btn btn-outline-primary btn-sm mx-2"
                        onClick={applyBpmChange}
                        disabled={disabled}
                    >
                        Set
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