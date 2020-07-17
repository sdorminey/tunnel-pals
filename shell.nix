{ pkgs ? import <nixpkgs> {} }:
with pkgs; mkShell {
  buildInputs = [
    nodejs
    python37Packages.websockets
    python37Packages.pylint
    python37Packages.rope
    python37Packages.scipy
    python37Packages.noise
    python37Packages.pillow
    python37Packages.imageio
    python37Packages.matplotlib
  ];
}
