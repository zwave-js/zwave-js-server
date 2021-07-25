import { Driver, VirtualEndpoint, VirtualNode } from "zwave-js";
import { UnknownCommandError, VirtualEndpointNotFoundError } from "../error";
import { MulticastGroupCommand } from "./command";
import { IncomingMessageMulticastGroup } from "./incoming_message";
import { MulticastGroupResultTypes } from "./outgoing_message";

export class MulticastGroupMessageHandler {
  static async handle(
    message: IncomingMessageMulticastGroup,
    driver: Driver
  ): Promise<MulticastGroupResultTypes[MulticastGroupCommand]> {
    const { command } = message;
    let supported: boolean;

    const virtualNode = driver.controller.getMulticastGroup(message.nodeIDs);

    switch (message.command) {
      case MulticastGroupCommand.setValue:
        const success = await virtualNode.setValue(
          message.valueId,
          message.value,
          message.options
        );
        return { success };
      case MulticastGroupCommand.getEndpointCount:
        const count = virtualNode.getEndpointCount();
        return { count };
      case MulticastGroupCommand.supportsCC:
        supported = getVirtualEndpoint(
          virtualNode,
          message.nodeIDs,
          message.index
        ).supportsCC(message.commandClass);
        return { supported };
      case MulticastGroupCommand.getCCVersion:
        const version = getVirtualEndpoint(
          virtualNode,
          message.nodeIDs,
          message.index
        ).getCCVersion(message.commandClass);
        return { version };
      case MulticastGroupCommand.invokeCCAPI:
        const response = getVirtualEndpoint(
          virtualNode,
          message.nodeIDs,
          message.index
        ).invokeCCAPI(
          message.commandClass,
          message.methodName,
          ...message.args
        );
        return { response };
      case MulticastGroupCommand.supportsCCAPI:
        supported = getVirtualEndpoint(
          virtualNode,
          message.nodeIDs,
          message.index
        ).supportsCCAPI(message.commandClass);
        return { supported };
      default:
        throw new UnknownCommandError(command);
    }
  }
}

function getVirtualEndpoint(
  virtualNode: VirtualNode,
  nodeIDs: number[],
  index?: number
): VirtualEndpoint {
  if (!index) return virtualNode;
  const virtualEndpoint = virtualNode.getEndpoint(index);
  if (!virtualEndpoint) {
    throw new VirtualEndpointNotFoundError(index, nodeIDs, undefined);
  }
  return virtualEndpoint;
}
