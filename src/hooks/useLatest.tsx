import { RefObject, useLayoutEffect, useRef } from 'react';

export function useLatest<T>(value: T): RefObject<T> {
  // 1. 创建一个持久化的 Ref 对象
  const ref: RefObject<T> = useRef<T>(value);

  // 2. 使用 useLayoutEffect (或 useEffect) 在 DOM 提交后同步更新 Ref
  //    使用 useLayoutEffect 保证在任何渲染相关的副作用（如其他 Effects）运行前，ref.current 都是最新的
  useLayoutEffect(() => {
    ref.current = value;
  }, [value]); // 依赖项：只有 value 改变时才更新 ref.current

  // 3. 返回这个稳定的 Ref 对象
  return ref;
}
