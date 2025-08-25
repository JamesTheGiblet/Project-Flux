/**
 * Asynchronously loads the mod manifest from the server.
 * @returns {Promise<Object|null>} A promise that resolves to the mod manifest object, or null if loading fails.
 */
export async function loadModManifest() {
    try {
        // The manifest is expected to be in the `mods` directory.
        const response = await fetch('mods/mod-manifest.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const modManifest = await response.json();
        console.log('Mod manifest loaded successfully:', modManifest);
        return modManifest;
    } catch (error) {
        console.error('Could not load mod manifest:', error);
        return null;
    }
}

/**
 * Asynchronously loads the text content of a mod script from its path.
 * This is used to populate the text editors in the UI.
 * @param {string} path - The path to the mod script.
 * @returns {Promise<string|null>} A promise that resolves to the script's code as a string, or null if loading fails.
 */
export async function loadModCode(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.text();
    } catch (error) {
        console.error(`Failed to load mod code from ${path}:`, error);
        return null;
    }
}
