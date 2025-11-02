// Helper functions

// Extract all parts from the tune's code
export function detectParts(code) {
    const partRegex = /<part:(\w+)>([\s\S]*?)<\/part:\1>/g;
    const parts = [];
    let match;
    
    while ((match = partRegex.exec(code)) !== null) {
      parts.push({
        name: match[1],
        fullMatch: match[0],
        content: match[2]
      });
    }
    
    return parts;
  }

// Preprocess code based on part states
export function preprocess(code, partStates) {
    let processed = code;
    
    // Check if any part is soloed
    const soloedParts = Object.entries(partStates)
      .filter(([_, state]) => state === 'solo')
      .map(([name, _]) => name);
    
    const hasSolo = soloedParts.length > 0;
    
    // Process each part based on its state
    Object.entries(partStates).forEach(([partName, state]) => {
      const partRegex = new RegExp(
        `<part:${partName}>([\\s\\S]*?)<\\/part:${partName}>`,
        'g'
      );
      
      processed = processed.replace(partRegex, (match, content) => {
        // If something is soloed
        if (hasSolo) {
          return state === 'solo' ? content : '_';
        }
        
        // No solo active, respect individual states
        return state === 'hush' ? '_' : content;
      });
    });
    
    return processed;
  }