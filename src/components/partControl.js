function PartControl ({ partName, state, onChange, disabled }){
    const displayName = partName.charAt(0).toUpperCase() + partName.slice(1);

    return (
        <div>
            <div>
                <h6>
                    {displayName === 'Arp' ? 'PianoEmoji' : displayName === 'Bassline' ? 'BassEmoji' : 'DrumEmoji'} {displayName}:
                </h6>
                <div>
                    <input
                        type="radio"
                        className="btn-check"
                        name={`part_${partName}`}
                        id={`${partName}_on`}
                        autoComplete="off"
                        checked={state === 'on'}
                        onChange={() => onChange(partName, 'on')}
                        disabled={disabled}
                    />
                    <label className="btn btn-outline-success btn-sm" htmlFor={`${partName}_on`}>
                        ON
                    </label>

                    <input
                        type="radio"
                        className="btn-check"
                        name={`part_${partName}`}
                        id={`${partName}_hush`}
                        autoComplete="off"
                        checked={state === 'hush'}
                        onChange={() => onChange(partName, 'hush')}
                        disabled={disabled}
                    />
                    <label  className="btn btn-outline-success btn-sm" htmlFor={`${partName}_hush`}>
                        HUSH
                    </label>

                    <input
                        type="radio"
                        className="btn-check"
                        name={`part_${partName}`}
                        id={`${partName}_solo`}
                        autoComplete="off"
                        checked={state === 'solo'}
                        onChange={() => onChange(partName, 'solo')}
                        disabled={disabled}
                    />
                    <label  className="btn btn-outline-warning btn-sm" htmlFor={`${partName}_hush`}>
                        SOLO
                    </label>
                </div>
            </div>
        </div>
    )
}

export default PartControl ;