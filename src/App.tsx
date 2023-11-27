import { useState, useEffect } from "react";
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
import useSWR from "swr";

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

type Variables = Record<string, object>;

const useVariables = (initialData?: Variables) => {
  const [variables, setVariables] = useState<Variables>(initialData ?? {});

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

  return { variables, setVariable, deleteVariable, setVariables };
};

const useRenderer = (template: string, variables: Variables) => {
  const [renderResult, setRenderResult] = useState("");

  useEffect(() => {
    render(template, variables)
      .then((r) => {
        setRenderResult(r);
      })
      .catch((e) => {
        setRenderResult(e.message);
      });
  }, [variables, template]);

  return { renderResult };
};

const deserializeData = () => {
  const url = new URL(window.location.href);
  const data = url.searchParams.get("data");
  if (!data) {
    return;
  }
  return import("./logics/data-serializer.ts").then(({ deserializeData }) =>
    deserializeData(data).then((d) => {
      const { variables, template } = JSON.parse(d);
      return { variables, template };
    }),
  );
};

const RendererForm = (props: {
  initialTemplate: string | undefined;
  initialVariables: Variables | undefined;
}) => {
  const [addVariableName, setAddVariableName] = useState("");
  const [addVariableValue, setAddVariableValue] = useState("");

  const [template, setTemplate] = useState(
    props.initialTemplate ??
      `
{%- for product in products -%}
  {{ product.name }} is {{ product.price | times: 0.8 | money }} yen{% if forloop.last %}.{% else %}, {% endif %}
{%- endfor -%}
  `.trim(),
  );

  const { variables, setVariable, deleteVariable } = useVariables(
    props.initialVariables ?? initialDummyData,
  );

  const { renderResult } = useRenderer(template, variables);

  return (
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
                message.error(e instanceof Error ? e.message : "unknown error");
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

      <Button
        style={{ marginTop: "1rem" }}
        onClick={async () => {
          const { serializeData } = await import("./logics/data-serializer.ts");
          const data = await serializeData({
            variables,
            template,
          });
          const url = new URL(window.location.href);
          url.searchParams.set("data", data);

          return navigator.clipboard.writeText(url.toString()).then(() => {
            message.success("Copied!");
          });
        }}
      >
        Copy with Data
      </Button>
    </Form>
  );
};

export const App = () => {
  const [isDataReady, setIsDataReady] = useState(false);
  const { data: dataFromUrl, isLoading } = useSWR(
    "dataFromUrl",
    deserializeData,
    {
      revalidateOnMount: true,
      refreshWhenHidden: false,
      refreshWhenOffline: false,
      refreshInterval: 0,
      errorRetryCount: 0,
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  useEffect(() => {
    if (isLoading) {
      return;
    }
    setIsDataReady(true);
  }, [isLoading]);

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
        <Typography.Title style={{ color: "white", margin: 0 }}>
          Liquid Renderer UI
        </Typography.Title>
      </Layout.Header>

      <Layout.Content style={{ padding: "1rem" }}>
        {isDataReady && (
          <RendererForm
            initialVariables={dataFromUrl?.variables}
            initialTemplate={dataFromUrl?.template}
          />
        )}
      </Layout.Content>
    </Layout>
  );
};
