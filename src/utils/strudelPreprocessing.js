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
export function preprocess(text, partState){

}