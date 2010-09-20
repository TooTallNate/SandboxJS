SandboxJS
=========
### JavaScript "Sandboxes" for the web browser.

This script offers a very simple interface for JavaScript "Sandboxes".
Underneath, it uses the [magic power of `iframe`s][DeanEdwards] to create
new execution scopes for JavaScript to be evaluated inside of.

This could potentially be used as the backbone for browser-side:

 * Isolated scope module loading (could implement CommonJS on top of this).
 * Client-side HTML templates, with access to certain defined variables.
 * Defining custom JavaScript environments (APIs), then loading external
   _script_ files that interact with the custom API (abstracting the browser/DOM away).


API
---

    new Sandbox([bare:Boolean]) -> sandbox

Creates and returns new `Sandbox` instance. The `bare` parameter
defaults to _true_, and determines whether or not the sandbox environment
should attempt to have all it's extraneous browser/DOM objects removed from
the scope. Setting this to _false_ will keep functions like `alert`, and
`XMLHttpRequest` available for use inside the sandbox.

    sandbox.global -> Global

The `global` scope of the sandbox instance. This is a convenient way
to share instances of `Object`s across scopes, or prepare the sandbox
environment with properties that scripts can use.

    sandbox.eval(jsStr:String) -> ?

Calls `eval` on the given `String` inside the sandbox. Variables declared
inside the sandbox won't be accessible globally, and global variables won't
be visible inside the sandbox. The result of the `eval` is returned.

    sandbox.load(filename:String [, callback:Function])

Loads the JavaScript file `filename` and executes it into the sandbox. `callback`
is an optional function that gets invoked when the file has finished loading and
being evaluated, or an error occurs (like the file was not found).

    sandbox.loadSync(filename:String)

Synchronously loads the JavaScript file `filename` and executes it into the
sandbox. If there is an error while loading (like the file was not found),
then this function will throw. This function is highly discouraged, since synchronous network
activity blocks the browser, making it appear to _freeze_! Also, underneath
this function uses `XMLHttpRequest`s, which are restricted by the [Same Origin Policy][SameOriginPolicy].
In other words, this function will ONLY work with files from the SAME DOMAIN.

[DeanEdwards]: http://dean.edwards.name/weblog/2006/11/sandbox/
[SameOriginPolicy]: http://en.wikipedia.org/wiki/Same_origin_policy