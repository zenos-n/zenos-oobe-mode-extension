{ lib, stdenvNoCC }:
stdenvNoCC.mkDerivation {
  pname = "zenos-oobe-mode";
  version = "0.1.0";
  src = ./.;
  dontBuild = true;
  installPhase = ''
    runHook preInstall
    extension="$out/share/gnome-shell/extensions/zenos-oobe-mode@neg-zero.com"
    mkdir -p "$extension" "$out/share/gnome-shell/modes"
    install -m644 extension.js metadata.json "$extension/"
    install -m644 zenos-oobe.json "$out/share/gnome-shell/modes/zenos-oobe.json"
    runHook postInstall
  '';
  meta = {
    description = "GNOME session mode for the ZenOS installer and first-boot setup";
    platforms = lib.platforms.linux;
  };
}
