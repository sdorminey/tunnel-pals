{ pkgs ? import <nixpkgs> {} }:
with pkgs; mkShell {
  buildInputs = [
    nodejs
    python37Packages.websockets
  ];
}