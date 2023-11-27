import { useState, useMemo, useEffect } from "react";
import "./App.css";
import {
  Typography,
  Form,
  Input,
  Flex,
  Layout,
  Button,
  message,
  Table,
} from "antd";
import { render } from "./logics/render-liquid.ts";

const initialDummyData = {
  products: [
    {
      name: "apple",
      price: 100,
    },
    {
      name: "orange",
      price: 200,
    },
  ],
};

export const App = () => {
  const [template, setTemplate] = useState(
    `
{%- for product in products -%}
  {{ product.name }} is {{ product.price | times: 0.8 | money }} yen{% if forloop.last %}.{% else %}, {% endif %}
{%- endfor -%}
  `.trim(),
  );
  const [renderResult, setRenderResult] = useState("");

  const [variables, setVariables] =
    useState<Record<string, object>>(initialDummyData);

  const [addVariableName, setAddVariableName] = useState("");
  const [addVariableValue, setAddVariableValue] = useState("");

  useEffect(() => {
    render(template, variables)
      .then((r) => {
        setRenderResult(r);
      })
      .catch((e) => {
        setRenderResult(e.message);
      });
  }, [variables, template]);

  const setVariable = (key: string, value: string) => {
    try {
      JSON.parse(value);
    } catch (_e) {
      throw new Error("Failed to add variable, Value is invalid JSON");
    }
    setVariables((prev) => ({ ...prev, [key]: JSON.parse(value) }));
  };

  const deleteVariable = (key: string) => {
    setVariables((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  return (
    <Layout style={{ height: "100vh", width: "100%" }}>
      <Layout.Header
        style={{
          top: 0,
          width: "100%",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Typography.Title style={{ color: "white" }}>
          Liquid Template Renderer
        </Typography.Title>
      </Layout.Header>

      <Layout.Content style={{ padding: "1rem" }}>
        <Form>
          <Form.Item label={"Template"}>
            <Input.TextArea
              style={{ height: "8rem" }}
              value={template}
              onChange={(e) => {
                setTemplate(e.target.value);
              }}
            />
          </Form.Item>

          <Form.Item label={"Render Result"}>
            <Input.TextArea
              style={{ height: "8rem" }}
              value={renderResult}
              contentEditable={false}
            />
          </Form.Item>

          <div>
            <Typography.Text>Add Variable</Typography.Text>
            <Flex gap={"1rem"}>
              <Form.Item label={"Variable Name"}>
                <Input
                  value={addVariableName}
                  onChange={(e) => {
                    setAddVariableName(e.target.value);
                  }}
                />
              </Form.Item>
              <Form.Item label={"Variable JSON Value"}>
                <Input
                  value={addVariableValue}
                  onChange={(e) => {
                    setAddVariableValue(e.target.value);
                  }}
                />
              </Form.Item>
              <Button
                onClick={() => {
                  try {
                    setVariable(addVariableName, addVariableValue);
                    setAddVariableName("");
                    setAddVariableValue("");
                  } catch (e) {
                    message.error(
                      e instanceof Error ? e.message : "unknown error",
                    );
                  }
                }}
              >
                Add
              </Button>
            </Flex>
          </div>

          <div>
            <Typography.Text>Variables</Typography.Text>

            <Table
              pagination={false}
              dataSource={Object.entries(variables).map(([key, value]) => ({
                key,
                value: JSON.stringify(value, undefined, 2),
              }))}
              columns={[
                {
                  title: "Name",
                  key: "key",
                  dataIndex: "key",
                },
                {
                  title: "Value",
                  key: "value",
                  dataIndex: "value",
                },
                {
                  key: "action",
                  render: (_, record) => (
                    <Button
                      danger
                      onClick={() => {
                        deleteVariable(record.key);
                      }}
                    >
                      Delete
                    </Button>
                  ),
                },
              ]}
            />
          </div>
        </Form>
      </Layout.Content>
    </Layout>
  );
};
