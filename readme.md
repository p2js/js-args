# CL-args

A feature-complete, type safe and flexible command line argument parsing library for JavaScript.

```typescript
import { cl_args } from "cl-args";
import { boolean, string } from "cl-args/option-types";

const args = cl_args({
    verbose: { alias: "v", type: boolean() },
    name: { alias: "n", type: string(), default: "world" }
});

console.log(`Hello, ${args.name}!`);
if (args.verbose) console.log("Verbose mode enabled.");
```

```bash
$ node index.js -v=false --name "CLI"
Hello, CLI!
Verbose mode enabled.
```

## Parsing

Parsing supports:

- Bundling short options with `-` (All options except for the last ones must be boolean)
- `getopt` style short options immediately followed by their value, eg `-O3` or `-ifile.js`
- Assigning values with a `=` sign, eg `--letter=a`
- Using a standalone `--` to delimit options and values
- Treating negative numbers as values rather than flags (including `Infinity` and `-Infinity`)
- Optionally accepting multiple values for an option
- Automatic type conversion and validation via option-type processors
- Collecting positional arguments (standalone values) into the output array

The output object of `cl_args` is an array with the numeric indices corresponding to the standalone positional arguments, and additional fields for options that were passed (or that have a default value).

```typescript
const args = cl_args({
    recursive: { alias: "r", type: boolean() },
    depth: { type: int(), default: 1 }
});

console.log(args[0]);
console.log(args.recursive);
// $ node index.js -r --depth 3 path/to/dir
// args == [ 'path/to/dir', recursive: true, depth: 3 ]
```
```bash
$ node index.js -r --depth 3 path/to/dir
'path/to/dir'
true
```

## Error handling

By default, `cl-args` prints a descriptive error message to `stderr` and exits the process when it encounters invalid input.

```bash
# Missing value for non-boolean flag
$ node index.js --name
Argument error: Expected a value after option 'name' (Found nothing)

# Unrecognized option
$ node index.js --unknown
Argument error: Unrecognised option 'unknown'

# Type validation failure (from built-in processor)
$ node index.js --port=99999
Argument error: port: Must be an integer between 1 and 65535 (Received: '99999')
```

### Advanced usage

`cl-args` handles complex scenarios like multi-value flags and custom type validation out of the box.

```typescript
import { cl_args } from "cl-args";
import { int, list, boolean } from "cl-args/option-types";

const options = {
    port: { alias: "p", type: int(1, 65535), default: 8080 },
    tags: { type: list(), multiple: true },
    debug: { alias: "d", type: boolean() }
};

const args = cl_args(options);
```

```bash
$ node node index.js -p 3000 --tags=web,api prod --debug extra_value
['extra_value', port: 3000, tags: [['web', 'api'], 'prod'], debug: true]
```

### Configuration

The `cl_args` function accepts an optional configuration object:

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `collect_values` | `boolean` | `true` | Collect standalone values into the output array. |
| `collect_unknown_options` | `boolean` | `false` | Collect options not defined in the schema. |
| `allow_double_dash_delimeter` | `boolean` | `true` | Allow passing `--` to stop option parsing. |
| `argv` | `string[]` | `process.argv.slice(2)` | Array of arguments to parse. |
| `on_error` | `(msg: string) => void` | `standard_error` | Custom error handler. |

## Option types

The library includes several built-in processors in `cl-args/option-types`:

| Processor                | Description                                                 |
|            ---           |                           ---                               |
| `string()`               | Returns the argument as a string.                           |
| `boolean()`              | Returns `true` (unless value is `"false"`).                 |
| `int(min, max)`          | Validates and returns an integer between `min` and `max`.   |
| `float(min, max)`        | Validates and returns a number between `min` and `max`.     |
| `one_of(...options)`     | Ensures value is one of the provided strings.               |
| `not_one_of(...options)` | Ensures value is *not* one of the provided strings.         |
| `list(separator)`        | Splits a string into an array by `separator` (default `,`). |

### Custom option types

A flag type is simply a function that takes a `string` and returns a value of any type. If the input is invalid, it should throw an error message as a string.

```typescript
const absolutePath = (arg: string) => {
    if (!arg.startsWith("/")) throw "Must be an absolute path";
    return arg;
};

const args = cl_args({ path: { type: absolutePath } });
```

If a custom processor throws an error, the library catches it and appends the received value:

```bash
$ node index.js --path=./relative/path
Argument error: path: Must be an absolute path (Received: './relative/path')
```

## Help menu generation

This library can also be used to generate a flag table to use in help menus:

```typescript
import { help_string } from "cl-args";
import { boolean, string } from "cl-args/option-types";

const options = {
    verbose: { alias: "v", type: boolean(), description: "Show verbose output" },
    name: { alias: "n", type: string(), arg_label: "<name>", description: "Your name" }
};

console.log("Usage: my-app [options]\n");
console.log(help_string(options));
```

Output:
```text
Usage: my-app [options]

 -v, --verbose        Show verbose output
 -n, --name <name>    Your name
```

### Help configuration

The `help_string` generator can be customized with a `HelpConfig` object:

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `descriptions_only` | `boolean` | `false` | Only include options that have a description. |
| `option_format` | `util.InspectColor` | `undefined` | Color or style that will be passed to node's `util.styleText` to format the flag strings. |
| `spaces_before_option` | `number` | `1` | Padding before the flags. |
| `spaces_after_option` | `number` | `4` | Padding between flags and description. |
