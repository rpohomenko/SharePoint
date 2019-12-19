String.prototype.format = String.prototype.format ||
    function() {
        let fmt = this;
        let args = arguments;
        if (fmt) {
            if (!fmt.match(/^(?:(?:(?:[^{}]|(?:\{\{)|(?:\}\}))+)|(?:\{[0-9]+\}))+$/)) {
                throw new Error('invalid format string.');
            }
            return fmt.replace(/((?:[^{}]|(?:\{\{)|(?:\}\}))+)|(?:\{([0-9]+)\})/g, (m, str, index) => {
                if (str) {
                    return str.replace(/(?:{{)|(?:}})/g, m => m[0]);
                } else {
                    if (index >= args.length) {
                        throw new Error('argument index is out of range in format');
                    }
                    return args[index];
                }
            });
        }
        return fmt;
    }

String.prototype.replaceAll = String.prototype.replaceAll ||
    function(search, replacement) {
        var target = this;
        return target.split(search).join(replacement);
    };

String.prototype.trunc = String.prototype.trunc ||
    function(n) {
        var target = this;
        return String(target.length > n ? target.substring(0, n - 1) + '...' : target);
    };