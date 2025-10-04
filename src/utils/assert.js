/**
    * @function
    * @param {boolean} condition - in which case trigger error
    * @param {string} message - message to show 
    * @returns {void}
    */
export function assert(condition, message) {
    if (!condition) {
        const error = new Error(message);
        error.name = 'AssertionError';
        throw error;
    }
}
