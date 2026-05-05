import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";

export default class ZenosOobeModeExtension extends Extension {
  enable() {
    // force close overview if it's active
    if (Main.overview.visible) {
      Main.overview.hide();
    }

    // hide only the activities button (the overview button)
    // it's usually the first item in the left box of the panel
    this._activitiesButton = Main.panel.statusArea.activities;
    if (this._activitiesButton) {
      this._activitiesButton.hide();
    }

    // store original overview methods to restore later
    this._originalOverviewShow = Main.overview.show;
    this._originalOverviewToggle = Main.overview.toggle;

    // block the overview logic so Super/Gestures do nothing
    Main.overview.show = () => {};
    Main.overview.toggle = () => {};
  }

  disable() {
    // bring back the activities button
    if (this._activitiesButton) {
      this._activitiesButton.show();
    }

    // restore overview functionality
    if (this._originalOverviewShow) {
      Main.overview.show = this._originalOverviewShow;
      this._originalOverviewShow = null;
    }

    if (this._originalOverviewToggle) {
      Main.overview.toggle = this._originalOverviewToggle;
      this._originalOverviewToggle = null;
    }
  }
}
