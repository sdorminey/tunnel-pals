import * as _ from 'lodash';

function component() {
  const element = document.createElement('div');

  element.innerHTML = _.join(['Hello', 'webpack'], ' ');

  return element;
}

document.body.appendChild(component());

const c = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = c.getContext('2d');
ctx.fillStyle = "#ff0000";
ctx.fillRect(0, 0, 320, 240);