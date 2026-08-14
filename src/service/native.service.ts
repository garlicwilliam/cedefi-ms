import { httpGet, HttpResponse } from '../util/http.ts';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { NativeOrderBookItem } from './types.ts';

const url: string = 'https://v2.api.native.org/swap-api-v2/v1/orderbook';
const apiKey: string = '982b80a29c55233e3d44006c325fe22d1b78d316';

//
export function getNativeOrderBookInfo(chain: 'ethereum' | 'bsc'): Observable<NativeOrderBookItem[]> {
  return httpGet(url, { chain: chain }, { header: { apiKey } }).pipe(
    map((res: HttpResponse<any>) => {
      if (res.status === 200) {
        return res.body;
      } else {
        console.error(new Date().toISOString(), `Native API Error: ${url}`, res.status, res.body);
      }

      return [];
    }),
  );
}
