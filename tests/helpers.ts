import { Cl } from "@stacks/transactions";

export const accounts = simnet.getAccounts();
export const deployer = accounts.get("deployer")!;
export const wallet1 = accounts.get("wallet_1")!;
export const wallet2 = accounts.get("wallet_2")!;

export const contractPrincipal = (name: string) =>
  Cl.contractPrincipal(deployer, name);
