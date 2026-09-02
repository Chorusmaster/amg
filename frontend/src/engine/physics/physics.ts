import type CollisionWorld from "./collision-world";
import PhysicsBody from "./physics-body";
import ContactDetector from "./contact-detector";
import CollisionResolver from "./collision-resolver";
import Entity from "../entity";

export default class Physics {
  private world: CollisionWorld;
  private contactDetector: ContactDetector;
  private collisionResolver: CollisionResolver;

  constructor(world: CollisionWorld) {
    this.world = world;
    this.contactDetector = new ContactDetector();
    this.collisionResolver = new CollisionResolver();
  }

  update(dt: number) {
    // STEP 1
    // Gravity
    for (const entity of this.world.entitiesList) {
      if (!entity.physicsBody) continue;

      this.integrate(entity.physicsBody, dt);
    }

    // STEP 2
    // Horizontal movement + static collision resolution
    for (const entity of this.world.entitiesList) {
      if (!entity.physicsBody) continue;

      const body = entity.physicsBody;

      if (body.velocity.x !== 0) {
        body.transform.position.x += body.velocity.x * dt;
        this.resolveStaticContactsX(body);
      }
    }

    // STEP 3
    // Vertical movement + static collision resolution
    for (const entity of this.world.entitiesList) {
      if (!entity.physicsBody) continue;

      const body = entity.physicsBody;

      if (body.velocity.y !== 0) {
        body.transform.position.y += body.velocity.y * dt;
        this.resolveStaticContactsY(body);
      }
    }

    // STEP 4
    // Dynamic collisions
    for (let iteration = 0; iteration < 4; iteration++) {
      for (
        let entityIndex = 0;
        entityIndex < this.world.entitiesList.length;
        entityIndex++
      ) {
        const entity = this.world.entitiesList[entityIndex];

        this.resolveDynamicContacts(
          entity,
          entityIndex,
        );
      }
    }
  }

  private integrate(body: PhysicsBody, dt: number) {
    if (body.affectedByGravity) {
      body.velocity.y -=
        this.world.gravityAcceleration * dt;
    }
  }

  private resolveStaticContactsX(body: PhysicsBody) {
    for (const collider of body.colliders) {
      if (collider.staticMode == "none") continue;

      const bounds = collider.getBounds(body.transform);

      const worldColliders =
        this.world.query(bounds);

      for (const candidate of worldColliders) {
        const collision =
        this.contactDetector.detectCollision(
          collider,
          candidate.collider,
          body.transform,
          candidate.transform,
          body,
          undefined,
        );

        if (!collision) continue;

        this.collisionResolver.resolveStaticX(collision);
      }
    }
  }

  private resolveStaticContactsY(body: PhysicsBody) {
    for (const collider of body.colliders) {
      if (collider.staticMode == "none") continue;

      const bounds = collider.getBounds(body.transform);

      const worldColliders =
        this.world.query(bounds);

      for (const candidate of worldColliders) {
        const collision =
          this.contactDetector.detectCollision(
            collider,
            candidate.collider,
            body.transform,
            candidate.transform,
            body,
            undefined,
          );

        if (!collision) continue;

        this.collisionResolver.resolveStaticY(collision);
      }
    }
  }

  private resolveDynamicContacts(
    entity: Entity,
    entityIndex: number,
  ) {
    const body = entity.physicsBody;
    if (!body) return;

    const entities = this.world.entitiesList;

    for (
      let i = entityIndex + 1;
      i < entities.length;
      i++
    ) {
      const otherEntity = entities[i];
      const otherBody = otherEntity.physicsBody;

      if (!otherBody) continue;
      if (!body.isMoving && !otherBody.isMoving) {
        continue;
      }

      for (const collider of body.colliders) {
        if (collider.dynamicMode == "none") continue;

        for (const otherCollider of otherBody.colliders) {
          if (otherCollider.dynamicMode == "none") continue;

          if (collider.dynamicMode == "trigger" || otherCollider.dynamicMode == "trigger") {
            const trigger =
              this.contactDetector.detectTrigger(
                collider,
                otherCollider,
                body.transform,
                otherBody.transform,
              );

            if (!trigger) continue;

            entity.onTriggerEnter(otherEntity);
            otherEntity.onTriggerEnter(entity);
          }
          else {
            const collision =
              this.contactDetector.detectCollision(
                collider,
                otherCollider,
                body.transform,
                otherBody.transform,
                body,
                otherBody,
              );

            if (!collision) continue;

            this.collisionResolver.resolve(collision);
          }
        }
      }
    }
  }
}