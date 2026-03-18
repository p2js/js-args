import { ArgProcessor } from ".";

const string_transformer = arg => arg;
export function string(): ArgProcessor {
    return string_transformer;
}

export function one_of(...options: string[]): ArgProcessor {
    return (arg: string) => {
        if (!options.includes(arg)) {
            throw `Must be one of: ${options.join(", ")}`;
        }
        return arg;
    }
}

export function not_one_of(...options: string[]): ArgProcessor {
    return (arg: string) => {
        if (options.includes(arg)) {
            throw `Must not be one of: ${options.join(", ")}`;
        }
        return arg;
    }
}

const boolean_transformer = arg => arg !== "false";
export function boolean(): ArgProcessor<boolean> {
    return boolean_transformer;
}

export function int(min = -Infinity, max = +Infinity): ArgProcessor<number> {
    return arg => {
        let int_arg = Number(arg);
        if (!isFinite(int_arg) || int_arg != Math.round(int_arg) || int_arg < min || int_arg > max) {
            throw `Must be an integer between ${min} and ${max}`;
        }
        return int_arg;
    }
}

export function float(min = -Infinity, max = +Infinity): ArgProcessor<number> {
    return arg => {
        let float_arg = Number(arg);
        if (isNaN(float_arg) || float_arg < min || float_arg > max) {
            throw `Must be a number between ${min} and ${max}`;
        }
        return float_arg;
    }
}

export function list(separator: string = ","): ArgProcessor<string[]> {
    return arg => arg.split(separator);
}

