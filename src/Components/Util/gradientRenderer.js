export class ChatBackgroundGradientRendererWebGL {
  constructor() {
    this.context = 'webgl';

    this.canvas = undefined;
    this.gl = undefined;
    this.program = undefined;

    this.colors = [];
    this.keyShift = 0;
    this.colorPositions = [];
    this.targetColorPositions = [];

    this.animating = false;
    this.animationSpeed = 0.05;

    this.uniformLocations = {
      resolutionLoc: undefined,
      colorCountLoc: undefined,
      colorLocs: [],
      colorPosLocs: [],
    };

    this.keyPoints = [
      [0.265, 0.582],
      [0.176, 0.918],
      [1 - 0.585, 1 - 0.164],
      [0.644, 0.755],
      [1 - 0.265, 1 - 0.582],
      [1 - 0.176, 1 - 0.918],
      [0.585, 0.164],
      [1 - 0.644, 1 - 0.755],
    ];
  }

  static shaders = {
    vertex: `attribute vec4 a_position;
    void main() {
      gl_Position = a_position;
    }`,
    fragment: `precision highp float;

    uniform vec2 resolution;
    uniform int colorCount;
    uniform vec3 colors[128];
    uniform vec2 colorPositions[128];

    void main() {
      vec2 position = gl_FragCoord.xy / resolution.xy;
      position.y = 1.0 - position.y;

      float minD = 10000.0;
      for (int i = 0; i < 128; i++) {
        if (i >= colorCount) break;
        float d = distance(position, colorPositions[i]);
        minD = min(minD, d);
      }

      float p = 3.0;
      float totalWeight = 0.0;
      vec3 resultColor = vec3(0.0);

      for (int i = 0; i < 128; i++) {
        if (i >= colorCount) break;
        float d = distance(position, colorPositions[i]);
        float weight = pow(1.0 - (d - minD), p);
        totalWeight += weight;
        resultColor += (colors[i] / 255.0) * weight;
      }

      gl_FragColor = vec4(resultColor / totalWeight, 1.0);
    }`
  };

  static loadShader(gl, shaderSource, shaderType) {
    const shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
    return shader;
  }

  static hexToVec3(hex) {
    if (hex.startsWith('#')) {
      hex = hex.slice(1);
    }
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return [r, g, b];
  }

  static distance(p1, p2) {
    return Math.sqrt((p1[1] - p2[1]) * (p1[1] - p2[1]));
  }

  static create(colors, canvas) {
    canvas.setAttribute('data-colors', colors);
    const gradientRenderer = new ChatBackgroundGradientRendererWebGL();
    gradientRenderer.init(canvas);
    return { gradientRenderer, canvas };
  }

  init(el) {
    this.canvas = el;

    this.colors = this.canvas.getAttribute('data-colors').split(',').map(ChatBackgroundGradientRendererWebGL.hexToVec3);

    this.gl = this.canvas.getContext(this.context);
    if (!this.gl) throw new Error('WebGL not supported');

    this.program = this.gl.createProgram();
    if (!this.program) throw new Error('Unable to create WebGLProgram');

    this.gl.attachShader(
      this.program,
      ChatBackgroundGradientRendererWebGL.loadShader(this.gl, ChatBackgroundGradientRendererWebGL.shaders.vertex, this.gl.VERTEX_SHADER)
    );
    this.gl.attachShader(
      this.program,
      ChatBackgroundGradientRendererWebGL.loadShader(this.gl, ChatBackgroundGradientRendererWebGL.shaders.fragment, this.gl.FRAGMENT_SHADER)
    );

    this.gl.linkProgram(this.program);
    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      throw new Error('Unable to initialize the shader program.');
    }

    this.gl.useProgram(this.program);

    const positionAttributeLocation = this.gl.getAttribLocation(this.program, 'a_position');
    const positionBuffer = this.gl.createBuffer();

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      this.gl.STATIC_DRAW
    );

    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

    this.gl.enableVertexAttribArray(positionAttributeLocation);
    this.gl.vertexAttribPointer(positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);

    this.uniformLocations.resolutionLoc = this.gl.getUniformLocation(this.program, 'resolution');
    this.uniformLocations.colorCountLoc = this.gl.getUniformLocation(this.program, 'colorCount');

    for (let i = 0; i < 128; i++) {
      this.uniformLocations.colorLocs.push(this.gl.getUniformLocation(this.program, `colors[${i}]`));
      this.uniformLocations.colorPosLocs.push(this.gl.getUniformLocation(this.program, `colorPositions[${i}]`));
    }

    this.updateTargetColors();
    this.updateTargetColors();

    for (let i = 0; i < this.colors.length; i++) {
      this.colorPositions[i] = [...this.targetColorPositions[i]];
    }

    this.renderGradientCanvas();
  }

  updateTargetColors() {
    this.targetColorPositions = [];
    for (let i = 0; i < this.colors.length; i++) {
      this.targetColorPositions.push(this.keyPoints[(this.keyShift + (i * 2)) % this.keyPoints.length]);
    }
    this.keyShift = (this.keyShift + 1) % this.keyPoints.length;
  }

  renderGradientCanvas() {
    if (!this.gl || !this.program) return;

    this.gl.uniform2fv(this.uniformLocations.resolutionLoc, [this.gl.canvas.width, this.gl.canvas.height]);
    this.gl.uniform1i(this.uniformLocations.colorCountLoc, this.colors.length);

    for (let i = 0; i < this.colors.length; i++) {
      this.gl.uniform3fv(this.uniformLocations.colorLocs[i], this.colors[i]);
      this.gl.uniform2fv(this.uniformLocations.colorPosLocs[i], this.colorPositions[i]);
    }

    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
  }

  toNextPosition() {
    this.updateTargetColors();
    if (!this.animating) requestAnimationFrame(this.animate.bind(this));
  }

  animate() {
    this.animating = true;
    let stillAnimating = false;
    for (let i = 0; i < this.colors.length; i++) {
      if (ChatBackgroundGradientRendererWebGL.distance(this.colorPositions[i], this.targetColorPositions[i]) > 0.01) {
        this.colorPositions[i][0] =
          this.colorPositions[i][0] * (1 - this.animationSpeed) + this.targetColorPositions[i][0] * this.animationSpeed;
        this.colorPositions[i][1] =
          this.colorPositions[i][1] * (1 - this.animationSpeed) + this.targetColorPositions[i][1] * this.animationSpeed;
        stillAnimating = true;
      }
    }

    this.renderGradientCanvas();

    if (stillAnimating) {
      requestAnimationFrame(this.animate.bind(this));
    } else {
      this.animating = false;
    }
  }
}
