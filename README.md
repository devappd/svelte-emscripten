# svelte-emscripten

Use your C++/WebAssembly program as a Svelte component.

This adapts a WebAssembly module compiled with [Emscripten](https://emscripten.org) to interact
with your Svelte application.

## How to Use

When you compile your program in Emscripten, use the output filetype `*.js`
and use the linker flags below. These are required to adapt your program into component form:

```sh
    -s MODULARIZE=1

    -s ENVIRONMENT='web'

    -s EXTRA_EXPORTED_RUNTIME_METHODS="['specialHTMLTargets',
           'JSEvents', 'GL', 'callMain', 'abort']"
```

Then, use the component in your Svelte app:

```js
import { default as Emscripten } from 'svelte-emscripten';
import { default as module } from './module.js';

<Emscripten
  module={module}
  canvas={true}
  console={false}
  verticalOrientation={false}
  options={
    { 
      autorun: true,
      wasmPath: 'path/to/module.wasm'
    }
  }
/>
```

## Component Properties

|Parameter|Default|Description
|---------|-------|-----------
|`module`|*required*|The module from your program JS.
|`canvas`|`true`|Display the canvas.
|`console`|`true`|Display the console textbox.
|`verticalOrientation`|`false`|If displaying both canvas and console, display them top-to-bottom instead of left-to-right.
|`options`|`{}`|An object with extra parameters for the runtime; see below.

### Runtime Options

|Option|Default|Description
|---------|-------|-----------
|`autorun`|`false`|Run `main()` immediately upon component mount.
|`global`|`false`|Listen to input events on the whole window, not just when this component is focused.
|`initialModule`|`{}`|An object containing your custom properties to initialize the Module.
|`wasmPath`|`""`|A relative or absolute URL to the WASM binary. If relative, the base directory is where the bundle JS is located on your server. If empty, the default is the filename you used when compiling your program.

## License

MIT License, see LICENSE.
