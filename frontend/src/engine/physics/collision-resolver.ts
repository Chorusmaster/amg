import type Collision from "./collision";

export default class CollisionResolver {
  resolve(collision: Collision) {
    const {
      bodyA,
      bodyB,
      normal,
      penetration,
    } = collision;

    if (!bodyA && !bodyB) return;

    const POSITION_SLOP = 0.01;

    const correction = Math.max(
      penetration - POSITION_SLOP,
      0,
    );

    if (correction <= 0) return;

    // Position

    if (bodyA && !bodyB) {
      bodyA.transform.position =
        bodyA.transform.position.subtract(
          normal.multiply(correction),
        );
    }
    else if (!bodyA && bodyB) {
      bodyB.transform.position =
        bodyB.transform.position.add(
          normal.multiply(correction),
        );
    }
    else if (bodyA && bodyB) {
      const invMassA = 1 / bodyA.mass;
      const invMassB = 1 / bodyB.mass;

      const total =
        invMassA + invMassB;

      const correctionA =
        normal.multiply(
          correction * invMassA / total,
        );

      const correctionB =
        normal.multiply(
          correction * invMassB / total,
        );

      bodyA.transform.position =
        bodyA.transform.position.subtract(
          correctionA,
        );

      bodyB.transform.position =
        bodyB.transform.position.add(
          correctionB,
        );
    }

    // Velocity

    if (bodyA) {
      const normalVelocity =
        bodyA.velocity.dot(normal);

      if (normalVelocity > 0) {
        bodyA.velocity =
          bodyA.velocity.subtract(
            normal.multiply(normalVelocity),
          );
      }
    }

    if (bodyB) {
      const normalVelocity =
        bodyB.velocity.dot(normal);

      if (normalVelocity < 0) {
        bodyB.velocity =
          bodyB.velocity.subtract(
            normal.multiply(normalVelocity),
          );
      }
    }
  }

  resolveStaticX(collision: Collision) {
    const {
      bodyA,
      bodyB,
      normal,
      penetration,
    } = collision;

    if (!bodyA && !bodyB) return;

    if (normal.y !== 0) return;

    const POSITION_SLOP = 0.01;

    const correction = Math.max(
      penetration - POSITION_SLOP,
      0,
    );

    if (correction <= 0) return;

    // Position

    if (bodyA && !bodyB) {
      bodyA.transform.position.x -=
        normal.x * correction;
    }
    else if (!bodyA && bodyB) {
      bodyB.transform.position.x +=
        normal.x * correction;
    }
    else if (bodyA && bodyB) {
      const invMassA = 1 / bodyA.mass;
      const invMassB = 1 / bodyB.mass;

      const total =
        invMassA + invMassB;

      bodyA.transform.position.x -=
        normal.x *
        correction *
        invMassA /
        total;

      bodyB.transform.position.x +=
        normal.x *
        correction *
        invMassB /
        total;
    }

    // Velocity

    if (bodyA) {
      const normalVelocity =
        bodyA.velocity.x * normal.x;

      if (normalVelocity > 0) {
        bodyA.velocity.x -=
          normalVelocity * normal.x;
      }
    }

    if (bodyB) {
      const normalVelocity =
        bodyB.velocity.x * normal.x;

      if (normalVelocity < 0) {
        bodyB.velocity.x -=
          normalVelocity * normal.x;
      }
    }
  }

  resolveStaticY(collision: Collision) {
    const {
      bodyA,
      bodyB,
      normal,
      penetration,
    } = collision;

    if (!bodyA && !bodyB) return;

    if (normal.x !== 0) return;

    const POSITION_SLOP = 0.01;

    const correction = Math.max(
      penetration - POSITION_SLOP,
      0,
    );

    if (correction <= 0) return;

    // Position

    if (bodyA && !bodyB) {
      bodyA.transform.position.y -=
        normal.y * correction;
    }
    else if (!bodyA && bodyB) {
      bodyB.transform.position.y +=
        normal.y * correction;
    }
    else if (bodyA && bodyB) {
      const invMassA = 1 / bodyA.mass;
      const invMassB = 1 / bodyB.mass;

      const total =
        invMassA + invMassB;

      bodyA.transform.position.y -=
        normal.y *
        correction *
        invMassA /
        total;

      bodyB.transform.position.y +=
        normal.y *
        correction *
        invMassB /
        total;
    }

    // Velocity

    if (bodyA) {
      const normalVelocity =
        bodyA.velocity.y * normal.y;

      if (normalVelocity > 0) {
        bodyA.velocity.y -=
          normalVelocity * normal.y;
      }
    }

    if (bodyB) {
      const normalVelocity =
        bodyB.velocity.y * normal.y;

      if (normalVelocity < 0) {
        bodyB.velocity.y -=
          normalVelocity * normal.y;
      }
    }
  }
}