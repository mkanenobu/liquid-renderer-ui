import { Liquid } from "liquidjs";

const liquidEngine = new Liquid();

export const render = async (template: string, data: object) => {
  return liquidEngine.parseAndRender(template, data);
};
