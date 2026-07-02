import {
  action,
  mutation,
  query,
  internalAction,
  internalMutation,
  internalQuery,
  httpAction,
} from "../../_generated/server";
import type {
  ActionCtx,
  MutationCtx,
  QueryCtx,
} from "../../_generated/server";
import { api as rootApi, internal as rootInternal } from "../../_generated/api";
import type { Doc, Id } from "../../_generated/dataModel";

const namespace = ["features", "cms_lite"] as const;

type ModuleNamespace = Record<string, any>;
type ModuleProxy = Record<string, any>;

const getNamespace = <T>(root: T): ModuleNamespace =>
  namespace.reduce<ModuleNamespace>(
    (scope, segment) => (scope?.[segment as keyof ModuleNamespace] as ModuleNamespace | undefined) ?? {},
    (root as ModuleNamespace) ?? {},
  );

const cmsLiteApi = getNamespace(rootApi);
const cmsLiteInternal = getNamespace(rootInternal);

const createModuleNamespace = (source: ModuleNamespace): ModuleProxy =>
  new Proxy(
    {} as ModuleProxy,
    {
      get: (_target, module: PropertyKey) => {
        const moduleScope = source?.[module as keyof ModuleNamespace] as ModuleNamespace | undefined;
        if (!moduleScope) return undefined;
        return new Proxy(
          {} as ModuleProxy,
          {
            get: (_moduleTarget, prop: PropertyKey) => {
              const key = String(prop);
              if (key === "actions" || key === "mutations" || key === "queries") {
                const apiScope = moduleScope?.["api"] as ModuleNamespace | undefined;
                return apiScope?.[key as keyof ModuleNamespace];
              }
              return moduleScope?.[key as keyof ModuleNamespace];
            },
          },
        );
      },
    },
  );

const createShorthandProxy = (
  namespaceProxy: ModuleProxy,
  property: "actions" | "mutations" | "queries",
): ModuleProxy =>
  new Proxy(
    {} as ModuleProxy,
    {
      get: (_target, module: PropertyKey) => {
        const moduleScope = namespaceProxy?.[module as keyof ModuleProxy] as ModuleNamespace | undefined;
        return moduleScope?.[property] as ModuleProxy | undefined;
      },
    },
  );

export const api = createModuleNamespace(cmsLiteApi);
export const internal = createModuleNamespace(cmsLiteInternal);
export const actions: ModuleProxy = createShorthandProxy(internal, "actions");
export const mutations: ModuleProxy = createShorthandProxy(internal, "mutations");
export const queries: ModuleProxy = createShorthandProxy(internal, "queries");

export {
  action,
  mutation,
  query,
  internalAction,
  internalMutation,
  internalQuery,
  httpAction,
};

export type {
  ActionCtx,
  MutationCtx,
  QueryCtx,
  Doc,
  Id,
};
