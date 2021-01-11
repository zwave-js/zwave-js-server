export enum ControllerCommand {
  beginInclusion = "controller.begin_inclusion",
  stopInclusion = "controller.stop_inclusion",
  beginExclusion = "controller.begin_exclusion",
  stopExclusion = "controller.stop_exclusion",
  removeFailedNode = "controller.remove_failed_node",
  replaceFailedNode = "controller.replace_failed_node",
  healNode = "controller.heal_node",
  beginHealingNetwork = "controller.begin_healing_network",
  stopHealingNetwork = "controller.stop_healing_network",
  isFailedNode = "controller.is_failed_node",
}
