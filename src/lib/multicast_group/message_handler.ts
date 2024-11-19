import { Driver, VirtualEndpoint, VirtualNode } from "zwave-js";
import { UnknownCommandError, VirtualEndpointNotFoundError } from "../error.js";
import { MulticastGroupCommand } from "./command.js";
import { IncomingMessageMulticastGroup } from "./incoming_message.js";
import { MulticastGroupResultTypes } from "./outgoing_message.js";
import { Client } from "../server.js";
import { setValueOutgoingMessage } from "../common.js";
import { MessageHandler } from "../message_handler.js";

export class MulticastGroupMessageHandler implements MessageHandler {
  constructor(
    private driver: Driver,
    private client: Client,
  ) {}

  async handle(
    message: IncomingMessageMulticastGroup,
  ): Promise<MulticastGroupResultTypes[MulticastGroupCommand]> {
    const { command } = message;

    const virtualNode = this.driver.controller.getMulticastGroup(
      message.nodeIDs,
    );

    switch (message.command) {
      case MulticastGroupCommand.setValue: {
        const result = await virtualNode.setValue(
          message.valueId,
          message.value,
          message.options,
        );
        return setValueOutgoingMessage(result, this.client.schemaVersion);
      }
      case MulticastGroupCommand.getEndpointCount: {
        const count = virtualNode.getEndpointCount();
        return { count };
      }
      case MulticastGroupCommand.supportsCC: {
        const supported = getVirtualEndpoint(
          virtualNode,
          message.nodeIDs,
          message.index,
        ).supportsCC(message.commandClass);
        return { supported };
      }
      case MulticastGroupCommand.getCCVersion: {
        const version = getVirtualEndpoint(
          virtualNode,
          message.nodeIDs,
          message.index,
        ).getCCVersion(message.commandClass);
        return { version };
      }
      case MulticastGroupCommand.invokeCCAPI: {
        const response = getVirtualEndpoint(
          virtualNode,
          message.nodeIDs,
          message.index,
        ).invokeCCAPI(
          message.commandClass,
          message.methodName,
          ...message.args,
        );
        return { response };
      }
      case MulticastGroupCommand.supportsCCAPI: {
        const supported = getVirtualEndpoint(
          virtualNode,
          message.nodeIDs,
          message.index,
        ).supportsCCAPI(message.commandClass);
        return { supported };
      }
      case MulticastGroupCommand.getDefinedValueIDs: {
        const valueIDs = virtualNode.getDefinedValueIDs();
        return { valueIDs };
      }
      default: {
        throw new UnknownCommandError(command);
      }
    }
  }
}

function getVirtualEndpoint(
  virtualNode: VirtualNode,
  nodeIDs: number[],
  index?: number,
): VirtualEndpoint {
  if (!index) return virtualNode;
  const virtualEndpoint = virtualNode.getEndpoint(index);
  if (!virtualEndpoint) {
    throw new VirtualEndpointNotFoundError(index, nodeIDs, undefined);
  }
  return virtualEndpoint;
}
