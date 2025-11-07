import PartControl from './partControl';
import React from "react";

// A set of controls for multiple parts
function PartControls({ parts, partStates, onChange, disabled}){
    if ( parts.length === 0 ){
        return (
            <div>
                <h5>Part Controls</h5>
                <div className="alert alert-info">
                    No parts detected. Use <code>&lt;part:name&gt;...&lt;/part:name&gt;</code> tags to define parts.
                </div>
            </div>
        )
    }
    return (
        <div>
            <h5>Part Controls</h5>
            {parts.map(part => (
                <PartControl
                    key={part.name}
                    partName={part.name}
                    state={partStates[part.name] || 'on'}  
                    onChange={onChange}
                    disabled={disabled}
                />
            ))}
            <div>
                <strong>Tips:</strong>
                <ul>
                    <li><strong>ON:</strong> Part plays normally</li>
                    <li><strong>HUSH:</strong> Part is muted</li>
                    <li><strong>SOLO:</strong> Only soloed parts play (mutes all others)</li>
                </ul>
            </div>
        </div>
    )
}

export default PartControls;