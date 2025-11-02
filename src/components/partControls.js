import PartControl from './partControl';

function PartControls({ parts, partStates, onChange, disabled}){
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