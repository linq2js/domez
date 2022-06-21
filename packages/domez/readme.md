- [`DOMEZ`](#domez)
  - [Installation](#installation)
  - [Features](#features)
  - [Motivation](#motivation)
  - [Recipes](#recipes)
    - [Hello World](#hello-world)
    - [Simple Todo App](#simple-todo-app)
  - [Caveats](#caveats)
    - [Do not use self closing tag](#do-not-use-self-closing-tag)

# `DOMEZ`

A tiny lib for DOM rendering

## Installation

**with NPM**

```bash
npm i domez --save
```

**with YARN**

```bash
yarn add domez
```

## Features

- No boilerplate
- No bundler
- Tiny size (5KB)

## Motivation

There are many frameworks for DOM manipulation like React, Angular, Vue, etc. they are difficult to learn and cumbersome. Domez was born to make it easier to handle the DOM instead of using Vanilla JS. Domez also makes debugging convenient and easy. It is also compatible with many CSS Frameworks like Tailwind JS, Bootstrap JS

## Recipes

### Hello World

With DOMEZ

```js
import { render } from "domez";

// define App block builder, the builder returns HTML template that will be rendered into the container
const App = ({ ref }) => {
  // handle button click event
  const buttonRef = ref({ onclick: () => alert("Hello World. " + new Date()) });
  return `<button ${buttonRef}>Greeting</button>`;
};

// use body as rendering container
render(document.body, App);
```

Compare to Vanilla JS

```js
const App = () => {
  document.body.innerHTML = `<button id="greeting">Greeting</button>`;
  document.getElementById("greeting").onclick = () =>
    alert("Hello World. " + new Date());
};

App();
```

As you see, if we use Vanilla JS, the app code looks verbose, hard to mainternant and extend. Let's see complex example

### Simple Todo App

```js
import { render } from "domez";

const Todo = ({ ref }, todo) => {
  // a block builder can return a controller object
  // the controller object must have template property, it uses to render the block
  return {
    // expose the todo object for external access
    todo,
    template: `<div ${ref({ onclick: todo.onRemove })}>${todo.id}: ${
      todo.title
    }</div>`,
  };
};

const App = ({ list, ref }) => {
  let uniqueId = 1;
  const inputRef = ref();
  // create a element list and specific builder for each item
  const todoList = list(Todo);
  const handleAdd = () => {
    const id = uniqueId++;
    // inputRef() returns current ref of target element
    const title = inputRef().value;
    // remove an list item that has id equals to current todo id
    // the list item is block controller that returns from block builder function
    const onRemove = () =>
      todoList.remove((todoController) => todoController.todo.id === id);
    // this param will be passed to Todo builder as second parameter
    // after creating the child block, the list will store the block controller for later use
    const param = { id, title, onRemove };
    todoList.push(param);
    inputRef().value = "";
    inputRef().focus();
  };

  return `
  <div>
    <input ${inputRef} /><button ${ref({ onclick: handleAdd })}>Add</button>
    ${todoList}
  </div>
  `;
};

render(document.body, App);
```

Compare to Vanilla JS

```js
const createTodo = (todo) => {
  const div = document.createElement("div");
  div.onclick = () => div.remove();
  div.textContent = `${todo.id} ${todo.title}`;
  return div;
};

const App = () => {
  let uniqueId = 0;

  document.body.innerHTML = `
    <input id="input"/><button id="button">Add</button>
    <div id="list"></div>
    `;
  const $input = document.getElementById("input");
  const $button = document.getElementById("button");
  const $list = document.getElementById("list");

  $button.onclick = () => {
    const id = uniqueId++;
    const title = $input.value;
    const $todo = createTodo({ id, title });
    $list.appendChild($todo);
    $input.value = "";
    $input.focus();
  };
};

App();
```

## Caveats

### Do not use self closing tag

Some frameworks accept self-closing tag for shorter code but this might lead to unexpected error if you use it with DOMEZ

WRONG

```js
template = `<h1/>`;
```

RIGHT

```js
template = `<h1></h1>`;
// it's ok
template = `<input/>`;
```
