import React, { useState } from 'react';

// ProjectManager Component

// Provides UI for saving and loading Strudel projects.Component
// Includes project name input and save/load buttons.

function ProjectManager({
    projectName,
    onProjectNameChange,
    onSave,
    onLoad,
    disabled = false
}) {
    const [fileName, setFileName] = useState('');

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file){
            setFileName(file.name);
            onLoad(event);
        }
    };

    return (
        <div className="project-manager">
            <h6>💾 Project Manager</h6>

            {/* Project Name Input */}
            <div className="">
                <label htmlFor='projectName' className="form-label-small">
                    Project Name
                </label>
                <input
                    type="text"
                    id="projectName"
                    className='form-control form-control-sm'
                    value={projectName}
                    onChange={(e) => onProjectNameChange(e.target.value)}
                    placeholder='Enter project name'
                    disabled={disabled}
                />
                    <small className="text-muted d-block">
                        This name will be used when saving the project
                    </small>
            </div>

            {/* Action Buttons */}
            <div className="project-action">
                {/* Save Button */}
                <button
                    className="btn btn-outline-success btn-sm w-100 mb-2"
                    onClick={onSave}
                    disabled={disabled || !projectName.trim()}
                    title="Save current project as JSON file"
                >
                    <span className='btn-icon'>💾</span> Save Project
                </button>

                {/* Load Button */}
                <label
                    className={`btn btn-outline-primary btn-sm w-100 ${disabled ? 'disabled' : ''}`}
                    title="Load project from JSON file"                
                >
                    <span className="btn-icon">📂</span> Load Project
                    <input
                        type="file"
                        accept=".json,application/json"
                        onChange={handleFileChange}
                        style={{ display: 'none'}}
                        disabled={disabled}
                    />
                </label>
                {fileName && (
                    <small className="text-muted d-block mt-2">
                        Selected: {fileName}
                    </small>
                )}
            </div>

            {/* Information Box */}
            <div className="project-info-box mt-3">
                <small className="text-muted">
                    <strong>Tip:</strong> Projects are saved as JSON files containing
                    <ul className="mb-0 mt-1">
                        <li>Your tune's code</li>
                        <li>Part states (ON/HUSH/SOLO)</li>
                        <li>BPM settings</li>
                    </ul>
                </small>
            </div>
        </div>
    );
}

export default ProjectManager;