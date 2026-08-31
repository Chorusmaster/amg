import Vector2 from "./vector2";

export default class Transform {
  position = new Vector2();
  scale = new Vector2(1, 1);
  rotation = 0;

  constructor(position = new Vector2(), scale = new Vector2(1, 1), rotation = 0) {
    this.position = position;
    this.scale = scale;
    this.rotation = rotation;
  }
}
