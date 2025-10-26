import { createJsonServer } from './server';
import { Low } from 'lowdb';
import type { Session, User } from './types';
import { App } from '@tinyhttp/app';
import type { Request, Response } from '@tinyhttp/app';
import { curTimestamp, failRes, passwordToHash, successList, successObj, userPublic } from './util';
import { createLoginSession, login } from './business';

const dbFile: string = './data/db.json';
const defaultPassword: string = 'admin321';

// check the authorization header and return user info if valid
function checkAuth(req: Request, db: Low<any>): null | User {
  const authStr: string | undefined = req.headers.authorization;
  if (!authStr) {
    return null;
  }

  const userToken: string = authStr.replace('Bearer ', '');

  const session = db.data.sessions ? db.data.sessions.find((s: any): boolean => s.token === userToken) : null;

  if (!session) {
    return null;
  }

  const uid: number = session.userId;

  const user: User | null = db.data.users.find((u: any): boolean => u.id === uid) || null;

  if (!user) {
    return null;
  }

  return user;
}

function checkPermission(user: User, permission: string): boolean {
  return user.permissions.indexOf(permission) > -1;
}

const appServer = await createJsonServer(dbFile, (app: App, db: Low<any>) => {
  app.get('/', (req: Request, res: Response) => {
    const adminHash = passwordToHash('admin123');
    res.send('Hello! This is the JSON Server. ' + adminHash).end();
  });

  app.get('/auth/current', (req: Request, res: Response) => {
    const user: User | null = checkAuth(req, db);
    if (!user) {
      res.status(401).send(failRes('Unauthorized')).end();
      return;
    }

    // 返回用户信息
    res
      .status(200)
      .send(successObj(userPublic(user)))
      .end();
  });

  app.post('/auth/login', async (req: Request, res: Response) => {
    const email: string = req.body.email;
    const pass: string = req.body.password;
    const curUser: User | null = login(db, { email, password: pass });

    if (!curUser) {
      // 登录失败
      res.status(401).send(failRes('Login Failed: invalid email or password')).end();
      return;
    }

    const session: Session = await createLoginSession(db, { user: curUser });

    // 登录成功
    res
      .status(200)
      .json(successObj(userPublic(curUser), { token: session.token }))
      .end();
  });

  app.post('/auth/logout', async (req: Request, res: Response) => {
    const user: User | null = checkAuth(req, db);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' }).end();
      return;
    }

    // 删除 session
    db.data.sessions = db.data.sessions.filter((s: Session) => s.userId !== user.id);
    await db.write();

    res.status(200).json(successObj({})).end();
  });

  app.post('/auth/password', async (req: Request, res: Response) => {
    const user: User | null = checkAuth(req, db);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' }).end();
      return;
    }

    const oldPassword: string = req.body.oldPassword;
    const newPassword: string = req.body.newPassword;
    //
    const oldPassHash: string = passwordToHash(oldPassword);
    const newPassHash: string = passwordToHash(newPassword);
    //
    if (user.passwordHash !== oldPassHash) {
      res.status(200).send(failRes('Change Password Failed: invalid old password')).end();
      return;
    }

    // update password
    db.data.users = db.data.users.map((u: User) => {
      if (u.id === user.id) {
        u.passwordHash = newPassHash;
      }
      return u;
    });
    await db.write();

    res.status(200).send(successObj({})).end();
  });

  app.get('/users', async (req: Request, res: Response) => {
    const user: User | null = checkAuth(req, db);

    if (!user) {
      res.status(401).json({ error: 'Unauthorized' }).end();
      return;
    }
    //
    const checked = checkPermission(user, 'user');
    if (!checked) {
      res.status(403).json(failRes('Forbidden')).end();
      return;
    }

    //
    const list: User[] = db.data.users.map((u: User) => {
      return userPublic(u);
    });

    res.status(200).send(successList(list, list.length)).end();
  });

  app.post('/users', async (req: Request, res: Response) => {
    //
    const user: User | null = checkAuth(req, db);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' }).end();
      return;
    }
    //
    const checked = checkPermission(user, 'user');
    if (!checked) {
      res.status(403).json(failRes('Forbidden')).end();
      return;
    }
    //

    const email: string = req.body.email;
    const permissions: string[] = req.body.permissions;
    const passHash: string = passwordToHash(defaultPassword);
    const existUser: User | null = db.data.users.find((u: any): boolean => String(u.email).toLowerCase() === email.toLowerCase()) || null;

    if (existUser) {
      res.status(200).json(failRes('Already Exist')).end();
      return;
    }

    const newUser: User = {
      id: Date.now(),
      email,
      isSuper: false,
      permissions: permissions,
      passwordHash: passHash,
      suspended: false,
      createdAt: curTimestamp(),
      updatedAt: curTimestamp(),
    };

    db.data.users.push(newUser);
    await db.write();

    res
      .status(200)
      .json(successObj(userPublic(newUser)))
      .end();
  });
  // 重置密码
  app.patch('/users/:id/reset', async (req: Request, res: Response) => {
    //
    const user: User | null = checkAuth(req, db);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' }).end();
      return;
    }
    //
    const checked = checkPermission(user, 'user');
    if (!checked) {
      res.status(403).json(failRes('Forbidden')).end();
      return;
    }
    //

    const uid: string | undefined = req.params.id;

    if (!uid) {
      res.status(400).json(failRes('Bad Request')).end();
      return;
    }

    const find: User | undefined = db.data.users.find((u: User) => u.id.toString() === uid.toString());

    if (!find) {
      res.status(200).json(failRes('Not Found')).end();
      return;
    }

    find.passwordHash = passwordToHash(defaultPassword);
    await db.write();

    res.status(200).send(successObj({})).end();
  });
  // 修改权限
  app.patch('/users/:id/permissions', async (req: Request, res: Response) => {
    const user: User | null = checkAuth(req, db);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' }).end();
      return;
    }
    //
    const checked = checkPermission(user, 'user');
    if (!checked) {
      res.status(403).json(failRes('Forbidden')).end();
      return;
    }

    const uid: string | undefined = req.params.id;
    const permissions: string[] = req.body.permissions;

    if (!uid || !permissions || !Array.isArray(permissions)) {
      res.status(400).json(failRes('Bad Request')).end();
      return;
    }

    const find: User | undefined = db.data.users.find((u: User) => u.id.toString() === uid.toString());

    if (!find) {
      res.status(404).json(failRes('Not Found')).end();
      return;
    }

    find.permissions = permissions;
    await db.write();

    res.status(200).send(successObj(find)).end();
  });
  // 禁用用户
  app.patch('/users/:id/suspend', async (req: Request, res: Response) => {
    const user: User | null = checkAuth(req, db);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' }).end();
      return;
    }
    //
    const checked = checkPermission(user, 'user');
    if (!checked) {
      res.status(403).json(failRes('Forbidden')).end();
      return;
    }
    //
    const uid: string | undefined = req.params.id;
    const suspend: boolean | undefined = req.body.suspend;
    if (suspend == undefined || !uid) {
      res.status(400).json(failRes('Bad Request')).end();
      return;
    }
    //
    const find: User | undefined = db.data.users.find((u: User) => u.id.toString() === uid.toString());
    //
    if (!find) {
      res.status(404).json(failRes('Not Found')).end();
      return;
    }

    find.suspended = suspend;
    await db.write();

    res.status(200).send(successObj(find)).end();
  });
  //
  app.delete('/users/:id', async (req: Request, res: Response) => {
    res.status(401).json({ error: 'Unauthorized' }).end();
  });
  //
  app.post('/teams', async (req: Request, res: Response) => {
    //
    const user: User | null = checkAuth(req, db);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' }).end();
      return;
    }
    //
    const checked = checkPermission(user, 'team');
    if (!checked) {
      res.status(403).json(failRes('Forbidden')).end();
      return;
    }
    //

    const name: string = req.body.name;
    //
    if (!name || name.length < 1) {
      res.status(400).json(failRes('Bad Request')).end();
      return;
    }

    const existTeam: any = db.data.teams.find((t: any): boolean => String(t.name).toLowerCase() === name.toLowerCase()) || null;

    if (existTeam) {
      res.status(200).json(failRes('Already Exist')).end();
      return;
    }

    const newTeam: any = {
      id: Date.now(),
      name,
      createdAt: curTimestamp(),
      updatedAt: curTimestamp(),
    };

    db.data.teams.push(newTeam);
    await db.write();

    res.status(200).json(successObj(newTeam)).end();
  });
  //
  app.put('/teams/:id', async (req: Request, res: Response) => {
    const user: User | null = checkAuth(req, db);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' }).end();
      return;
    }
    //
    const checked = checkPermission(user, 'team');
    if (!checked) {
      res.status(403).json(failRes('Forbidden')).end();
      return;
    }
    //
    const name: string = req.body.name;
    //
    if (!name || name.length < 1) {
      res.status(400).json(failRes('Bad Request')).end();
      return;
    }
    //
    const existTeam: any = db.data.teams.find((t: any): boolean => String(t.name).toLowerCase() === name.toLowerCase()) || null;

    if (existTeam) {
      res.status(200).json(failRes('Already Exist')).end();
      return;
    }

    //
    const tid: string | undefined = req.params.id;
    const team = db.data.teams.find((one: any) => one.id == tid);
    if (!team) {
      res.status(404).json(failRes('Not Found')).end();
      return;
    }
    //
    team.name = name;
    team.updatedAt = curTimestamp();
    await db.write();
    //

    res.status(200).json(successObj(team)).end();
  });
  //
  app.patch('/portfolios/:id/team', async (req: Request, res: Response) => {
    const user: User | null = checkAuth(req, db);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' }).end();
      return;
    }

    const checked = checkPermission(user, 'portfolio');
    if (!checked) {
      res.status(403).json(failRes('Forbidden')).end();
      return;
    }

    const pid: string | undefined = req.params.id;
    const teamId: number = req.body.teamId;

    if (!teamId || !pid) {
      res.status(400).json(failRes('Bad Request')).end();
      return;
    }

    const portfolio = db.data.portfolios.find((one: any) => one.id == pid);
    if (!portfolio) {
      res.status(404).json(failRes('Not Found')).end();
      return;
    }

    portfolio.teamId = teamId;
    portfolio.updatedAt = curTimestamp();
    await db.write();

    res.status(200).json(successObj(portfolio)).end();
  });
  //
  app.get('/portfolios', async (req: Request, res: Response) => {
    const user: User | null = checkAuth(req, db);

    if (!user) {
      res.status(401).json({ error: 'Unauthorized' }).end();
      return;
    }
    //
    const tid: string | string[] | undefined = req.query.teamId;
    let ids: string | string[] | undefined = req.query.id;
    let list: any[] = db.data.portfolios;

    if (tid) {
      const tids: string[] = Array.isArray(tid) ? tid : [tid];
      list = list.filter((one) => tids.indexOf(one.teamId.toString()) >= 0);
    }

    if (ids && !Array.isArray(ids)) {
      ids = [ids];
    }

    if (ids) {
      list = list.filter((one) => ids.indexOf(one.id.toString()) >= 0);
    }

    res.status(200).send(successList(list, list.length)).end();
  });
  //
  app.post('/profit_allocation_ratios', async (req: Request, res: Response) => {
    const user: User | null = checkAuth(req, db);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' }).end();
      return;
    }

    const checked = checkPermission(user, 'profit');
    if (!checked) {
      res.status(403).json(failRes('Forbidden')).end();
      return;
    }

    const portfolioId: number = req.body.portfolioId;
    const { toTeam, toPlatform, toUser } = req.body.allocation;
    if (
      !portfolioId ||
      toTeam === undefined ||
      toPlatform === undefined ||
      toUser === undefined ||
      toTeam + toPlatform + toUser !== 10000
    ) {
      res.status(400).json(failRes('Bad Request')).end();
      return;
    }

    const maxVersion: number = (db.data.profit_allocation_ratios as any[])
      .map((one) => one.version)
      .reduce((acc, cur) => {
        return Math.max(acc, cur);
      }, 0);

    const newAllocation = {
      id: Date.now(),
      portfolioId,
      version: maxVersion + 1,
      toTeam,
      toPlatform,
      toUser,
      createdAt: curTimestamp(),
    };

    db.data.profit_allocation_ratios.push(newAllocation);
    await db.write();

    res.status(200).json(successObj(newAllocation)).end();
  });
  //
  app.get('/profit_allocation_ratios', async (req: Request, res: Response) => {
    const pid = req.query.portfolioId;
    const pids: string[] | undefined = !!pid && !Array.isArray(pid) ? ([pid] as string[]) : (pid as string[] | undefined);
    const size = req.query.limit ? Number(req.query.limit) : 100;
    const offset = req.query.offset ? Number(req.query.offset) : 0;

    let list: any[] = db.data.profit_allocation_ratios
      .filter((one: any) => {
        return pids ? pids.indexOf(one.portfolioId.toString()) >= 0 : true;
      })
      .sort((a: any, b: any) => b.createdAt - a.createdAt);

    const total = list.length;
    list = list.slice(offset, offset + size);

    res.status(200).send(successList(list, total)).end();
  });
  //
  app.post('/blacklist', async (req: Request, res: Response) => {
    const user: User | null = checkAuth(req, db);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' }).end();
      return;
    }

    const checked = checkPermission(user, 'blacklist');
    if (!checked) {
      res.status(403).json(failRes('Forbidden')).end();
      return;
    }

    let address: string = req.body.address;
    const note: string = req.body.note;
    const addrRegex = /^(0x)?[0-9a-fA-F]{40}$/;

    if (!address || !addrRegex.test(address) || !note) {
      res.status(400).json(failRes('Bad Request')).end();
      return;
    }

    address = address.toLowerCase();

    const exist: any = db.data.blacklist.find((t: any): boolean => String(t.address).toLowerCase() === address.toLowerCase()) || null;

    const maxId: number = db.data.blacklist
      .map((one: any) => one.id)
      .reduce((acc: number, cur: number) => {
        return Math.max(acc, cur);
      }, 0);

    if (exist) {
      res.status(200).json(failRes('Already Exist')).end();
      return;
    }

    const newItem: any = {
      id: maxId + 1,
      address,
      note: note,
      createdAt: curTimestamp(),
      updatedAt: curTimestamp(),
    };

    db.data.blacklist.push(newItem);
    await db.write();

    res.status(200).json(successObj(newItem)).end();
  });
  //
  app.post('/profit_reallocations', async (req: Request, res: Response) => {
    const user: User | null = checkAuth(req, db);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' }).end();
      return;
    }
    //
    const checked = checkPermission(user, 'profit');
    if (!checked) {
      res.status(403).json(failRes('Forbidden')).end();
      return;
    }

    //
    const { from, fromPortfolioId, to, toPortfolioId, reason, usdValue } = req.body;

    const type = ['platform', 'user', 'team_portfolio'];

    if (
      !from ||
      !to ||
      !reason ||
      !usdValue ||
      isNaN(Number(usdValue)) ||
      Number(usdValue) <= 0 ||
      !type.includes(to) ||
      !type.includes(from)
    ) {
      res.status(400).json(failRes('Bad Request')).end();
      return;
    }

    const rows: any[] = db.data.profit_reallocations;
    //
    const maxId: number = rows
      .map((one: any) => one.id)
      .reduce((acc: number, cur: number) => {
        console.log('cur acc', cur, acc);
        return Math.max(acc, cur);
      }, 0);

    const newObj = {
      id: maxId + 1,
      from,
      fromPortfolioId: from === 'team_portfolio' ? fromPortfolioId : null,
      to,
      toPortfolioId: to === 'team_portfolio' ? toPortfolioId : null,
      reason,
      usdValue,
      createdAt: curTimestamp(),
      createdBy: user.id,
    };

    rows.push(newObj);
    await db.write();

    res.status(200).json(successObj(newObj)).end();
  });
  //
  app.post('/profit_withdrawals', async (req: Request, res: Response) => {
    const user: User | null = checkAuth(req, db);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' }).end();
      return;
    }
    //
    const checked = checkPermission(user, 'profit');
    if (!checked) {
      res.status(403).json(failRes('Forbidden')).end();
      return;
    }
    //
    const { from, portfolioId, chainId, transactionHash, transactionTime, usdValue, assets, assetsAmount } = req.body;
    //
    const type = ['platform', 'team_portfolio'];

    if (
      !from ||
      !type.includes(from) ||
      !portfolioId ||
      !chainId ||
      !transactionHash ||
      !usdValue ||
      isNaN(Number(usdValue)) ||
      Number(usdValue) <= 0 ||
      !assets ||
      !assetsAmount ||
      !transactionTime
    ) {
      res.status(400).json(failRes('Bad Request')).end();
      return;
    }
    //
    const rows: any[] = db.data.profit_withdrawals;
    //
    const maxId: number = rows
      .map((one: any) => one.id)
      .reduce((acc: number, cur: number) => {
        return Math.max(acc, cur);
      }, 0);

    const newObj = {
      id: maxId + 1,
      from,
      portfolioId: from === 'team_portfolio' ? portfolioId : null,
      chainId,
      transactionHash,
      transactionTime,
      assets,
      assetsAmount,
      usdValue,
      createdAt: curTimestamp(),
      createdBy: user.id,
    };

    rows.push(newObj);
    await db.write();

    res.status(200).json(successObj(newObj)).end();
  });
});

appServer.listen(3100, () => console.log('Server running: http://localhost:3100'));
