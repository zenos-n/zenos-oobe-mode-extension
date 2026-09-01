import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
import Clutter from "gi://Clutter";
import GLib from "gi://GLib";
import * as Main from "resource:///org/gnome/shell/ui/main.js";

export default class ZenosOobeModeExtension extends Extension {
  enable() {
    Main.layoutManager.startInOverview = false;
    Main.overview.hide();
    this._startupCompleteId = Main.layoutManager.connect("startup-complete", () => {
      Main.overview.hide();
    });

    this._keyPressId = global.stage.connect("key-press-event", (_actor, event) => {
      const isShiftF10 =
        event.get_key_symbol() === Clutter.KEY_F10 &&
        (event.get_state() & Clutter.ModifierType.SHIFT_MASK) !== 0;

      if (!isShiftF10) {
        return Clutter.EVENT_PROPAGATE;
      }

      this.disable();
      return Clutter.EVENT_STOP;
    });

    if (GLib.getenv("ZENOS_INSTALLER") !== "1") {
      Main.panel.hide();
      this._dateMenu = Main.panel.statusArea.dateMenu;
      if (this._dateMenu) this._dateMenu.hide();
      const introCompletePath = GLib.build_filenamev([
        GLib.get_user_runtime_dir(),
        "zenos-oobe-intro-complete",
      ]);
      this._introPollId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 100, () => {
        if (GLib.file_test(introCompletePath, GLib.FileTest.EXISTS)) {
          Main.panel.show();
          this._introPollId = null;
          return GLib.SOURCE_REMOVE;
        }

        return GLib.SOURCE_CONTINUE;
      });

      const timezoneReadyPath = GLib.build_filenamev([
        GLib.get_user_runtime_dir(),
        "zenos-oobe-timezone-ready",
      ]);
      this._timezonePollId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 100, () => {
        if (GLib.file_test(timezoneReadyPath, GLib.FileTest.EXISTS)) {
          if (this._dateMenu) this._dateMenu.show();
          this._timezonePollId = null;
          return GLib.SOURCE_REMOVE;
        }

        return GLib.SOURCE_CONTINUE;
      });
    }

    this._activitiesButton = Main.panel.statusArea.activities;
    if (this._activitiesButton) {
      this._activitiesButton.hide();
    }

    this._originalOverviewShow = Main.overview.show;
    this._originalOverviewToggle = Main.overview.toggle;

    Main.overview.show = () => {};
    Main.overview.toggle = () => {};
  }

  disable() {
    if (this._keyPressId) {
      global.stage.disconnect(this._keyPressId);
      this._keyPressId = null;
    }

    if (this._introPollId) {
      GLib.source_remove(this._introPollId);
      this._introPollId = null;
    }

    if (this._timezonePollId) {
      GLib.source_remove(this._timezonePollId);
      this._timezonePollId = null;
    }

    if (this._startupCompleteId) {
      Main.layoutManager.disconnect(this._startupCompleteId);
      this._startupCompleteId = null;
    }

    Main.panel.show();

    if (this._dateMenu) {
      this._dateMenu.show();
      this._dateMenu = null;
    }

    if (this._activitiesButton) {
      this._activitiesButton.show();
      this._activitiesButton = null;
    }

    if (this._originalOverviewShow) {
      Main.overview.show = this._originalOverviewShow;
      this._originalOverviewShow = null;
    }

    if (this._originalOverviewToggle) {
      Main.overview.toggle = this._originalOverviewToggle;
      this._originalOverviewToggle = null;
    }

    if (Main.sessionMode.currentMode === "zenos-oobe")
      Main.sessionMode.switchMode("user");
  }
}
