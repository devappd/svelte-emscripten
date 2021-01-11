<script>
  import { onDestroy, onMount } from 'svelte';
  import { ModuleManager } from './emscripten-component-base';
  import { WorkerManager } from './emscripten-component-base';
  import ResizeObserver from 'svelte-resize-observer';

////////////////////////////////////////////////////////////////////////
// INPUTS
////////////////////////////////////////////////////////////////////////

  /** Emscripten Module factory to use. Either this or `worker` is required. **/
  export let module = null;

  /** Emscripten Worker script to use, in string form. Either this or `module` is required. */
  export let worker = null;

  /** Display canvas output. Default: true */
  export let canvas = true;

  /** Display console output. Default: true */
  export let console = true;

  /** When displaying both canvas and console, show the elements vertically instead of
   ** horizontally. Default: false */
  export let verticalOrientation = false;

  /** Toggle manager options. See manager.js for descriptions. Default: {} */
  export let options = {};

////////////////////////////////////////////////////////////////////////
// COMPONENT VARIABLES
////////////////////////////////////////////////////////////////////////

  let _componentElement;
  let _managerInstance;
  let _canvasElement;
  let _consoleElement;

  function checkInitialized() {
    return !!_managerInstance;
  }

  function validateProps() {
    if (!module && !worker)
      throw new RangeError('Either `module` or `worker` must be specified.');
    else if (module && worker)
      throw new RangeError('Specify either `module` or `worker`, not both.');
    
    if (!module && typeof worker !== 'string')
      throw new RangeError('Worker must be input as a JS script that is stored as a string.');
  }

////////////////////////////////////////////////////////////////////////
// INITIALIZATION
////////////////////////////////////////////////////////////////////////

  export async function initialize() {
    if (checkInitialized()) {
      console.warn('Module already initialized!');
      return;
    }

    let userOptions = {
      ...options,
      captureFocusOnComponent: !options.global,
      captureTabKey: !!options.global,
    };

    if (worker)
      await initializeManagerForWorker(userOptions);
    else
      await initializeManagerForModule(userOptions);
  }

  async function initializeManagerForModule(userOptions) {
    _managerInstance = await ModuleManager.initialize(
      module,
      _componentElement, _canvasElement, _consoleElement,
      userOptions
    );
  }

  async function initializeManagerForWorker(userOptions) {
    _managerInstance = await WorkerManager.initialize(
      worker,
      _componentElement, _canvasElement, _consoleElement,
      userOptions
    );
  }

////////////////////////////////////////////////////////////////////////
// RUNTIME METHODS
////////////////////////////////////////////////////////////////////////

  export function abort(reason) {
    if (checkInitialized())
      _managerInstance.abort(reason);
  }

  export async function reset() {
    abort();
    _managerInstance = null;
    await initialize();
  }

  export async function callMain(args) {
    if (checkInitialized())
      await _managerInstance.callMain(args);
  }

  export async function pauseMainLoop() {
    if (checkInitialized())
      await _managerInstance.pauseMainLoop();
  }

  export async function resumeMainLoop() {
    if (checkInitialized())
      await _managerInstance.resumeMainLoop();
  }

  export async function requestFullscreen() {
    if (checkInitialized())
      return await _managerInstance.requestFullscreen();
  }

  export async function exitFullscreen() {
    if (checkInitialized())
      return await _managerInstance.exitFullscreen();
  }

////////////////////////////////////////////////////////////////////////
// COMPONENT EVENT HANDLERS
////////////////////////////////////////////////////////////////////////

  export function _onResizeCanvas(e) {
    if (checkInitialized()) {
      let resizeEntry = e.detail;
      _managerInstance.onResizeCanvas(resizeEntry);
    }
  }

  onMount(async () => {
    validateProps();
    await initialize();

    if (options.autorun)
      callMain();
  });
  
  onDestroy(() => {
    abort('Emscripten component dismounted');
  });
</script>

<!--
@component
Run an Emscripten `Module` runtime within this reusable component.

- Usage:
  ```jsx
  <Emscripten
    module={YourModule} or worker={YourWorkerString}
    canvas={true}
    console={true}
    verticalOrientation={false}
    options={ {
      autorun: false,
      global: false,
      initialModule: {},
      wasmPath: '' // relative or absolute URL to WASM file
    } }
    />
  ```
-->
<div
  class="emscriptenMain"
  class:portrait={verticalOrientation}
  bind:this={_componentElement}
  tabindex={canvas ? '0' : (console ? '-1' : '0')}
>
  {#if module === undefined}
    Error: No Emscripten Module is defined!
  {:else}
    <div class="canvasContainer" class:hide={!canvas}>
      <canvas
        bind:this={_canvasElement}
        class:hide={!canvas}
        oncontextmenu="event.preventDefault()"
        tabindex="-1"
      ></canvas>
    </div>

    <textarea
      bind:this={_consoleElement}
      class:hide={!console}
      rows="8"
    ></textarea>

    <ResizeObserver
      elementResize={_canvasElement}
      on:resize={_onResizeCanvas}
    />
  {/if}
</div>

<style>
  .emscriptenMain {
    display: flex;
  }

  .canvasContainer, textarea {
    flex: 1;
    margin: 0;
  }

  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }

  .hide {
    display: none;
  }

  .portrait {
    flex-direction: column;
  }
</style>