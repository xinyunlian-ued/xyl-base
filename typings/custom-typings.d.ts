

declare const module: any;

declare const require: any;

declare let process: {
  env: {
    NODE_ENV: string
  }
};

declare module "*.json" {
  const value: any;
  export const version: string;
  export default value;
}
