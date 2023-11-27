import { expect, test } from "vitest";
import { render } from "./render-liquid.ts";

test("render function renders liquid", async () => {
  const renderResult = await render("{{ name }}", { name: "John" });
  expect(renderResult).toBe("John");

  const renderResult2 = await render("{{ products | json }}", {
    products: { a: 1, b: "2" },
  });
  expect(renderResult2).toBe('{"a":1,"b":"2"}');

  const renderResult3 = await render(
    `
{%- for product in products -%}
{{ product.name }} is {{ product.price | times: 0.8 | money }}{% if forloop.last %}.{% else %},{% endif %}
{%- endfor -%}`.trim(),
    {
      products: [
        { name: "Apple", price: "100" },
        { name: "Banana", price: "200" },
      ],
    },
  );
  expect(renderResult3).toBe("Apple is 80,Banana is 160.");
});
