import { Context, html, render } from "./main";

const container = document.body;

test("should render block properly", () => {
  const App = () => html`<h1>Hello World</h1>`;
  render(container, App);
  expect(container.textContent).toBe("Hello World");
});

test("should render block with param properly", () => {
  const App = (_: Context, text: string) => html`<h1>${text}</h1>`;
  render(container, App, "Hello World");
  expect(container.textContent).toBe("Hello World");
});
