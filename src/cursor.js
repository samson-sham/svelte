/**
 * Cursor that follows the insertion behaviour by
 * sticking to same ending offset
 */
export default class Cursor {
    /**
     * @constructor
     * @param {Text} container 
     * @param {number} endOffset 
     */
    constructor(container, endOffset) {
        this.container = container;
        this.endOffset = endOffset;
    }
    /**
     * @returns {Range}
     */
    getRange() {
        const range = document.createRange();
        // Insertion behaviour
        range.setStart(
            this.container, 
            this.container.length === void 0 ? 1 : this.container.length - this.endOffset
        );
        range.collapse(true);
        return range;
    }
}