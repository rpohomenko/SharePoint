interface String {
    removePrefix(prefix: string): string;
    format(fmt: string, ...args: string[]): string;
    replaceAll(search: string, replacement: string): string;
    trunc(n: number);
    startsWith(search: string, start?: number);
    endsWith(search: string, start?: number);
    includes(search: string, start?: number);
    replaceLast(search: string, replacement: string);
    removePostfix(search: string): string;
}

String.prototype.removePrefix = String.prototype.removePrefix || function (prefix) {
    const hasPrefix = this.indexOf(prefix) === 0;
    return hasPrefix ? this.substr(prefix.length) : this.toString();
};

String.prototype.format = String.prototype.format ||
    function () {
        let fmt = this;
        let args = arguments;
        if (fmt) {
            if (!fmt.match(/^(?:(?:(?:[^{}]|(?:\{\{)|(?:\}\}))+)|(?:\{[0-9]+\}))+$/)) {
                throw new Error('invalid format string.');
            }
            return fmt.replace(/((?:[^{}]|(?:\{\{)|(?:\}\}))+)|(?:\{([0-9]+)\})/g, (m, str, index) => {
                if (str) {
                    return str.replace(/(?:{{)|(?:}})/g, mm => mm[0]);
                } else {
                    if (index >= args.length) {
                        throw new Error('argument index is out of range in format');
                    }
                    return args[index];
                }
            });
        }
        return fmt;
    };

String.prototype.replaceAll = String.prototype.replaceAll ||
    function (search, replacement) {
        var target = this;
        return target.split(search).join(replacement);
    };

String.prototype.trunc = String.prototype.trunc ||
    function (n) {
        var target = this;
        return String(target.length > n ? target.substring(0, n - 1) + '...' : target);
    };

if (!String.prototype.startsWith) {
    Object.defineProperty(String.prototype, 'startsWith', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (searchString, position) {
            position = position || 0;
            return this.indexOf(searchString, position) === position;
        }
    });
}

if (!String.prototype.endsWith) {
    Object.defineProperty(String.prototype, 'endsWith', {
        value: function (searchString, position) {
            var subjectString = this.toString();
            if (position === undefined || position > subjectString.length) {
                position = subjectString.length;
            }
            position -= searchString.length;
            var lastIndex = subjectString.indexOf(searchString, position);
            return lastIndex !== -1 && lastIndex === position;
        }
    });
}

if (!String.prototype.includes) {
    String.prototype.includes = function (search, start) {
        'use strict';
        if (typeof start !== 'number') {
            start = 0;
        }

        if (start + search.length > this.length) {
            return false;
        } else {
            return this.indexOf(search, start) !== -1;
        }
    };
}

String.prototype.replaceLast = String.prototype.replaceLast ||
    function (search, replacement) {
        var pos = this.lastIndexOf(search);
        return this.substring(0, pos) + replacement + this.substring(pos + 1);
    };

if (!String.prototype.removePostfix) {
    String.prototype.removePostfix = function (search) {
        'use strict';
        if (this.endsWith(search)) {
            return this.substring(0, this.length - search.length);
        }
        return this;
    };
}