import { asyncScheduler, AsyncSubject, BehaviorSubject, Observable, switchMap, combineLatest, Subscription } from 'rxjs';
import { filter, finalize, map } from 'rxjs/operators';

export type IService = {
  destroy: () => void;
  receiveInjection?: (injected: InjectedObjectState<{ [k: string]: IService }>) => void;
};
export type InjectableServiceType = { new (): { destroy: () => void } };
type InjectInfo = { cls: InjectableServiceType; key: string };
type InjectInstance = { ins: IService; key: string };

/**
 *
 */
class InstanceContainer {
  private instance: IService | null = null;
  private injected: InjectedObjectState<{ [k: string]: IService }> | null = null;
  private subscriptionCount = 0;

  private injector: Observable<any>;
  private instantiated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public constructor(cls: InjectableServiceType, depends: InjectInfo[] = []) {
    this.injector = new Observable((subscriber) => {
      if (!this.instance) {
        this.instance = new cls();
        if (this.instance.receiveInjection && depends.length > 0) {
          this.injected = new InjectedObjectState(depends);
          this.instance.receiveInjection(this.injected);
        }

        asyncScheduler.schedule(() => {
          this.instantiated.next(true);
        });
      }

      this.subscriptionCount++;

      subscriber.next(this.instance);

      return () => {
        this.subscriptionCount--;

        if (this.subscriptionCount === 0 && this.instance) {
          this.instance.destroy();
          if (this.injected) {
            this.injected.destroy();
          }

          this.instance = null;
          this.injected = null;

          asyncScheduler.schedule(() => {
            this.instantiated.next(false);
          });
        }
      };
    }).pipe();
  }

  public getIns(): Observable<any> {
    return this.injector;
  }

  public isInstantiated(): Observable<boolean> {
    return this.instantiated;
  }
}

/**
 *
 */
export class InjectedObjectState<T extends { [k: string]: IService }> {
  private sub: Subscription;
  private instance: { [k in keyof T]?: IService } = {};
  private init: AsyncSubject<boolean> = new AsyncSubject<boolean>();

  constructor(depends: InjectInfo[]) {
    const obs$Arr: Observable<InjectInstance>[] = depends.map(({ cls, key }) => {
      return serviceManager.service(cls).pipe(map((ins: IService): InjectInstance => ({ key, ins })));
    });

    this.sub = combineLatest(obs$Arr)
      .pipe(
        map((insArr: InjectInstance[]) => {
          insArr.forEach(({ key, ins }) => {
            this.instance[key as keyof T] = ins;
          });

          this.init.next(true);
          this.init.complete();
        }),
        finalize(() => {
          Object.keys(this.instance).forEach(() => {
            this.instance = {};
          });
        }),
      )
      .subscribe();
  }

  destroy() {
    this.sub.unsubscribe();
  }

  public ins(k: keyof T): Observable<IService> {
    return this.init.pipe(
      map(() => this.instance[k]),
      filter(Boolean),
    );
  }
}

/**
 *
 */
export class ServiceInstantManager {
  private maps: Map<InjectableServiceType, InstanceContainer> = new Map<InjectableServiceType, InstanceContainer>();
  private initMaps: Map<InjectableServiceType, AsyncSubject<boolean>> = new Map<InjectableServiceType, AsyncSubject<boolean>>();

  private watchInitMap(type: InjectableServiceType): Observable<boolean> {
    if (!this.initMaps.has(type)) {
      this.initMaps.set(type, new AsyncSubject<boolean>());
    }

    return this.initMaps.get(type)!;
  }

  private setInitMap(type: InjectableServiceType): void {
    if (!this.initMaps.has(type)) {
      this.initMaps.set(type, new AsyncSubject<boolean>());
    }

    const init$ = this.initMaps.get(type);
    if (init$) {
      init$.next(true);
      init$.complete();
    }
  }

  public registerService(serviceType: InjectableServiceType, depends?: { [k: string]: InjectableServiceType }): void {
    if (this.maps.has(serviceType)) {
      return;
    }

    const injectArr: InjectInfo[] | undefined = depends
      ? Object.keys(depends).map((key: string) => {
          const cls = depends[key];
          return { cls, key };
        })
      : undefined;

    const container = new InstanceContainer(serviceType, injectArr);
    this.maps.set(serviceType, container);

    this.setInitMap(serviceType);
  }

  public service<T extends IService>(type: InjectableServiceType): Observable<T> {
    if (this.maps.has(type)) {
      return this.maps.get(type)!.getIns();
    } else {
      return this.watchInitMap(type).pipe(switchMap(() => this.maps.get(type)!.getIns()));
    }
  }
}

export const serviceManager: ServiceInstantManager = new ServiceInstantManager();
