type DataTypes =
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "array"
  | "object";

type Properties = {
  [prop: string]: {
    type?: unknown;
    format?: string;
    example?: unknown;
    description?: string;
  };
};

type Example = {
  $ref?: string;
  summary?: string;
  externalValue?: string;
  value?: Record<string, any>;
};

type Examples = {
  [name: string]: Example;
};

type Schema = {
  type?: DataTypes;
  format?: string;
  $ref?: string;
  minimum?: number;
  maximum?: number;
  default?: unknown;
  pattern?: string;
  nullable?: boolean;
  properties?: Properties;
  exclusiveMinimum?: boolean;
  exclusiveMaximum?: boolean;

  required?: string[];

  oneOf?: { type: DataTypes }[];

  items?: Record<string, Schema>;

  example?: unknown;
};

type Parameter = {
  name?: string;
  in?: string;
  description?: string;
  required?: boolean;
  schema?: Schema;
  examples?: Examples;
};

type ContentTypes = {
  [type: string]: {
    schema?: {
      type?: unknown;
      $ref?: string;
      properties?: Properties;
      items?: {
        $ref?: string;
      };
    };
    example?: Record<string, any>;
    examples?: Examples;
  };
};

type ResponseType = {
  description?: string;
  summary?: string;
  $ref?: string;
  headers?: {
    [header: string]: {
      description?: string;
      schema?: Schema;
    };
  };
  //   schema?: Schema;
  content?: ContentTypes;
};

type Servers = {
  [server: string]: {
    url?: string;
    description?: string;
    variables?: {
      [variable: string]: {
        default?: unknown;
        description?: string;
        enum: Record<string, unknown>;
      };
    };
  };
};

export type PathMeta = {
  description?: string;
  summary?: string;
  tags?: string[];
  servers?: Servers;
  responses?: {
    [code: number]: ResponseType;
    default?: ResponseType;
  };
  parameters?: Parameter[];
  requestBody?: {
    description?: string;
    required?: boolean;
    content: ContentTypes;
  };
};

export type SwaggerSpec = {
  openapi: string;
  info?: {
    title?: string;
    description?: string;
    version?: string;
    termsOfService?: string;
  };
  tags?: {
    name?: string;
    description?: string;
    externalDocs?: SwaggerSpec["externalDocs"];
  }[];
  servers?: Servers;
  contact?: {
    name?: string;
    email?: string;
    url?: string;
  };
  license?: {
    name?: string;
    url?: string;
  };
  externalDocs?: {
    url?: string;
    description?: string;
  };
  components?: {
    schemas?: Record<string, Schema>;
    parameters?: Record<string, Parameter>;
    responses?: Record<string, ResponseType>;
    securitySchemes?: {
      [name: string]: {
        type?: string;
        scheme?: string;
        in?: string;
        name?: string;
        openIdConnectUrl?: string;
      };
    };
  };
};
