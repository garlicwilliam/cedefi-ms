import { App } from "@tinyhttp/app";
import { cors } from "@tinyhttp/cors";
import { logger } from "@tinyhttp/logger";
import { json } from "milliparsec";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { failRes, successObj } from "./util";

function isItemField(qKey: string, itemFields: string[]): string | false {
  if (itemFields.indexOf(qKey) >= 0) {
    return qKey;
  }

  const ops: string[] = ["lte", "gte", "lt", "gt"].map(
    (op: string) => `_${op}`,
  );

  const keys: string[] = ops
    .map((op: string) => {
      return qKey.endsWith(op) ? qKey.slice(0, -op.length) : null;
    })
    .filter(Boolean)
    .map((one) => one as string);

  if (keys.length === 0) {
    return false;
  }

  const key: string = keys[0] as string;

  if (itemFields.indexOf(key) >= 0) {
    return key;
  }

  return false;
}

function filterItems(items: any[], queryObj: any, itemFields: string[]): any[] {
  const qKeys: string[] = Object.keys(queryObj);

  console.log("queryObj=", queryObj);

  qKeys.forEach((qKey: string): void => {
    const itemField: string | false = isItemField(qKey, itemFields);
    if (itemField) {
      const value: string | string[] = queryObj[qKey];

      const matchValueFun = (
        itemValue: any,
        searchValue: string | string[],
      ): boolean => {
        if (Array.isArray(searchValue)) {
          return searchValue.indexOf(itemValue.toString()) >= 0;
        } else {
          return itemValue == searchValue;
        }
      };

      if (qKey === itemField) {
        // equal
        items = items.filter((item) => matchValueFun(item[itemField], value));
      } else if (qKey.endsWith("_gte")) {
        items = items.filter((item) => item[itemField] >= value);
      } else if (qKey.endsWith("_lte")) {
        items = items.filter((item) => item[itemField] <= value);
      } else if (qKey.endsWith("_gt")) {
        items = items.filter((item) => item[itemField] > value);
      } else if (qKey.endsWith("_lt")) {
        items = items.filter((item) => item[itemField] < value);
      }
    }
  });

  return items;
}

export async function createJsonServer(
  dbFile: string,
  extraRoutes?: (app: App, db: Low<any>) => void,
) {
  const app = new App();

  const db: Low<any> = new Low(new JSONFile(dbFile), {});
  await db.read();

  app.use(
    cors({
      origin: "*", // 允许的来源
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE"], // 允许的方法
      allowedHeaders: ["Content-Type", "Authorization"], // 允许的头
      exposedHeaders: ["X-Custom-Header"], // 可被浏览器访问的响应头
      credentials: true, // 允许携带 cookie
    }),
  );
  app.use(logger());
  app.use(json() as any);

  if (extraRoutes) {
    extraRoutes(app, db);
  }

  // 自动 CRUD
  for (const key in db.data) {
    const items: any[] = db.data[key];

    app.get(`/${key}`, (req, res) => {
      req.query = req.query || {};
      let newItems = [...items];
      newItems = filterItems(newItems, req.query, Object.keys(items[0] || {}));

      const offset: number = parseInt(req.query.offset as string) || 0;
      const limit: number = parseInt(req.query.limit as string) || 100;
      const end: number = offset + limit;

      const pagedData = Array.isArray(newItems)
        ? newItems.slice(offset, end)
        : newItems;

      res.json({
        isOK: true,
        message: "success",
        data: {
          list: pagedData,
          total: newItems.length,
        },
      });
    });

    app.get(`/${key}/:id`, (req, res) => {
      const one = items.find((one: any): boolean => one.id == req.params.id);

      if (one) {
        res.status(200).send(successObj(one)).end();
      } else {
        res.status(404).send(failRes("Not Found")).end();
      }
    });

    app.post(`/${key}`, async (req, res) => {
      items.push(req.body);
      await db.write();
      res.status(201).json({
        status: 201,
        message: "created",
        data: req.body,
      });
    });

    app.put(`/${key}/:id`, async (req, res) => {
      const index = items.findIndex((i: any) => i.id == req.params.id);
      if (index !== -1) {
        items[index] = req.body;
        await db.write();
        res.json({ status: 200, message: "updated", data: req.body });
      } else {
        res.status(404).json({ status: 404, message: "not found" });
      }
    });

    app.delete(`/${key}/:id`, async (req, res) => {
      const index = items.findIndex((i: any) => i.id == req.params.id);
      if (index !== -1) {
        const removed = items.splice(index, 1)[0];
        await db.write();
        res.status(200).send(successObj(removed)).end();
      } else {
        res.status(404).send(failRes("Not Found")).end();
      }
    });
  }

  return app;
}
