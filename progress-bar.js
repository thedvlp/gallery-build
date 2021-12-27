class Progress {
    constructor(text, max) {
        this.count = 0;
        this.max = max;
        this.text = text;
    }

    getPercent() { return (this.count * 100 / this.max) | 0; }
    increment() {
        this.count++;
        process.stdout.cursorTo(0);
        process.stdout.write('\r' + this.text + ' ' + this.getPercent() + "%");
        if (this.count === this.max) console.log('');
    }
}

class SimpleProgress {
    constructor(text) {
        this.count = 0;
        this.text = text;
    }

    increment() {
        this.count++;
        process.stdout.cursorTo(0);
        process.stdout.write('\r' + this.text + ' ' + this.count);
    }
    stop() {
        console.log('');
    }
}

module.exports = {
    Progress,
    SimpleProgress
};