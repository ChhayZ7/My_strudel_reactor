// Prokect Management Utilities

// Handle saving and loading Strudel projects as JSON files.
// Provides validation, serilisation, and file I/O functionality.

// Creates a project object from current app state
export function createProject(code, partStates, bpm, projectName = "Untitled Project"){
    return {
        metadata: {
            name: projectName,
            versio: "1.0",
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            generator: "Strudel Music Coder"
        },
        settings: {
            bpm: bpm,
            // volume:
        },
        code: {
            raw: code,
            // Extract parts from code for preview
            parts: extractPartsMetadata(code)
        },
        partStates: partStates
    };
}

// Extracts part metadata from code for preview purposes
function extractPartsMetadata(code){
    const partRegex = /<part:(\w+)>([\s\S]*?)<\/part:\1>/g;
    const parts = [];
    let match;

    while ((match = partRegex.exec(code)) !== null) {
        const content = match[2].trim();
        parts.push({
            name: match[1],
            lineCount: content.split('\n').length,
            preview: content.substring(0, 50) + (content.length > 50 ? "..." : "")
        });
    }
    return parts;
}

// Svaes project to JSON file and triggers download
export function saveProjectToFile(project, filename){
    // Update modified timestamp
    project.metadata.modified = new Date().toISOString();

    // Convert to pretty-printed JSON
    const jsonString = JSON.stringify(project, null, 2);

    // Create blob with JSON content
    const blob = new Blob([jsonString], {type: 'application/json'});

    // Create downlooad URL
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url

    // Set filename
    link.download = filename ? `${sanitizeFileName(filename)}.json` : `${sanitizeFileName(project.metadata.name)}.json`;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Cleanup blob URL
    URL.revokeObjectURL(url)

    console.log(`Project Svaed: ${link.download}`)
    return link.download
}

// Sanitizes filename for safe file system use
// Remove special characters and replaces spaces with underscores
function sanitizeFileName(name){
    return name.replace(/[^a-z0-9\s\-_]/gi, '') // Remove special chars
                .replace(/\s+/g, '_') // Replace spaces with underscores
                .toLowerCase()
                .substring(0, 50); // Length limit
}

// Loads project from JSON file
export async function loadProjectFromFile(file){
    return new Promise((resolve, reject) => {
        // Validate file type
        if (!file.name.endsWith('.json')){
            reject(new Error('Please select a JSON file'))
            return
        }

        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const jsonString = e.target.result;
                const project = JSON.parse(jsonString);

                // Validate project structure
                const validation = validateProject(project);
                if (!validation.valid){
                    reject(new Error(`Invalid project file:\n${validation.errors.join('\n')}`))
                    return;
                }
                console.log(`Project loaded: ${project.metadata.name}`);
                resolve(project);
            } catch (error) {
                if (error instanceof SyntaxError){
                    reject(new Error(`Invalid JSON format: ${error.message}`));
                } else {
                    reject(error);
                }
            }
        };

        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };

        reader.readAsText(file);
    })
}

export function validateProject(project){
    const errors = [];

    // Check if project is an object
    if (!project || typeof project !== 'object'){
        errors.push("Project must be an object");
        return { valid: false, errors};
    }

    // Check required metadata fields
    if (!project.metadata){
        errors.push("Missing 'metadata' field");
    } else {
        if (!project.metadata.name){
            errors.push("Missing 'metadata.name'");
        }
    }

    // Check code field
    if (!project.code){
        errors.push("Missing 'code' field");
    } else {
        if (typeof project.code.raw !== 'string'){
            errors.push("'code.raw' must be a string");
        }
        if (!project.code.raw || project.code.raw.trim() === ''){
            errors.push("'code.raw' cannot be empty")
        }
    }

    // Check settings
    if (!project.settings){
        errors.push("Missing 'settings' field");
    } else {
        if (typeof project.settings.bpm !== 'number'){
            errors.push("'settings.bpm' must be a number");
        } else {
            const bpm = project.settings.bpm;
            if (bpm < 20 || bpm > 300){
                errors.push(`BPM out of valid range (20-300): ${bpm}`)
            }
        }
    }

    // Check part states
    if (!project.partStates || typeof project.partStates !== 'object'){
        errors.push("Missing or invalid 'partStates' field");
    } else {
        // Validate each part state
        const validStates = ['on', 'hush', 'solo'];
        for (const [partName, state] of Object.entries(project.partStates)) {
            if (!validStates.includes(state)) {
                errors.push(`Invalid state for part '${partName}': ${state} (must be 'on', 'hush', or 'solo')`);
            }
        }
    }

    return {
        valid: errors.length === 0,
        errors: errors
    };
}

// Exports project state to JSON string
// Useful for copying to clipboard or sending to API
export function exportProjectJSON(project, pretty = false){
    return JSON.stringify(project, null, pretty ? 2 : 0);
}

// Imports project from JSON string
// Useful for pasting from clipboard or receiving from API
export function importProjectJSON(jsonString){
    try {
        const project = JSON.parse(jsonString);

        const validation = validateProject(project);
        if (!validation.valid){
            throw new Error(`Invalid projects:\n${validation.errors.join('\n')}`);
        }
        return project;
    } catch (error){
        if (error instanceof SyntaxError){
            throw new Error(`Failed to parse JSON: ${error.message}`);
        }
        throw error;
    }
}

// Gets a summary of the project for display
export function getProjectSummary(project){
    const partCount = Object.keys(project.partStates).length;
    const activePartCount = Object.values(project.partStates)
        .filter(state => state === 'on' || state === 'solo').length;

    return {
        name: project.metadata.name,
        bpm: project.settings.bpm,
        partCount,
        activePartCount,
        created: new Date(project.metadata.created).toLocaleDateString(),
        modified: new Date(project.metadata.modified).toLocaleTimeString()
    };
}