import { Driver } from "zwave-js";
import { UnknownCommandError } from "../error";
import { ControllerCommand } from "./command";
import { IncomingMessageController } from "./incoming_message";
import { ControllerResultTypes } from "./outgoing_message";

export class ControllerMessageHandler {
  static async handle(
    message: IncomingMessageController,
    driver: Driver
  ): Promise<ControllerResultTypes[ControllerCommand]> {
    const { command } = message;

    switch (message.command) {
      case ControllerCommand.beginInclusion: {
        const success = await driver.controller.beginInclusion(
          message.includeNonSecure
        );
        return { success };
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
          message.includeNonSecure
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
          .getAssociationGroups(message.nodeId)
          .forEach((value, key) => (groups[key] = value));
        return { groups };
      }
      case ControllerCommand.getAssociations: {
        const associations: ControllerResultTypes[ControllerCommand.getAssociations]["associations"] =
          {};
        driver.controller
          .getAssociations(message.nodeId)
          .forEach((value, key) => (associations[key] = value));
        return { associations };
      }
      case ControllerCommand.isAssociationAllowed: {
        const allowed = driver.controller.isAssociationAllowed(
          message.nodeId,
          message.group,
          message.association
        );
        return { allowed };
      }
      case ControllerCommand.addAssociations: {
        await driver.controller.addAssociations(
          message.nodeId,
          message.group,
          message.associations
        );
        return {};
      }
      case ControllerCommand.removeAssociations: {
        await driver.controller.removeAssociations(
          message.nodeId,
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
