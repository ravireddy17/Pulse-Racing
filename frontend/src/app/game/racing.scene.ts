import Phaser from 'phaser';
import { RaceSnapshot, TrackDefinition } from './race.models';

const WORLD_WIDTH = 1800;
const WORLD_HEIGHT = 1050;
const ROAD_WIDTH = 170;
const PROGRESS_GATE_RADIUS = ROAD_WIDTH / 2 + 24;
const TOTAL_LAPS = 3;
const MAX_ROAD_SPEED = 460;
const MAX_OFFROAD_SPEED = 175;

export interface RacingSceneOptions {
  readonly track: TrackDefinition;
  readonly bestTimeMs: number | null;
  readonly onStateChange: (snapshot: RaceSnapshot) => void;
  readonly onBestTime: (elapsedMs: number) => void;
}

export class RacingScene extends Phaser.Scene {
  private readonly options: RacingSceneOptions;
  private car!: Phaser.Physics.Arcade.Image;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private restartKey!: Phaser.Input.Keyboard.Key;
  private pauseKey!: Phaser.Input.Keyboard.Key;
  private trackPoints: Phaser.Math.Vector2[] = [];
  private checkpointIndexes: number[] = [];
  private nextCheckpoint = 0;
  private lap = 1;
  private raceStartedAt = 0;
  private pausedAt = 0;
  private pausedDuration = 0;
  private finished = false;
  private finishedElapsedMs = 0;
  private lastSnapshotAt = 0;

  constructor(options: RacingSceneOptions) {
    super({ key: `race-${options.track.id}` });
    this.options = options;
  }

  create(): void {
    this.nextCheckpoint = 0;
    this.lap = 1;
    this.pausedDuration = 0;
    this.finished = false;
    this.finishedElapsedMs = 0;
    this.lastSnapshotAt = 0;
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.trackPoints = this.createTrackPoints();
    this.checkpointIndexes = [
      Math.floor(this.trackPoints.length * 0.24),
      Math.floor(this.trackPoints.length * 0.49),
      Math.floor(this.trackPoints.length * 0.74),
    ];
    this.drawWorld();
    this.createCar();
    this.configureInput();
    this.configureCamera();
    this.raceStartedAt = this.time.now;
    this.publishState(true);
  }

  override update(time: number, delta: number): void {
    if (Phaser.Input.Keyboard.JustDown(this.pauseKey)) {
      this.togglePause(time);
      return;
    }
    if (Phaser.Input.Keyboard.JustDown(this.restartKey)) {
      this.scene.restart();
      return;
    }
    if (this.physics.world.isPaused || this.finished) {
      return;
    }

    this.updateCar(delta / 1000);
    this.updateProgress();
    if (time - this.lastSnapshotAt >= 80) {
      this.publishState();
      this.lastSnapshotAt = time;
    }
  }

  private createTrackPoints(): Phaser.Math.Vector2[] {
    const xValues = this.options.track.points.map(([x]) => x);
    const yValues = this.options.track.points.map(([, y]) => y);
    xValues.push(xValues[0]);
    yValues.push(yValues[0]);
    return Array.from({ length: 320 }, (_, index) => {
      const position = index / 320;
      return new Phaser.Math.Vector2(
        Phaser.Math.Interpolation.CatmullRom(xValues, position),
        Phaser.Math.Interpolation.CatmullRom(yValues, position),
      );
    });
  }

  private drawWorld(): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(this.options.track.backgroundColor, 1);
    graphics.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.drawScenery(graphics);

    graphics.lineStyle(ROAD_WIDTH + 30, this.options.track.shoulderColor, 1);
    graphics.strokePoints(this.trackPoints, true, false);
    graphics.lineStyle(ROAD_WIDTH + 14, this.options.track.accentColor, 1);
    graphics.strokePoints(this.trackPoints, true, false);
    graphics.lineStyle(ROAD_WIDTH, this.options.track.roadColor, 1);
    graphics.strokePoints(this.trackPoints, true, false);
    graphics.lineStyle(2, 0xffffff, 0.2);
    graphics.strokePoints(this.trackPoints, true, false);

