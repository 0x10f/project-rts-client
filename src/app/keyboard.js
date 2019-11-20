export class Keyboard {
    constructor(element) {
        this.element = element;

        this.pressed = new Set();
        this.queue = [];

        this.element.addEventListener("keypress", this.handleKeyPress.bind(this), true);
        this.element.addEventListener("keydown", this.handleKeyDown.bind(this));
        this.element.addEventListener("keyup", this.handleKeyUp.bind(this));
    }

    isPressed(keys) {
        for (let k of keys) {
            if (!this.pressed.has(k)) {
                return false;
            }
        }
        return true;
    }

    handleKeyPress(event) {
        this.queue.push(event.key);
    }

    handleKeyDown(event) {
        this.pressed.add(event.key);
    }

    handleKeyUp(event) {
        this.pressed.delete(event.key);
    }

    reset() {
        this.queue.length = 0;
    }
}