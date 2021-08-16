import { createDeferredPromise } from "alcalzone-shared/deferred-promise";
import {
  Driver,
  InclusionGrant,
  InclusionOptions,
  InclusionStrategy,
  ReplaceNodeOptions,
} from "zwave-js";
import {
  InclusionPhaseNotInProgressError,
  UnknownCommandError,
} from "../error";
import { Client, ClientsController } from "../server";
import { ControllerCommand } from "./command";
import { IncomingMessageController } from "./incoming_message";
import { ControllerResultTypes } from "./outgoing_message";

export class ControllerMessageHandler {
  static async handle(
    message: IncomingMessageController,
    clientsController: ClientsController,
    driver: Driver,
    client: Client
  ): Promise<ControllerResultTypes[ControllerCommand]> {
    const { command } = message;

    switch (message.command) {
      case ControllerCommand.beginInclusion: {
        const success = await driver.controller.beginInclusion(
          processInclusionOptions(clientsController, client, message)
        );
        return { success };
      }
      case ControllerCommand.grantSecurityClasses: {
        if (!clientsController.grantSecurityClassesPromise)
          throw new InclusionPhaseNotInProgressError(
            "grantSecurityClassesPromise"
          );
        clientsController.grantSecurityClassesPromise.resolve(
          message.inclusionGrant
        );
        return {};
      }
      case ControllerCommand.validateDSKAndEnterPIN: {
        if (!clientsController.validateDSKAndEnterPinPromise)
          throw new InclusionPhaseNotInProgressError(
            "validateDSKAndEnterPinPromise"
          );
        clientsController.validateDSKAndEnterPinPromise.resolve(message.pin);
        return {};
      }
      case ControllerCommand.stopInclusion: {
        const success = await driver.controller.stopInclusion();
        return { success };
      }
      case ControllerCommand.beginExclusion: {
        const success = await driver.controller.beginExclusion();
        return { success };
      }
      case ControllerCommand.stopExclusion: {
        const success = await driver.controller.stopExclusion();
        return { success };
      }
      case ControllerCommand.removeFailedNode: {
        await driver.controller.removeFailedNode(message.nodeId);
        return {};
      }
      case ControllerCommand.replaceFailedNode: {
        const success = await driver.controller.replaceFailedNode(
          message.nodeId,
          processInclusionOptions(
            clientsController,
            client,
            message
          ) as ReplaceNodeOptions
        );
        return { success };
      }
      case ControllerCommand.healNode: {
        const success = await driver.controller.healNode(message.nodeId);
        return { success };
      }
      case ControllerCommand.beginHealingNetwork: {
        const success = driver.controller.beginHealingNetwork();
        return { success };
      }
      case ControllerCommand.stopHealingNetwork: {
        const success = driver.controller.stopHealingNetwork();
        return { success };
      }
      case ControllerCommand.isFailedNode: {
        const failed = await driver.controller.isFailedNode(message.nodeId);
        return { failed };
      }
      case ControllerCommand.getAssociationGroups: {
        const groups: ControllerResultTypes[ControllerCommand.getAssociationGroups]["groups"] =
          {};
        driver.controller
          .getAssociationGroups({
            nodeId: message.nodeId,
            endpoint: message.endpoint,
          })
          .forEach((value, key) => (groups[key] = value));
        return { groups };
      }
      case ControllerCommand.getAssociations: {
        const associations: ControllerResultTypes[ControllerCommand.getAssociations]["associations"] =
          {};
        driver.controller
          .getAssociations({
            nodeId: message.nodeId,
            endpoint: message.endpoint,
          })
          .forEach((value, key) => (associations[key] = value));
        return { associations };
      }
      case ControllerCommand.isAssociationAllowed: {
        const allowed = driver.controller.isAssociationAllowed(
          { nodeId: message.nodeId, endpoint: message.endpoint },
          message.group,
          message.association
        );
        return { allowed };
      }
      case ControllerCommand.addAssociations: {
        await driver.controller.addAssociations(
          { nodeId: message.nodeId, endpoint: message.endpoint },
          message.group,
          message.associations
        );
        return {};
      }
      case ControllerCommand.removeAssociations: {
        await driver.controller.removeAssociations(
          { nodeId: message.nodeId, endpoint: message.endpoint },
          message.group,
          message.associations
        );
        return {};
      }
      case ControllerCommand.removeNodeFromAllAssocations:
      case ControllerCommand.removeNodeFromAllAssociations: {
        await driver.controller.removeNodeFromAllAssociations(message.nodeId);
        return {};
      }
      case ControllerCommand.getNodeNeighbors:
        const neighbors = await driver.controller.getNodeNeighbors(
          message.nodeId
        );
        return { neighbors };
      default:
        throw new UnknownCommandError(command);
    }
  }
}

function processInclusionOptions(
  clientsController: ClientsController,
  client: Client,
  message: IncomingMessageController
): InclusionOptions | ReplaceNodeOptions {
  if ("options" in message) {
    if (
      message.options.strategy === InclusionStrategy.Default ||
      message.options.strategy === InclusionStrategy.Security_S2
    ) {
      message.options.userCallbacks = {
        grantSecurityClasses: async (
          requested: InclusionGrant
        ): Promise<InclusionGrant | false> => {
          clientsController.grantSecurityClassesPromise = createDeferredPromise<
            InclusionGrant | false
          >();
          client.sendEvent({
            source: "controller",
            event: "grant security classes",
            requested: requested as any,
          });
          return clientsController.grantSecurityClassesPromise;
        },
        validateDSKAndEnterPIN: async (
          dsk: string
        ): Promise<string | false> => {
          clientsController.validateDSKAndEnterPinPromise =
            createDeferredPromise<string | false>();
          client.sendEvent({
            source: "controller",
            event: "validate dsk and enter pin",
            dsk,
          });
          return clientsController.validateDSKAndEnterPinPromise;
        },
        abort: (): void => {
          delete clientsController.grantSecurityClassesPromise;
          delete clientsController.validateDSKAndEnterPinPromise;
          client.sendEvent({
            source: "controller",
            event: "inclusion aborted",
          });
        },
      };
    }
    return message.options;
  }
  if ("includeNonSecure" in message && message.includeNonSecure)
    return {
      strategy: InclusionStrategy.Insecure,
    };
  return {
    strategy: InclusionStrategy.Security_S0,
  };
}
