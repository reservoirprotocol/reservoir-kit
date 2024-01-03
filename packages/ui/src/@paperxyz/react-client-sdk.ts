/**
 * This TypeScript declaration for '@paperxyz/react-client-sdk' is specifically designed to facilitate an optional integration with the '@paperxyz/react-client-sdk'.
 * By implementing this declaration file, the library is made optional for users, yet the integration capabilities remain embedded and accessible.
 * This approach allows for a more flexible and lightweight use of ReservoirKit, enabling users to opt-in to its Paper integration without the necessity of including it as a mandatory dependency in their projects.
 */
declare module '@paperxyz/react-client-sdk' {
  // Check if the module's default type is already defined
  type ExistingModuleType =
    // @ts-ignore
    typeof import('@paperxyz/react-client-sdk/dist/index.d.ts')

  // Extend the existing module type if it's present, otherwise fallback to a general type definition
  const module: ExistingModuleType extends { [key: string]: any }
    ? ExistingModuleType
    : { [key: string]: any }
  export = module
}