    this.drawStartLine(graphics);
    this.drawCheckpointMarkers(graphics);
  }

  private drawScenery(graphics: Phaser.GameObjects.Graphics): void {
    for (let index = 0; index < 95; index += 1) {
      const x = 55 + ((index * 173) % (WORLD_WIDTH - 110));
      const y = 45 + ((index * 97) % (WORLD_HEIGHT - 90));
      if (this.distanceFromTrack(x, y) < ROAD_WIDTH / 2 + 45) {
        continue;
      }
      if (this.options.track.id === 'green-hills') {
        graphics.fillStyle(0x173f27, 0.9);
        graphics.fillCircle(x, y, 10 + (index % 8));
        graphics.fillStyle(0x255a33, 1);
        graphics.fillCircle(x - 3, y - 4, 7 + (index % 6));
      } else {
        graphics.fillStyle(index % 3 === 0 ? 0x70422f : 0x81513a, 0.9);
        graphics.fillRoundedRect(x - 11, y - 8, 22 + (index % 9), 15, 5);
      }
    }
  }

  private drawStartLine(graphics: Phaser.GameObjects.Graphics): void {
    const start = this.trackPoints[0];
    const tangent = this.trackPoints[2].clone().subtract(start).normalize();
    const normal = new Phaser.Math.Vector2(-tangent.y, tangent.x);
    for (let index = -4; index < 4; index += 1) {
      const center = start.clone().add(normal.clone().scale(index * 20 + 10));
      graphics.fillStyle(index % 2 === 0 ? 0xffffff : 0x151515, 1);
      graphics.fillRect(center.x - 10, center.y - 5, 20, 10);
    }
  }

  private drawCheckpointMarkers(graphics: Phaser.GameObjects.Graphics): void {
    for (const pointIndex of this.checkpointIndexes) {
      const point = this.trackPoints[pointIndex];
      graphics.fillStyle(0x50e3c2, 0.2);
      graphics.fillCircle(point.x, point.y, PROGRESS_GATE_RADIUS);
    }
  }

  private createCar(): void {
    if (!this.textures.exists('player-car')) {
      const texture = this.make.graphics({ x: 0, y: 0 });
      texture.fillStyle(0xe53935, 1);
      texture.fillRoundedRect(0, 4, 64, 28, 8);
      texture.fillStyle(0x15191f, 1);
      texture.fillRoundedRect(24, 7, 22, 22, 5);
      texture.fillStyle(0xf4f7f8, 1);
      texture.fillRect(53, 7, 6, 5);
      texture.fillRect(53, 24, 6, 5);
      texture.generateTexture('player-car', 64, 36);
      texture.destroy();
    }

    const start = this.trackPoints[0];
    const tangent = this.trackPoints[3].clone().subtract(start);
    this.car = this.physics.add.image(start.x, start.y, 'player-car');
    this.car.setRotation(tangent.angle());
    this.car.setDepth(5);
    this.car.setCollideWorldBounds(true);
    this.car.setDrag(55, 55);
    this.car.setMaxVelocity(MAX_ROAD_SPEED, MAX_ROAD_SPEED);
    this.car.body?.setSize(52, 25);
  }

  private configureInput(): void {
    if (!this.input.keyboard) {
      throw new Error('Keyboard input is unavailable');
    }
    this.cursors = this.input.keyboard.createCursorKeys();
    this.restartKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.input.keyboard.addCapture([
      Phaser.Input.Keyboard.KeyCodes.UP,
      Phaser.Input.Keyboard.KeyCodes.DOWN,
      Phaser.Input.Keyboard.KeyCodes.LEFT,
      Phaser.Input.Keyboard.KeyCodes.RIGHT,
      Phaser.Input.Keyboard.KeyCodes.SPACE,
      Phaser.Input.Keyboard.KeyCodes.ESC,
    ]);
  }

  private configureCamera(): void {
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.startFollow(this.car, true, 0.08, 0.08);
    this.cameras.main.setZoom(0.82);
    this.cameras.main.setBackgroundColor(this.options.track.backgroundColor);
  }

  private updateCar(deltaSeconds: number): void {
    const body = this.car.body as Phaser.Physics.Arcade.Body;
    const speed = body.velocity.length();
    const onRoad = this.distanceFromTrack(this.car.x, this.car.y) <= ROAD_WIDTH / 2;
    const speedLimit = onRoad ? MAX_ROAD_SPEED : MAX_OFFROAD_SPEED;
    const acceleration = onRoad ? 330 : 175;
    const force = new Phaser.Math.Vector2();

    if (this.cursors.up.isDown) {
      this.physics.velocityFromRotation(this.car.rotation, acceleration, force);
      body.velocity.add(force.scale(deltaSeconds));
    }
    if (this.cursors.down.isDown) {
      this.physics.velocityFromRotation(this.car.rotation, -250, force);
      body.velocity.add(force.scale(deltaSeconds));
    }

    if (speed > 12) {
      const forward = new Phaser.Math.Vector2(
        Math.cos(this.car.rotation),
        Math.sin(this.car.rotation),
      );
      const direction = Math.sign(body.velocity.dot(forward)) || 1;
      const steering = Phaser.Math.Clamp(speed / 190, 0.35, 1.25) * direction;
      if (this.cursors.left.isDown) {
        this.car.rotation -= 2.25 * steering * deltaSeconds;
      }
      if (this.cursors.right.isDown) {
        this.car.rotation += 2.25 * steering * deltaSeconds;
      }
    }

    const grip = onRoad ? 0.07 : 0.025;
    const forwardSpeed =
      body.velocity.x * Math.cos(this.car.rotation) +
      body.velocity.y * Math.sin(this.car.rotation);
    const targetVelocity = new Phaser.Math.Vector2(
      Math.cos(this.car.rotation) * forwardSpeed,
      Math.sin(this.car.rotation) * forwardSpeed,
    );
    body.velocity.lerp(targetVelocity, grip);
    if (body.velocity.length() > speedLimit) {
      body.velocity.setLength(speedLimit);
    }
  }

  private updateProgress(): void {
    const checkpointPoint = this.trackPoints[this.checkpointIndexes[this.nextCheckpoint]];
    if (checkpointPoint && checkpointPoint.distance(this.car) <= PROGRESS_GATE_RADIUS) {
      this.nextCheckpoint += 1;
    }
    if (this.nextCheckpoint < this.checkpointIndexes.length) {
      return;
    }

    const start = this.trackPoints[0];
    if (start.distance(this.car) <= PROGRESS_GATE_RADIUS) {
      this.nextCheckpoint = 0;
      if (this.lap >= TOTAL_LAPS) {
        this.finishRace();
      } else {
        this.lap += 1;
      }
    }
  }

  private finishRace(): void {
    this.finishedElapsedMs =
      this.time.now - this.raceStartedAt - this.pausedDuration;
    this.finished = true;
    this.car.setVelocity(0, 0);
    const elapsedMs = this.finishedElapsedMs;
    if (this.options.bestTimeMs === null || elapsedMs < this.options.bestTimeMs) {
      this.options.onBestTime(elapsedMs);
    }
    this.publishState(true);
  }

  private togglePause(time: number): void {
    if (this.finished) {
      return;
    }
    if (this.physics.world.isPaused) {
      this.physics.resume();
      this.pausedDuration += time - this.pausedAt;
    } else {
      this.pausedAt = time;
      this.physics.pause();
    }
    this.publishState(true);
  }

  private elapsedMs(): number {
    if (this.finished) {
      return this.finishedElapsedMs;
    }
    const endTime = this.time.now;
    const activePause = this.physics.world.isPaused ? this.time.now - this.pausedAt : 0;
    return Math.max(0, endTime - this.raceStartedAt - this.pausedDuration - activePause);
  }

  private publishState(force = false): void {
    if (force) {
      this.lastSnapshotAt = this.time.now;
    }
    const speed = Math.round(
      ((this.car.body as Phaser.Physics.Arcade.Body)?.velocity.length() ?? 0) * 0.68,
    );
    this.options.onStateChange({
      lap: this.lap,
      totalLaps: TOTAL_LAPS,
      elapsedMs: this.elapsedMs(),
      bestTimeMs: this.options.bestTimeMs,
      speed,
      paused: this.physics.world.isPaused,
      finished: this.finished,
    });
  }

  private distanceFromTrack(x: number, y: number): number {
    let minimum = Number.POSITIVE_INFINITY;
    for (let index = 0; index < this.trackPoints.length; index += 3) {
      minimum = Math.min(minimum, Phaser.Math.Distance.Between(
        x,
        y,
        this.trackPoints[index].x,
        this.trackPoints[index].y,
      ));
    }
    return minimum;
  }
}
