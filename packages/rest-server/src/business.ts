import { Low } from "lowdb";
import { passwordToHash } from "./util";
import type { Session, User } from "./types";

export function login(
  db: Low<any>,
  info: { email: string; password: string },
): User | null {
  const passHash: string = passwordToHash(info.password);

  const user: User | undefined = db.data.users.find((u: User) => {
    return u.email === info.email && u.passwordHash === passHash;
  });

  if (!user) {
    return null;
  }

  return user;
}

export async function createLoginSession(
  db: Low<any>,
  info: { user: User },
): Promise<Session> {
  const session: Session | undefined = db.data.sessions.find(
    (s: Session) => s.userId === info.user.id,
  );

  const now: number = Math.ceil(new Date().getTime() / 1000);
  const createSession = (user: User): Session => {
    return {
      id: now,
      userId: user.id,
      token: passwordToHash(user.email + now),
      createdAt: now,
    };
  };

  if ((session && session.createdAt + 24 * 3600 < now) || !session) {
    if (session) {
      db.data.sessions = db.data.sessions.filter(
        (s: Session) => s.id !== session.id,
      );
    }

    //
    const newSession: Session = createSession(info.user);
    db.data.sessions.push(newSession);

    //
    await db.write();

    //
    return newSession;
  } else {
    return session;
  }
}
